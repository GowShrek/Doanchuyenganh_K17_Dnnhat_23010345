import React, { useState, useEffect } from 'react';
import { Star, Quote, MessageSquareOff } from 'lucide-react';
import { requestGetLatestReviews } from '../../config/reviewRequest';

const UserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        requestGetLatestReviews({ limit: 3 })
            .then(res => setReviews(res.metadata?.reviews || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || reviews.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-surface-container-lowest">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Độc Giả Nói Gì Về Chúng Tôi</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Hơn 500+ độc giả đã trải nghiệm và hài lòng với dịch vụ thư viện số. Hãy cùng xem họ cảm nhận như thế nào nhé!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {reviews.map((review) => {
                        const avatar = review.reviewer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.fullName || 'U')}&background=random`;
                        return (
                            <div 
                                key={review.id} 
                                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative group flex flex-col"
                            >
                                <Quote size={40} className="absolute top-6 right-6 text-gray-100 group-hover:text-red-50 transition-colors" />
                                
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                
                                <p className="text-gray-600 font-body-md leading-relaxed mb-8 relative z-10 line-clamp-4 flex-1">
                                    "{review.comment}"
                                </p>
                                
                                <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-4">
                                    <img 
                                        src={avatar} 
                                        alt={review.reviewer?.fullName} 
                                        className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-50 shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{review.reviewer?.fullName}</h4>
                                        <p className="text-xs text-gray-500 truncate">Về sách: <span className="font-medium text-gray-700">{review.book?.title}</span></p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default UserReviews;
