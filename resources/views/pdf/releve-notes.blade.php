<!DOCTYPE html>
<html lang="{{ $isAr ? 'ar' : 'fr' }}" dir="{{ $isAr ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <title>{{ $isAr ? 'بيان النقاط' : 'Relevé de notes' }}</title>
    <style>
        @page {
            margin: 18mm 14mm 20mm 14mm;
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
            color: #1f2937;
            line-height: 1.45;
            margin: 0;
            padding: 0;
            background: #ffffff;
        }

        .page-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 7.5pt;
            color: #94a3b8;
            padding: 6px 0 4px;
            border-top: 1px solid #dbe4f0;
        }

        .header-card {
            border: 1px solid #dbe4f0;
            border-top: 5px solid #0f4c81;
            background: #f8fbff;
            border-radius: 10px;
            padding: 16px 18px 14px;
            margin-bottom: 12px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .logo-cell {
            width: 62px;
            vertical-align: middle;
        }

        .logo-cell svg {
            width: 52px;
            height: 52px;
            display: block;
        }

        .title-cell {
            vertical-align: middle;
            padding-{{ $isAr ? 'right' : 'left' }}: 14px;
        }

        .eyebrow {
            font-size: 7.2pt;
            text-transform: uppercase;
            letter-spacing: 0.9px;
            color: #64748b;
            margin-bottom: 4px;
        }

        .title-cell h1 {
            margin: 0 0 4px;
            font-size: 16pt;
            line-height: 1.1;
            color: #0f4c81;
            font-weight: 700;
        }

        .title-cell h2 {
            margin: 0 0 5px;
            font-size: 10.5pt;
            color: #334155;
            font-weight: 600;
        }

        .title-cell .sub {
            font-size: 8pt;
            color: #64748b;
        }

        .title-cell .sub strong {
            color: #0f4c81;
        }

        .meta-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 12px;
        }

        .meta-grid td {
            width: 25%;
            vertical-align: top;
            padding: 0 6px 0 0;
        }

        .meta-box {
            border: 1px solid #e2e8f0;
            background: #ffffff;
            border-radius: 8px;
            padding: 8px 10px;
            min-height: 46px;
        }

        .meta-label {
            display: block;
            font-size: 7.4pt;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
            margin-bottom: 2px;
            font-weight: 700;
        }

        .meta-value {
            display: block;
            font-size: 9pt;
            color: #1f2937;
            font-weight: 600;
        }

        .stats-row {
            width: 100%;
            margin: 0 0 12px;
        }

        .stat {
            display: inline-block;
            min-width: 102px;
            border: 1px solid #dbe4f0;
            border-radius: 8px;
            background: #ffffff;
            padding: 8px 12px;
            margin-{{ $isAr ? 'left' : 'right' }}: 6px;
            vertical-align: top;
        }

        .stat .num {
            display: block;
            font-size: 12.5pt;
            line-height: 1;
            color: #0f4c81;
            font-weight: 700;
            margin-bottom: 3px;
        }

        .stat .label {
            display: block;
            font-size: 7.4pt;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            font-weight: 700;
        }

        table.data {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-bottom: 10px;
        }

        table.data thead th {
            background: #0f4c81;
            color: #ffffff;
            padding: 9px 8px;
            font-size: 7.6pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #0b3559;
            text-align: {{ $isAr ? 'right' : 'left' }};
        }

        table.data thead th.center {
            text-align: center;
        }

        table.data tbody td {
            padding: 7px 8px;
            border-bottom: 1px solid #e5edf5;
            vertical-align: middle;
        }

        table.data tbody tr:nth-child(even) td {
            background: #f8fbff;
        }

        table.data tbody tr:last-child td {
            border-bottom: 2px solid #0f4c81;
        }

        .center {
            text-align: center;
        }

        .index {
            color: #94a3b8;
            font-size: 8pt;
            font-weight: 700;
        }

        .cne {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 7.8pt;
            color: #475569;
            letter-spacing: 0.3px;
        }

        .note-value {
            text-align: center;
            font-weight: 700;
            color: #0f4c81;
        }

        .note-absent {
            text-align: center;
            font-weight: 700;
            color: #a16207;
        }

        .badge {
            display: inline-block;
            min-width: 76px;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 7.4pt;
            font-weight: 700;
            text-align: center;
        }

        .badge-valid {
            background: #dcfce7;
            color: #166534;
        }

        .badge-fail {
            background: #fee2e2;
            color: #b91c1c;
        }

        .badge-absent {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-empty {
            background: #f1f5f9;
            color: #64748b;
            border: 1px dashed #cbd5e1;
        }

        .empty-state {
            text-align: center;
            padding: 34px 16px;
            color: #94a3b8;
            font-size: 10pt;
        }

        .empty-state .icon {
            width: 46px;
            height: 46px;
            margin: 0 auto 10px;
            color: #cbd5e1;
        }

        .sig-section {
            margin-top: 24px;
            border-top: 1px solid #dbe4f0;
            padding-top: 14px;
        }

        .sig-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
        }

        .sig-table td {
            vertical-align: bottom;
        }

        .sig-left {
            color: #94a3b8;
        }

        .sig-right {
            text-align: {{ $isAr ? 'left' : 'right' }};
        }

        .sig-line {
            display: inline-block;
            min-width: 210px;
            padding-top: 5px;
            border-top: 1.5px solid #0f4c81;
            color: #334155;
            text-align: center;
            font-weight: 600;
        }
    </style>
</head>
<body>

<div class="page-footer">
    {{ $isAr ? 'صفحة' : 'Page' }} {PAGENO} / {nb}
</div>

