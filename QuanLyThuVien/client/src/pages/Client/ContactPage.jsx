import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { requestCreateContact } from '../../config/contactRequest';
import { message } from 'antd';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await requestCreateContact(formData);
            message.success('Cảm ơn bạn! Tin nhắn đã được gửi thành công.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Liên hệ với chúng tôi</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Thư viện luôn sẵn sàng lắng nghe mọi ý kiến đóng góp, thắc mắc và yêu cầu hỗ trợ từ bạn.
                    </p>
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    
                    {/* Contact Info */}
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin Thư viện</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">Địa chỉ</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            123 Đường Sách, Phường Đọc Giả, Quận Tri Thức, TP. Hồ Chí Minh
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">Điện thoại</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            (+84) 123 456 789<br />
                                            Hotline hỗ trợ: 1900 9999
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">Email</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            support@fahasalibrary.com<br />
                                            contact@fahasalibrary.com
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">Giờ mở cửa</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Thứ 2 - Thứ 6: 08:00 - 20:00<br />
                                            Thứ 7 - CN: 08:00 - 17:00
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map or Image Placeholder */}
                        <div className="aspect-[4/3] w-full bg-gray-200 rounded-2xl overflow-hidden relative">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.319350036697!2d106.6953140153343!3d10.78683489231454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3565020bc1%3A0xc0fb19842f65f!2sHo%20Chi%20Minh%20City%20Book%20Street!5e0!3m2!1sen!2s!4v1655000000000!5m2!1sen!2s" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Gửi tin nhắn cho chúng tôi</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Nhập họ và tên của bạn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email liên hệ <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Bạn cần hỗ trợ vấn đề gì?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung tin nhắn <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    rows="5"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    placeholder="Nhập nội dung chi tiết..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 text-white font-bold rounded-xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#a30014' }}
                            >
                                {submitting ? 'Đang gửi...' : (
                                    <>
                                        <Send size={20} />
                                        Gửi tin nhắn ngay
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
