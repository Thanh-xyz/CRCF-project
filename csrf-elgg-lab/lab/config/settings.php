<?php
date_default_timezone_set('Asia/Ho_Chi_Minh');
global $CONFIG;
if (!isset($CONFIG)) { $CONFIG = new stdClass; }
$CONFIG->dataroot = '/var/elgg-data/';
$CONFIG->wwwroot = getenv('ELGG_URL');
$CONFIG->dbuser = 'seed';
$CONFIG->dbpass = getenv('DB_PASSWORD');
$CONFIG->dbname = 'elgg_seed';
$CONFIG->dbhost = 'db';
$CONFIG->dbport = '3306';
$CONFIG->dbprefix = 'elgg_';
$CONFIG->dbencoding = 'utf8mb4';
$CONFIG->cookies['session'] = session_get_cookie_params();
$CONFIG->cookies['session']['name'] = 'Elgg';
$CONFIG->cookies['session']['domain'] = '';
$CONFIG->cookies['session']['httponly'] = true;
$CONFIG->cookies['session']['secure'] = false; // HTTP loopback lab only
$CONFIG->cookies['session']['samesite'] = 'Lax';
$CONFIG->simplecache_enabled = false;
$CONFIG->system_cache_enabled = false;