@php
    $validCount = 0;
    $failCount = 0;
    $absentCount = 0;
    $emptyCount = 0;

    foreach ($students as $student) {
        $note = $student['note'] ?? '';
        $isEmpty = $note === '' || $note === null;
        $isAbsent = !$isEmpty && ((int) $note === 99);

        if ($isEmpty) {
            $emptyCount++;
        } elseif ($isAbsent) {
            $absentCount++;
        } elseif ((float) $note >= 10) {
            $validCount++;
        } else {
            $failCount++;
        }
    }
@endphp

<div class="header-card">
    <table class="header-table">
        <tr>
            <td class="logo-cell">
                <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect width="60" height="60" rx="12" fill="#0f4c81"/>
                    <rect x="7" y="7" width="46" height="46" rx="10" fill="rgba(255,255,255,0.08)"/>
                    <text x="30" y="38" font-family="DejaVu Sans, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">{{ $isAr ? 'ج' : 'U' }}</text>
                </svg>
            </td>
            <td class="title-cell">
                <div class="eyebrow">{{ $isAr ? 'وثيقة أكاديمية' : 'Document académique' }}</div>
                <h1>{{ $isAr ? 'بيان النقاط' : 'RELEVÉ DE NOTES' }}</h1>
                <h2>{{ $isAr ? ($module->nom_ar ?? $module->nom_fr) : $module->nom_fr }}</h2>
                <div class="sub">
                    <strong>{{ $module->code_module }}</strong>
                    @if ($module->semestre)
                        &nbsp;·&nbsp; {{ $module->semestre->nom_fr }}{{ $module->semestre->nom_ar ? ' / ' . $module->semestre->nom_ar : '' }}
                    @endif
                </div>
            </td>
        </tr>
    </table>
</div>

<table class="meta-grid">
    <tr>
        <td>
            <div class="meta-box">
                <span class="meta-label">{{ $isAr ? 'الأستاذ' : 'Professeur' }}</span>
                <span class="meta-value">{{ $prof->nom_fr }} {{ $prof->prenom_fr }}{{ $prof->nom_ar ? ' / ' . $prof->nom_ar . ' ' . $prof->prenom_ar : '' }}</span>
            </div>
        </td>
        <td>
            <div class="meta-box">
                <span class="meta-label">{{ $isAr ? 'التاريخ' : 'Date' }}</span>
                <span class="meta-value">{{ $date }}</span>
            </div>
        </td>
        <td>
            <div class="meta-box">
                <span class="meta-label">{{ $isAr ? 'الطلبة' : 'Étudiants' }}</span>
                <span class="meta-value">{{ $total }}</span>
            </div>
        </td>
        <td>
            <div class="meta-box">
                <span class="meta-label">{{ $isAr ? 'السنة الجامعية' : 'Année univ.' }}</span>
                <span class="meta-value">{{ $anneeUniversitaire ?? '—' }}</span>
            </div>
        </td>
    </tr>
</table>

@if ($students->count() > 0)
    <div class="stats-row">
        <div class="stat">
            <span class="num">{{ $validCount }}</span>
            <span class="label">{{ $isAr ? 'مستوفي' : 'Validés' }}</span>
        </div>
        <div class="stat">
            <span class="num">{{ $failCount }}</span>
            <span class="label">{{ $isAr ? 'غير مستوفي' : 'Non validés' }}</span>
        </div>
        <div class="stat">
            <span class="num">{{ $absentCount }}</span>
            <span class="label">{{ $isAr ? 'غائب' : 'Absents' }}</span>
        </div>
        @if ($emptyCount > 0)
            <div class="stat">
                <span class="num">{{ $emptyCount }}</span>
                <span class="label">{{ $isAr ? 'غير مسجل' : 'Non saisis' }}</span>
            </div>
        @endif
    </div>
@endif

<table class="data">
    <thead>
        <tr>
            <th style="width:32px" class="center">#</th>
            <th style="width:78px">CNE</th>
            <th>{{ $isAr ? 'الاسم' : 'Nom' }}</th>
            <th>{{ $isAr ? 'النسب' : 'Prénom' }}</th>
            <th style="width:60px" class="center">{{ $isAr ? 'النقطة' : 'Note' }}</th>
            <th style="width:90px" class="center">{{ $isAr ? 'القرار' : 'Décision' }}</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($students as $i => $s)
            @php
                $note = $s['note'] ?? '';
                $isEmpty = $note === '' || $note === null;
                $isAbsent = !$isEmpty && ((int) $note === 99);
                $noteVal = $isEmpty ? null : (float) $note;
                $noteDisplay = $isAbsent ? ($isAr ? 'غائب' : 'Absent') : ($noteVal !== null ? number_format($noteVal, 1) : '—');

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

                $prenom = $isAr ? ($s['prenom_ar'] ?? $s['prenom_fr']) : $s['prenom_fr'];
                $nom = $isAr ? ($s['nom_ar'] ?? $s['nom_fr']) : $s['nom_fr'];
            @endphp
            <tr>
                <td class="center index">{{ $i + 1 }}</td>
                <td class="cne">{{ $s['CNE'] }}</td>
                <td>{{ $prenom }}</td>
                <td>{{ $nom }}</td>
                <td class="{{ $isAbsent ? 'note-absent' : 'note-value' }}">{{ $noteDisplay }}</td>
                <td class="center"><span class="badge {{ $badgeClass }}">{{ $decisionDisplay }}</span></td>
            </tr>
        @empty
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18"/>
                            <path d="M9 21V9"/>
                        </svg>
                        <div>{{ $isAr ? 'لا توجد بيانات متاحة' : 'Aucune donnée disponible' }}</div>
                    </div>
                </td>
            </tr>
        @endforelse
    </tbody>
</table>

<div class="sig-section">
    <table class="sig-table">
        <tr>
            <td class="sig-left">
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