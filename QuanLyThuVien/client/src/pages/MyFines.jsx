import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { Receipt, AlertCircle, BookOpen } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { requestGetMyFines } from '../config/fineRequest';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
    overdue:  { label: 'Quá hạn',   color: 'bg-orange-100 text-orange-700' },
    lost:     { label: 'Mất sách',  color: 'bg-red-100 text-red-700'      },
    damaged:  { label: 'Hư hỏng',   color: 'bg-purple-100 text-purple-700' },
};

const STATUS_CONFIG = {
    unpaid: { label: 'Chưa nộp', color: 'bg-red-100 text-red-700'      },
    paid:   { label: 'Đã nộp',   color: 'bg-green-100 text-green-700'  },
    waived: { label: 'Được miễn',color: 'bg-gray-100 text-gray-500'    },
};

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

const FineCard = ({ fine }) => {
    const book = fine.borrow?.book;
    const img = Array.isArray(book?.coverImage) ? book.coverImage[0] : book?.coverImage;
    const typeCfg = TYPE_CONFIG[fine.type] || { label: fine.type, color: 'bg-gray-100 text-gray-500' };
    const stsCfg = STATUS_CONFIG[fine.status] || { label: fine.status, color: 'bg-gray-100 text-gray-500' };
    const unpaid = fine.status === 'unpaid';

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${unpaid ? 'border-red-200' : 'border-gray-100'}`}>
            <div className="flex gap-4 p-4">
                {/* Cover */}
                <div className="shrink-0 w-14 h-20 rounded-lg overflow-hidden bg-gray-50">
                    {img
                        ? <img src={img} alt={book?.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-gray-200" /></div>
                    }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{book?.title || 'Không rõ sách'}</h3>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stsCfg.color}`}>{stsCfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{fine.borrow?.borrowCode}</p>

                    <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeCfg.color}`}>{typeCfg.label}</span>
                        <span className={`text-base font-bold ${unpaid ? 'text-red-600' : 'text-gray-400 line-through'}`}>
                            {fmt(fine.amount)}
                        </span>
                    </div>

                    {fine.reason && fine.status === 'waived' && (
                        <p className="text-xs text-gray-400 mt-1 italic">Miễn phạt: {fine.reason}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{new Date(fine.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
        </div>
    );
};

const MyFines = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [fines, setFines] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => { if (!user) navigate('/login'); }, [user]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetMyFines({ status: statusFilter || undefined, page, limit: 10 });
            setFines(res.metadata?.fines || []);
            setTotal(res.metadata?.total || 0);
        } catch { message.error('Không thể tải dữ liệu tiền phạt'); }
        finally { setLoading(false); }
    }, [statusFilter, page]);

    useEffect(() => { if (user) fetchData(); }, [fetchData, user]);

    const totalUnpaid = fines.filter(f => f.status === 'unpaid').reduce((s, f) => s + Number(f.amount), 0);
    const hasUnpaid = totalUnpaid > 0;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Tiền phạt của tôi</h1>
                    <p className="text-sm text-gray-500 mt-1">Thông tin các khoản phạt phát sinh khi mượn sách</p>
                </div>

                {/* Tổng tiền chưa nộp */}
                {hasUnpaid && (
                    <div className="mb-5 p-5 rounded-2xl bg-red-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={24} />
                            <div>
                                <p className="text-sm font-medium opacity-90">Tổng tiền cần nộp</p>
                                <p className="text-2xl font-bold">{fmt(totalUnpaid)}</p>
                            </div>
                        </div>
                        <div className="text-right text-sm opacity-90">
                            <p>Vui lòng mang đến</p>
                            <p className="font-semibold">phòng thư viện</p>
                            <p>để nộp phạt</p>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="flex gap-2 flex-wrap mb-5">
                    {[{ label: 'Tất cả', value: '' }, { label: 'Chưa nộp', value: 'unpaid' }, { label: 'Đã nộp', value: 'paid' }, { label: 'Được miễn', value: 'waived' }].map(f => (
                        <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === f.value ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            style={statusFilter === f.value ? { backgroundColor: '#a30014' } : {}}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}</div>
                ) : fines.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <Receipt size={40} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-sm text-gray-400">{hasUnpaid ? '' : 'Bạn không có khoản phạt nào'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {fines.map(f => <FineCard key={f.id} fine={f} />)}
                    </div>
                )}

                {total > 10 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Trước</button>
                        <span className="px-4 py-2 text-sm text-gray-500">Trang {page}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={fines.length < 10}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Sau</button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyFines;
