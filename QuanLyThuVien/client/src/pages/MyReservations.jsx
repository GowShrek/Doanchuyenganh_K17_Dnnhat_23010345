import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { Bell, BellOff, BookOpen, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { requestGetMyReservations, requestCancelReservation } from '../config/reservationRequest';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const STATUS_CFG = {
    pending:   { label: 'Đang chờ',       cls: 'bg-blue-100 text-blue-700',   icon: <Clock size={13} /> },
    notified:  { label: 'Sách đã có!',    cls: 'bg-green-100 text-green-700', icon: <Bell size={13} /> },
    fulfilled: { label: 'Đã mượn',        cls: 'bg-gray-100 text-gray-500',   icon: <CheckCircle size={13} /> },
    expired:   { label: 'Hết hạn',        cls: 'bg-red-100 text-red-600',     icon: <AlertTriangle size={13} /> },
    cancelled: { label: 'Đã hủy',         cls: 'bg-gray-100 text-gray-400',   icon: <XCircle size={13} /> },
};

const ReservationCard = ({ reservation, onCancel }) => {
    const book = reservation.book;
    const img = Array.isArray(book?.coverImage) ? book.coverImage[0] : book?.coverImage;
    const cfg = STATUS_CFG[reservation.status] || STATUS_CFG.pending;
    const isActive = ['pending', 'notified'].includes(reservation.status);
    const isNotified = reservation.status === 'notified';

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md
            ${isNotified ? 'border-green-300' : 'border-gray-100'}`}>
            {isNotified && (
                <div className="bg-green-600 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
                    <Bell size={12} /> Sách đã có sẵn! Vui lòng đến mượn trước {new Date(reservation.expiresAt).toLocaleDateString('vi-VN')}
                </div>
            )}
            <div className="flex gap-4 p-4">
                {/* Cover */}
                <Link to={`/books/${book?.id}`} className="shrink-0 w-14 h-20 rounded-lg overflow-hidden bg-gray-50 block">
                    {img
                        ? <img src={img} alt={book?.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen size={18} className="text-gray-200" /></div>
                    }
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <Link to={`/books/${book?.id}`} className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:underline">
                            {book?.title}
                        </Link>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${cfg.cls}`}>
                            {cfg.icon} {cfg.label}
                        </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                        {reservation.status === 'pending' && (
                            <p>Vị trí hàng chờ: <span className="font-bold text-blue-700">#{reservation.queuePosition}</span></p>
                        )}
                        <p>Ngày đặt: <span className="text-gray-700">{new Date(reservation.createdAt).toLocaleDateString('vi-VN')}</span></p>
                        {reservation.note && <p className="italic text-gray-400">"{reservation.note}"</p>}
                    </div>

                    {isActive && (
                        <button onClick={() => onCancel(reservation)}
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                            <BellOff size={11} /> Hủy đặt trước
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyReservations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (!user) navigate('/login'); }, [user]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetMyReservations({ limit: 20 });
            setReservations(res.metadata?.reservations || []);
            setTotal(res.metadata?.total || 0);
        } catch { message.error('Không thể tải danh sách đặt trước'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (user) fetchData(); }, [fetchData, user]);

    const handleCancel = async (res) => {
        try {
            await requestCancelReservation(res.id);
            message.success('Đã hủy đặt trước');
            fetchData();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể hủy');
        }
    };

    const active = reservations.filter(r => ['pending', 'notified'].includes(r.status));
    const history = reservations.filter(r => !['pending', 'notified'].includes(r.status));

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Sách đã đặt trước</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi hàng chờ và nhận thông báo khi sách có sẵn</p>
                </div>

                {/* Stats mini */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Đang chờ</p>
                        <p className="text-2xl font-black text-blue-600">{active.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Tổng đặt trước</p>
                        <p className="text-2xl font-black text-gray-700">{total}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
                ) : reservations.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
                        <Bell size={40} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-sm text-gray-400">Bạn chưa đặt trước cuốn sách nào</p>
                        <Link to="/" className="mt-3 inline-block text-sm font-semibold hover:underline" style={{ color: '#a30014' }}>
                            Khám phá sách ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {active.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Bell size={14} className="text-blue-600" /> Đang chờ ({active.length})
                                </h2>
                                <div className="space-y-3">
                                    {active.map(r => <ReservationCard key={r.id} reservation={r} onCancel={handleCancel} />)}
                                </div>
                            </div>
                        )}
                        {history.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold text-gray-500 mb-3">Lịch sử ({history.length})</h2>
                                <div className="space-y-3">
                                    {history.map(r => <ReservationCard key={r.id} reservation={r} onCancel={handleCancel} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyReservations;
