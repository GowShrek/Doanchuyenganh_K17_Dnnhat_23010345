/**
 * Seed sách từ dữ liệu Tiki (Sách Văn Học)
 * Chạy: node src/seeds/seedBooks.js
 */
require('dotenv').config();
const { sequelize } = require('../config/connectDB');
const { Book, Author, Genre, Category, Publisher, BookAuthor, BookGenre } = require('../models/index');

const createSlug = (title) =>
    title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80)
    + '-' + Date.now().toString().slice(-6);

// ── Dữ liệu sách lấy từ Tiki ────────────────────────────────────────────────
const BOOKS = [
    { title: 'Nhân Sinh Dù Rộng Lớn, Muôn Kiếp Vẫn Gặp Người', author: 'Littlebbear96', price: 83500, genres: ['Văn học lãng mạn'] },
    { title: 'Khế Ước Bán Dâu', author: 'Thục Linh', price: 181500, genres: ['Tiểu thuyết'] },
    { title: 'Người Tình Hào Hoa', author: 'Guy De Maupassant', price: 112000, genres: ['Văn học nước ngoài'] },
    { title: 'Chúng Ta Của Hiện Tại', author: 'Becky Albertalli', price: 85300, genres: ['Văn học lãng mạn'] },
    { title: 'Kẻ Song Trùng', author: 'Stephen King', price: 216800, genres: ['Văn học kinh dị'] },
    { title: 'Mình Chia Tay Rồi, Có Nhớ Không?', author: 'Lavende', price: 69000, genres: ['Văn học lãng mạn'] },
    { title: 'Thương Tiến Tửu', author: 'Đường Tửu Khanh', price: 108000, genres: ['Tiểu thuyết'] },
    { title: 'Cô Bé Hàng Xóm Và Bốn Viên Kẹo', author: 'Nguyễn Nhật Ánh', price: 88000, genres: ['Văn học Việt Nam'] },
    { title: 'Britney Spears - Người Đàn Bà Trong Tôi', author: 'Britney Spears', price: 144760, genres: ['Hồi ký'] },
    { title: 'Cù Lao Tràm', author: 'Nguyễn Mạnh Tuấn', price: 156000, genres: ['Văn học Việt Nam'], publisher: 'NXB Văn Lang' },
    { title: 'Lòng Tôi Nhẹ Khi Mẹ Rời Xa', author: 'Jennette McCurdy', price: 152460, genres: ['Hồi ký'] },
    { title: 'Ma Đạo Tổ Sư', author: 'Mặc Hương Đồng Khứu', price: 114400, genres: ['Tiểu thuyết'] },
    { title: 'Ngũ Hành Của Tôi Thiếu Em', author: 'Tây Tử Tự', price: 125000, genres: ['Văn học lãng mạn'] },
    { title: 'Thiên Tài Bên Trái, Kẻ Điên Bên Phải', author: 'Cao Minh', price: 161350, genres: ['Tâm lý học'] },
    { title: 'Những Kẻ Ăn Sách', author: 'Sunyi Dean', price: 154600, genres: ['Văn học kinh dị'] },
    { title: 'Hà Thanh Hải Yến - Ngang Qua Ngõ Nhỏ Bình An', author: 'Quất Tử Bất Toán', price: 125300, genres: ['Văn học lãng mạn'] },
    { title: 'Kiêu Hãnh Và Định Kiến', author: 'Jane Austen', price: 147000, genres: ['Văn học nước ngoài'] },
    { title: 'Sứ Mệnh Hail Mary', author: 'Andy Weir', price: 156750, genres: ['Khoa học viễn tưởng'] },
    { title: 'Thiên Quan Tứ Phúc', author: 'Mặc Hương Đồng Khứu', price: 108000, genres: ['Tiểu thuyết'] },
    { title: 'Cô Gái Chọc Tổ Ong Bầu', author: 'Stieg Larsson', price: 135520, genres: ['Văn học trinh thám'] },
    { title: 'Bí Ẩn Phố Âm Dương', author: 'Hà Mạt Bì', price: 124700, genres: ['Văn học kinh dị'] },
    { title: 'Piranesi - Bí Ẩn Ngôi Nhà Vô Tận', author: 'Susanna Clarke', price: 117700, genres: ['Khoa học viễn tưởng'] },
    { title: 'Điểm Đoạt Mạng', author: 'Ngô Hiểu Lạc', price: 145900, genres: ['Văn học trinh thám'] },
    { title: 'Rừng Na Uy', author: 'Haruki Murakami', price: 142000, genres: ['Văn học nước ngoài'] },
    { title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', price: 92000, genres: ['Kỹ năng sống'] },
    { title: '1984', author: 'George Orwell', price: 99000, genres: ['Khoa học viễn tưởng'] },
    { title: 'Nhà Giả Kim', author: 'Paulo Coelho', price: 79000, genres: ['Văn học lãng mạn'] },
    { title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', price: 65000, genres: ['Văn học Việt Nam'] },
];

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Kết nối MySQL thành công');
        await sequelize.sync();
        console.log('✅ Tables synced\n');

        // Lấy danh mục "Văn học" (nếu có)
        const categoryVanHoc = await Category.findOne({ where: { name: 'Văn học' } });
        const categoryId = categoryVanHoc?.id || null;

        let created = 0, skipped = 0, errors = 0;

        for (const bookData of BOOKS) {
            try {
                // Kiểm tra trùng
                const exists = await Book.findOne({ where: { title: bookData.title } });
                if (exists) {
                    console.log(`⏩ Bỏ qua (đã tồn tại): ${bookData.title}`);
                    skipped++;
                    continue;
                }

                // Tìm/tạo tác giả
                let author = null;
                if (bookData.author) {
                    author = await Author.findOne({ where: { fullName: bookData.author } });
                    if (!author) {
                        const slug = bookData.author.toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
                            .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
                            + '-' + Date.now().toString().slice(-4);
                        author = await Author.create({ fullName: bookData.author, slug, nationality: 'Việt Nam' });
                    }
                }

                // Tìm NXB nếu có
                let publisherId = null;
                if (bookData.publisher) {
                    const pub = await Publisher.findOne({ where: { name: bookData.publisher } });
                    if (pub) publisherId = pub.id;
                }

                // Tạo sách
                const totalQuantity = Math.floor(Math.random() * 10) + 3; // 3-12 cuốn
                const borrowedQuantity = Math.floor(Math.random() * Math.min(3, totalQuantity));

                const book = await Book.create({
                    title: bookData.title,
                    slug: createSlug(bookData.title),
                    isbn: null,
                    price: bookData.price,
                    language: 'Tiếng Việt',
                    totalQuantity,
                    availableQuantity: totalQuantity - borrowedQuantity,
                    borrowedQuantity,
                    categoryId,
                    publisherId,
                    isActive: true,
                });

                // Gắn tác giả
                if (author) await book.setAuthors([author.id]);

                // Gắn thể loại
                if (bookData.genres?.length) {
                    const genreIds = [];
                    for (const gName of bookData.genres) {
                        let genre = await Genre.findOne({ where: { name: gName } });
                        if (genre) genreIds.push(genre.id);
                    }
                    if (genreIds.length) await book.setGenres(genreIds);
                }

                console.log(`✅ Thêm: ${bookData.title} (SL: ${totalQuantity})`);
                created++;
            } catch (err) {
                console.error(`❌ Lỗi khi thêm "${bookData.title}": ${err.message}`);
                errors++;
            }
        }

        console.log(`\n--- Kết quả ---`);
        console.log(`✅ Đã thêm : ${created} sách`);
        console.log(`⏩ Bỏ qua  : ${skipped} sách (đã tồn tại)`);
        if (errors) console.log(`❌ Lỗi     : ${errors} sách`);
        console.log(`🎉 Hoàn thành!`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
        process.exit(1);
    }
}

seed();
