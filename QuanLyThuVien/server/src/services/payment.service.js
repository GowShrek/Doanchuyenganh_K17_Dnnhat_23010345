const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const crypto = require('crypto');
const https = require('https');
const { Fine, Borrow, Book } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

// ── Config (sandbox) ───────────────────────────────────────────────
// Khóa cổng thanh toán chỉ nạp từ biến môi trường (.env), không ghi cứng trong mã nguồn
const VNPAY_TMN_CODE  = process.env.VNPAY_TMN_CODE;
const VNPAY_SECRET    = process.env.VNPAY_SECRET;
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/fines/vnpay/return';

const MOMO_ACCESS_KEY   = process.env.MOMO_ACCESS_KEY;
const MOMO_SECRET_KEY   = process.env.MOMO_SECRET_KEY;
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || 'MOMO';
const MOMO_REDIRECT_URL = process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/api/fines/momo/return';
const MOMO_IPN_URL      = process.env.MOMO_IPN_URL      || 'http://localhost:3000/api/fines/momo/ipn';

// Client redirect sau thanh toán
const CLIENT_SUCCESS_URL = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/profile?tab=fines&payment=success` : 'http://localhost:5173/profile?tab=fines&payment=success';
const CLIENT_FAIL_URL    = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/profile?tab=fines&payment=fail`    : 'http://localhost:5173/profile?tab=fines&payment=fail';

// ── Helpers ────────────────────────────────────────────────────────
const generatePayID = () => {
    const now = new Date();
    return `PAY${now.getTime()}${now.getSeconds().toString().padStart(2, '0')}${now.getMilliseconds().toString().padStart(3, '0')}`;
};

// Thiếu khóa thì tắt cổng tương ứng (báo lỗi khi tạo thanh toán) thay vì làm máy chủ không khởi động được
const vnpay = VNPAY_TMN_CODE && VNPAY_SECRET ? new VNPay({
    tmnCode: VNPAY_TMN_CODE,
    secureSecret: VNPAY_SECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
    hashAlgorithm: 'SHA512',
    loggerFn: ignoreLogger,
}) : null;
const momoConfigured = Boolean(MOMO_ACCESS_KEY && MOMO_SECRET_KEY);

// Chữ ký kết quả MoMo (redirect/IPN): HMAC-SHA256 trên các trường theo thứ tự tài liệu MoMo v2
const verifyMomoSignature = (p) => {
    if (!momoConfigured) return false;
    const raw = [
        `accessKey=${MOMO_ACCESS_KEY}`, `amount=${p.amount}`, `extraData=${p.extraData ?? ''}`,
        `message=${p.message}`, `orderId=${p.orderId}`, `orderInfo=${p.orderInfo}`,
        `orderType=${p.orderType}`, `partnerCode=${p.partnerCode}`, `payType=${p.payType}`,
        `requestId=${p.requestId}`, `responseTime=${p.responseTime}`, `resultCode=${p.resultCode}`,
        `transId=${p.transId}`,
    ].join('&');
    const expected = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(raw).digest('hex');
    const given = String(p.signature || '');
    return given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
};

const buildVnpayUrl = async (amount, fineId) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: `${fineId}_${generatePayID()}`,
        vnp_OrderInfo: `Thanh toan tien phat ${fineId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: VNPAY_RETURN_URL,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(tomorrow),
    });
};

const buildMomoUrl = (amount, fineId) => new Promise((resolve, reject) => {
    const orderId    = MOMO_PARTNER_CODE + new Date().getTime();
    const requestId  = orderId;
    const orderInfo  = `Thanh toan tien phat ${fineId}`;
    const requestType = 'payWithMethod';
    const extraData  = '';

    const rawSignature = [
        `accessKey=${MOMO_ACCESS_KEY}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `ipnUrl=${MOMO_IPN_URL}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${MOMO_PARTNER_CODE}`,
        `redirectUrl=${MOMO_REDIRECT_URL}`,
        `requestId=${requestId}`,
        `requestType=${requestType}`,
    ].join('&');

    const signature = crypto.createHmac('sha256', MOMO_SECRET_KEY).update(rawSignature).digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: MOMO_PARTNER_CODE,
        partnerName: 'Thu Vien So',
        storeId: 'ThuVienSoStore',
        requestId, amount, orderId, orderInfo,
        redirectUrl: MOMO_REDIRECT_URL,
        ipnUrl: MOMO_IPN_URL,
        lang: 'vi', requestType, autoCapture: true, extraData,
        orderGroupId: '', signature,
    });

    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(requestBody) },
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch (err) { reject(err); }
        });
    });
    req.on('error', reject);
    req.write(requestBody);
    req.end();
});

// ── Payment Service ────────────────────────────────────────────────
class FinePaymentService {

