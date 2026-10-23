const { Op } = require('sequelize');
const { Category } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

// Tạo slug từ tên
const createSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
};

class CategoryService {
    // Lấy tất cả danh mục (có search, phân trang, filter active)
    static async getAll({ search = '', page = 1, limit = 20, isActive } = {}) {
        const where = {};
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true' || isActive === true;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Category.findAndCountAll({
            where,
            order: [['name', 'ASC']],
            limit: parseInt(limit),
            offset,
        });

        return {
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            categories: rows,
        };
    }

    // Lấy 1 danh mục theo id
    static async getById(id) {
        const category = await Category.findByPk(id);
        if (!category) throw new NotFoundError('Không tìm thấy danh mục');
        return category;
    }

    // Tạo danh mục mới
    static async create({ name, description, image }) {
        if (!name) throw new BadRequestError('Tên danh mục là bắt buộc');

        const slug = createSlug(name);

        const exists = await Category.findOne({ where: { name } });
        if (exists) throw new BadRequestError('Tên danh mục đã tồn tại');

        const category = await Category.create({ name, slug, description, image });
        return category;
    }

    // Cập nhật danh mục
    static async update(id, { name, description, image, isActive }) {
        const category = await Category.findByPk(id);
        if (!category) throw new NotFoundError('Không tìm thấy danh mục');

        // Kiểm tra trùng tên (ngoại trừ chính nó)
        if (name && name !== category.name) {
            const exists = await Category.findOne({ where: { name } });
            if (exists) throw new BadRequestError('Tên danh mục đã tồn tại');
        }

        await category.update({
            name: name ?? category.name,
            slug: name ? createSlug(name) : category.slug,
            description: description ?? category.description,
            image: image ?? category.image,
            isActive: isActive ?? category.isActive,
        });

        return category;
    }

    // Xóa danh mục
    static async delete(id) {
        const category = await Category.findByPk(id);
        if (!category) throw new NotFoundError('Không tìm thấy danh mục');

        await category.destroy();
        return { message: 'Đã xóa danh mục thành công' };
    }

    // Bật/tắt hiển thị
    static async toggleActive(id) {
        const category = await Category.findByPk(id);
        if (!category) throw new NotFoundError('Không tìm thấy danh mục');

        await category.update({ isActive: !category.isActive });
        return category;
    }
}

module.exports = CategoryService;
