import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, ChevronRight } from 'lucide-react';
import { requestGetArticles } from '../../config/articleRequest';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const LatestArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        requestGetArticles({ limit: 3, isPublished: true })
            .then(res => {
                setArticles(res.metadata?.articles || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || articles.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-gray-50 border-t border-gray-100">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Tin Tức & Sự Kiện</h2>
                        <p className="text-gray-500 max-w-xl">Cập nhật những thông tin mới nhất về thư viện, sách hay mỗi ngày và các sự kiện giao lưu tác giả.</p>
                    </div>
                    <Link to="/articles" className="hidden md:flex items-center gap-2 text-[#a30014] font-semibold hover:gap-3 transition-all">
                        Xem tất cả <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {articles.map((article) => (
                        <Link 
                            key={article.id} 
                            to={`/articles/${article.slug}`}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group flex flex-col"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 relative">
                                {article.thumbnail ? (
                                    <img 
                                        src={article.thumbnail} 
                                        alt={article.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                        <Calendar size={40} className="mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Chưa có ảnh</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                    {article.category || 'Tin tức'}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {dayjs(article.publishedAt || article.createdAt).format('DD/MM/YYYY')}</span>
                                    <span className="flex items-center gap-1.5"><User size={14} /> {article.author?.fullName || 'Admin'}</span>
                                </div>
                                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-[#a30014] transition-colors leading-snug">
                                    {article.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                                    {article.excerpt || 'Đọc chi tiết bài viết này để khám phá thêm nhiều thông tin hữu ích...'}
                                </p>
                                <div className="flex items-center justify-between text-sm font-semibold text-[#a30014] mt-auto">
                                    <span>Đọc tiếp</span>
                                    <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-[#a30014] group-hover:text-white transition-colors">
                                        <ChevronRight size={16} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link to="/articles" className="inline-flex items-center gap-2 text-[#a30014] font-semibold hover:underline">
                        Xem tất cả tin tức <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LatestArticles;