    // Tạo link thanh toán phiếu phạt
    static async createPaymentUrl(fineId, userId, method) {
        const fine = await Fine.findByPk(fineId, {
            include: [{
                model: Borrow, as: 'borrow',
                include: [{ model: Book, as: 'book', attributes: ['title'] }],
            }],
        });
        if (!fine) throw new NotFoundError('Không tìm thấy phiếu phạt');
        // So sánh number vs number
        if (parseInt(fine.userId) !== parseInt(userId)) throw new BadRequestError('Không có quyền thanh toán phiếu phạt này');
        if (fine.status !== 'unpaid') throw new BadRequestError('Phiếu phạt này đã được xử lý');
        if (!['vnpay', 'momo'].includes(method)) throw new BadRequestError('Phương thức thanh toán không hợp lệ');

        if (method === 'vnpay' && !vnpay) throw new BadRequestError('Hệ thống chưa cấu hình cổng thanh toán VNPay');
        if (method === 'momo' && !momoConfigured) throw new BadRequestError('Hệ thống chưa cấu hình cổng thanh toán MoMo');

        if (method === 'vnpay') {
            const url = await buildVnpayUrl(fine.amount, fine.id);
            console.log(`[PAYMENT] VNPay URL created for fine ${fine.id}, amount: ${fine.amount}`);
            return { paymentUrl: url, method: 'vnpay', amount: fine.amount };
        }

        if (method === 'momo') {
            const result = await buildMomoUrl(fine.amount, fine.id);
            console.log(`[PAYMENT] MoMo response for fine ${fine.id}:`, result.resultCode, result.message);
            if (result.resultCode !== 0) throw new BadRequestError(result.message || 'Lỗi tạo link MoMo');
            return { paymentUrl: result.payUrl || result.shortLink, method: 'momo', amount: fine.amount };
        }
    }

    // VNPay return callback (browser redirect từ VNPay)
    static async vnpayReturn(vnpParams) {
        console.log('[PAYMENT] VNPay return params:', vnpParams);

        // Kiểm tra chữ ký vnp_SecureHash trước khi tin vào mã kết quả
        if (!vnpay || !vnpay.verifyReturnUrl(vnpParams).isVerified) {
            console.error('[PAYMENT] VNPay return - sai chữ ký vnp_SecureHash');
            return { redirectUrl: CLIENT_FAIL_URL, success: false };
        }

        // vnp_TxnRef = "fineId_PAYxxx"
        const fineId = (vnpParams.vnp_TxnRef || '').split('_')[0];
        const responseCode = vnpParams.vnp_ResponseCode;

        console.log(`[PAYMENT] VNPay return - fineId: ${fineId}, responseCode: ${responseCode}`);

        if (!fineId) {
            console.error('[PAYMENT] VNPay return - no fineId extracted from TxnRef:', vnpParams.vnp_TxnRef);
            return { redirectUrl: CLIENT_FAIL_URL, success: false };
        }

        const fine = await Fine.findByPk(fineId);
        if (!fine) {
            console.error(`[PAYMENT] VNPay return - fine not found: ${fineId}`);
            return { redirectUrl: CLIENT_FAIL_URL, success: false };
        }

        if (responseCode === '00' && fine.status === 'unpaid') {
            await fine.update({
                status: 'paid',
                paidAmount: fine.amount,
                paidAt: new Date(),
                paymentMethod: 'vnpay',
            });
            console.log(`[PAYMENT] Fine ${fineId} marked as PAID via VNPay`);
        } else {
            console.log(`[PAYMENT] VNPay - skip update. responseCode=${responseCode}, fine.status=${fine.status}`);
        }

        const success = responseCode === '00';
        return { redirectUrl: success ? CLIENT_SUCCESS_URL : CLIENT_FAIL_URL, success };
    }

    // MoMo IPN callback (server-to-server — không hoạt động với localhost, dùng momoReturn để bù)
    static async momoIPN(momoData) {
        console.log('[PAYMENT] MoMo IPN:', momoData);
        if (!verifyMomoSignature(momoData)) return { message: 'Invalid signature' };
        const { orderInfo, resultCode } = momoData;
        const match = orderInfo?.match(/Thanh toan tien phat (.+)/);
        const fineId = match?.[1];

        const fine = await Fine.findByPk(fineId);
        if (!fine) return { message: 'Fine not found' };

        if ((resultCode === 0 || resultCode === '0') && fine.status === 'unpaid') {
            await fine.update({
                status: 'paid',
                paidAmount: fine.amount,
                paidAt: new Date(),
                paymentMethod: 'momo',
            });
            console.log(`[PAYMENT] Fine ${fineId} marked as PAID via MoMo IPN`);
        }

        return { message: 'IPN received' };
    }

    // MoMo return — user browser redirect sau khi thanh toán
    // IPN không hoạt động với localhost, nên xử lý update DB ở đây luôn
    static async momoReturn(params) {
        console.log('[PAYMENT] MoMo return params:', params);
        if (!verifyMomoSignature(params)) {
            console.error('[PAYMENT] MoMo return - sai chữ ký');
            return { redirectUrl: CLIENT_FAIL_URL, success: false };
        }
        const { resultCode, orderId, extraData } = params;
        const success = resultCode === '0' || resultCode === 0;

        // Lấy fineId từ orderInfo nếu có trong params
        const orderInfo = params.orderInfo || params.message || '';
        const match = orderInfo.match(/Thanh toan tien phat (.+)/);
        const fineId = match?.[1];

        console.log(`[PAYMENT] MoMo return - fineId: ${fineId}, resultCode: ${resultCode}`);

        if (success && fineId) {
            const fine = await Fine.findByPk(fineId);
            if (fine && fine.status === 'unpaid') {
                await fine.update({
                    status: 'paid',
                    paidAmount: fine.amount,
                    paidAt: new Date(),
                    paymentMethod: 'momo',
                });
                console.log(`[PAYMENT] Fine ${fineId} marked as PAID via MoMo Return`);
            }
        }

        return { redirectUrl: success ? CLIENT_SUCCESS_URL : CLIENT_FAIL_URL, success };
    }
}

module.exports = FinePaymentService;

