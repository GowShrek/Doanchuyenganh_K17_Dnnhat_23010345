import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CreditCard } from 'lucide-react';
import { fmt, FINE_TYPE_LABEL, FINE_STATUS_CFG } from './constants';
import PaymentModal from './PaymentModal';

// ── Fine row ──────────────────────────────────────────────────────
const FineRow = ({ fine, onPayOnline }) => {
    const type = FINE_TYPE_LABEL[fine.type] || fine.type;
    const sts  = FINE_STATUS_CFG[fine.status];
    const canPay = fine.status === 'unpaid';

    return (
        <div className="px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{fine.borrow?.book?.title || 'Không rõ sách'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{type} • {fine.borrow?.borrowCode}</p>
                    <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold ${sts?.cls}`}>{sts?.label}</span>
                </div>
                <div className="text-right shrink-0 space-y-1.5">
                    <p className={`text-base font-bold ${canPay ? 'text-red-600' : 'text-gray-400'}`}>{fmt(fine.amount)}</p>
                    {canPay && (
                        <button onClick={() => onPayOnline(fine)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                            style={{ backgroundColor: '#a30014' }}>
                            <CreditCard size={12} /> Thanh toán
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────
const FinesList = ({ fines, totalUnpaid, onFinesPaid }) => {
    const [payingFine, setPayingFine] = useState(null);

    return (
        <div className="space-y-4">
            {/* Banner tổng cần nộp */}
            {totalUnpaid > 0 && (
                <div className="rounded-2xl p-5 text-white flex items-center justify-between shadow-lg" style={{ backgroundColor: '#a30014' }}>
                    <div>
                        <p className="text-sm opacity-80">Tổng tiền cần nộp</p>
                        <p className="text-2xl font-bold">{fmt(totalUnpaid)}</p>
                    </div>
                    <Link to="/my/fines" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors">
                        Xem tất cả
                    </Link>
                </div>
            )}

            {/* Hướng dẫn thanh toán online */}
            <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">i</div>
                <div className="text-xs text-blue-700 space-y-1">
                    <p className="font-semibold">Thanh toán online</p>
                    <p>Nhấn nút <strong>Thanh toán</strong> trên từng phiếu để thanh toán qua VNPay hoặc MoMo. Trạng thái sẽ tự động cập nhật sau khi hoàn tất.</p>
                </div>
            </div>

            {/* Danh sách phiếu phạt */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Danh sách phiếu phạt</h3>
                    <Link to="/my/fines" className="text-xs font-semibold hover:underline flex items-center gap-1" style={{ color: '#a30014' }}>
                        Xem tất cả <ChevronRight size={14} />
                    </Link>
                </div>

                {fines.length === 0
                    ? <div className="p-10 text-center text-sm text-gray-400">Không có khoản phạt nào</div>
                    : (
                        <div className="divide-y divide-gray-50">
                            {fines.slice(0, 6).map(f => (
                                <FineRow key={f.id} fine={f} onPayOnline={setPayingFine} />
                            ))}
                        </div>
                    )
                }
            </div>

            {/* Payment Modal */}
            <PaymentModal
                open={!!payingFine}
                fine={payingFine}
                onClose={() => setPayingFine(null)}
                onSuccess={() => { setPayingFine(null); onFinesPaid?.(); }}
            />
        </div>
    );
};

export default FinesList;
