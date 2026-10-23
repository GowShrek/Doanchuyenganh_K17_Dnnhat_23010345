import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertTriangle, Calendar, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { STATUS_CFG } from './constants';
import RenewModal from './RenewModal';

// ── Renew status badge ────────────────────────────────────────────
const RENEW_BADGE = {
    pending:  { cls: 'bg-yellow-100 text-yellow-700', label: 'Chờ duyệt gia hạn' },
    approved: { cls: 'bg-green-100 text-green-700',  label: 'Đã gia hạn' },
    rejected: { cls: 'bg-red-100 text-red-700',      label: 'Từ chối gia hạn' },
};

// ── Borrow card (đang mượn) ───────────────────────────────────────
const BorrowCard = ({ borrow, onRenew }) => {
    const img = Array.isArray(borrow.book?.coverImage) ? borrow.book.coverImage[0] : borrow.book?.coverImage;
    const isOver = borrow.status === 'overdue';
    const canRenew = ['approved', 'overdue'].includes(borrow.status)
        && borrow.renewStatus !== 'pending'
        && borrow.renewCount < borrow.renewLimit;
    const renewBadge = borrow.renewStatus && borrow.renewStatus !== 'none' ? RENEW_BADGE[borrow.renewStatus] : null;

    return (
        <div className={`flex gap-3 p-3 rounded-xl border transition-shadow hover:shadow-md relative overflow-hidden group
            ${isOver ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
            {/* Hover bar */}
            <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom"
                style={{ backgroundColor: isOver ? '#dc2626' : '#a30014' }} />

            {/* Cover */}
            <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {img
                    ? <img src={img} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen size={18} className="text-gray-300" /></div>
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{borrow.book?.title}</p>
                <div>
                    <div className="flex items-center gap-1 mb-1.5">
                        <Calendar size={12} className={isOver ? 'text-red-500' : 'text-gray-400'} />
                        <span className={`text-[11px] font-medium ${isOver ? 'text-red-600' : 'text-gray-500'}`}>
                            Hạn: {borrow.dueDate || '—'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_CFG[borrow.status]?.cls || 'bg-gray-100 text-gray-500'}`}>
                            {STATUS_CFG[borrow.status]?.label}
                        </span>
                        {renewBadge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${renewBadge.cls}`}>
                                {renewBadge.label}
                            </span>
                        )}
                    </div>

                    {/* Renew button */}
                    {canRenew && (
                        <button onClick={() => onRenew(borrow)}
                            className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            <RefreshCw size={11} /> Gia hạn ({borrow.renewLimit - borrow.renewCount} lần còn lại)
                        </button>
                    )}
                    {borrow.renewStatus === 'pending' && (
                        <p className="mt-1.5 text-[10px] text-yellow-600 font-medium">Yêu cầu gia hạn đang chờ duyệt</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── History row ───────────────────────────────────────────────────
const HistoryRow = ({ borrow }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{borrow.book?.title || '—'}</td>
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{borrow.borrowDate || '—'}</td>
        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{borrow.dueDate || '—'}</td>
        <td className="px-4 py-3">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS_CFG[borrow.status]?.cls || 'bg-gray-100 text-gray-500'}`}>
                {STATUS_CFG[borrow.status]?.label || borrow.status}
            </span>
        </td>
    </tr>
);

// ── Main component ────────────────────────────────────────────────
const BorrowHistory = ({ borrows, currentBorrows, overdueBorrows, loading, onBorrowsChanged }) => {
    const [renewingBorrow, setRenewingBorrow] = useState(null);

    return (
        <div className="space-y-4">
            {/* Overdue alert */}
            {overdueBorrows.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-sm font-bold text-red-700">Bạn có {overdueBorrows.length} sách quá hạn!</p>
                        <p className="text-xs text-red-500 mt-0.5">Vui lòng mang sách đến trả ngay hoặc gia hạn để tránh phạt thêm.</p>
                    </div>
                </div>
            )}

            {/* Currently borrowing grid */}
            {currentBorrows.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Đang mượn</h3>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">{currentBorrows.length} cuốn</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {currentBorrows.map(b => (
                            <BorrowCard key={b.id} borrow={b} onRenew={setRenewingBorrow} />
                        ))}
                    </div>
                </div>
            )}

            {/* History table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Lịch sử mượn trả</h3>
                    <Link to="/my/borrows" className="text-xs font-semibold hover:underline flex items-center gap-1" style={{ color: '#a30014' }}>
                        Xem tất cả <ChevronRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
                ) : borrows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-400">Chưa có lịch sử mượn</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                                    <th className="px-4 py-3 text-left">Tên sách</th>
                                    <th className="px-4 py-3 text-left">Ngày mượn</th>
                                    <th className="px-4 py-3 text-left">Hạn trả</th>
                                    <th className="px-4 py-3 text-left">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {borrows.slice(0, 8).map(b => <HistoryRow key={b.id} borrow={b} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Renew Modal */}
            <RenewModal
                open={!!renewingBorrow}
                borrow={renewingBorrow}
                onClose={() => setRenewingBorrow(null)}
                onSuccess={() => { setRenewingBorrow(null); onBorrowsChanged?.(); }}
            />
        </div>
    );
};

export default BorrowHistory;
