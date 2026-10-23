const { Op, fn, col, literal } = require('sequelize');
const { Book, User, Borrow, Fine, Category } = require('../models');

class DashboardService {
    async getDashboardStats() {
        // 1. STATS TỔNG QUAN
        const [totalBooks, totalTitles, totalReaders, totalBorrows, activeBorrows, overdueBorrows, totalFines] = await Promise.all([
            Book.sum('totalQuantity'),
            Book.count(),
            User.count({ where: { role: 'reader' } }),
            Borrow.count(),
            Borrow.count({ where: { status: 'approved' } }),
            Borrow.count({ where: { status: 'overdue' } }),
            Fine.sum('amount', { where: { status: 'paid' } }),
        ]);

        // 2. BIỂU ĐỒ MƯỢN TRẢ 6 THÁNG
        // Để dễ dàng với mọi CSDL, lấy 6 tháng gần nhất bằng cách fetch Borrows và group bằng JS
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const borrowsData = await Borrow.findAll({
            where: {
                createdAt: { [Op.gte]: sixMonthsAgo }
            },
            attributes: ['createdAt', 'returnDate']
        });

        const monthsMap = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mLabel = `Thg ${d.getMonth() + 1}`;
            monthsMap[mLabel] = { label: mLabel, borrows: 0, returns: 0, yearMonth: `${d.getFullYear()}-${d.getMonth()}` };
        }

        borrowsData.forEach(b => {
            const bDate = new Date(b.createdAt);
            const bLabel = `Thg ${bDate.getMonth() + 1}`;
            if (monthsMap[bLabel]) monthsMap[bLabel].borrows += 1;

            if (b.returnDate) {
                const rDate = new Date(b.returnDate);
                const rLabel = `Thg ${rDate.getMonth() + 1}`;
                if (monthsMap[rLabel]) monthsMap[rLabel].returns += 1;
            }
        });

        const borrowsByMonth = Object.values(monthsMap);

        // 3. BIỂU ĐỒ THỂ LOẠI (Danh mục)
        const booksByCategoryRaw = await Book.findAll({
            attributes: ['categoryId', [fn('COUNT', col('Book.id')), 'count']],
            group: ['categoryId'],
            include: [{ model: Category, as: 'category', attributes: ['name'] }]
        });

        const booksByCategory = booksByCategoryRaw.map(item => ({
            category: item.category?.name || 'Chưa phân loại',
            count: parseInt(item.getDataValue('count'), 10)
        }));

        // 4. TOP SÁCH MƯỢN NHIỀU
        const topBooksRaw = await Borrow.findAll({
            attributes: ['bookId', [fn('COUNT', col('Borrow.id')), 'borrowCount']],
            group: ['bookId'],
            order: [[literal('borrowCount'), 'DESC']],
            limit: 5,
            include: [{ model: Book, as: 'book', attributes: ['title', 'coverImage'] }]
        });
        const topBooks = topBooksRaw.map(t => ({
            id: t.bookId,
            title: t.book?.title,
            coverImage: t.book?.coverImage?.[0] || null,
            borrowCount: parseInt(t.getDataValue('borrowCount'), 10)
        }));

        // 5. TOP ĐỘC GIẢ MƯỢN NHIỀU
        const topReadersRaw = await Borrow.findAll({
            attributes: ['userId', [fn('COUNT', col('Borrow.id')), 'borrowCount']],
            group: ['userId'],
            order: [[literal('borrowCount'), 'DESC']],
            limit: 5,
            include: [{ model: User, as: 'reader', attributes: ['fullName', 'email', 'avatar'] }]
        });
        const topReaders = topReadersRaw.map(t => ({
            id: t.userId,
            fullName: t.reader?.fullName,
            email: t.reader?.email,
            avatar: t.reader?.avatar,
            borrowCount: parseInt(t.getDataValue('borrowCount'), 10)
        }));

        // 6. YÊU CẦU GẦN ĐÂY
        const recentRequests = await Borrow.findAll({
            where: { status: 'pending' },
            order: [['createdAt', 'DESC']],
            limit: 5,
            include: [
                { model: Book, as: 'book', attributes: ['title'], include: [{ model: Category, as: 'category', attributes: ['name'] }] },
                { model: User, as: 'reader', attributes: ['fullName', 'studentId', 'avatar'] }
            ]
        });

        return {
            stats: {
                totalBooks: totalBooks || 0,
                totalTitles: totalTitles || 0,
                totalReaders: totalReaders || 0,
                totalBorrows: totalBorrows || 0,
                activeBorrows: activeBorrows || 0,
                overdueBorrows: overdueBorrows || 0,
                totalFines: totalFines || 0
            },
            charts: {
                borrowsByMonth,
                booksByCategory
            },
            topBooks,
            topReaders,
            recentRequests: recentRequests.map(r => ({
                id: r.id,
                readerName: r.reader?.fullName,
                readerAvatar: r.reader?.avatar,
                studentId: r.reader?.studentId,
                bookTitle: r.book?.title,
                categoryName: r.book?.category?.name || 'Khác',
                date: new Date(r.createdAt).toLocaleDateString('vi-VN')
            }))
        };
    }
}

module.exports = new DashboardService();
