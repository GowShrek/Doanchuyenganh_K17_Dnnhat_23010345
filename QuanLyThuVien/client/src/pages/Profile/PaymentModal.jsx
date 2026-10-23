import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { requestCreateFinePayment } from '../../config/fineRequest';
import { fmt } from './constants';

const VNPAY_LOGO = 'https://salt.tikicdn.com/ts/upload/77/6a/df/a35cb9c62b9215dbc6d334a77cda4327.png';
const MOMO_LOGO  = 'https://salt.tikicdn.com/ts/upload/ce/f6/e8/ea880ef285856f744e3ffb5d282d4b2d.jpg';

const METHODS = [
    {
        key: 'vnpay',
        name: 'VNPay',
        desc: 'Thanh toán qua cổng VNPay (ATM, thẻ quốc tế, QR)',
        logo: VNPAY_LOGO,
        logoBg: 'bg-blue-50',
    },
    {
        key: 'momo',
        name: 'MoMo',
        desc: 'Thanh toán qua ví MoMo',
        logo: MOMO_LOGO,
        logoBg: 'bg-pink-50',
    },
];

const PaymentModal = ({ open, fine, onClose, onSuccess }) => {
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        if (!selected) { message.warning('Vui lòng chọn phương thức thanh toán'); return; }
        setLoading(true);
        try {
            const res = await requestCreateFinePayment(fine.id, selected);
            const payUrl = res.metadata?.paymentUrl;
            if (payUrl) {
                onClose();
                // Mở tab mới để không mất session
                window.open(payUrl, '_blank', 'noopener,noreferrer');
            } else {
                message.error('Không nhận được link thanh toán');
            }
        } catch (err) {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra, thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => { setSelected(null); onClose(); };

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            title={
                <div className="flex items-center gap-2 py-1">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <CreditCard size={16} style={{ color: '#a30014' }} />
                    </div>
                    <span className="font-bold text-gray-900">Thanh toán tiền phạt</span>
                </div>
            }
            footer={null}
            destroyOnClose
            width={420}
        >
            {fine && (
                <div className="mt-4 space-y-5">
                    {/* Fine info */}
                    <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">Phiếu phạt</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{fine.borrow?.book?.title || 'Phiếu phạt #' + fine.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fine.borrow?.borrowCode}</p>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Số tiền cần nộp</span>
                            <span className="text-xl font-bold" style={{ color: '#a30014' }}>{fmt(fine.amount)}</span>
                        </div>
                    </div>

                    {/* Method selection */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Chọn phương thức thanh toán</p>
                        <div className="space-y-2">
                            {METHODS.map(m => (
                                <button key={m.key} onClick={() => setSelected(m.key)}
                                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 text-left transition-all
                                        ${selected === m.key
                                            ? 'border-red-700 bg-red-50/40'
                                            : 'border-gray-100 hover:border-gray-200 bg-white'
                                        }`}>
                                    {/* Radio */}
                                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                                        ${selected === m.key ? 'border-red-700' : 'border-gray-300'}`}>
                                        {selected === m.key && <div className="w-2 h-2 rounded-full bg-red-700" />}
                                    </div>

                                    {/* Logo */}
                                    <div className={`w-12 h-8 rounded-lg ${m.logoBg} flex items-center justify-center overflow-hidden shrink-0`}>
                                        <img src={m.logo} alt={m.name} className="w-full h-full object-contain" />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{m.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notice */}
                    <p className="text-xs text-gray-400 text-center">
                        Bạn sẽ được chuyển đến trang thanh toán của {selected === 'vnpay' ? 'VNPay' : selected === 'momo' ? 'MoMo' : 'nhà cung cấp'}.
                        Sau khi hoàn tất, quay lại để kiểm tra trạng thái.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button onClick={handleClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            Hủy
                        </button>
                        <button onClick={handlePay} disabled={loading || !selected}
                            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#a30014' }}>
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
                            Thanh toán ngay
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default PaymentModal;
