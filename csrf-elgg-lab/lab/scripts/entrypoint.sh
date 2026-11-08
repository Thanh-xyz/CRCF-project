#!/bin/sh
set -eu
case "${LAB_CSRF_MODE:-protected}" in
  protected|vulnerable) printf '%s' "$LAB_CSRF_MODE" > /tmp/lab-csrf-mode ;;
  *) echo 'Invalid LAB_CSRF_MODE' >&2; exit 1 ;;
esac
chmod 644 /tmp/lab-csrf-mode
php /opt/lab/initialize.php
exec apachectl -D FOREGROUND
