<!DOCTYPE html>
<html lang="{{ $isAr ? 'ar' : 'fr' }}" dir="{{ $isAr ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <title>{{ $isAr ? arabic_reshape('بيان النقاط') : 'Relevé de notes' }}</title>
    <style>
        @page {
            margin: 5mm 14mm 22mm 14mm;
        }

        * {
            box-sizing: border-box;
        }

        html, body {
            direction: {{ $isAr ? 'rtl' : 'ltr' }};
            unicode-bidi: embed;
        }

        body {
            font-family: {{ $isAr ? "'Amiri', 'DejaVu Sans'" : "'DejaVu Sans'" }}, sans-serif;
            font-size: 9pt;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #ffffff;
        }

        .rtl-block {
            direction: rtl;
            unicode-bidi: embed;
            text-align: right;
        }

        .rtl-inline {
            direction: rtl;
            unicode-bidi: embed;
            display: inline-block;
        }

        .ltr-inline {
            direction: ltr;
            unicode-bidi: embed;
            display: inline-block;
        }

        .page-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 18px;
            display: table;
            width: 100%;
            border-top: 1px solid #e2e8f0;
            font-size: 7pt;
            color: #94a3b8;
            padding: 2px 14mm;
        }
        .page-footer-inner {
            display: table-row;
        }
        .footer-left  { display: table-cell; text-align: {{ $isAr ? 'right' : 'left' }}; }
        .footer-right { display: table-cell; text-align: {{ $isAr ? 'left' : 'right' }}; }

        .header-wrap {
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px solid #dbeafe;
        }
        .header-logo {
            text-align: center;
            margin-bottom: 10px;
        }
        .header-logo img {
            display: block;
            width: 70%;
            max-width: 70%;
            height: auto;
            margin: 0 auto;
            object-fit: contain;
        }

        .header-main {
            width: 100%;
            border-collapse: collapse;
        }
        .header-info-cell {
            vertical-align: middle;
            text-align: center;
        }
        .header-doctitle {
            font-size: 17pt;
            font-weight: 700;
            color: #1e3a8a;
            line-height: 1.1;
            margin: 0;
            text-align: center;
        }
        .header-module-line {
            font-size: 12pt;
            font-weight: 700;
            color: #334155;
            margin: 6px 0 0;
            text-align: center;
        }
        .header-filiere {
            font-size: 10pt;
            font-weight: 600;
            color: #334155;
            margin: 4px 0 0;
            text-align: center;
        }
        .header-sub {
            font-size: 8pt;
            color: #64748b;
            margin-top: 4px;
            text-align: center;
        }

        table.data {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-bottom: 10px;
            border: 1px solid #cbd5e1;
        }
        table.data thead th {
            background: #1e3a8a;
            color: #ffffff;
            padding: 4px 6px;
            font-size: 7.4pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: {{ $isAr ? 'right' : 'left' }};
            border: 1px solid #cbd5e1;
        }
        table.data thead th.center { text-align: center; }

        table.data tbody td {
            padding: 1px 6px;
            border: 1px solid #dbe4f0;
            vertical-align: middle;
        }
        table.data tbody tr:nth-child(even) td {
            background: #f8fbff;
        }

        .center { text-align: center; }

        .cne {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 7.6pt;
            color: #475569;
            letter-spacing: 0.3px;
            direction: ltr;
        }

        .note-value  { text-align: center; font-weight: 700; color: #1e3a8a; }
        .note-absent { text-align: center; font-weight: 700; color: #a16207; }

        .badge {
            display: inline;
            min-width: 0;
            padding: 0;
            border-radius: 0;
            font-size: 7.2pt;
            font-weight: 700;
            text-align: center;
            background: transparent;
            border: none;
        }
        .badge-valid  { color: #166534; }
        .badge-fail   { color: #b91c1c; }
        .badge-absent { color: #92400e; }
        .badge-empty  { color: #64748b; }

        .rtl-cell { text-align: right; direction: rtl; }

        .empty-state {
            text-align: center;
            padding: 32px 16px;
            color: #94a3b8;
            font-size: 10pt;
        }

        .sig-section {
            margin-top: 6px;
            margin-bottom: 10px;
        }
        .sig-table { width: 100%; border-collapse: collapse; }
        .sig-table td { vertical-align: bottom; font-size: 8pt; }
        .sig-date { color: #94a3b8; text-align: left; }
        .sig-right { text-align: right; }
        .sig-line {
            display: inline-block;
            min-width: 200px;
            padding-top: 6px;
            color: #334155;
            text-align: center;
            font-size: 8pt;
            font-weight: 600;
        }
    </style>
</head>
<body>

<div class="page-footer">
    <div class="page-footer-inner">
        <span class="footer-left" dir="{{ $isAr ? 'rtl' : 'ltr' }}">{{ $isAr ? arabic_reshape('بيان النقاط') : 'Relevé de notes' }} — {{ $isAr ? arabic_reshape($module->nom_ar ?? $module->nom_fr) : $module->nom_fr }}</span>
        <span class="footer-right"></span>
    </div>
</div>

@php
    $students = collect($students ?? [])->sortBy(function ($student) use ($isAr) {
        $nom = $isAr ? ($student['nom_ar'] ?? $student['nom_fr'] ?? '') : ($student['nom_fr'] ?? $student['nom_ar'] ?? '');
        $prenom = $isAr ? ($student['prenom_ar'] ?? $student['prenom_fr'] ?? '') : ($student['prenom_fr'] ?? $student['prenom_ar'] ?? '');
        return mb_strtolower(trim($nom . ' ' . $prenom));
    })->values();
@endphp

<div class="header-wrap">
    <div class="header-logo">
        <img src="{{ public_path('./logo.jpg') }}" alt="Logo">
    </div>
    <hr style="border: 1px solid #1e40af; margin-top: 10px; margin-bottom: 10px;">
    <div class="sig-section">
        <table class="sig-table">
            <tr>
                <td class="sig-date">
                    @if ($isAr)
                        <span class="rtl-inline">{{ arabic_reshape('تم الإنشاء في:') }}</span>
                        <span class="ltr-inline">{{ $date }}</span>
                    @else
                        Généré le {{ $date }}
                    @endif
                </td>
                <td class="sig-right">
                    <span class="sig-line {{ $isAr ? 'rtl-inline' : '' }}">
                        {{ $isAr ? arabic_reshape('توقيع الأستاذ:') : 'Signature du professeur:' }}
                        <br>
                    <span>................................</span>

                    </span>
                    
                </td>
            </tr>
        </table>
    </div>
    <table class="header-main">
        <tr>
            <td class="header-info-cell">
                <div class="header-doctitle {{ $isAr ? 'rtl-block' : '' }}">{{ $isAr ? arabic_reshape('بيان النقاط') : 'RELEVE DE NOTES' }}</div>
                <div class="header-filiere {{ $isAr ? 'rtl-block' : '' }}">{{ $isAr ? arabic_reshape($module->semestre?->niveau?->filiere?->nom_ar ?? $module->semestre?->niveau?->filiere?->nom_fr ?? '-') : ($module->semestre?->niveau?->filiere?->nom_fr ?? $module->semestre?->niveau?->filiere?->nom_ar ?? '-') }}</div>
                <div class="header-sub {{ $isAr ? 'rtl-block' : '' }}">{{ $isAr ? arabic_reshape($module->semestre?->niveau?->nom_ar ?? $module->semestre?->niveau?->nom_fr ?? '-') : ($module->semestre?->niveau?->nom_fr ?? $module->semestre?->niveau?->nom_ar ?? '-') }} @if ($module->semestre) - {{ $isAr ? arabic_reshape($module->semestre->nom_ar ?? $module->semestre->nom_fr ?? '-') : ($module->semestre->nom_fr ?? $module->semestre->nom_ar ?? '-') }} @endif</div>
                <div class="header-module-line {{ $isAr ? 'rtl-block' : '' }}">{{ $isAr ? arabic_reshape('الوحدة:') : 'MODULE:' }} {{ $isAr ? arabic_reshape($module->nom_ar ?? $module->nom_fr ?? '-') : ($module->nom_fr ?? $module->nom_ar ?? '-') }}</div>
            </td>
        </tr>
    </table>
</div>

<table class="data" dir="{{ $isAr ? 'rtl' : 'ltr' }}">
    <thead>
        <tr>
            @if ($isAr)
            <th style="width:92px" class="center">{{ arabic_reshape('القرار') }}</th>
            <th style="width:58px" class="center">{{ arabic_reshape('النقطة') }}</th>
            <th>{{ arabic_reshape('النسب') }}</th>
            <th>{{ arabic_reshape('الاسم') }}</th>
            <th style="width:80px">CNE</th>
            @else
            <th style="width:80px">CNE</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th style="width:58px" class="center">Note /20</th>
            <th style="width:92px" class="center">Décision</th>
            @endif
        </tr>
    </thead>
    <tbody>
        @forelse ($students as $i => $s)
            @php
                $note     = $s['note'] ?? '';
                $isEmpty  = $note === '' || $note === null;
                $isAbsent = !$isEmpty && ((int) $note === 99);
                $noteVal  = $isEmpty ? null : (float) $note;

                $noteDisplay = $isAbsent
                    ? ($isAr ? arabic_reshape('غائب') : 'Absent')
                    : ($noteVal !== null ? number_format($noteVal, 2) : '—');

                if ($isEmpty) {
                    $decisionDisplay = '—';
                    $badgeClass = 'badge-empty';
                } elseif ($isAbsent) {
                    $decisionDisplay = $isAr ? arabic_reshape('غائب') : 'Absent';
                    $badgeClass = 'badge-absent';
                } elseif ($noteVal >= 10) {
                    $decisionDisplay = $isAr ? arabic_reshape('مستوفي') : 'Validé';
                    $badgeClass = 'badge-valid';
                } else {
                    $decisionDisplay = $isAr ? arabic_reshape('غير مستوفي') : 'Non validé';
                    $badgeClass = 'badge-fail';
                }

                $prenom = $isAr ? ($s['prenom_ar'] ?? $s['prenom_fr']) : ($s['prenom_fr'] ?? $s['prenom_ar']);
                $nom    = $isAr ? ($s['nom_ar'] ?? $s['nom_fr']) : ($s['nom_fr'] ?? $s['nom_ar']);
                $prenomDisplay = mb_strtoupper((string) ($prenom ?? '-'));
                $nomDisplay = mb_strtoupper((string) ($nom ?? '-'));
            @endphp
            @if ($isAr)
            <tr>
                <td class="center rtl-cell"><span class="badge {{ $badgeClass }} rtl-inline">{{ $decisionDisplay }}</span></td>
                <td class="{{ $isAbsent ? 'note-absent' : 'note-value' }} rtl-cell">{{ $noteDisplay }}</td>
                <td class="rtl-cell">{{ $prenomDisplay }}</td>
                <td class="rtl-cell">{{ $nomDisplay }}</td>
                <td class="cne">{{ $s['CNE'] }}</td>
            </tr>
            @else
            <tr>
                <td class="cne">{{ $s['CNE'] }}</td>
                <td>{{ $nomDisplay }}</td>
                <td>{{ $prenomDisplay }}</td>
                <td class="{{ $isAbsent ? 'note-absent' : 'note-value' }}">{{ $noteDisplay }}</td>
                <td class="center"><span class="badge {{ $badgeClass }}">{{ $decisionDisplay }}</span></td>
            </tr>
            @endif
        @empty
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        {{ $isAr ? arabic_reshape('لا توجد بيانات متاحة') : 'Aucune donnée disponible' }}
                    </div>
                </td>
            </tr>
        @endforelse
    </tbody>
</table>


<script type="text/php">
    if (isset($pdf) && isset($fontMetrics)) {
        $font = $fontMetrics->getFont('{{ $isAr ? 'Amiri' : 'DejaVu Sans' }}', 'normal');
        $size = 7;
        $text = @json($isAr ? arabic_reshape('صفحة') . ' {PAGE_NUM} / {PAGE_COUNT}' : 'Page {PAGE_NUM} / {PAGE_COUNT}');
        $color = [0.58, 0.64, 0.72];
        $textWidth = $fontMetrics->getTextWidth($text, $font, $size);
        $x = $pdf->get_width() - $textWidth - 40;
        $y = $pdf->get_height() - 18;
        $pdf->page_text($x, $y, $text, $font, $size, $color);
    }
</script>
</body>
</html>
