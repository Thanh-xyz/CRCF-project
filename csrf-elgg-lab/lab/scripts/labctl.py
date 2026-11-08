#!/usr/bin/env python3
"""Portable lab lifecycle; run from any directory. Python standard library only."""
import argparse
import hashlib
import json
import os
import platform
import re
import secrets
import subprocess
import sys
import urllib.request
import zipfile
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEED_URL = 'https://seedsecuritylabs.org/Labs_20.04/Files/Web_CSRF_Elgg/Labsetup-arm.zip'
SEED_SHA = '13dd0f34a3e5347877a97f6f40c011b424bde6c7ef1dfd41c004975caaa97447'


def compose(*args, capture=False):
    return subprocess.run(['docker', 'compose', *args], cwd=ROOT, check=True,
                          text=True, capture_output=capture)


def initialize():
    env = ROOT / '.env'
    if not env.exists():
        value = (ROOT / '.env.example').read_text()
        value = value.replace('replace-with-random-value', secrets.token_hex(24))
        value = value.replace('replace-with-another-random-value', secrets.token_hex(24))
        if platform.machine().lower() not in ('arm64', 'aarch64'):
            value = value.replace('original-arm', 'original')
        fd = os.open(env, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as stream:
            stream.write(value)
        print('Created .env (private).')
    else:
        print('Kept existing .env.')


def fetch_seed():
    # Only extract the specific SQL member, never arbitrary ZIP paths.
    with urllib.request.urlopen(SEED_URL, timeout=30) as response:
        archive = response.read(2_000_000)
    if hashlib.sha256(archive).hexdigest() != SEED_SHA:
        raise RuntimeError('SEED ZIP changed; review provenance before updating SHA-256.')
    with zipfile.ZipFile(BytesIO(archive)) as bundle:
        sql = bundle.read('Labsetup-arm/image_mysql/elgg.sql').decode()
    # Omit the public upstream site secret. A private per-install secret is generated at boot.
    sql, count = re.subn(r",\('__site_secret__','[^']*'\)", '', sql)
    if count != 1:
        raise RuntimeError('Unexpected SQL format: cannot remove upstream site secret.')
    out = ROOT / 'lab/seed/elgg.sql'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(sql)
    print('Extracted official demo SQL; removed upstream site secret.')


def set_mode(mode):
    # mode is restricted by argparse, not interpolated from arbitrary text.
    code = f"file_put_contents('/tmp/lab-csrf-mode', '{mode}');"
    compose('exec', '-T', 'elgg', 'php', '-r', code)
    print(f'CSRF token mode: {mode}; only profile edit may be bypassed.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    for name in ('init', 'fetch-seed', 'up', 'down', 'status', 'reset-profile', 'version'):
        sub.add_parser(name)
    mode = sub.add_parser('mode')
    mode.add_argument('value', choices=['protected', 'vulnerable'])
    args = parser.parse_args()
    if args.command == 'init':
        initialize()
    elif args.command == 'fetch-seed':
        fetch_seed()
    elif args.command == 'up':
        initialize()
        if not (ROOT / 'lab/seed/elgg.sql').is_file():
            fetch_seed()
        compose('up', '-d', '--build', '--wait', '--wait-timeout', '240')
    elif args.command == 'down':
        compose('down')  # Preserve this project's named database volume.
    elif args.command == 'status':
        compose('ps')
    elif args.command == 'mode':
        set_mode(args.value)
    elif args.command == 'reset-profile':
        # Elgg's API is used inside the target container, not an unauthenticated web reset route.
        compose('exec', '-T', 'elgg', 'php', '/opt/lab/profile.php', 'reset')
    elif args.command == 'version':
        compose('exec', '-T', 'elgg', 'php', '/opt/lab/version.php')
        image_id = compose('images', '-q', 'elgg', capture=True).stdout.strip()
        if image_id:
            subprocess.run(['docker', 'image', 'inspect', image_id, '--format',
                            '{{.Id}} {{json .RepoDigests}}'], check=True)


if __name__ == '__main__':
    try:
        main()
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f'Lab operation failed: {error}', file=sys.stderr)
        sys.exit(1)
