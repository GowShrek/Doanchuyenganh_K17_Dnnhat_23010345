const BookService = require('../services/book.service');
const { OK, Created } = require('../core/success.response');

class BookController {
    static async getAll(req, res) {
        new OK({ message: 'success', metadata: await BookService.getAll(req.query) }).send(res);
    }
    static async getById(req, res) {
        new OK({ message: 'success', metadata: await BookService.getById(req.params.id) }).send(res);
    }
    static async create(req, res) {
        new Created({ message: 'Thêm sách thành công', metadata: await BookService.create(req.body) }).send(res);
    }
    static async update(req, res) {
        new OK({ message: 'Cập nhật thành công', metadata: await BookService.update(req.params.id, req.body) }).send(
            res,
        );
    }
    static async delete(req, res) {
        new OK({ message: 'Xóa thành công', metadata: await BookService.delete(req.params.id) }).send(res);
    }
    static async toggleActive(req, res) {
        new OK({
            message: 'Cập nhật trạng thái thành công',
            metadata: await BookService.toggleActive(req.params.id),
        }).send(res);
    }
}

module.exports = BookController;
