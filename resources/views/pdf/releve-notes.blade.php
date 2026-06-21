<!DOCTYPE html>
<html lang="{{ $isAr ? 'ar' : 'fr' }}" dir="{{ $isAr ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <title>{{ $isAr ? 'بيان النقاط' : 'Relevé de notes' }}</title>
    <style>
        @page {
            margin: 16mm 14mm 22mm 14mm;
        }

        * {
            box-sizing: border-box;
        }

        html, body {
            direction: {{ $isAr ? 'rtl' : 'ltr' }};
            unicode-bidi: embed;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #ffffff;
        }

        /* ── Fixed footer ─────────────────────────────────────────────── */
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

        /* ── Header band ──────────────────────────────────────────────── */
        .header-wrap {
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px solid #dbeafe;
        }

        /* Logo + title row */
        .header-main {
            width: 100%;
            border-collapse: collapse;
        }
        .header-logo-cell,
        .header-spacer-cell {
            width: 72px;
            vertical-align: middle;
        }
        .header-logo-cell {
            padding-{{ $isAr ? 'left' : 'right' }}: 16px;
        }
        .header-logo-cell img {
            width: 62px;
            height: 62px;
            object-fit: contain;
            display: block;
        }
        /* Fallback monogram when no logo */
        .logo-monogram {
            width: 62px;
            height: 62px;
            background: #1e40af;
            border-radius: 12px;
            display: block;
            text-align: center;
            line-height: 62px;
            font-size: 24pt;
            font-weight: 700;
            color: #ffffff;
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
        .header-filiere {
            font-size: 10.5pt;
            font-weight: 600;
            color: #334155;
            margin: 6px 0 0;
            text-align: center;
        }
        .header-sub {
            font-size: 8pt;
            color: #64748b;
            margin-top: 4px;
            text-align: center;
        }

        /* Meta grid (4 info boxes) */
        .meta-row {
            width: 100%;
            border-collapse: separate;
            border-spacing: 5px 0;
            margin: 0 -5px;
        }
        .meta-row td {
            width: 25%;
            vertical-align: top;
            padding: 0;
        }
        .meta-box {
            background: #ffffff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 7px 10px;
        }
        .meta-label {
            display: block;
            font-size: 6.8pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            color: #94a3b8;
            margin-bottom: 2px;
        }
        .meta-value {
            display: block;
            font-size: 8.5pt;
            font-weight: 600;
            color: #1e293b;
        }

        /* ── Stats bar ─────────────────────────────────────────────────── */
        .stats-wrap {
            margin-bottom: 12px;
        }
        .stats-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 5px 0;
        }
        .stats-table td {
            width: 25%;
            vertical-align: top;
        }
        .stat-box {
            border-radius: 8px;
            padding: 8px 10px;
            text-align: center;
        }
        .stat-box .num {
            display: block;
            font-size: 13pt;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 3px;
        }
        .stat-box .lbl {
            display: block;
            font-size: 6.8pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .stat-valid   { background: #dcfce7; border: 1px solid #bbf7d0; }
        .stat-valid   .num { color: #166534; }
        .stat-valid   .lbl { color: #15803d; }
        .stat-fail    { background: #fee2e2; border: 1px solid #fecaca; }
        .stat-fail    .num { color: #b91c1c; }
        .stat-fail    .lbl { color: #dc2626; }
        .stat-absent  { background: #fef3c7; border: 1px solid #fde68a; }
        .stat-absent  .num { color: #92400e; }
        .stat-absent  .lbl { color: #b45309; }
        .stat-empty   { background: #f1f5f9; border: 1px solid #e2e8f0; }
        .stat-empty   .num { color: #475569; }
        .stat-empty   .lbl { color: #64748b; }

        /* ── Section heading ───────────────────────────────────────────── */
            font-size: 7.4pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }

        /* ── Data table ────────────────────────────────────────────────── */
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
            padding: 8px 8px;
            font-size: 7.4pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: {{ $isAr ? 'right' : 'left' }};
            border: 1px solid #cbd5e1;
        }
        table.data thead th.center { text-align: center; }

        table.data tbody td {
            padding: 7px 8px;
            border: 1px solid #dbe4f0;
            vertical-align: middle;
        }
        table.data tbody tr:nth-child(even) td {
            background: #f8fbff;
        }

        .center { text-align: center; }
        .index  { color: #94a3b8; font-size: 7.8pt; font-weight: 700; }

        .cne {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 7.6pt;
            color: #475569;
            letter-spacing: 0.3px;
        }

        .note-value  { text-align: center; font-weight: 700; color: #1e3a8a; }
        .note-absent { text-align: center; font-weight: 700; color: #a16207; }

        /* Badges */
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

        /* Empty state */
        .empty-state {
            text-align: center;
            padding: 32px 16px;
            color: #94a3b8;
            font-size: 10pt;
        }

        /* ── Signature section ─────────────────────────────────────────── */
        .sig-section {
            margin-top: 22px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
        }
        .sig-table { width: 100%; border-collapse: collapse; }
        .sig-table td { vertical-align: bottom; font-size: 8pt; }
        .sig-date { color: #94a3b8; }
        .sig-right { text-align: {{ $isAr ? 'left' : 'right' }}; }
        .sig-line {
            display: inline-block;
            min-width: 200px;
            padding-top: 6px;
            border-top: 1.5px solid #1e40af;
            color: #334155;
            text-align: center;
            font-size: 8pt;
            font-weight: 600;
        }
    </style>
</head>
<body>

{{-- Fixed footer with page numbers --}}
<div class="page-footer">
    <div class="page-footer-inner">
        <span class="footer-left">{{ $isAr ? 'بيان النقاط' : 'Relevé de notes' }} — {{ $isAr ? ($module->nom_ar ?? $module->nom_fr) : $module->nom_fr }}</span>
        <span class="footer-right">{{ $isAr ? 'صفحة' : 'Page' }} {PAGENO} / {nb}</span>
    </div>
</div>

@php
    $students = collect($students ?? [])->sortBy(function ($student) use ($isAr) {
        $nom = $isAr ? ($student['nom_ar'] ?? $student['nom_fr'] ?? '') : ($student['nom_fr'] ?? $student['nom_ar'] ?? '');
        $prenom = $isAr ? ($student['prenom_ar'] ?? $student['prenom_fr'] ?? '') : ($student['prenom_fr'] ?? $student['prenom_ar'] ?? '');
        return mb_strtolower(trim($nom . ' ' . $prenom));
    })->values();

    $validCount  = 0;
    $failCount   = 0;
    $absentCount = 0;
    $emptyCount  = 0;

    foreach ($students as $student) {
        $note    = $student['note'] ?? '';
        $isEmpty = $note === '' || $note === null;
        $isAbsent = !$isEmpty && ((int) $note === 99);

        if ($isEmpty)        { $emptyCount++; }
        elseif ($isAbsent)   { $absentCount++; }
        elseif ((float)$note >= 10) { $validCount++; }
        else                 { $failCount++; }
    }
@endphp

{{-- ═══════════════════════════════════════════════════════ HEADER ══ --}}
<div class="header-wrap">
    <table class="header-main">
        <tr>
            <td class="header-logo-cell">
                <span class="logo-monogram">{{ $isAr ? '?' : 'U' }}</span>
            </td>
            <td class="header-info-cell">
                <div class="header-doctitle">{{ $isAr ? '???? ?????' : 'RELEVE DE NOTES' }}</div>
                <div class="header-filiere">{{ $isAr ? ($module->semestre?->niveau?->filiere?->nom_ar ?? $module->semestre?->niveau?->filiere?->nom_fr ?? '-') : ($module->semestre?->niveau?->filiere?->nom_fr ?? $module->semestre?->niveau?->filiere?->nom_ar ?? '-') }}</div>
                <div class="header-sub">{{ $isAr ? ($module->semestre?->niveau?->nom_ar ?? $module->semestre?->niveau?->nom_fr ?? '-') : ($module->semestre?->niveau?->nom_fr ?? $module->semestre?->niveau?->nom_ar ?? '-') }} @if ($module->semestre) - {{ $isAr ? ($module->semestre->nom_ar ?? $module->semestre->nom_fr ?? '-') : ($module->semestre->nom_fr ?? $module->semestre->nom_ar ?? '-') }} @endif</div>
            </td>
            <td class="header-spacer-cell"></td>
        </tr>
    </table>

    <table class="meta-row">
        <tr>
            <td>
                <div class="meta-box">
                    <span class="meta-label">{{ $isAr ? '??????????????' : 'Professeur' }}</span>
                    <span class="meta-value">
                        {{ $prof->nom_fr }} {{ $prof->prenom_fr }}
                        @if ($prof->nom_ar)
                            / {{ $prof->nom_ar }} {{ $prof->prenom_ar }}
                        @endif
                    </span>
                </div>
            </td>
            <td>
                <div class="meta-box">
                    <span class="meta-label">{{ $isAr ? '?????????? ??????????????' : 'Date' }}</span>
                    <span class="meta-value">{{ $date }}</span>
                </div>
            </td>
            <td>
                <div class="meta-box">
                    <span class="meta-label">{{ $isAr ? '?????? ????????????' : '??tudiants' }}</span>
                    <span class="meta-value">{{ $total }}</span>
                </div>
            </td>
            <td>
                <div class="meta-box">
                    <span class="meta-label">{{ $isAr ? '?????????? ????????????????' : 'Ann??e univ.' }}</span>
                    <span class="meta-value">{{ $anneeUniversitaire ?? '???' }}</span>
                </div>
            </td>
        </tr>
    </table>
</div>{{-- /.header-wrap --}}

{{-- ═══════════════════════════════════════════════════════ STATS ═══ --}}

<table class="data">
    <thead>
        <tr>
            <th style="width:80px">CNE</th>
            <th>{{ $isAr ? 'الاسم' : 'Nom' }}</th>
            <th>{{ $isAr ? 'النسب' : 'Prénom' }}</th>
            <th style="width:58px" class="center">{{ $isAr ? 'النقطة' : 'Note /20' }}</th>
            <th style="width:92px" class="center">{{ $isAr ? 'القرار' : 'Décision' }}</th>
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
                    ? ($isAr ? 'غائب' : 'Absent')
                    : ($noteVal !== null ? number_format($noteVal, 2) : '—');

                if ($isEmpty) {
                    $decisionDisplay = '—';
                    $badgeClass = 'badge-empty';
                } elseif ($isAbsent) {
                    $decisionDisplay = $isAr ? 'غائب' : 'Absent';
                    $badgeClass = 'badge-absent';
                } elseif ($noteVal >= 10) {
                    $decisionDisplay = $isAr ? 'مستوفي' : 'Validé';
                    $badgeClass = 'badge-valid';
                } else {
                    $decisionDisplay = $isAr ? 'غير مستوفي' : 'Non validé';
                    $badgeClass = 'badge-fail';
                }

                $prenom = $isAr ? ($s['prenom_ar'] ?? $s['prenom_fr']) : ($s['prenom_fr'] ?? $s['prenom_ar']);
                $nom    = $isAr ? ($s['nom_ar'] ?? $s['nom_fr']) : ($s['nom_fr'] ?? $s['nom_ar']);
                $prenomDisplay = mb_strtoupper((string) ($prenom ?? '-'));
                $nomDisplay = mb_strtoupper((string) ($nom ?? '-'));
            @endphp
            <tr>
                <td class="cne">{{ $s['CNE'] }}</td>
                <td>{{ $nomDisplay }}</td>
                <td>{{ $prenomDisplay }}</td>
                <td class="{{ $isAbsent ? 'note-absent' : 'note-value' }}">{{ $noteDisplay }}</td>
                <td class="center"><span class="badge {{ $badgeClass }}">{{ $decisionDisplay }}</span></td>
            </tr>
        @empty
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        {{ $isAr ? 'لا توجد بيانات متاحة' : 'Aucune donnée disponible' }}
                    </div>
                </td>
            </tr>
        @endforelse
    </tbody>
</table>

{{-- ═══════════════════════════════════════════════════════ SIGNATURE --}}
<div class="sig-section">
    <table class="sig-table">
        <tr>
            <td class="sig-date">
                {{ $isAr ? 'تم الإنشاء في' : 'Généré le' }} {{ $date }}
            </td>
            <td class="sig-right">
                <span class="sig-line">
                    {{ $isAr ? 'توقيع الأستاذ' : 'Signature du professeur' }}
                </span>
            </td>
        </tr>
    </table>
</div>

</body>
</html>
