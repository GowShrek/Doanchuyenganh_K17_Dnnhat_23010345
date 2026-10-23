#!/bin/bash
# Script tạo database MySQL cho QuanLyThuVien
# Chạy: bash setup-db.sh <mysql-password>

PASS=${1:-""}
MYSQL=/usr/local/mysql/bin/mysql

echo "🔍 Thử kết nối MySQL với password đã nhập..."

$MYSQL -u root -p"$PASS" -e "CREATE DATABASE IF NOT EXISTS quan_ly_thu_vien CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; SHOW DATABASES LIKE 'quan_ly_thu_vien';" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database 'quan_ly_thu_vien' đã được tạo thành công!"
    echo ""
    echo "📝 Hãy cập nhật file server/.env:"
    echo "   DB_PASS=$PASS"
else
    echo "❌ Kết nối thất bại. Vui lòng kiểm tra lại mật khẩu MySQL."
fi
