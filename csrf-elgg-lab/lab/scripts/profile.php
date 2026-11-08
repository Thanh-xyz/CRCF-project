<?php
// CLI only. Resets Alice's About me through Elgg's entity API.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once '/var/www/elgg/vendor/autoload.php';
\Elgg\Application::start();
$user = elgg_get_user_by_username('alice');
if (!$user) { fwrite(STDERR, "Alice not found\n"); exit(1); }
if (($argv[1] ?? '') === 'reset') {
    $previous = elgg_set_ignore_access(true);
    try {
        $user->description = 'Alice — hồ sơ ban đầu của Nhóm 6';
        $user->save();
    } finally { elgg_set_ignore_access($previous); }
}
echo json_encode(['username' => 'alice', 'guid' => (int) $user->guid,
                 'description' => (string) $user->description], JSON_UNESCAPED_UNICODE) . "\n";
