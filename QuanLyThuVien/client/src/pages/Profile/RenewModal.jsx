import React, { useState } from 'react';
import { Modal, DatePicker, message } from 'antd';
import { RefreshCw, Loader2, CalendarClock } from 'lucide-react';
import dayjs from 'dayjs';
import { requestRenewBorrow } from '../../config/borrowRequest';

const RenewModal = ({ open, borrow, onClose, onSuccess }) => {
    const [renewDueDate, setRenewDueDate] = useState(null);
    const [renewNote, setRenewNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!renewDueDate) { message.warning('Vui lòng chọn ngày trả mới'); return; }
        setLoading(true);
        try {
            await requestRenewBorrow(borrow.id, {
                renewDueDate: renewDueDate.format('YYYY-MM-DD'),
                renewNote: renewNote.trim() || undefined,
            });
            message.success('Gửi yêu cầu gia hạn thành công! Chờ thủ thư duyệt.');
            setRenewDueDate(null);
            setRenewNote('');
            onSuccess?.();
            onClose();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể gửi yêu cầu gia hạn');
        } finally { setLoading(false); }
    };

    const currentDueDate = borrow?.dueDate ? dayjs(borrow.dueDate) : null;
    const renewsLeft = borrow ? (borrow.renewLimit - borrow.renewCount) : 0;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-2 py-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <RefreshCw size={15} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-900">Yêu cầu gia hạn sách</span>
                </div>
            }
            footer={null}
            destroyOnClose
            width={420}
        >
            {borrow && (
                <div className="mt-4 space-y-4">
                    {/* Thông tin sách */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Sách đang mượn</p>
                        <p className="text-sm font-bold text-gray-900 line-clamp-2">{borrow.book?.title}</p>
                        <p className="text-xs text-gray-400 mt-1">Mã phiếu: {borrow.borrowCode}</p>
                    </div>

                    {/* Thông tin gia hạn */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-amber-600 font-medium">Hạn trả hiện tại</p>
                            <p className="text-sm font-bold text-amber-800 mt-0.5">
                                {currentDueDate ? currentDueDate.format('DD/MM/YYYY') : '—'}
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-blue-600 font-medium">Lần gia hạn còn lại</p>
                            <p className="text-2xl font-black text-blue-800 leading-none mt-0.5">{renewsLeft}</p>
                        </div>
                    </div>

                    {/* Trạng thái nếu đang pending */}
                    {borrow.renewStatus === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
                            Bạn đang có yêu cầu gia hạn chờ duyệt. Vui lòng đợi thủ thư xử lý.
                        </div>
                    )}

                    {/* Trạng thái nếu bị từ chối */}
                    {borrow.renewStatus === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                            Yêu cầu gia hạn trước bị từ chối: <span className="font-medium">{borrow.renewNote}</span>
                        </div>
                    )}

                    {/* Form chọn ngày mới — chỉ khi không có pending */}
                    {borrow.renewStatus !== 'pending' && renewsLeft > 0 && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Ngày trả mới <span className="text-red-500">*</span>
                                    <span className="text-xs text-gray-400 font-normal ml-1">(phải sau {currentDueDate?.format('DD/MM/YYYY')})</span>
                                </label>
                                <DatePicker
                                    value={renewDueDate}
                                    onChange={setRenewDueDate}
                                    disabledDate={d => {
                                        if (!d) return false;
                                        const min = currentDueDate ? currentDueDate.add(1, 'day') : dayjs().add(1, 'day');
                                        return d.isBefore(min.startOf('day'));
                                    }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày trả mới"
                                    size="large"
                                    className="w-full"
                                    suffixIcon={<CalendarClock size={14} />}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lý do gia hạn (tùy chọn)</label>
                                <textarea
                                    value={renewNote}
                                    onChange={e => setRenewNote(e.target.value)}
                                    placeholder="VD: Chưa đọc xong, cần thêm thời gian..."
                                    rows={2}
                                    maxLength={300}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    Hủy
                                </button>
                                <button onClick={handleSubmit} disabled={loading || !renewDueDate}
                                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 bg-blue-600">
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    Gửi yêu cầu
                                </button>
                            </div>
                        </>
                    )}

                    {/* Đã hết lượt */}
                    {renewsLeft <= 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600 text-center">
                            Đã sử dụng hết {borrow.renewLimit} lần gia hạn cho phiếu mượn này.
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default RenewModal;
