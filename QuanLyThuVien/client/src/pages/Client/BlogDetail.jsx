import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { requestGetArticleBySlug } from '../../config/articleRequest';
import { Spin, Result, Breadcrumb } from 'antd';
import { Calendar, Eye, ArrowLeft, Home } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

const BlogDetail = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const res = await requestGetArticleBySlug(slug);
                if (res.metadata) {
                    setArticle(res.metadata);
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error('Lỗi lấy bài viết:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex justify-center items-center">
                    <Spin size="large" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <div className="flex-1 flex justify-center items-center p-4">
                    <Result
                        status="404"
                        title="Không tìm thấy bài viết"
                        subTitle="Xin lỗi, bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa."
                        extra={
                            <Link to="/articles" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                                Quay lại danh sách bài viết
                            </Link>
                        }
                    />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-12 w-full">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-8 text-sm">
                    <Breadcrumb.Item>
                        <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
                            <Home size={14} /> Trang chủ
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/articles" className="text-gray-500 hover:text-primary transition-colors">Tin tức</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className="text-gray-900 font-medium">{article.title}</Breadcrumb.Item>
                </Breadcrumb>

                <article>
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                            {article.author?.avatar ? (
                                <img src={article.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold">
                                    {article.author?.fullName?.[0] || 'A'}
                                </div>
                            )}
                            <span className="font-semibold text-gray-700">{article.author?.fullName || 'Ẩn danh'}</span>
                        </div>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Eye size={16} />
                            {article.views} lượt xem
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-10 tracking-tight">
                        {article.title}
                    </h1>

                    {/* Thumbnail */}
                    {article.thumbnail && (
                        <div className="w-full aspect-[2/1] md:aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-sm border border-gray-100">
                            <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Content (HTML) */}
                    <div 
                        className="ql-editor prose prose-lg prose-red max-w-none text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </article>

                <div className="mt-16 pt-8 border-t border-gray-100">
                    <Link to="/articles" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-red-700 transition-colors">
                        <ArrowLeft size={18} /> Quay lại Tin tức & Sự kiện
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogDetail;
