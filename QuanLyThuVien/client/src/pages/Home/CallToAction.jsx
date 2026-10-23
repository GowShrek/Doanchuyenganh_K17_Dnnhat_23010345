import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CallToAction = () => {
    const { user } = useAuth();

    if (user) return null;

    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#a30014]"></div>
            
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex-1 text-center md:text-left text-white">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm font-medium mb-6">
                            <BookMarked size={16} /> Tham gia thư viện số
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                            Bắt Đầu Hành Trình <br className="hidden md:block" /> Đọc Sách Của Bạn
                        </h2>
                        <p className="text-white/80 text-lg max-w-xl mx-auto md:mx-0">
                            Đăng ký tài khoản ngay hôm nay để mượn sách, đọc trực tuyến và tham gia cộng đồng hàng ngàn độc giả yêu sách.
                        </p>
                    </div>
                    
                    <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4">
                        <Link 
                            to="/register"
                            style={{ backgroundColor: '#ffffff', color: '#a30014' }}
                            className="px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                        >
                            Đăng ký ngay <ArrowRight size={20} />
                        </Link>
                        <Link 
                            to="/login"
                            style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
                            className="px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors duration-300"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;
