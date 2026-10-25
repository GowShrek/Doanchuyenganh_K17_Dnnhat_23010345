import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { Star, Edit3, Trash2, Loader2, Send, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarSrc } from '../utils/avatar';
import {
    requestGetReviews,
    requestGetMyReview,
    requestUpsertReview,
    requestDeleteReview,
} from '../config/reviewRequest';

// ── Star rating display ───────────────────────────────────────────
const Stars = ({ value, size = 16, interactive = false, onChange }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <button key={i}
                type="button"
                disabled={!interactive}
                onClick={() => interactive && onChange?.(i)}
                className={`transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}>
                <Star
                    size={size}
                    fill={i <= value ? '#f59e0b' : 'none'}
                    color={i <= value ? '#f59e0b' : '#d1d5db'}
                    strokeWidth={1.5}
                />
            </button>
        ))}
    </div>
);

// ── Rating distribution bar ───────────────────────────────────────
const DistBar = ({ star, count, total }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-4 text-right">{star}</span>
            <Star size={11} fill="#f59e0b" color="#f59e0b" strokeWidth={1.5} />
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }} />
            </div>
            <span className="w-6 text-right">{count}</span>
        </div>
    );
};

// ── Avatar placeholder ────────────────────────────────────────────
const Avatar = ({ user }) => {
    const src = getAvatarSrc(user?.avatar);
    return (
        <div className="w-9 h-9 rounded-full overflow-hidden bg-red-50 border border-gray-100 shrink-0 flex items-center justify-center">
            {src
                ? <img src={src} alt="" className="w-full h-full object-cover" />
                : <span className="text-sm font-bold" style={{ color: '#a30014' }}>{user?.fullName?.[0]?.toUpperCase() || 'U'}</span>
            }
        </div>
    );
};

// ── Single review card ────────────────────────────────────────────
const ReviewCard = ({ review, isOwn, onEdit, onDelete }) => {
    const date = new Date(review.createdAt).toLocaleDateString('vi-VN');
    return (
        <div className={`p-4 rounded-xl border transition-colors ${isOwn ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-white'}`}>
            <div className="flex items-start gap-3">
                <Avatar user={review.reviewer} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{review.reviewer?.fullName}</span>
                            {isOwn && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">Của bạn</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{date}</span>
                            {isOwn && (
                                <div className="flex items-center gap-1">
                                    <button onClick={onEdit} title="Chỉnh sửa"
                                        className="p-1 rounded-lg hover:bg-amber-100 transition-colors text-gray-400 hover:text-amber-600">
                                        <Edit3 size={13} />
                                    </button>
                                    <button onClick={onDelete} title="Xóa"
                                        className="p-1 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <Stars value={review.rating} size={13} />
                    {review.comment && (
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Write / Edit form ─────────────────────────────────────────────
const ReviewForm = ({ existing, onSubmit, onCancel, loading }) => {
    const [rating, setRating] = useState(existing?.rating || 0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState(existing?.comment || '');

    const LABELS = ['', 'Tệ', 'Không hay', 'Bình thường', 'Hay', 'Tuyệt vời'];

    const handleSubmit = () => {
        if (!rating) { message.warning('Vui lòng chọn số sao'); return; }
        onSubmit({ rating, comment });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm">{existing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}</h4>

            {/* Star selector */}
            <div>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} type="button"
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(i)}
                            className="transition-transform hover:scale-125">
                            <Star
                                size={28}
                                fill={(hovered || rating) >= i ? '#f59e0b' : 'none'}
                                color={(hovered || rating) >= i ? '#f59e0b' : '#d1d5db'}
                                strokeWidth={1.5}
                            />
                        </button>
                    ))}
                    {(hovered || rating) > 0 && (
                        <span className="ml-2 text-sm font-medium text-amber-600">{LABELS[hovered || rating]}</span>
                    )}
                </div>
            </div>

            {/* Comment */}
            <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này... (tùy chọn)"
                rows={3}
                maxLength={500}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
            />
            <p className="text-xs text-gray-400 text-right -mt-2">{comment.length}/500</p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
                {onCancel && (
                    <button onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Hủy
                    </button>
                )}
                <button onClick={handleSubmit} disabled={loading || !rating}
                    className="px-5 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#a30014' }}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {existing ? 'Cập nhật' : 'Gửi đánh giá'}
                </button>
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────
const BookReviews = ({ bookId }) => {
    const { user } = useAuth();

    const [stats, setStats] = useState(null);          // { avgRating, totalRatings, distribution }
    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const load = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const [reviewsRes, myRes] = await Promise.all([
                requestGetReviews(bookId, { page: p, limit: 8 }),
                user ? requestGetMyReview(bookId) : Promise.resolve(null),
            ]);
            const d = reviewsRes.metadata;
            setStats({ avgRating: d.avgRating, totalRatings: d.totalRatings, distribution: d.distribution });
            setReviews(p === 1 ? d.reviews : prev => [...prev, ...d.reviews]);
            setHasMore(p < d.totalPages);
            setPage(p);
            if (myRes) setMyReview(myRes.metadata?.review || null);
        } catch { /* ignore */ } finally { setLoading(false); }
    }, [bookId, user]);

    useEffect(() => { load(1); }, [load]);

    const handleSubmit = async ({ rating, comment }) => {
        setSubmitting(true);
        try {
            await requestUpsertReview(bookId, { rating, comment });
            message.success(myReview ? 'Cập nhật đánh giá thành công' : 'Cảm ơn bạn đã đánh giá!');
            setShowForm(false);
            setEditMode(false);
            load(1);
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể gửi đánh giá');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        try {
            await requestDeleteReview(bookId);
            message.success('Đã xóa đánh giá');
            setMyReview(null);
            load(1);
        } catch { message.error('Không thể xóa đánh giá'); }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header + stats */}
            <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Đánh giá & Nhận xét</h2>

                {stats && (
                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* Average score */}
                        <div className="text-center">
                            <p className="text-5xl font-black text-gray-900 leading-none">
                                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
                            </p>
                            <Stars value={Math.round(stats.avgRating)} size={18} />
                            <p className="text-xs text-gray-400 mt-1">{stats.totalRatings} đánh giá</p>
                        </div>

                        {/* Distribution */}
                        <div className="flex-1 space-y-1.5">
                            {stats.distribution.map(d => (
                                <DistBar key={d.star} star={d.star} count={d.count} total={stats.totalRatings} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Write review */}
            <div className="px-6 py-4 border-b border-gray-50">
                {!user ? (
                    <p className="text-sm text-gray-500">
                        <a href="/login" className="font-semibold hover:underline" style={{ color: '#a30014' }}>Đăng nhập</a> để viết đánh giá.
                    </p>
                ) : myReview && !editMode ? (
                    /* Đã có đánh giá → hiển thị */
                    <ReviewCard
                        review={{ ...myReview, reviewer: { fullName: user.fullName, avatar: user.avatar, id: user.id } }}
                        isOwn={true}
                        onEdit={() => setEditMode(true)}
                        onDelete={handleDelete}
                    />
                ) : editMode ? (
                    <ReviewForm existing={myReview} onSubmit={handleSubmit} onCancel={() => setEditMode(false)} loading={submitting} />
                ) : showForm ? (
                    <ReviewForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} loading={submitting} />
                ) : (
                    <button onClick={() => setShowForm(true)}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-red-200 hover:text-red-700 transition-colors flex items-center justify-center gap-2">
                        <Star size={15} /> Viết đánh giá của bạn
                    </button>
                )}
            </div>

            {/* Review list */}
            <div className="px-6 py-4 space-y-3">
                {loading && reviews.length === 0 ? (
                    <div className="py-8 flex justify-center"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
                ) : reviews.filter(r => !user || r.userId !== user.id).length === 0 && !loading ? (
                    <div className="py-10 text-center">
                        <Star size={32} className="mx-auto mb-2 text-gray-200" />
                        <p className="text-sm text-gray-400">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                    </div>
                ) : (
                    reviews
                        .filter(r => !user || r.userId !== user.id)
                        .map(r => (
                        <ReviewCard key={r.id} review={r} isOwn={false} />
                    ))
                )}

                {hasMore && (
                    <button onClick={() => load(page + 1)} disabled={loading}
                        className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 transition-colors">
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={16} />}
                        Xem thêm đánh giá
                    </button>
                )}
            </div>
        </div>
    );
};

export default BookReviews;
