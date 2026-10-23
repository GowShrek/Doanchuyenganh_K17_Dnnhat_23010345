/**
 * Script dọn dẹp index trùng trong MySQL do alter:true tích lũy.
 * Chạy: node src/scripts/fixIndexes.js
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS || '',
    { host: process.env.DB_HOST || 'localhost', dialect: 'mysql', logging: false }
);

// Các bảng cần kiểm tra
const TABLES = ['categories', 'genres', 'publishers', 'authors', 'books', 'book_authors', 'book_genres', 'users', 'api_keys', 'otps'];

async function fixIndexes() {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối MySQL thành công\n');

        for (const table of TABLES) {
            try {
                // Lấy tất cả index của bảng
                const [rows] = await sequelize.query(`SHOW INDEX FROM \`${process.env.DB_NAME}\`.\`${table}\``);
                if (!rows.length) { console.log(`⏩ ${table}: không có index`); continue; }

                // Nhóm theo key_name, bỏ qua PRIMARY
                const keyMap = {};
                for (const row of rows) {
                    if (row.Key_name === 'PRIMARY') continue;
                    if (!keyMap[row.Key_name]) keyMap[row.Key_name] = [];
                    keyMap[row.Key_name].push(row.Column_name);
                }

                const keyNames = Object.keys(keyMap);
                if (keyNames.length === 0) { console.log(`✅ ${table}: OK (chỉ có PRIMARY)`); continue; }

                console.log(`🔍 ${table}: ${keyNames.length} index phụ – [${keyNames.join(', ')}]`);

                // Xóa tất cả index phụ (Sequelize sẽ tự tạo lại khi sync)
                for (const keyName of keyNames) {
                    await sequelize.query(`ALTER TABLE \`${process.env.DB_NAME}\`.\`${table}\` DROP INDEX \`${keyName}\``);
                    console.log(`   🗑️  Đã xóa index: ${keyName}`);
                }

                console.log(`   ✅ ${table}: Đã dọn xong`);
            } catch (err) {
                if (err.message.includes("doesn't exist")) {
                    console.log(`⚠️  ${table}: bảng chưa tồn tại`);
                } else {
                    console.log(`❌ ${table}: ${err.message}`);
                }
            }
        }

        console.log('\n🎉 Hoàn thành! Hãy khởi động lại server.\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi kết nối:', err.message);
        process.exit(1);
    }
}

fixIndexes();
