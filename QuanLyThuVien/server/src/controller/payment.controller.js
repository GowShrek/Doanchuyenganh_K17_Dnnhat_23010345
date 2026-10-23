const FinePaymentService = require('../services/payment.service');
const { OK } = require('../core/success.response');

class PaymentController {
    // POST /api/fines/:id/payment — tạo link thanh toán
    createPaymentUrl = async (req, res) => {
        const fineId = req.params.id;
        const userId = req.user.id;
        const { method } = req.body; // 'vnpay' | 'momo'
        const result = await FinePaymentService.createPaymentUrl(fineId, userId, method);
        return new OK({ message: 'Tạo link thanh toán thành công', metadata: result }).send(res);
    };

    // GET /api/fines/vnpay/return — VNPay callback (redirect)
    vnpayReturn = async (req, res) => {
        const { redirectUrl } = await FinePaymentService.vnpayReturn(req.query);
        return res.redirect(redirectUrl);
    };

    // POST /api/fines/momo/ipn — MoMo IPN (server-to-server)
    momoIPN = async (req, res) => {
        const result = await FinePaymentService.momoIPN(req.body);
        return res.status(204).json(result);
    };

    // GET /api/fines/momo/return — MoMo redirect user trở về
    momoReturn = async (req, res) => {
        const { redirectUrl } = await FinePaymentService.momoReturn(req.query);
        return res.redirect(redirectUrl);
    };
}

module.exports = new PaymentController();
