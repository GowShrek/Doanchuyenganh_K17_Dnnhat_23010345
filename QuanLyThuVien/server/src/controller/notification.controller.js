const NotificationService = require('../services/notification.service');
const { OK } = require('../core/success.response');

class NotificationController {
    getMyNotifications = async (req, res) => {
        const data = await NotificationService.getForUser(req.user.id, req.query);
        return new OK({ message: 'OK', metadata: data }).send(res);
    };

    markRead = async (req, res) => {
        const data = await NotificationService.markRead(req.params.id, req.user.id);
        return new OK({ message: 'Đã đọc', metadata: data }).send(res);
    };

    markAllRead = async (req, res) => {
        const data = await NotificationService.markAllRead(req.user.id);
        return new OK({ message: 'Đã đánh dấu tất cả đã đọc', metadata: data }).send(res);
    };

    delete = async (req, res) => {
        const data = await NotificationService.delete(req.params.id, req.user.id);
        return new OK({ message: 'Đã xóa', metadata: data }).send(res);
    };

    // Admin: kích thủ công job nhắc quá hạn
    triggerOverdueReminders = async (req, res) => {
        const count = await NotificationService.sendOverdueReminders();
        return new OK({ message: `Đã gửi ${count} thông báo nhắc quá hạn`, metadata: { count } }).send(res);
    };
}

module.exports = new NotificationController();
