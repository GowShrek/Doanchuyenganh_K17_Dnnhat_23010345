const { Op } = require('sequelize');
const { Author } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

const createSlug = (name) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);

class AuthorService {
    static async getAll({ search = '', page = 1, limit = 10, isActive } = {}) {
        const where = {};
        if (search) {
            where[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { penName: { [Op.like]: `%${search}%` } },
            ];
        }
        if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
        const { count, rows } = await Author.findAndCountAll({
            where, order: [['fullName', 'ASC']],
            limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
        });
        return { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), authors: rows };
    }

    static async getById(id) {
        const author = await Author.findByPk(id);
        if (!author) throw new NotFoundError('Không tìm thấy tác giả');
        return author;
    }

    static async create(data) {
        if (!data.fullName) throw new BadRequestError('Họ tên tác giả là bắt buộc');
        const slug = createSlug(data.fullName);
        return await Author.create({ ...data, slug });
    }

    static async update(id, data) {
        const author = await Author.findByPk(id);
        if (!author) throw new NotFoundError('Không tìm thấy tác giả');
        await author.update(data);
        return author;
    }

    static async delete(id) {
        const author = await Author.findByPk(id);
        if (!author) throw new NotFoundError('Không tìm thấy tác giả');
        await author.destroy();
        return { message: 'Đã xóa tác giả' };
    }

    static async toggleActive(id) {
        const author = await Author.findByPk(id);
        if (!author) throw new NotFoundError('Không tìm thấy tác giả');
        await author.update({ isActive: !author.isActive });
        return author;
    }
}

module.exports = AuthorService;
