<?php
// New private site secret for the imported public demo database. Never printed.
$db = new PDO('mysql:host=db;dbname=elgg_seed;charset=utf8mb4', 'seed', getenv('DB_PASSWORD'),
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$query = $db->prepare('INSERT IGNORE INTO elgg_config (name,value) VALUES (?,?)');
$query->execute(['__site_secret__', serialize(bin2hex(random_bytes(32)))]);
