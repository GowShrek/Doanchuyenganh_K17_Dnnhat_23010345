import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import HeroSection from './HeroSection';
import FeaturedCategories from './FeaturedCategories';
import BookGrid from './BookGrid';
import { BookOpen, Library, Users, ArrowRightLeft } from 'lucide-react';
import { requestGetBooks } from '../../config/bookRequest';


// Stats thực từ API
const QuickStats = () => {
    const [stats, setStats] = useState({ books: 0, copies: 0, readers: 0 });

    useEffect(() => {
        requestGetBooks({ limit: 1, isActive: true })
            .then((booksRes) => {
                setStats({
                    books: booksRes.metadata?.total || 0,
                    readers: 500, // Hiển thị số ảo hoặc cần tạo API public
                });
            })
            .catch(() => {});
    }, []);

    const items = [
        { icon: <BookOpen size={22} />, label: 'Tổng đầu sách', value: stats.books.toLocaleString('vi-VN') },
        { icon: <Library size={22} />, label: 'Danh mục sách', value: '10+' },
        { icon: <Users size={22} />, label: 'Độc giả', value: stats.readers.toLocaleString('vi-VN') },
        { icon: <ArrowRightLeft size={22} />, label: 'Lượt mượn tháng', value: '—' },
    ];

    return (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg -mt-10 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map(s => (
                    <div key={s.label} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant flex flex-col gap-2 hover:-translate-y-1 transition-transform">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fef2f2', color: '#a30014' }}>
                            {s.icon}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant">{s.label}</p>
                        <h3 className="font-headline-lg text-headline-lg text-on-surface">{s.value}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

import HowItWorks from './HowItWorks';
import LatestArticles from './LatestArticles';
import CallToAction from './CallToAction';
import UserReviews from './UserReviews';

const Home = () => {
    return (
        <div className="bg-background text-on-surface font-body-md text-body-md antialiased flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <HeroSection />
                <QuickStats />
                <HowItWorks />
                <FeaturedCategories />
                <BookGrid />
                <UserReviews />
                <LatestArticles />
                <CallToAction />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
