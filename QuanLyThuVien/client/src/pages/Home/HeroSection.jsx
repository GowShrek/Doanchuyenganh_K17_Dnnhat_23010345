import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="bg-surface-container-lowest border-b border-surface-variant">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Thư viện số Đại học</span>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface">
            Khám phá tri thức<br/><span className="text-primary">không giới hạn</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Truy cập hàng ngàn tài liệu, giáo trình và sách tham khảo chất lượng cao. Nền tảng học tập hiện đại dành riêng cho sinh viên và giảng viên.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <Link to="/search" className="bg-primary-container text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md font-semibold hover:shadow-md transition-all flex items-center gap-2" style={{ backgroundColor: '#a30014', color: 'white' }}>
              <Search size={20} />
              Tìm sách ngay
            </Link>
            <Link to="/register" className="border border-outline-variant text-on-surface bg-transparent px-6 py-3 rounded-lg font-label-md text-label-md font-semibold hover:bg-surface-container-low transition-all">
              Đăng ký thành viên
            </Link>
          </div>
        </div>
        <div className="relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden shadow-sm border border-surface-variant">
          <img 
            alt="Students studying" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOEH_lUNpBXUE0UfGmlMBzuzMzdItZerleiIYmisjXjp0328JAOlBui_vXY3pjBL3-14wyFbUYtUwXtNyS1J9fjyCtBvOl2_PhN-HmuTXXqDtkwjY0d-ue2O2kfo01me4yjkBBMB3T57yLwGZN0DhvzauHz7Odz6a_7ksCwr3TKOcvQ7llTKT37elANCQ2uHWrOwUgRMTo0fKhNgjtidVHLT68iVx1pcMarrAbCLeUsTd2i9RRfVe4aJ6wVuFzNK88VyydFn82_tyu"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
