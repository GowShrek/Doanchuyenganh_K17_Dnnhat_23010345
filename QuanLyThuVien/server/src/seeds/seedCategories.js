/**
 * Seed 10 danh mục sách cho hệ thống thư viện
 * Chạy: node src/seeds/seedCategories.js
 */

require('dotenv').config();
const { sequelize } = require('../config/connectDB');
const Category = require('../models/category.model');

const createSlug = (name) =>
    name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

const CATEGORIES = [
    {
        name: 'Giáo trình & Tài liệu học tập',
        description: 'Sách giáo trình đại học, tài liệu tham khảo cho sinh viên và giảng viên các ngành.',
    },
    {
        name: 'Khoa học & Công nghệ',
        description: 'Sách về khoa học máy tính, lập trình, kỹ thuật phần mềm, trí tuệ nhân tạo.',
    },
    {
        name: 'Kinh tế & Quản trị',
        description: 'Kinh tế học, quản trị kinh doanh, tài chính, marketing và kế toán.',
    },
    {
        name: 'Văn học & Nghệ thuật',
        description: 'Tiểu thuyết, truyện ngắn, thơ ca, kịch bản và các tác phẩm nghệ thuật.',
    },
    {
        name: 'Kỹ năng mềm & Phát triển bản thân',
        description: 'Sách kỹ năng sống, tư duy, lãnh đạo, giao tiếp và phát triển cá nhân.',
    },
    {
        name: 'Toán học & Thống kê',
        description: 'Giải tích, đại số tuyến tính, xác suất thống kê, toán rời rạc.',
    },
    {
        name: 'Y học & Sức khỏe',
        description: 'Sách y học, dược học, chăm sóc sức khỏe và điều dưỡng.',
    },
    {
        name: 'Ngoại ngữ',
        description: 'Học tiếng Anh, tiếng Nhật, tiếng Hàn và các ngôn ngữ khác qua sách tham khảo.',
    },
    {
        name: 'Lịch sử & Địa lý',
        description: 'Lịch sử Việt Nam, lịch sử thế giới, địa lý tự nhiên và kinh tế xã hội.',
    },
    {
        name: 'Triết học & Tâm lý học',
        description: 'Triết học phương Đông, phương Tây, tâm lý học hành vi và giáo dục.',
    },
];

async function seed() {
    try {
        // Kết nối DB
        await sequelize.authenticate();
        console.log('✅ Kết nối MySQL thành công');

        // Sync bảng categories
        await Category.sync({ alter: true });
        console.log('✅ Bảng categories đã sẵn sàng');

        let created = 0;
        let skipped = 0;

        for (const cat of CATEGORIES) {
            const slug = createSlug(cat.name);
            const exists = await Category.findOne({ where: { slug } });
            if (exists) {
                console.log(`⏩ Bỏ qua (đã tồn tại): ${cat.name}`);
                skipped++;
            } else {
                await Category.create({ ...cat, slug });
                console.log(`✅ Đã thêm: ${cat.name}`);
                created++;
            }
        }

        console.log(`\n🎉 Hoàn thành! Đã thêm ${created} danh mục, bỏ qua ${skipped} danh mục.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
}

seed();
