require('dotenv').config();
const { sequelize } = require('../config/connectDB');
const Publisher = require('../models/publisher.model');

const createSlug = (name) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

const PUBLISHERS = [
    { name: 'NXB Giáo Dục Việt Nam', address: '81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', phone: '024 39422555', email: 'nxbgd@moet.edu.vn', website: 'https://www.nxbgd.vn', description: 'Nhà xuất bản hàng đầu Việt Nam chuyên xuất bản sách giáo khoa và tài liệu giáo dục.' },
    { name: 'NXB Đại học Quốc gia Hà Nội', address: '16 Hàng Chuối, Hai Bà Trưng, Hà Nội', phone: '024 39714897', email: 'nxb@vnu.edu.vn', website: 'https://nxb.vnu.edu.vn', description: 'Xuất bản sách học thuật, giáo trình và tài liệu nghiên cứu của ĐHQG Hà Nội.' },
    { name: 'NXB Đại học Quốc gia TP.HCM', address: 'Phòng 501, Nhà điều hành ĐHQG, Thủ Đức, TP.HCM', phone: '028 37247172', email: 'nxb@vnuhcm.edu.vn', website: 'https://press.vnuhcm.edu.vn', description: 'Đơn vị xuất bản sách khoa học kỹ thuật và đào tạo của ĐHQG TP.HCM.' },
    { name: 'NXB Khoa học & Kỹ thuật', address: '70 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', phone: '024 39422366', email: 'contact@nxbkhkt.com.vn', website: 'https://www.nxbkhkt.com.vn', description: 'Chuyên xuất bản sách khoa học, kỹ thuật, công nghệ và các lĩnh vực liên quan.' },
    { name: 'NXB Trẻ', address: '161B Lý Chính Thắng, Quận 3, TP.HCM', phone: '028 39316289', email: 'info@nxbtre.com.vn', website: 'https://www.nxbtre.com.vn', description: 'Một trong những NXB tư nhân lớn nhất, chuyên văn học trong và ngoài nước.' },
    { name: 'NXB Kim Đồng', address: '55 Quang Trung, Hai Bà Trưng, Hà Nội', phone: '024 39434730', email: 'nxbkd@nxbkimdong.com.vn', website: 'https://www.nxbkimdong.com.vn', description: 'Nhà xuất bản chuyên về sách thiếu nhi và văn học dành cho trẻ em.' },
    { name: 'NXB Tổng hợp TP.HCM', address: '62 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', phone: '028 38256804', email: 'nxbth@hcm.vnn.vn', website: 'https://www.nxbhcm.com.vn', description: 'Xuất bản đa dạng các thể loại: văn học, khoa học xã hội, kinh tế, du lịch.' },
    { name: 'NXB Thông tin & Truyền thông', address: '115 Trần Duy Hưng, Cầu Giấy, Hà Nội', phone: '024 37622730', email: 'contact@nxbtt.vn', website: 'https://www.nxbtt.vn', description: 'Chuyên về sách công nghệ thông tin, viễn thông và truyền thông số.' },
    { name: 'NXB Lao động', address: '175 Giảng Võ, Ba Đình, Hà Nội', phone: '024 38517936', email: 'nxbld@laodong.com.vn', website: 'https://www.nxblaodong.com.vn', description: 'Xuất bản sách luật, kinh tế, kỹ năng nghề nghiệp và phát triển bản thân.' },
    { name: 'NXB Chính trị Quốc gia Sự thật', address: '6/86 Duy Tân, Cầu Giấy, Hà Nội', phone: '024 39423586', email: 'info@nxbctqg.vn', website: 'https://www.nxbctqg.vn', description: 'Chuyên xuất bản sách lý luận chính trị, pháp luật, lịch sử và khoa học xã hội.' },
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối MySQL thành công');
        await Publisher.sync({ alter: true });
        console.log('✅ Bảng publishers đã sẵn sàng');

        let created = 0, skipped = 0;
        for (const p of PUBLISHERS) {
            const slug = createSlug(p.name);
            const exists = await Publisher.findOne({ where: { slug } });
            if (exists) { console.log(`⏩ Bỏ qua: ${p.name}`); skipped++; }
            else { await Publisher.create({ ...p, slug }); console.log(`✅ Đã thêm: ${p.name}`); created++; }
        }

        console.log(`\n🎉 Hoàn thành! Đã thêm ${created} NXB, bỏ qua ${skipped}.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
}

seed();
