const { Op } = require('sequelize');
const { Genre } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

const createSlug = (name) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

class GenreService {
    static async getAll({ search = '', page = 1, limit = 50, isActive } = {}) {
        const where = {};
        if (search) where.name = { [Op.like]: `%${search}%` };
        if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

        const { count, rows } = await Genre.findAndCountAll({
            where,
            order: [['name', 'ASC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        return { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), genres: rows };
    }

    static async getById(id) {
        const genre = await Genre.findByPk(id);
        if (!genre) throw new NotFoundError('Không tìm thấy thể loại');
        return genre;
    }

    static async create({ name, description, color }) {
        if (!name) throw new BadRequestError('Tên thể loại là bắt buộc');
        const slug = createSlug(name);
        const exists = await Genre.findOne({ where: { name } });
        if (exists) throw new BadRequestError('Tên thể loại đã tồn tại');
        return await Genre.create({ name, slug, description, color });
    }

    static async update(id, { name, description, color, isActive }) {
        const genre = await Genre.findByPk(id);
        if (!genre) throw new NotFoundError('Không tìm thấy thể loại');
        if (name && name !== genre.name) {
            const exists = await Genre.findOne({ where: { name } });
            if (exists) throw new BadRequestError('Tên thể loại đã tồn tại');
        }
        await genre.update({
            name: name ?? genre.name,
            slug: name ? createSlug(name) : genre.slug,
            description: description ?? genre.description,
            color: color ?? genre.color,
            isActive: isActive ?? genre.isActive,
        });
        return genre;
    }

    static async delete(id) {
        const genre = await Genre.findByPk(id);
        if (!genre) throw new NotFoundError('Không tìm thấy thể loại');
        await genre.destroy();
        return { message: 'Đã xóa thể loại' };
    }

    static async toggleActive(id) {
        const genre = await Genre.findByPk(id);
        if (!genre) throw new NotFoundError('Không tìm thấy thể loại');
        await genre.update({ isActive: !genre.isActive });
        return genre;
    }
}

module.exports = GenreService;
