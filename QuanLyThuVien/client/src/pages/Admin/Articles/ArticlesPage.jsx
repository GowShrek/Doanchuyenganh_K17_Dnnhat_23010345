import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { requestGetArticles, requestDeleteArticle, requestToggleArticleStatus } from '../../../config/articleRequest';
import { message, Pagination, Popconfirm, Tag, Spin } from 'antd';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import ArticleForm from './ArticleForm';

const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await requestGetArticles({ page, limit: 10, search });
            if (res.metadata) {
                setArticles(res.metadata.articles);
                setTotal(res.metadata.total);
            }
        } catch (error) {
            message.error('Lỗi lấy danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchArticles();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, page]);

    const handleDelete = async (id) => {
        try {
            await requestDeleteArticle(id);
            message.success('Xóa bài viết thành công');
            if (articles.length === 1 && page > 1) setPage(page - 1);
            else fetchArticles();
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await requestToggleArticleStatus(id);
            message.success('Cập nhật trạng thái thành công');
            fetchArticles();
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleEdit = (id) => {
        setEditingId(id);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = (shouldReload = false) => {
        setIsFormOpen(false);
        setEditingId(null);
        if (shouldReload) fetchArticles();
    };

    return (
        <AdminLayout title="Quản lý Bài viết" subtitle="Đăng tải tin tức, thông báo, bài viết giới thiệu sách.">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {/* Header Actions */}
                <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="w-full sm:w-auto px-5 py-2 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#a30014' }}
                    >
                        <Plus size={18} />
                        Thêm bài viết
                    </button>
                </div>

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
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Lượt xem</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tác giả</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {articles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {article.thumbnail ? (
                                                <img src={article.thumbnail} alt="" className="w-12 h-10 object-cover rounded shadow-sm" />
                                            ) : (
                                                <div className="w-12 h-10 bg-gray-100 rounded flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-gray-400">image</span>
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{article.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">/{article.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleToggleStatus(article.id)} className="transition-transform hover:scale-105">
                                            {article.status === 'published' ? (
                                                <Tag color="green" className="m-0 cursor-pointer">Đã xuất bản</Tag>
                                            ) : (
                                                <Tag color="default" className="m-0 cursor-pointer">Bản nháp</Tag>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600">
                                            <Eye size={14} />
                                            <span className="text-sm font-semibold">{article.views}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {article.author?.fullName || 'Ẩn danh'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(article.id)}
                                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <Popconfirm
                                                title="Xóa bài viết"
                                                description="Bạn có chắc chắn muốn xóa bài viết này không?"
                                                onConfirm={() => handleDelete(article.id)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <button className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </Popconfirm>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && articles.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-[48px] text-gray-300">article</span>
                                            <p>Chưa có bài viết nào</p>
                                        </div>
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

            {/* Form Modal */}
            <ArticleForm 
                isOpen={isFormOpen} 
                onClose={handleCloseForm} 
                articleId={editingId} 
            />
        </AdminLayout>
    );
};

export default ArticlesPage;
