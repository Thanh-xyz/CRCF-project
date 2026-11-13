<?php
if (PHP_SAPI !== 'cli') { exit(1); }
$lock = json_decode(file_get_contents('/var/www/elgg/composer.lock'), true);
$found = false;
foreach (($lock['packages'] ?? []) as $package) {
    if ($package['name'] === 'elgg/elgg') {
        echo json_encode(['package' => $package['name'], 'version' => $package['version'],
                          'source' => $package['source']['reference'] ?? null]) . "\n";
        $found = true;
    }
}
if (!$found) { fwrite(STDERR, "Version not found in composer.lock; inspect vendor/elgg/elgg/version.php manually.\n"); exit(1); }
