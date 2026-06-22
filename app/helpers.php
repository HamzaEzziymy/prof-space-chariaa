<?php

use ArPHP\I18N\Arabic;

if (!function_exists('arabic_reshape')) {
    function arabic_reshape(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }
        static $arabic = null;
        if ($arabic === null) {
            $arabic = new Arabic('Glyphs');
        }
        return $arabic->utf8Glyphs($text);
    }
}
