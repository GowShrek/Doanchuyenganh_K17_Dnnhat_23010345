const PublisherService = require('../services/publisher.service');
const { OK, Created } = require('../core/success.response');

class PublisherController {
    static async getAll(req, res) {
        new OK({ message: 'success', metadata: await PublisherService.getAll(req.query) }).send(res);
    }
    static async getById(req, res) {
        new OK({ message: 'success', metadata: await PublisherService.getById(req.params.id) }).send(res);
    }
    static async create(req, res) {
        new Created({ message: 'Tạo nhà xuất bản thành công', metadata: await PublisherService.create(req.body) }).send(
            res,
        );
    }
    static async update(req, res) {
        new OK({
            message: 'Cập nhật thành công',
            metadata: await PublisherService.update(req.params.id, req.body),
        }).send(res);
    }
    static async delete(req, res) {
        new OK({ message: 'Xóa thành công', metadata: await PublisherService.delete(req.params.id) }).send(res);
    }
    static async toggleActive(req, res) {
        new OK({
            message: 'Cập nhật trạng thái thành công',
            metadata: await PublisherService.toggleActive(req.params.id),
        }).send(res);
    }
}

module.exports = PublisherController;
