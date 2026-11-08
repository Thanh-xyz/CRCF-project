<?php
$path = '/var/www/elgg/vendor/elgg/elgg/engine/classes/Elgg/Security/Csrf.php';
$source = file_get_contents($path);
$signature = 'public function validate(Request $request) {';
if (substr_count($source, $signature) !== 1) {
    fwrite(STDERR, "Unsupported upstream Csrf.php; inspect before modifying.\n"); exit(1);
}
if (strpos($source, 'disabling the CSRF countermeasure') !== false) {
    fwrite(STDERR, "Expected original protected SEED image.\n"); exit(1);
}
$guard = <<<'PHP'

        // Group 6 lab: deliberate opt-in, restricted to profile edit action.
        $mode = @file_get_contents('/tmp/lab-csrf-mode');
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
        if (trim((string) $mode) === 'vulnerable' && $path === '/action/profile/edit') {
            return;
        }
PHP;
file_put_contents($path, str_replace($signature, $signature . $guard, $source));
