import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { requestGetArticles } from '../../config/articleRequest';
import { Spin, Empty, Pagination } from 'antd';
import { Calendar, Eye, ArrowRight } from 'lucide-react';

const BlogPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await requestGetArticles({ page, limit: 9, status: 'published' });
            if (res.metadata) {
                setArticles(res.metadata.articles);
                setTotal(res.metadata.total);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách bài viết:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
        window.scrollTo(0, 0);
    }, [page]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Tin tức & Sự kiện</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Cập nhật những thông tin mới nhất về thư viện, giới thiệu sách hay, và các sự kiện sắp diễn ra.
                    </p>
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
                {loading ? (
                    <div className="flex justify-center p-20"><Spin size="large" /></div>
                ) : articles.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <Empty description="Chưa có bài viết nào được đăng tải" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((article) => (
                                <article key={article.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                                    <Link to={`/articles/${article.slug}`} className="block relative aspect-video overflow-hidden">
                                        {article.thumbnail ? (
                                            <img 
                                                src={article.thumbnail} 
                                                alt={article.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[40px] text-gray-300">article</span>
                                            </div>
                                        )}
                                    </Link>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Eye size={14} />
                                                {article.views} lượt xem
                                            </span>
                                        </div>
                                        <Link to={`/articles/${article.slug}`}>
                                            <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
                                                {article.title}
                                            </h2>
                                        </Link>
                                        
                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {article.author?.avatar ? (
                                                    <img src={article.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                        {article.author?.fullName?.[0] || 'A'}
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-gray-600">{article.author?.fullName || 'Ẩn danh'}</span>
                                            </div>
                                            <Link to={`/articles/${article.slug}`} className="text-primary hover:text-red-700 flex items-center gap-1 text-sm font-semibold transition-colors">
                                                Đọc tiếp <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {total > 9 && (
                            <div className="mt-10 flex justify-center">
                                <Pagination
                                    current={page}
                                    total={total}
                                    pageSize={9}
                                    onChange={(p) => setPage(p)}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BlogPage;
