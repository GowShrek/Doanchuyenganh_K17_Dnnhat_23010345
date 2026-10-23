require('dotenv').config();
const { sequelize } = require('../config/connectDB');
const Genre = require('../models/genre.model');

const createSlug = (name) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

const GENRES = [
    { name: 'Tiểu thuyết', description: 'Tác phẩm văn xuôi dài, xây dựng nhân vật và cốt truyện phức tạp.', color: '#7c3aed' },
    { name: 'Truyện ngắn', description: 'Tác phẩm văn xuôi ngắn, súc tích và tập trung vào một tình huống.', color: '#2563eb' },
    { name: 'Thơ ca', description: 'Thể loại văn học dùng ngôn ngữ giàu hình ảnh và nhịp điệu.', color: '#db2777' },
    { name: 'Khoa học viễn tưởng', description: 'Thể loại dựa trên khoa học và công nghệ tương lai, khám phá vũ trụ và xã hội.', color: '#0891b2' },
    { name: 'Kinh dị & Huyền bí', description: 'Câu chuyện mang yếu tố rùng rợn, bí ẩn và siêu nhiên.', color: '#374151' },
    { name: 'Lịch sử', description: 'Tác phẩm dựa trên bối cảnh lịch sử hoặc tái hiện các sự kiện lịch sử.', color: '#b45309' },
    { name: 'Trinh thám', description: 'Thể loại xoay quanh việc điều tra và giải quyết các vụ án bí ẩn.', color: '#1d4ed8' },
    { name: 'Tâm lý học ứng dụng', description: 'Sách phân tích hành vi, cảm xúc và tư duy con người.', color: '#059669' },
    { name: 'Hồi ký & Tiểu sử', description: 'Câu chuyện cuộc đời thực của các nhân vật nổi tiếng hoặc tác giả.', color: '#d97706' },
    { name: 'Sách thiếu nhi', description: 'Tác phẩm dành cho trẻ em với ngôn ngữ đơn giản và hình ảnh sinh động.', color: '#16a34a' },
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối MySQL thành công');
        await Genre.sync({ alter: true });
        console.log('✅ Bảng genres đã sẵn sàng');

        let created = 0, skipped = 0;
        for (const g of GENRES) {
            const slug = createSlug(g.name);
            const exists = await Genre.findOne({ where: { slug } });
            if (exists) { console.log(`⏩ Bỏ qua: ${g.name}`); skipped++; }
            else { await Genre.create({ ...g, slug }); console.log(`✅ Đã thêm: ${g.name}`); created++; }
        }

        console.log(`\n🎉 Hoàn thành! Đã thêm ${created} thể loại, bỏ qua ${skipped}.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
}

seed();
