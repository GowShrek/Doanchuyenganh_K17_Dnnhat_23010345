import React from 'react';
import { Library, Mail, Phone, MapPin, Facebook, Youtube, Instagram, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1a0005] text-white mt-16">
      {/* Main Footer Content */}
      <div className="max-w-[1280px] mx-auto px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 - Brand */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Library size={28} className="text-red-400" />
              <span className="text-xl font-bold text-white">Fahasa Digital</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Thư viện số đại học – nền tảng học tập hiện đại, kết nối sinh viên và tri thức không giới hạn.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-1">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-700 flex items-center justify-center transition-colors duration-200">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-700 flex items-center justify-center transition-colors duration-200">
                <Youtube size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-700 flex items-center justify-center transition-colors duration-200">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">Điều hướng</h4>
            {['Trang chủ', 'Danh mục sách', 'Sách nổi bật', 'Tin tức', 'Trợ giúp & FAQ'].map((item) => (
              <a key={item} href="#" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-1 transition-colors duration-200 group">
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 -ml-1 transition-all duration-200" />
                {item}
              </a>
            ))}
          </div>

          {/* Column 3 - Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">Chính sách</h4>
            {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Chính sách Cookie', 'Quy định mượn sách', 'Khả năng truy cập'].map((item) => (
              <a key={item} href="#" className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-1 transition-colors duration-200 group">
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 -ml-1 transition-all duration-200" />
                {item}
              </a>
            ))}
          </div>

          {/* Column 4 - Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">Liên hệ</h4>
            <div className="flex items-start gap-3 text-gray-400 text-sm">
              <MapPin size={16} className="text-red-400 mt-0.5 shrink-0" />
              <span>01 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <Phone size={16} className="text-red-400 shrink-0" />
              <span>(028) 3720 6001</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <Mail size={16} className="text-red-400 shrink-0" />
              <span>thuvien@fahasa.edu.vn</span>
            </div>

            {/* Newsletter mini */}
            <div className="mt-2">
              <p className="text-gray-400 text-xs mb-2">Đăng ký nhận thông báo sách mới:</p>
              <div className="flex overflow-hidden rounded-lg border border-white/10">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="flex-1 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
                <button className="bg-red-700 hover:bg-red-600 px-3 text-white transition-colors duration-200">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-8 py-5 flex justify-center items-center">
          <p className="text-gray-500 text-xs">
            © 2024 Fahasa Digital University Library. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
