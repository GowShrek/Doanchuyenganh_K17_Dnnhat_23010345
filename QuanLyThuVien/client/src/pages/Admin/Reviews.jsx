import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { requestGetAllReviews, requestToggleReviewStatus } from '../../config/reviewRequest';
import { message, Pagination, Popconfirm, Tag, Spin, Rate } from 'antd';
import { EyeOff, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await requestGetAllReviews({ page, limit: 10 });
            if (res.metadata) {
                setReviews(res.metadata.reviews);
                setTotal(res.metadata.total);
            }
        } catch (error) {
            message.error('Lỗi lấy danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page]);

    const handleToggleStatus = async (id) => {
        try {
            await requestToggleReviewStatus(id);
            message.success('Cập nhật trạng thái thành công');
            fetchReviews();
        } catch (error) {
            message.error('Lỗi cập nhật trạng thái');
        }
    };

    return (
        <AdminLayout title="Đánh giá sách" subtitle="Quản lý và kiểm duyệt các bình luận đánh giá từ độc giả.">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {/* Table */}
                <div className="overflow-x-auto relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                            <Spin />
                        </div>
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Độc giả</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Đánh giá sách</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm số</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reviews.map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {review.reviewer?.avatar ? (
                                                <img src={review.reviewer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold">
                                                    {review.reviewer?.fullName?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <span className="block font-semibold text-gray-900">{review.reviewer?.fullName}</span>
                                                <span className="block text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={`/books/${review.book?.id}`} className="text-sm font-bold text-blue-600 hover:underline block mb-1">
                                            {review.book?.title}
                                        </Link>
                                        <p className="text-sm text-gray-700 italic max-w-[300px] line-clamp-2">
                                            "{review.comment}"
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Rate disabled defaultValue={review.rating} className="text-sm" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {review.isHidden ? (
                                            <Tag color="red" className="m-0">Đã ẩn</Tag>
                                        ) : (
                                            <Tag color="green" className="m-0">Hiển thị</Tag>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Popconfirm
                                            title={review.isHidden ? "Hiển thị lại đánh giá này?" : "Ẩn đánh giá này?"}
                                            onConfirm={() => handleToggleStatus(review.id)}
                                            okText="Đồng ý"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: !review.isHidden }}
                                        >
                                            <button 
                                                className={`p-2 rounded-lg transition-colors ${
                                                    review.isHidden 
                                                    ? 'text-green-600 hover:bg-green-50' 
                                                    : 'text-red-600 hover:bg-red-50'
                                                }`}
                                                title={review.isHidden ? "Cho phép hiển thị" : "Ẩn đánh giá"}
                                            >
                                                {review.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </Popconfirm>
                                    </td>
                                </tr>
                            ))}
                            {!loading && reviews.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <p>Chưa có đánh giá nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                        <Pagination
                            current={page}
                            total={total}
                            pageSize={10}
                            onChange={(p) => setPage(p)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ReviewsPage;
