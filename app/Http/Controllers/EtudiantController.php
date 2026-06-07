<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Filiere;
use App\Models\Niveau;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EtudiantController extends Controller
{
    /**
     * List all students with search + filter + pagination.
     */
    public function index(Request $request): Response
    {
        $query = Etudiant::query()
            ->with('niveau.filiere')
            ->orderBy('created_at', 'desc');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nom_fr',      'like', "%{$search}%")
                  ->orWhere('prenom_fr',  'like', "%{$search}%")
                  ->orWhere('nom_ar',     'like', "%{$search}%")
                  ->orWhere('prenom_ar',  'like', "%{$search}%")
                  ->orWhere('CNE',        'like', "%{$search}%")
                  ->orWhere('CIN',        'like', "%{$search}%")
                  ->orWhere('Nins',       'like', "%{$search}%")
                  ->orWhere('email',      'like', "%{$search}%");
            });
        }

        if ($sexe = $request->get('sexe')) {
            $query->where('sexe', $sexe);
        }

        if ($filiereId = $request->get('filiere_id')) {
            $niveauIds = Niveau::where('filiere_id', $filiereId)->pluck('id');
            $query->whereIn('niveau_id', $niveauIds);
        }

        if ($niveauId = $request->get('niveau_id')) {
            $query->where('niveau_id', $niveauId);
        }

        $etudiants = $query->paginate(12)->withQueryString();

        $filieres = Filiere::orderBy('code')->get(['id', 'code', 'nom_fr', 'nom_ar']);
        $niveaux  = Niveau::with('filiere')->orderBy('ordre')->get(['id', 'code', 'nom_fr', 'nom_ar', 'filiere_id']);

        $stats = [
            'total'   => Etudiant::count(),
            'hommes'  => Etudiant::where('sexe', 'M')->count(),
            'femmes'  => Etudiant::where('sexe', 'F')->count(),
            'filieres' => Filiere::count(),
        ];

        return Inertia::render('Etudiants/Index', [
            'etudiants' => $etudiants,
            'filters'   => $request->only(['search', 'sexe', 'filiere_id', 'niveau_id']),
            'filieres'  => $filieres,
            'niveaux'   => $niveaux,
            'stats'     => $stats,
        ]);
    }

    /**
     * Show a single student's detail page.
     */
    public function show(Etudiant $etudiant): Response
    {
        return Inertia::render('Etudiants/Show', [
            'etudiant' => $etudiant->load('modules', 'niveau.filiere'),
            'niveaux'  => Niveau::with('filiere')->orderBy('ordre')->get(['id', 'code', 'nom_fr', 'nom_ar', 'filiere_id']),
        ]);
    }

    /**
     * Store a new student via form.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'Nins'           => 'nullable|string|max:255',
            'CNE'            => 'nullable|string|max:255|unique:etudiant,CNE',
            'CIN'            => 'nullable|string|max:255|unique:etudiant,CIN',
            'nom_ar'         => 'nullable|string|max:255',
            'prenom_ar'      => 'nullable|string|max:255',
            'nom_fr'         => 'required|string|max:255',
            'prenom_fr'      => 'required|string|max:255',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:255',
            'sexe'           => 'nullable|in:M,F',
            'telephone'      => 'nullable|string|max:255',
            'email'          => 'nullable|string|email|max:255',
            'photo_url'      => 'nullable|string|max:255',
            'filier'         => 'nullable|string|max:255',
            'niveau_id'      => 'nullable|exists:niveaux,id',
        ]);

        Etudiant::create($validated);

        return back()->with('success', 'etudiant_created');
    }

    /**
     * Update an existing student.
     */
    public function update(Request $request, Etudiant $etudiant): RedirectResponse
    {
        $validated = $request->validate([
            'Nins'           => 'nullable|string|max:255',
            'CNE'            => ['nullable', 'string', 'max:255', Rule::unique('etudiant', 'CNE')->ignore($etudiant->id)],
            'CIN'            => ['nullable', 'string', 'max:255', Rule::unique('etudiant', 'CIN')->ignore($etudiant->id)],
            'nom_ar'         => 'nullable|string|max:255',
            'prenom_ar'      => 'nullable|string|max:255',
            'nom_fr'         => 'required|string|max:255',
            'prenom_fr'      => 'required|string|max:255',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:255',
            'sexe'           => 'nullable|in:M,F',
            'telephone'      => 'nullable|string|max:255',
            'email'          => 'nullable|string|email|max:255',
            'photo_url'      => 'nullable|string|max:255',
            'filier'         => 'nullable|string|max:255',
            'niveau_id'      => 'nullable|exists:niveaux,id',
        ]);

        $etudiant->update($validated);

        return back()->with('success', 'etudiant_updated');
    }

    /**
     * Delete a student.
     */
    public function destroy(Etudiant $etudiant): RedirectResponse
    {
        $etudiant->delete();

        return back()->with('success', 'etudiant_deleted');
    }

    /**
     * Import students from a CSV / Excel file.
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file'      => 'required|file|max:5120',
            'niveau_id' => 'nullable|exists:niveaux,id',
        ]);

        $file      = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $mime      = $file->getMimeType() ?? '';

        $isXlsx = in_array($extension, ['xlsx', 'ods'])
            || str_contains($mime, 'spreadsheetml')
            || str_contains($mime, 'opendocument');

        $isXls = $extension === 'xls'
            || str_contains($mime, 'ms-excel')
            || str_contains($mime, 'msexcel');

        try {
            if ($isXlsx) {
                $rows = $this->parseXlsx($file->getRealPath());
            } elseif ($isXls) {
                $rows = $this->parseXls($file->getRealPath());
            } else {
                $rows = $this->parseCsv($file->getRealPath());
            }
        } catch (\Throwable $e) {
            return response()->json(['error' => 'parse_error', 'message' => $e->getMessage()], 422);
        }

        if (count($rows) < 2) {
            return response()->json(['error' => 'empty_file'], 422);
        }

        $header = array_map(
            fn($h) => mb_strtolower(trim(preg_replace('/\s+/u', '_', $this->sanitize($h))), 'UTF-8'),
            $rows[0]
        );

        $imported  = 0;
        $skipped   = 0;
        $rows_report = [];
        $batchNiveauId = $request->input('niveau_id');

        foreach (array_slice($rows, 1) as $lineNum => $row) {
            if (count(array_filter($row, fn($v) => $v !== '' && $v !== null)) === 0) continue;

            $data = [];
            foreach ($header as $i => $key) {
                $data[$key] = isset($row[$i]) ? trim((string) $row[$i]) : null;
            }
            // Convert empty strings to null so MySQL doesn't reject date/numeric columns
            $data = array_map(fn($v) => $v === '' ? null : $v, $data);

            $prenom_fr = $data['prenom_fr'] ?? null;
            $nom_fr    = $data['nom_fr']    ?? null;
            $cne       = $data['cne']       ?? null;
            $line      = $lineNum + 2;

            if (!$prenom_fr || !$nom_fr) {
                $rows_report[] = [
                    'line'      => $line,
                    'status'    => 'rejected',
                    'prenom_fr' => $prenom_fr ?? '',
                    'nom_fr'    => $nom_fr ?? '',
                    'reason'    => 'prenom_fr ou nom_fr manquant',
                ];
                $skipped++;
                continue;
            }

            if ($cne && Etudiant::where('CNE', $cne)->exists()) {
                $rows_report[] = [
                    'line'      => $line,
                    'status'    => 'rejected',
                    'prenom_fr' => $prenom_fr,
                    'nom_fr'    => $nom_fr,
                    'reason'    => 'CNE "' . $cne . '" déjà existant',
                ];
                $skipped++;
                continue;
            }

            $niveauId = $batchNiveauId;
            if (!$niveauId && !empty($data['code_niveau'])) {
                $niveau = Niveau::where('code', $data['code_niveau'])->first();
                if ($niveau) $niveauId = $niveau->id;
            }

            Etudiant::create([
                'Nins'           => $data['nins']           ?? null,
                'CNE'            => $cne,
                'CIN'            => $data['cin']            ?? null,
                'nom_ar'         => $data['nom_ar']         ?? null,
                'prenom_ar'      => $data['prenom_ar']      ?? null,
                'nom_fr'         => $nom_fr,
                'prenom_fr'      => $prenom_fr,
                'date_naissance' => $data['date_naissance'] ?? null,
                'lieu_naissance' => $data['lieu_naissance'] ?? null,
                'sexe'           => $data['sexe']           ?? null,
                'telephone'      => $data['telephone']      ?? null,
                'email'          => $data['email']          ?? null,
                'filier'         => $data['filier']         ?? null,
                'niveau_id'      => $niveauId,
            ]);

            $rows_report[] = [
                'line'      => $line,
                'status'    => 'imported',
                'prenom_fr' => $prenom_fr,
                'nom_fr'    => $nom_fr,
                'reason'    => null,
            ];

            $imported++;
        }

        return response()->json([
            'imported' => $imported,
            'skipped'  => $skipped,
            'rows'     => $rows_report,
        ]);
    }

    // ── Internal parsers (shared with ModuleController) ───────────────────────

    private function sanitize(string $value): string
    {
        $value = ltrim($value, "\xEF\xBB\xBF");
        if (!mb_check_encoding($value, 'UTF-8')) {
            try {
                $converted = mb_convert_encoding($value, 'UTF-8', 'Windows-1252, ISO-8859-1');
                $value = $converted ?: $value;
            } catch (\Throwable) {
                $value = preg_replace('/[^\x09\x0A\x0D\x20-\x7E]/', '', $value);
            }
        }
        return trim($value);
    }

    private function parseCsv(string $path): array
    {
        $rows   = [];
        $handle = fopen($path, 'r');
        if ($handle === false) throw new \RuntimeException('Cannot open file.');

        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") rewind($handle);

        $firstLine = fgets($handle);
        rewind($handle);
        $bom2 = fread($handle, 3);
        if ($bom2 !== "\xEF\xBB\xBF") rewind($handle);

        $delimiter = ',';
        foreach ([';', "\t", '|', ','] as $d) {
            if (substr_count($firstLine, $d) > substr_count($firstLine, $delimiter)) {
                $delimiter = $d;
            }
        }

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rows[] = array_map(fn($v) => $this->sanitize((string)($v ?? '')), $row);
        }
        fclose($handle);
        return $rows;
    }

    private function parseXlsx(string $path): array
    {
        if (class_exists('ZipArchive')) {
            return $this->parseXlsxViaZipArchive($path);
        }
        return $this->parseXlsxPurePhp($path);
    }

    private function parseXlsxViaZipArchive(string $path): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            throw new \RuntimeException('Cannot open XLSX file.');
        }

        $ssXml    = $zip->getFromName('xl/sharedStrings.xml') ?: null;
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if ($sheetXml === false) throw new \RuntimeException('Cannot find sheet1 in XLSX.');

        return $this->parseXlsxXml($ssXml ?: '', $sheetXml);
    }

    private function parseXlsxPurePhp(string $path): array
    {
        $data = file_get_contents($path);
        if ($data === false) throw new \RuntimeException('Cannot read XLSX file.');

        if (substr($data, 0, 4) !== "PK\x03\x04") {
            throw new \RuntimeException('File is not a valid ZIP/XLSX archive.');
        }

        $entries  = $this->parseZipEntries($data);
        $ssXml    = $entries['xl/sharedStrings.xml'] ?? '';
        $sheetXml = $entries['xl/worksheets/sheet1.xml'] ?? null;

        if ($sheetXml === null) {
            throw new \RuntimeException('Cannot find sheet1 in XLSX (pure-PHP reader).');
        }

        return $this->parseXlsxXml($ssXml, $sheetXml);
    }

    private function parseZipEntries(string $data): array
    {
        $entries = [];
        $offset  = 0;
        $len     = strlen($data);

        while ($offset + 30 <= $len) {
            if (substr($data, $offset, 4) !== "PK\x03\x04") break;

            $method          = unpack('v', substr($data, $offset + 8,  2))[1];
            $compressedSize  = unpack('V', substr($data, $offset + 18, 4))[1];
            $uncompressedSize= unpack('V', substr($data, $offset + 22, 4))[1];
            $fileNameLen     = unpack('v', substr($data, $offset + 26, 2))[1];
            $extraLen        = unpack('v', substr($data, $offset + 28, 2))[1];

            $fileName    = substr($data, $offset + 30, $fileNameLen);
            $dataOffset  = $offset + 30 + $fileNameLen + $extraLen;
            $compressed  = substr($data, $dataOffset, $compressedSize);

            if ($method === 0) {
                $entries[$fileName] = $compressed;
            } elseif ($method === 8) {
                $inflated = @gzinflate($compressed);
                if ($inflated !== false) $entries[$fileName] = $inflated;
            }

            $offset = $dataOffset + $compressedSize;
        }

        return $entries;
    }

    private function parseXlsxXml(string $ssXml, string $sheetXml): array
    {
        $strings = [];
        if ($ssXml !== '') {
            libxml_use_internal_errors(true);
            $ss = simplexml_load_string($ssXml, 'SimpleXMLElement', LIBXML_NOERROR | LIBXML_NOWARNING);
            libxml_clear_errors();

            if ($ss !== false) {
                foreach ($ss->si as $si) {
                    if (isset($si->t)) {
                        $strings[] = $this->sanitize((string) $si->t);
                    } else {
                        $parts = [];
                        foreach ($si->r as $run) {
                            if (isset($run->t)) $parts[] = (string) $run->t;
                        }
                        $strings[] = $this->sanitize(implode('', $parts));
                    }
                }
            }
        }

        libxml_use_internal_errors(true);
        $sheet = simplexml_load_string($sheetXml, 'SimpleXMLElement', LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();

        if ($sheet === false) throw new \RuntimeException('Cannot parse sheet XML.');

        $rows = [];
        foreach ($sheet->sheetData->row as $row) {
            $rowData    = [];
            $prevColIdx = -1;
            foreach ($row->c as $cell) {
                preg_match('/^([A-Z]+)/', (string) $cell['r'], $m);
                $colIdx = $this->colToIndex($m[1] ?? 'A');

                while ($prevColIdx < $colIdx - 1) {
                    $rowData[]  = '';
                    $prevColIdx++;
                }

                $t = (string) ($cell['t'] ?? '');
                $v = isset($cell->v) ? (string) $cell->v : '';

                if ($t === 's') {
                    $rowData[] = $strings[(int) $v] ?? '';
                } elseif ($t === 'inlineStr') {
                    $rowData[] = isset($cell->is->t) ? $this->sanitize((string) $cell->is->t) : '';
                } else {
                    $rowData[] = $this->sanitize($v);
                }
                $prevColIdx = $colIdx;
            }
            $rows[] = $rowData;
        }

        return $rows;
    }

    private function parseXls(string $path): array
    {
        try {
            return $this->parseBiff8($path);
        } catch (\Throwable) {
            return $this->parseCsv($path);
        }
    }

    private function parseBiff8(string $path): array
    {
        $data = file_get_contents($path);
        if ($data === false) throw new \RuntimeException('Cannot read XLS file.');

        if (substr($data, 0, 8) !== "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1") {
            throw new \RuntimeException('Not a valid OLE file.');
        }

        $sectorSizePow = unpack('v', substr($data, 30, 2))[1];
        $sectorSize    = 1 << $sectorSizePow;
        $numFatSectors = unpack('V', substr($data, 44, 4))[1];
        $firstDirSector= unpack('V', substr($data, 48, 4))[1];

        $fat = [];
        for ($i = 0; $i < $numFatSectors && $i < 109; $i++) {
            $fatSecNum = unpack('V', substr($data, 76 + $i * 4, 4))[1];
            $offset    = ($fatSecNum + 1) * $sectorSize;
            for ($j = 0; $j < $sectorSize / 4; $j++) {
                $fat[] = unpack('V', substr($data, $offset + $j * 4, 4))[1];
            }
        }

        $stream  = null;
        $sector  = $firstDirSector;
        $visited = [];

        while ($sector < 0xFFFFFFFE && !isset($visited[$sector])) {
            $visited[$sector] = true;
            $offset = ($sector + 1) * $sectorSize;
            for ($i = 0; $i < $sectorSize / 128; $i++) {
                $entry     = substr($data, $offset + $i * 128, 128);
                $nameLen   = unpack('v', substr($entry, 64, 2))[1];
                $nameRaw   = substr($entry, 0, max(0, $nameLen - 2));
                $name      = iconv('UTF-16LE', 'UTF-8//IGNORE', $nameRaw);
                $type      = ord($entry[66]);
                $startSec  = unpack('V', substr($entry, 116, 4))[1];
                $size      = unpack('V', substr($entry, 120, 4))[1];

                if ($type === 2 && in_array($name, ['Workbook', 'Book'], true)) {
                    $streamData = '';
                    $s = $startSec;
                    $sv = [];
                    while ($s < 0xFFFFFFFE && !isset($sv[$s])) {
                        $sv[$s] = true;
                        $streamData .= substr($data, ($s + 1) * $sectorSize, $sectorSize);
                        $s = $fat[$s] ?? 0xFFFFFFFE;
                    }
                    $stream = substr($streamData, 0, $size);
                    break 2;
                }
            }
            $sector = $fat[$sector] ?? 0xFFFFFFFE;
        }

        if ($stream === null) throw new \RuntimeException('Workbook stream not found in XLS.');

        $rows       = [];
        $sharedStrs = [];
        $pos        = 0;
        $len        = strlen($stream);
        $maxRow     = -1;
        $cells      = [];

        while ($pos + 4 <= $len) {
            $recType = unpack('v', substr($stream, $pos, 2))[1];
            $recLen  = unpack('v', substr($stream, $pos + 2, 2))[1];
            $recData = substr($stream, $pos + 4, $recLen);
            $pos    += 4 + $recLen;

            if ($recType === 0x00FC) {
                $numStrings = unpack('V', substr($recData, 4, 4))[1];
                $p = 8;
                for ($i = 0; $i < $numStrings && $p < strlen($recData); $i++) {
                    $charCount = unpack('v', substr($recData, $p, 2))[1];
                    $flags     = ord($recData[$p + 2] ?? "\x00");
                    $p        += 3;
                    $unicode   = $flags & 0x01;
                    $richText  = ($flags & 0x08) ? unpack('v', substr($recData, $p, 2))[1] : 0;
                    if ($flags & 0x08) $p += 2;
                    $phonetic  = ($flags & 0x04) ? unpack('V', substr($recData, $p, 4))[1] : 0;
                    if ($flags & 0x04) $p += 4;

                    if ($unicode) {
                        $raw = substr($recData, $p, $charCount * 2);
                        $sharedStrs[] = $this->sanitize(iconv('UTF-16LE', 'UTF-8//IGNORE', $raw) ?: '');
                        $p += $charCount * 2;
                    } else {
                        $raw = substr($recData, $p, $charCount);
                        $sharedStrs[] = $this->sanitize($raw);
                        $p += $charCount;
                    }
                    $p += $richText * 4 + $phonetic;
                }
            }

            if ($recType === 0x00FD && $recLen >= 10) {
                $row = unpack('v', substr($recData, 0, 2))[1];
                $col = unpack('v', substr($recData, 2, 2))[1];
                $idx = unpack('V', substr($recData, 6, 4))[1];
                $cells[$row][$col] = $sharedStrs[$idx] ?? '';
                $maxRow = max($maxRow, $row);
            }

            if ($recType === 0x0203 && $recLen >= 14) {
                $row   = unpack('v', substr($recData, 0, 2))[1];
                $col   = unpack('v', substr($recData, 2, 2))[1];
                $val   = unpack('d', substr($recData, 6, 8))[1];
                $cells[$row][$col] = (string)(int)$val === (string)$val ? (string)(int)$val : (string)$val;
                $maxRow = max($maxRow, $row);
            }

            if ($recType === 0x0204 && $recLen >= 8) {
                $row    = unpack('v', substr($recData, 0, 2))[1];
                $col    = unpack('v', substr($recData, 2, 2))[1];
                $strLen = unpack('v', substr($recData, 6, 2))[1];
                $raw    = substr($recData, 8, $strLen);
                $cells[$row][$col] = $this->sanitize($raw);
                $maxRow = max($maxRow, $row);
            }

            if ($recType === 0x027E && $recLen >= 10) {
                $row  = unpack('v', substr($recData, 0, 2))[1];
                $col  = unpack('v', substr($recData, 2, 2))[1];
                $rk   = unpack('V', substr($recData, 6, 4))[1];
                $val  = ($rk & 0x02) ? ($rk >> 2) : unpack('d', pack('VV', 0, $rk & 0xFFFFFFFC))[1];
                if ($rk & 0x01) $val /= 100;
                $cells[$row][$col] = (string)(int)$val === (string)$val ? (string)(int)$val : (string)$val;
                $maxRow = max($maxRow, $row);
            }
        }

        for ($r = 0; $r <= $maxRow; $r++) {
            $maxCol = empty($cells[$r]) ? 0 : max(array_keys($cells[$r]));
            $rowArr = [];
            for ($c = 0; $c <= $maxCol; $c++) {
                $rowArr[] = $cells[$r][$c] ?? '';
            }
            $rows[] = $rowArr;
        }

        return $rows;
    }

    private function colToIndex(string $col): int
    {
        $col   = strtoupper($col);
        $index = 0;
        for ($i = 0; $i < strlen($col); $i++) {
            $index = $index * 26 + (ord($col[$i]) - 64);
        }
        return $index - 1;
    }

    /**
     * Upload a photo for a student.
     */
    public function uploadPhoto(Request $request, Etudiant $etudiant): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($etudiant->photo_url) {
            $oldPath = str_replace('/storage/', '', $etudiant->photo_url);
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('photo')->store('etudiants', 'public');
        $etudiant->photo_url = '/storage/' . $path;
        $etudiant->save();

        return back()->with('success', 'etudiant_photo_updated');
    }

    /**
     * Remove the photo for a student.
     */
    public function removePhoto(Request $request, Etudiant $etudiant): RedirectResponse
    {
        if ($etudiant->photo_url) {
            $oldPath = str_replace('/storage/', '', $etudiant->photo_url);
            Storage::disk('public')->delete($oldPath);
            $etudiant->photo_url = null;
            $etudiant->save();
        }

        return back()->with('success', 'etudiant_photo_removed');
    }
}
