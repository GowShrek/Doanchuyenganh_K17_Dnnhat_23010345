const GenreService = require('../services/genre.service');
const { OK, Created } = require('../core/success.response');

class GenreController {
    static async getAll(req, res) {
        const data = await GenreService.getAll(req.query);
        new OK({ message: 'success', metadata: data }).send(res);
    }
    static async getById(req, res) {
        const data = await GenreService.getById(req.params.id);
        new OK({ message: 'success', metadata: data }).send(res);
    }
    static async create(req, res) {
        const data = await GenreService.create(req.body);
        new Created({ message: 'Tạo thể loại thành công', metadata: data }).send(res);
    }
    static async update(req, res) {
        const data = await GenreService.update(req.params.id, req.body);
        new OK({ message: 'Cập nhật thành công', metadata: data }).send(res);
    }
    static async delete(req, res) {
        const data = await GenreService.delete(req.params.id);
        new OK({ message: 'Xóa thành công', metadata: data }).send(res);
    }
    static async toggleActive(req, res) {
        const data = await GenreService.toggleActive(req.params.id);
        new OK({ message: 'Cập nhật trạng thái thành công', metadata: data }).send(res);
    }
}

module.exports = GenreController;
