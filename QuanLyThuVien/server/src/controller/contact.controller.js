const ContactService = require('../services/contact.service');
const { Created, OK } = require('../core/success.response');

class ContactController {
    async create(req, res) {
        const data = await ContactService.create(req.body);
        new Created({ message: 'Gửi liên hệ thành công', metadata: data }).send(res);
    }

    async getAll(req, res) {
        const data = await ContactService.getAll(req.query);
        new OK({ message: 'Lấy danh sách liên hệ thành công', metadata: data }).send(res);
    }

    async updateStatus(req, res) {
        const data = await ContactService.updateStatus(req.params.id, req.body.status);
        new OK({ message: 'Cập nhật trạng thái thành công', metadata: data }).send(res);
    }

    async delete(req, res) {
        await ContactService.delete(req.params.id);
        new OK({ message: 'Xóa liên hệ thành công' }).send(res);
    }
}

module.exports = new ContactController();
