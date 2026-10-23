import React from 'react';
import { Search, CalendarCheck, BookOpen, Undo2 } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: 'Tìm Kiếm Sách',
        desc: 'Khám phá hàng ngàn đầu sách đa dạng từ thư viện số của chúng tôi.',
        icon: <Search size={28} />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        id: 2,
        title: 'Đặt Trước (Tùy chọn)',
        desc: 'Giữ chỗ trước những cuốn sách đang hot hoặc đang được mượn.',
        icon: <CalendarCheck size={28} />,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
    {
        id: 3,
        title: 'Nhận Sách & Đọc',
        desc: 'Đến thư viện nhận sách đã đặt hoặc mượn trực tiếp tại quầy.',
        icon: <BookOpen size={28} />,
        color: 'text-green-600',
        bg: 'bg-green-50',
    },
    {
        id: 4,
        title: 'Trả Hoặc Gia Hạn',
        desc: 'Trả sách đúng hạn hoặc yêu cầu gia hạn trực tuyến dễ dàng.',
        icon: <Undo2 size={28} />,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
    },
];

const HowItWorks = () => {
    return (
        <section className="py-16 md:py-24 bg-white border-t border-gray-100">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Quy Trình Hoạt Động</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Mượn sách dễ dàng chỉ với 4 bước đơn giản. Hệ thống trực tuyến giúp bạn tiết kiệm thời gian và dễ dàng quản lý việc đọc của mình.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="relative flex flex-col items-center text-center group">
                            {/* Connector line for desktop */}
                            {idx < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-[2.5rem] left-[60%] w-full h-[2px] bg-gray-100 -z-10 group-hover:bg-gray-200 transition-colors"></div>
                            )}
                            
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white group-hover:scale-110 transition-transform duration-300 ${step.bg} ${step.color}`}>
                                {step.icon}
                            </div>
                            
                            <div className="relative">
                                <span className="absolute -top-10 -left-6 text-6xl font-black text-gray-50/50 -z-10 select-none">
                                    0{step.id}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
