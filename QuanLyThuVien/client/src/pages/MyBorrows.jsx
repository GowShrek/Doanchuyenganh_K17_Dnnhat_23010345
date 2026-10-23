import React, { useState, useEffect, useCallback } from 'react';
import { Tag, message, Empty } from 'antd';
import { BookOpen, AlertTriangle, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { requestGetMyBorrows } from '../config/borrowRequest';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
    pending:  { label: 'Chờ duyệt',  color: 'orange', icon: <Clock size={14} />,       bg: 'bg-orange-50 text-orange-700' },
    approved: { label: 'Đang mượn',  color: 'blue',   icon: <BookOpen size={14} />,    bg: 'bg-blue-50 text-blue-700'   },
    returned: { label: 'Đã trả',     color: 'default',icon: <CheckCircle size={14} />, bg: 'bg-gray-100 text-gray-500'  },
    rejected: { label: 'Từ chối',    color: 'default',icon: <XCircle size={14} />,     bg: 'bg-gray-100 text-gray-400'  },
    overdue:  { label: 'Quá hạn',    color: 'red',    icon: <AlertTriangle size={14} />,bg: 'bg-red-50 text-red-700'    },
    lost:     { label: 'Mất sách',   color: 'purple', icon: <XCircle size={14} />,     bg: 'bg-purple-50 text-purple-700'},
};

const BorrowCard = ({ borrow }) => {
    const book = borrow.book;
    const img = Array.isArray(book?.coverImage) ? book.coverImage[0] : book?.coverImage;
    const cfg = STATUS_CONFIG[borrow.status] || { label: borrow.status, bg: 'bg-gray-100 text-gray-500', icon: null };
    const isOverdue = borrow.status === 'overdue';

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
            {isOverdue && (
                <div className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Sách quá hạn! Vui lòng trả ngay
                </div>
            )}
            <div className="flex gap-4 p-4">
                {/* Cover */}
                <div className="shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-gray-50">
                    {img
                        ? <img src={img} alt={book?.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen size={20} className="text-gray-200" /></div>
                    }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{book?.title}</h3>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${cfg.bg}`}>
                            {cfg.icon} {cfg.label}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{borrow.borrowCode}</p>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 text-xs text-gray-500">
                        <p>Ngày mượn: <span className="text-gray-700 font-medium">{borrow.borrowDate || '—'}</span></p>
                        <p>Hạn trả: <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>{borrow.dueDate || '—'}</span></p>
                        {borrow.returnDate && (
                            <p className="col-span-2 mt-0.5">Ngày trả: <span className="text-green-700 font-medium">{borrow.returnDate}</span></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MyBorrows = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [borrows, setBorrows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => { if (!user) navigate('/login'); }, [user]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetMyBorrows({ status: statusFilter || undefined, page, limit: 8 });
            setBorrows(res.metadata?.borrows || []);
            setTotal(res.metadata?.total || 0);
        } catch { message.error('Không thể tải lịch sử mượn'); }
        finally { setLoading(false); }
    }, [statusFilter, page]);

    useEffect(() => { if (user) fetchData(); }, [fetchData, user]);

    const overdueCount = borrows.filter(b => b.status === 'overdue').length;
    const pendingCount = borrows.filter(b => b.status === 'pending').length;

    const filters = [
        { label: 'Tất cả', value: '' },
        { label: 'Chờ duyệt', value: 'pending' },
        { label: 'Đang mượn', value: 'approved' },
        { label: 'Quá hạn', value: 'overdue' },
        { label: 'Đã trả', value: 'returned' },
        { label: 'Từ chối', value: 'rejected' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Lịch sử mượn sách</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi các phiếu mượn và trạng thái của bạn</p>
                </div>

                {/* Alert nếu có quá hạn */}
                {overdueCount > 0 && (
                    <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                        <AlertTriangle className="text-red-600 shrink-0" size={20} />
                        <div>
                            <p className="text-sm font-bold text-red-700">Bạn có {overdueCount} phiếu mượn quá hạn!</p>
                            <p className="text-xs text-red-500">Vui lòng mang sách trả ngay để tránh bị phạt thêm.</p>
                        </div>
                    </div>
                )}

                {/* Stats mini */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Tổng phiếu</p>
                        <p className="text-xl font-bold text-gray-800">{total}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Chờ duyệt</p>
                        <p className="text-xl font-bold text-orange-600">{pendingCount}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Quá hạn</p>
                        <p className="text-xl font-bold text-red-600">{overdueCount}</p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap mb-5">
                    {filters.map(f => (
                        <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === f.value ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            style={statusFilter === f.value ? { backgroundColor: '#a30014' } : {}}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}
                    </div>
                ) : borrows.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-sm text-gray-400">Chưa có phiếu mượn nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {borrows.map(b => <BorrowCard key={b.id} borrow={b} />)}
                    </div>
                )}

                {/* Pagination simple */}
                {total > 8 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
                            Trước
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-500">Trang {page}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={borrows.length < 8}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
                            Sau
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyBorrows;
