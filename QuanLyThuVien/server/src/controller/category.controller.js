const CategoryService = require('../services/category.service');
const { OK, Created } = require('../core/success.response');

class CategoryController {
    // GET /api/categories
    static async getAll(req, res) {
        const { search, page, limit, isActive } = req.query;
        const data = await CategoryService.getAll({ search, page, limit, isActive });
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // GET /api/categories/:id
    static async getById(req, res) {
        const data = await CategoryService.getById(req.params.id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // POST /api/categories
    static async create(req, res) {
        const data = await CategoryService.create(req.body);
        new Created({ message: 'Tạo danh mục thành công', metadata: data }).send(res);
    }

    // PUT /api/categories/:id
    static async update(req, res) {
        const data = await CategoryService.update(req.params.id, req.body);
        new OK({ message: 'Cập nhật thành công', metadata: data }).send(res);
    }

    // DELETE /api/categories/:id
    static async delete(req, res) {
        const data = await CategoryService.delete(req.params.id);
        new OK({ message: 'Xóa thành công', metadata: data }).send(res);
    }

    // PATCH /api/categories/:id/toggle
    static async toggleActive(req, res) {
        const data = await CategoryService.toggleActive(req.params.id);
        new OK({ message: 'Cập nhật trạng thái thành công', metadata: data }).send(res);
    }
}

module.exports = CategoryController;
