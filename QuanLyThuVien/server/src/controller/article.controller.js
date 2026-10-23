const ArticleService = require('../services/article.service');
const { Created, OK } = require('../core/success.response');

class ArticleController {
    async create(req, res) {
        const data = await ArticleService.create(req.user.id, req.body);
        new Created({ message: 'Tạo bài viết thành công', metadata: data }).send(res);
    }

    async getAll(req, res) {
        const data = await ArticleService.getAll(req.query);
        new OK({ message: 'Lấy danh sách bài viết thành công', metadata: data }).send(res);
    }

    async getBySlug(req, res) {
        const data = await ArticleService.getBySlug(req.params.slug);
        new OK({ message: 'Lấy chi tiết bài viết thành công', metadata: data }).send(res);
    }

    async getById(req, res) {
        const data = await ArticleService.getById(req.params.id);
        new OK({ message: 'Lấy chi tiết bài viết thành công', metadata: data }).send(res);
    }

    async update(req, res) {
        const data = await ArticleService.update(req.params.id, req.body);
        new OK({ message: 'Cập nhật bài viết thành công', metadata: data }).send(res);
    }

    async delete(req, res) {
        await ArticleService.delete(req.params.id);
        new OK({ message: 'Xóa bài viết thành công' }).send(res);
    }

    async toggleStatus(req, res) {
        const data = await ArticleService.toggleStatus(req.params.id);
        new OK({ message: 'Đổi trạng thái bài viết thành công', metadata: data }).send(res);
    }
}

module.exports = new ArticleController();
