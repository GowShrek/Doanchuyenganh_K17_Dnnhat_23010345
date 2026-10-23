const { Op } = require('sequelize');
const { Publisher } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

const createSlug = (name) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

class PublisherService {
    static async getAll({ search = '', page = 1, limit = 10, isActive } = {}) {
        const where = {};
        if (search) where.name = { [Op.like]: `%${search}%` };
        if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
        const { count, rows } = await Publisher.findAndCountAll({
            where, order: [['name', 'ASC']],
            limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
        });
        return { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), publishers: rows };
    }

    static async getById(id) {
        const pub = await Publisher.findByPk(id);
        if (!pub) throw new NotFoundError('Không tìm thấy nhà xuất bản');
        return pub;
    }

    static async create(data) {
        if (!data.name) throw new BadRequestError('Tên nhà xuất bản là bắt buộc');
        const slug = createSlug(data.name);
        const exists = await Publisher.findOne({ where: { name: data.name } });
        if (exists) throw new BadRequestError('Nhà xuất bản đã tồn tại');
        return await Publisher.create({ ...data, slug });
    }

    static async update(id, data) {
        const pub = await Publisher.findByPk(id);
        if (!pub) throw new NotFoundError('Không tìm thấy nhà xuất bản');
        if (data.name && data.name !== pub.name) {
            const exists = await Publisher.findOne({ where: { name: data.name } });
            if (exists) throw new BadRequestError('Tên đã tồn tại');
        }
        await pub.update({ ...data, slug: data.name ? createSlug(data.name) : pub.slug });
        return pub;
    }

    static async delete(id) {
        const pub = await Publisher.findByPk(id);
        if (!pub) throw new NotFoundError('Không tìm thấy nhà xuất bản');
        await pub.destroy();
        return { message: 'Đã xóa nhà xuất bản' };
    }

    static async toggleActive(id) {
        const pub = await Publisher.findByPk(id);
        if (!pub) throw new NotFoundError('Không tìm thấy nhà xuất bản');
        await pub.update({ isActive: !pub.isActive });
        return pub;
    }
}

module.exports = PublisherService;
