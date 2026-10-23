const { Op } = require('sequelize');
const { Book, Author, Genre, Category, Publisher } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

const createSlug = (title) =>
    title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6);

const BOOK_INCLUDES = [
    { model: Category, as: 'category', attributes: ['id', 'name'] },
    { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
    { model: Author, as: 'authors', attributes: ['id', 'fullName', 'penName'], through: { attributes: [] } },
    { model: Genre, as: 'genres', attributes: ['id', 'name', 'color'], through: { attributes: [] } },
];

class BookService {
    // ── List with search / filter / pagination ─────────────────────
    static async getAll({ search = '', page = 1, limit = 10, categoryId, publisherId, isActive, authorId, genreId, yearFrom, yearTo, available, sortBy } = {}) {
        const where = {};
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { isbn: { [Op.like]: `%${search}%` } },
            ];
        }
        if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
        if (categoryId) where.categoryId = categoryId;
        if (publisherId) where.publisherId = publisherId;
        if (yearFrom) where.publishYear = { ...where.publishYear, [Op.gte]: parseInt(yearFrom) };
        if (yearTo) where.publishYear = { ...where.publishYear, [Op.lte]: parseInt(yearTo) };
        if (available === 'true' || available === true) where.availableQuantity = { [Op.gt]: 0 };

        const include = BOOK_INCLUDES.map(i => ({ ...i }));

        // Filter by author or genre if provided
        if (authorId) {
            include.find(i => i.as === 'authors').where = { id: authorId };
            include.find(i => i.as === 'authors').required = true;
        }
        if (genreId) {
            include.find(i => i.as === 'genres').where = { id: genreId };
            include.find(i => i.as === 'genres').required = true;
        }

        // Sort
        let order = [['createdAt', 'DESC']];
        if (sortBy === 'title') order = [['title', 'ASC']];
        if (sortBy === 'year_desc') order = [['publishYear', 'DESC']];
        if (sortBy === 'year_asc') order = [['publishYear', 'ASC']];
        if (sortBy === 'newest') order = [['createdAt', 'DESC']];

        const { count, rows } = await Book.findAndCountAll({
            where,
            include,
            order,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            distinct: true,
        });

        return { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), books: rows };
    }

    // ── Get single book ────────────────────────────────────────────
    static async getById(id) {
        const book = await Book.findByPk(id, { include: BOOK_INCLUDES });
        if (!book) throw new NotFoundError('Không tìm thấy sách');
        return book;
    }

    // ── Create book ────────────────────────────────────────────────
    static async create({ title, isbn, description, coverImage, publishYear, language, pageCount, price,
        totalQuantity, categoryId, publisherId, authorIds = [], genreIds = [], isActive }) {
        if (!title) throw new BadRequestError('Tên sách là bắt buộc');
        if (isbn) {
            const exists = await Book.findOne({ where: { isbn } });
            if (exists) throw new BadRequestError('ISBN đã tồn tại');
        }
        const slug = createSlug(title);
        const qty = parseInt(totalQuantity) || 1;
        // coverImage có thể là string URL (1 ảnh) hoặc array
        const images = Array.isArray(coverImage) ? coverImage : (coverImage ? [coverImage] : []);
        const book = await Book.create({
            title, isbn, slug, description, coverImage: images,
            publishYear, language, pageCount, price,
            totalQuantity: qty, availableQuantity: qty,
            categoryId, publisherId, isActive: isActive ?? true,
        });

        // Set many-to-many
        if (authorIds.length) await book.setAuthors(authorIds);
        if (genreIds.length) await book.setGenres(genreIds);

        return BookService.getById(book.id);
    }

    // ── Update book ────────────────────────────────────────────────
    static async update(id, { title, isbn, description, coverImage, pdfFile, publishYear, language,
        pageCount, price, totalQuantity, availableQuantity, categoryId, publisherId,
        authorIds, genreIds, isActive }) {
        const book = await Book.findByPk(id);
        if (!book) throw new NotFoundError('Không tìm thấy sách');

        // ISBN trùng (ngoại trừ chính nó)
        if (isbn && isbn !== book.isbn) {
            const exists = await Book.findOne({ where: { isbn } });
            if (exists) throw new BadRequestError('ISBN đã tồn tại');
        }

        const images = Array.isArray(coverImage) ? coverImage
            : (coverImage !== undefined ? (coverImage ? [coverImage] : []) : book.coverImage);

        await book.update({
            title: title ?? book.title,
            slug: title ? createSlug(title) : book.slug,
            isbn: isbn ?? book.isbn,
            description: description ?? book.description,
            coverImage: images,
            publishYear: publishYear ?? book.publishYear,
            language: language ?? book.language,
            pageCount: pageCount ?? book.pageCount,
            price: price ?? book.price,
            totalQuantity: totalQuantity ?? book.totalQuantity,
            availableQuantity: availableQuantity ?? book.availableQuantity,
            categoryId: categoryId ?? book.categoryId,
            publisherId: publisherId ?? book.publisherId,
            isActive: isActive ?? book.isActive,
        });

        if (authorIds !== undefined) await book.setAuthors(authorIds);
        if (genreIds !== undefined) await book.setGenres(genreIds);

        return BookService.getById(book.id);
    }

    // ── Delete book ────────────────────────────────────────────────
    static async delete(id) {
        const book = await Book.findByPk(id);
        if (!book) throw new NotFoundError('Không tìm thấy sách');
        await book.destroy();
        return { message: 'Đã xóa sách' };
    }

    // ── Toggle active ──────────────────────────────────────────────
    static async toggleActive(id) {
        const book = await Book.findByPk(id);
        if (!book) throw new NotFoundError('Không tìm thấy sách');
        await book.update({ isActive: !book.isActive });
        return book;
    }
}

module.exports = BookService;
