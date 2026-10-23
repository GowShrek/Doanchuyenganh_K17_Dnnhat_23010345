const Groq = require('groq-sdk');
const { Book, Borrow, Genre, Author, Category } = require('../models/index');
const { Op, literal } = require('sequelize');

const SystemConfigService = require('./systemConfig.service');

const MODEL = 'openai/gpt-oss-120b';

// ── Tóm tắt catalog sách để đưa vào context ──────────────────────
const buildBookCatalog = async () => {
    const books = await Book.findAll({
        where: { isActive: true },
        attributes: ['id', 'title', 'description', 'language', 'publishYear', 'availableQuantity', 'borrowedQuantity'],
        include: [
            { model: Author, as: 'authors', attributes: ['fullName', 'penName'], through: { attributes: [] } },
            { model: Genre, as: 'genres', attributes: ['name'], through: { attributes: [] } },
            { model: Category, as: 'category', attributes: ['name'] },
        ],
        limit: 80,
        order: [['borrowedQuantity', 'DESC']],
    });

    return books.map(b => ({
        id: b.id,
        title: b.title,
        authors: b.authors?.map(a => a.penName || a.fullName).join(', ') || 'Không rõ',
        genres: b.genres?.map(g => g.name).join(', ') || '',
        category: b.category?.name || '',
        year: b.publishYear,
        available: b.availableQuantity > 0,
        desc: b.description ? b.description.slice(0, 120) + (b.description.length > 120 ? '...' : '') : '',
    }));
};

// ── Lấy lịch sử mượn của user (nếu có) ──────────────────────────
const getUserHistory = async (userId) => {
    if (!userId) return [];
    const borrows = await Borrow.findAll({
        where: { userId },
        include: [{ model: Book, as: 'book', attributes: ['id', 'title'], include: [{ model: Genre, as: 'genres', attributes: ['name'], through: { attributes: [] } }] }],
        limit: 20,
        order: [['createdAt', 'DESC']],
    });
    return borrows.map(b => ({ id: b.book?.id, title: b.book?.title, genres: b.book?.genres?.map(g => g.name).join(', ') })).filter(b => b.title);
};

// ── Tìm sách trong DB khớp với titles mà AI đề xuất ─────────────
const findMatchingBooks = async (titles) => {
    if (!titles || titles.length === 0) return [];
    const results = await Promise.all(
        titles.map(title =>
            Book.findOne({
                where: { title: { [Op.like]: `%${title.slice(0, 15)}%` }, isActive: true },
                attributes: ['id', 'title', 'coverImage', 'availableQuantity', 'price'],
                include: [{ model: Author, as: 'authors', attributes: ['fullName', 'penName'], through: { attributes: [] } }],
            })
        )
    );
    return results.filter(Boolean);
};

class AiService {
    // ── Chat với AI, trả về response + sách gợi ý từ DB ─────────
    static async chat(messages, userId = null) {
        const apiKey = await SystemConfigService.get('GROQ_API_KEY');
        if (!apiKey) {
            return { content: 'Hệ thống chưa được cấu hình API Key cho AI.', suggestedBooks: [] };
        }
        const groq = new Groq({ apiKey });

        const [catalog, history] = await Promise.all([
            buildBookCatalog(),
            getUserHistory(userId),
        ]);

        const catalogText = catalog.map(b =>
            `[ID:${b.id}] "${b.title}" — ${b.authors} | ${b.genres} | ${b.category} | ${b.available ? 'còn sách' : 'hết sách'}${b.desc ? ' | ' + b.desc : ''}`
        ).join('\n');

        const historyText = history.length > 0
            ? `\nLịch sử mượn của độc giả:\n${history.map(h => `- "${h.title}" (${h.genres})`).join('\n')}`
            : '';

        const systemPrompt = `Bạn là trợ lý AI của Thư Viện Số — một hệ thống quản lý thư viện.
Nhiệm vụ: Gợi ý sách từ danh mục thư viện cho độc giả khi họ hỏi.

QUY TẮC:
1. Chỉ gợi ý sách có trong danh mục sau (không bịa sách ngoài danh mục).
2. Khi gợi ý sách, luôn kèm tiêu đề CHÍNH XÁC như trong danh mục và ID của sách.
3. Ưu tiên sách còn trong kho (còn sách).
4. Trả lời bằng tiếng Việt, thân thiện và ngắn gọn.
5. Khi liệt kê sách gợi ý, hãy thêm dòng cuối: SUGGESTED_BOOKS: ["Tiêu đề sách 1", "Tiêu đề sách 2", ...]
6. Tối đa gợi ý 4 cuốn mỗi lần.
${historyText}

DANH MỤC SÁCH THƯ VIỆN:
${catalogText}`;

        const groqMessages = [
            { role: 'system', content: systemPrompt },
            ...messages,
        ];

        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 1200,
        });

        const content = response.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

        // Parse SUGGESTED_BOOKS từ response
        let suggestedBooks = [];
        const match = content.match(/SUGGESTED_BOOKS:\s*\[([^\]]+)\]/);
        if (match) {
            try {
                const titles = JSON.parse(`[${match[1]}]`);
                const dbBooks = await findMatchingBooks(titles);
                suggestedBooks = dbBooks.map(b => ({
                    id: b.id,
                    title: b.title,
                    authors: b.authors?.map(a => a.penName || a.fullName).join(', ') || '',
                    coverImage: Array.isArray(b.coverImage) ? b.coverImage[0] : b.coverImage,
                    availableQuantity: b.availableQuantity,
                    price: b.price,
                }));
            } catch (_) {}
        }

        // Xóa dòng SUGGESTED_BOOKS khỏi text hiển thị
        const cleanContent = content.replace(/\n?SUGGESTED_BOOKS:\s*\[[^\]]*\]/g, '').trim();

        return {
            content: cleanContent,
            suggestedBooks,
            usage: response.usage,
        };
    }
}

module.exports = AiService;
