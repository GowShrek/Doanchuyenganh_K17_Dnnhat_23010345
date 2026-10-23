require('dotenv').config();
const { sequelize } = require('../config/connectDB');
const Author = require('../models/author.model');

const createSlug = (name) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);

const AUTHORS = [
    { fullName: 'Nguyễn Du', penName: null, bio: 'Đại thi hào dân tộc Việt Nam, tác giả của kiệt tác Truyện Kiều – tác phẩm văn học bất hủ của văn học Việt Nam.', birthYear: 1766, nationality: 'Việt Nam' },
    { fullName: 'Nam Cao', penName: 'Trần Hữu Tri', bio: 'Nhà văn hiện thực xuất sắc, nổi tiếng với "Chí Phèo", "Lão Hạc" và nhiều tác phẩm phản ánh xã hội Việt Nam trước Cách mạng.', birthYear: 1917, nationality: 'Việt Nam' },
    { fullName: 'Tô Hoài', penName: null, bio: 'Nhà văn lớn của văn học Việt Nam hiện đại, tác giả "Dế mèn phiêu lưu ký" và hàng trăm tác phẩm khác.', birthYear: 1920, nationality: 'Việt Nam' },
    { fullName: 'Nguyễn Nhật Ánh', penName: null, bio: 'Nhà văn yêu thích của nhiều thế hệ thiếu nhi và thanh thiếu niên Việt Nam với hàng trăm đầu sách về tuổi thơ.', birthYear: 1955, nationality: 'Việt Nam' },
    { fullName: 'Võ Quảng', penName: null, bio: 'Nhà thơ, nhà văn viết cho thiếu nhi, với những tác phẩm gắn liền với tuổi thơ nhiều thế hệ bạn đọc Việt Nam.', birthYear: 1920, nationality: 'Việt Nam' },
    { fullName: 'Dale Carnegie', penName: null, bio: 'Tác giả người Mỹ nổi tiếng với "Đắc nhân tâm" – cuốn sách kỹ năng mềm bán chạy nhất mọi thời đại.', birthYear: 1888, nationality: 'Hoa Kỳ', website: 'https://www.dalecarnegie.com' },
    { fullName: 'Stephen Hawking', penName: null, bio: 'Nhà vật lý lý thuyết và vũ trụ học người Anh, nổi tiếng với "Lược sử thời gian" và các công trình về lỗ đen.', birthYear: 1942, nationality: 'Anh Quốc' },
    { fullName: 'Haruki Murakami', penName: null, bio: 'Tiểu thuyết gia người Nhật nổi tiếng toàn cầu, tác giả của "Rừng Na Uy", "Kafka bên bờ biển" và nhiều kiệt tác khác.', birthYear: 1949, nationality: 'Nhật Bản', website: 'https://www.harukimurakami.com' },
    { fullName: 'Paulo Coelho', penName: null, bio: 'Nhà văn người Brazil nổi tiếng với "Nhà giả kim" – một trong những cuốn sách bán chạy nhất lịch sử.', birthYear: 1947, nationality: 'Brazil', website: 'https://paulocoelhoblog.com' },
    { fullName: 'George Orwell', penName: 'Eric Arthur Blair', bio: 'Nhà văn, nhà báo người Anh, tác giả của "1984" và "Trại súc vật" – những tác phẩm phê phán chủ nghĩa toàn trị.', birthYear: 1903, nationality: 'Anh Quốc' },
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối MySQL thành công');
        await Author.sync({ alter: true });
        console.log('✅ Bảng authors đã sẵn sàng');

        let created = 0, skipped = 0;
        for (const a of AUTHORS) {
            const exists = await Author.findOne({ where: { fullName: a.fullName } });
            if (exists) { console.log(`⏩ Bỏ qua: ${a.fullName}`); skipped++; }
            else {
                await Author.create({ ...a, slug: createSlug(a.fullName) });
                console.log(`✅ Đã thêm: ${a.fullName}`);
                created++;
            }
        }

        console.log(`\n🎉 Hoàn thành! Đã thêm ${created} tác giả, bỏ qua ${skipped}.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
}

seed();
