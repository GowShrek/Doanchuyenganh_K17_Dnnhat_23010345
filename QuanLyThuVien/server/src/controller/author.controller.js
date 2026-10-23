const AuthorService = require('../services/author.service');
const { OK, Created } = require('../core/success.response');

class AuthorController {
    static async getAll(req, res) {
        new OK({ message: 'success', metadata: await AuthorService.getAll(req.query) }).send(res);
    }
    static async getById(req, res) {
        new OK({ message: 'success', metadata: await AuthorService.getById(req.params.id) }).send(res);
    }
    static async create(req, res) {
        new Created({ message: 'Tạo tác giả thành công', metadata: await AuthorService.create(req.body) }).send(res);
    }
    static async update(req, res) {
        new OK({ message: 'Cập nhật thành công', metadata: await AuthorService.update(req.params.id, req.body) }).send(
            res,
        );
    }
    static async delete(req, res) {
        new OK({ message: 'Xóa thành công', metadata: await AuthorService.delete(req.params.id) }).send(res);
    }
    static async toggleActive(req, res) {
        new OK({
            message: 'Cập nhật trạng thái thành công',
            metadata: await AuthorService.toggleActive(req.params.id),
        }).send(res);
    }
}

module.exports = AuthorController;
