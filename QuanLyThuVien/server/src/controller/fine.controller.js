const FineService = require('../services/fine.service');
const { OK } = require('../core/success.response');

class FineController {
    async getAll(req, res) {
        const data = await FineService.getAll(req.query);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async getStats(req, res) {
        const data = await FineService.getStats();
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async getMyFines(req, res) {
        const data = await FineService.getMyFines({ userId: req.user.id, ...req.query });
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async getById(req, res) {
        const data = await FineService.getById(req.params.id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    async markPaid(req, res) {
        const data = await FineService.markPaid(req.params.id, req.user.id);
        new OK({ message: 'Đã xác nhận thu tiền phạt', metadata: data }).send(res);
    }

    async waive(req, res) {
        const data = await FineService.waive(req.params.id, { reason: req.body.reason, paidBy: req.user.id });
        new OK({ message: 'Đã miễn phạt', metadata: data }).send(res);
    }
}

module.exports = new FineController();
