const { Article, User } = require('../models');
const { NotFoundError, BadRequestError } = require('../core/error.response');
const { Op } = require('sequelize');

const generateSlug = (title) => {
    return title.toLowerCase()
        .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        .replace(/đ/gi, 'd')
        .replace(/[^a-z0-9 ]/g, '')
        .trim()
        .replace(/\s+/g, '-');
};

class ArticleService {
    static async create(authorId, data) {
        let slug = generateSlug(data.title);
        let existing = await Article.findOne({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        const article = await Article.create({
            ...data,
            slug,
            authorId
        });

        return Article.findByPk(article.id, {
            include: [{ model: User, as: 'author', attributes: ['fullName', 'avatar'] }]
        });
    }

    static async getAll({ page = 1, limit = 10, search, status }) {
        const where = {};
        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }
        if (status) {
            where.status = status;
        }

        const { count, rows } = await Article.findAndCountAll({
            where,
            include: [{ model: User, as: 'author', attributes: ['fullName', 'avatar'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        return {
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            articles: rows
        };
    }

    static async getBySlug(slug) {
        const article = await Article.findOne({
            where: { slug },
            include: [{ model: User, as: 'author', attributes: ['fullName', 'avatar'] }]
        });
        if (!article) throw new NotFoundError('Không tìm thấy bài viết');
        
        // Tăng view (không await để không block)
        article.increment('views');
        
        return article;
    }

    static async getById(id) {
        const article = await Article.findByPk(id, {
            include: [{ model: User, as: 'author', attributes: ['fullName', 'avatar'] }]
        });
        if (!article) throw new NotFoundError('Không tìm thấy bài viết');
        return article;
    }

    static async update(id, data) {
        const article = await Article.findByPk(id);
        if (!article) throw new NotFoundError('Không tìm thấy bài viết');

        if (data.title && data.title !== article.title) {
            let slug = generateSlug(data.title);
            let existing = await Article.findOne({ where: { slug, id: { [Op.ne]: id } } });
            if (existing) {
                slug = `${slug}-${Date.now()}`;
            }
            data.slug = slug;
        }

        await article.update(data);
        return Article.findByPk(id, {
            include: [{ model: User, as: 'author', attributes: ['fullName', 'avatar'] }]
        });
    }

    static async delete(id) {
        const article = await Article.findByPk(id);
        if (!article) throw new NotFoundError('Không tìm thấy bài viết');
        await article.destroy();
        return { ok: true };
    }

    static async toggleStatus(id) {
        const article = await Article.findByPk(id);
        if (!article) throw new NotFoundError('Không tìm thấy bài viết');
        
        const newStatus = article.status === 'published' ? 'draft' : 'published';
        await article.update({ status: newStatus });
        return article;
    }
}

module.exports = ArticleService;
