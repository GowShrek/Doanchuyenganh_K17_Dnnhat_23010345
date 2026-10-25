import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { message, Skeleton, Tag, Tooltip, Modal, DatePicker } from 'antd';
import {
    BookOpen, ChevronLeft, ChevronRight, ArrowLeft,
    Calendar, Hash, Globe, FileText, Building2,
    CheckCircle, AlertTriangle, Send, Star, Bell, BellOff, Users, QrCode,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BookReviews from '../components/BookReviews';
import BookQRCode from '../components/BookQRCode';
import { requestGetBookById } from '../config/bookRequest';
import { requestCreateBorrow } from '../config/borrowRequest';
import {
    requestCreateReservation,
    requestGetMyReservationForBook,
    requestGetQueueInfo,
    requestCancelReservation,
} from '../config/reservationRequest';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

// Thời hạn một lần mượn tối đa (BR-11, máy chủ kiểm tra lại)
const MAX_BORROW_DAYS = 30;

// ── Image Carousel ────────────────────────────────────────────────
const ImageCarousel = ({ images, title }) => {
    const [idx, setIdx] = useState(0);
    const imgs = Array.isArray(images) ? images.filter(Boolean) : images ? [images] : [];

    if (!imgs.length) {
        return (
            <div className="w-full aspect-[3/4] rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-3 text-gray-300">
                <BookOpen size={56} />
                <span className="text-sm">Chưa có ảnh bìa</span>
            </div>
        );
    }

    return (
        <div className="relative select-none">
            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <img src={imgs[idx]} alt={title} className="w-full h-full object-cover" />
            </div>

            {imgs.length > 1 && (
                <>
                    <button onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setIdx(i => (i + 1) % imgs.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors">
                        <ChevronRight size={16} />
                    </button>
                    {/* Dots */}
                    <div className="flex justify-center gap-1.5 mt-3">
                        {imgs.map((_, i) => (
                            <button key={i} onClick={() => setIdx(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-red-700 w-4' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// ── Info Row ─────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
    value ? (
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-50">
            <div className="w-5 h-5 mt-0.5 shrink-0 text-gray-400">{icon}</div>
            <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
            <span className="text-sm text-gray-800 font-medium flex-1">{value}</span>
        </div>
    ) : null
);

// ── Main Page ─────────────────────────────────────────────────────
const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowing, setBorrowing] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [borrowModal, setBorrowModal] = useState(false);
    const [borrowDate, setBorrowDate] = useState(null);
    const [dueDate, setDueDate] = useState(null);
    const [myReservation, setMyReservation] = useState(null);
    const [queueCount, setQueueCount] = useState(0);
    const [reserving, setReserving] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);

    const loadBook = () => {
        setLoading(true);
        requestGetBookById(id)
            .then(res => setBook(res.metadata))
            .catch(() => { message.error('Không tìm thấy sách'); navigate('/'); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadBook(); }, [id]);

    // Load reservation info khi user và book sẵn sàng
    useEffect(() => {
        if (!book) return;
        requestGetQueueInfo(book.id)
            .then(r => setQueueCount(r.metadata?.queueCount || 0))
            .catch(() => {});
        if (user) {
            requestGetMyReservationForBook(book.id)
                .then(r => setMyReservation(r.metadata?.reservation || null))
                .catch(() => {});
        }
    }, [book, user]);

    const handleBorrow = async () => {
        if (!borrowDate || !dueDate) { message.warning('Vui lòng chọn đầy đủ ngày mượn và ngày trả'); return; }
        setBorrowing(true);
        try {
            await requestCreateBorrow({
                bookId: book.id,
                borrowDate: borrowDate.format('YYYY-MM-DD'),
                dueDate: dueDate.format('YYYY-MM-DD'),
            });
            message.success('Đã gửi yêu cầu mượn sách. Chờ thủ thư duyệt!');
            setBorrowModal(false);
            setBorrowDate(null);
            setDueDate(null);
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể gửi yêu cầu');
        } finally { setBorrowing(false); }
    };

    const handleReserve = async () => {
        if (!user) { navigate('/login'); return; }
        setReserving(true);
        try {
            await requestCreateReservation(book.id);
            message.success('Đặt trước thành công! Chúng tôi sẽ báo khi có sách.');
            // Reload reservation status
            const r = await requestGetMyReservationForBook(book.id);
            setMyReservation(r.metadata?.reservation || null);
            setQueueCount(q => q + 1);
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể đặt trước');
        } finally { setReserving(false); }
    };

    const handleCancelReservation = async () => {
        try {
            await requestCancelReservation(myReservation.id);
            message.success('Đã hủy đặt trước');
            setMyReservation(null);
            setQueueCount(q => Math.max(0, q - 1));
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể hủy');
        }
    };

    const available = book?.availableQuantity > 0;
    const desc = book?.description || '';
    const isLong = desc.length > 400;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8">
                {/* Breadcrumb */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
                    <ArrowLeft size={16} /> Quay lại
                </button>

                {loading ? (
                    <div className="grid md:grid-cols-[320px_1fr] gap-10">
                        <Skeleton.Image active style={{ width: '100%', height: 420, borderRadius: 16 }} />
                        <div><Skeleton active paragraph={{ rows: 10 }} /></div>
                    </div>
                ) : book ? (
                    <>
                    <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-10">
                        {/* LEFT: Cover */}
                        <div>
                            <ImageCarousel images={book.coverImage} title={book.title} />

                            {/* Availability badge */}
                            <div className={`mt-4 rounded-xl p-3 flex items-center gap-2 ${available ? 'bg-green-50' : 'bg-gray-50'}`}>
                                {available
                                    ? <CheckCircle size={18} className="text-green-600 shrink-0" />
                                    : <AlertTriangle size={18} className="text-gray-400 shrink-0" />
                                }
                                <div>
                                    <p className={`text-sm font-semibold ${available ? 'text-green-700' : 'text-gray-500'}`}>
                                        {available ? `Còn ${book.availableQuantity} bản` : 'Hết sách'}
                                    </p>
                                    <p className="text-xs text-gray-400">Tổng {book.totalQuantity} bản trong kho</p>
                                </div>
                            </div>

                            {/* Borrow / Reserve Buttons */}
                            {user ? (
                                available ? (
                                    /* Có sách → nút mượn */
                                    <button
                                        onClick={() => setBorrowModal(true)}
                                        className="mt-3 w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: '#a30014' }}>
                                        <Send size={16} /> Gửi yêu cầu mượn
                                    </button>
                                ) : myReservation ? (
                                    /* Đã đặt trước → hiện thông tin + nút hủy */
                                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Bell size={15} className="text-blue-600 shrink-0" />
                                            <span className="text-sm font-semibold text-blue-800">
                                                {myReservation.status === 'notified'
                                                    ? 'Sách đã có! Hãy đến mượn sớm'
                                                    : `Đang chờ — Vị trí #${myReservation.queuePosition}`
                                                }
                                            </span>
                                        </div>
                                        {myReservation.status === 'notified' && (
                                            <p className="text-xs text-blue-600">Hết hạn: {new Date(myReservation.expiresAt).toLocaleDateString('vi-VN')}</p>
                                        )}
                                        <button onClick={handleCancelReservation}
                                            className="w-full py-1.5 rounded-lg border border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                                            <BellOff size={12} /> Hủy đặt trước
                                        </button>
                                    </div>
                                ) : (
                                    /* Chưa đặt → nút đặt trước */
                                    <button
                                        onClick={handleReserve}
                                        disabled={reserving}
                                        className="mt-3 w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                                        style={{ backgroundColor: '#1d4ed8' }}>
                                        <Bell size={16} />
                                        {reserving ? 'Đang xử lý...' : 'Đặt trước sách'}
                                    </button>
                                )
                            ) : (
                                <Link to="/login"
                                    className="mt-3 w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: '#a30014' }}>
                                    Đăng nhập để mượn sách
                                </Link>
                            )}

                            {/* Số người đang chờ khi hết sách */}
                            {!available && queueCount > 0 && (
                                <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                    <Users size={11} /> {queueCount} người đang trong hàng chờ
                                </p>
                            )}
                        </div>

                        {/* RIGHT: Info */}
                        <div>
                            {/* Genres */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {book.genres?.map(g => (
                                    <Tag key={g.id} color={g.color} className="rounded-full text-xs px-2 font-medium">{g.name}</Tag>
                                ))}
                            </div>

                            <div className="flex items-start gap-2 mb-2">
                                <h1 className="flex-1 text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{book.title}</h1>
                                <Tooltip title="Xem mã QR">
                                    <button onClick={() => setQrOpen(true)}
                                        className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors mt-1">
                                        <QrCode size={17} className="text-gray-500" />
                                    </button>
                                </Tooltip>
                            </div>

                            {book.authors?.length > 0 && (
                                <p className="text-base text-red-700 font-medium mb-3">
                                    {book.authors.map(a => a.penName || a.fullName).join(', ')}
                                </p>
                            )}

                            {/* Rating summary inline */}
                            {book._avgRating > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map(i => (
                                            <Star key={i} size={14}
                                                fill={i <= Math.round(book._avgRating) ? '#f59e0b' : 'none'}
                                                color={i <= Math.round(book._avgRating) ? '#f59e0b' : '#d1d5db'}
                                                strokeWidth={1.5} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-semibold text-amber-600">{Number(book._avgRating).toFixed(1)}</span>
                                    <span className="text-xs text-gray-400">({book._totalRatings} đánh giá)</span>
                                </div>
                            )}

                            {/* Details */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
                                <InfoRow icon={<Building2 size={15} />} label="Nhà xuất bản" value={book.publisher?.name} />
                                <InfoRow icon={<Calendar size={15} />} label="Năm xuất bản" value={book.publishYear} />
                                <InfoRow icon={<Hash size={15} />} label="ISBN" value={book.isbn} />
                                <InfoRow icon={<Globe size={15} />} label="Ngôn ngữ" value={book.language} />
                                <InfoRow icon={<FileText size={15} />} label="Số trang" value={book.pages} />
                                <InfoRow icon={<BookOpen size={15} />} label="Danh mục" value={book.category?.name} />
                            </div>

                            {/* Description */}
                            {desc && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                    <h2 className="font-bold text-gray-900 mb-3">Mô tả sách</h2>
                                    <p className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${!expanded && isLong ? 'line-clamp-6' : ''}`}>
                                        {desc}
                                    </p>
                                    {isLong && (
                                        <button onClick={() => setExpanded(e => !e)}
                                            className="mt-2 text-sm font-medium hover:underline" style={{ color: '#a30014' }}>
                                            {expanded ? 'Thu gọn' : 'Xem thêm'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Review section */}
                    <div className="mt-8">
                        <BookReviews bookId={book.id} />
                    </div>
                    </>
                ) : null}
            </main>

            {/* Modal chọn ngày mượn / trả */}
            <Modal
                open={borrowModal}
                onCancel={() => { setBorrowModal(false); setBorrowDate(null); setDueDate(null); }}
                title={
                    <div className="flex items-center gap-2 py-1">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fef2f2' }}>
                            <Calendar size={16} style={{ color: '#a30014' }} />
                        </div>
                        <span className="font-bold text-gray-900">Chọn ngày mượn sách</span>
                    </div>
                }
                footer={null}
                destroyOnClose
                width={420}
            >
                <div className="mt-4 space-y-4">
                    {/* Preview sách */}
                    {book && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            {(Array.isArray(book.coverImage) ? book.coverImage[0] : book.coverImage)
                                ? <img src={Array.isArray(book.coverImage) ? book.coverImage[0] : book.coverImage}
                                    alt="" className="w-10 h-14 object-cover rounded-lg shrink-0" />
                                : <div className="w-10 h-14 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                    <BookOpen size={16} style={{ color: '#a30014' }} />
                                  </div>
                            }
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{book.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{book.authors?.map(a => a.fullName).join(', ')}</p>
                            </div>
                        </div>
                    )}

                    {/* Ngày mượn */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ngày mượn <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            value={borrowDate}
                            onChange={(date) => {
                                setBorrowDate(date);
                                // Ngày trả đang chọn không còn hợp lệ với ngày mượn mới (<= ngày mượn hoặc quá 30 ngày) thì reset
                                const dueOutOfRange = dueDate && date && (dueDate.isBefore(date.add(1, 'day'))
                                    || dueDate.isAfter(date.add(MAX_BORROW_DAYS, 'day').endOf('day')));
                                if (dueOutOfRange) setDueDate(null);
                            }}
                            disabledDate={(d) => d && d.isBefore(dayjs().startOf('day'))}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày mượn"
                            size="large"
                            className="w-full"
                        />
                    </div>

                    {/* Ngày trả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ngày trả <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            value={dueDate}
                            onChange={setDueDate}
                            disabledDate={(d) => {
                                if (!d) return false;
                                const start = borrowDate || dayjs();
                                // từ ngày sau ngày mượn đến tối đa MAX_BORROW_DAYS ngày
                                return d.isBefore(start.add(1, 'day').startOf('day'))
                                    || d.isAfter(start.add(MAX_BORROW_DAYS, 'day').endOf('day'));
                            }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày trả"
                            size="large"
                            className="w-full"
                        />
                        {borrowDate && dueDate && (
                            <p className="text-xs text-gray-400 mt-1">
                                Thời gian mượn: <span className="font-medium text-gray-700">
                                    {dueDate.diff(borrowDate, 'day')} ngày
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 justify-end pt-1">
                        <button onClick={() => { setBorrowModal(false); setBorrowDate(null); setDueDate(null); }}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            Hủy
                        </button>
                        <button onClick={handleBorrow} disabled={!borrowDate || !dueDate || borrowing}
                            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            style={{ backgroundColor: '#a30014' }}>
                            <Send size={15} />
                            {borrowing ? 'Đang gửi...' : 'Xác nhận gửi yêu cầu'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* QR Code Modal */}
            <BookQRCode
                open={qrOpen}
                onClose={() => setQrOpen(false)}
                book={book}
            />

            <Footer />
        </div>
    );
};

export default BookDetail;
