#!/bin/sh
set -e
sed -i "s|__ANON_KEY__|${ANON_KEY}|g; s|__SERVICE_ROLE_KEY__|${SERVICE_ROLE_KEY}|g" /kong.yml
exec /docker-entrypoint.sh kong docker-start
