#!/bin/sh
# wait-for-db.sh — Chờ MySQL sẵn sàng rồi chạy app
set -e

HOST="${DB_HOST:-db}"
PORT="${DB_PORT:-3306}"
USER="${DB_USER:-root}"
PASS="${DB_PASS:-}"
NAME="${DB_NAME:-quan_ly_thu_vien}"

echo "⏳ Waiting for MySQL at $HOST:$PORT ..."
until node -e "
const mysql = require('mysql2');
const c = mysql.createConnection({ host:'$HOST', port:$PORT, user:'$USER', password:'$PASS', database:'$NAME' });
c.connect(err => { if(err){ process.exit(1); } else { console.log('ok'); c.end(); process.exit(0); } });
" 2>/dev/null; do
  sleep 2
done

echo "✅ MySQL is ready!"

echo "🌱 Running initAdmin seed..."
node src/seeds/initAdmin.js

echo "🚀 Starting server..."
exec node src/server.js
