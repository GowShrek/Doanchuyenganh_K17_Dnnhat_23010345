import React from 'react';
import { ArrowRight, Monitor, TrendingUp, Languages, Megaphone, Palette, BookOpenText } from 'lucide-react';

const FeaturedCategories = () => {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Danh mục nổi bật</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Khám phá sách theo các lĩnh vực chuyên môn</p>
        </div>
        <button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
          Xem tất cả <ArrowRight size={18} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <a className="group bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all" href="#">
          <Monitor className="text-tertiary group-hover:text-primary transition-colors" size={36} />
          <span className="font-label-md text-label-md text-on-surface">CNTT</span>
        </a>
        <a className="group bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all" href="#">
          <TrendingUp className="text-tertiary group-hover:text-primary transition-colors" size={36} />
          <span className="font-label-md text-label-md text-on-surface">Kinh tế</span>
        </a>
        <a className="group bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all" href="#">
          <Languages className="text-tertiary group-hover:text-primary transition-colors" size={36} />
          <span className="font-label-md text-label-md text-on-surface">Ngoại ngữ</span>
        </a>
        <a className="group bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all" href="#">
          <Megaphone className="text-tertiary group-hover:text-primary transition-colors" size={36} />
          <span className="font-label-md text-label-md text-on-surface">Marketing</span>
        </a>
        <a className="group bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all" href="#">
          <Palette className="text-tertiary group-hover:text-primary transition-colors" size={36} />
          <span className="font-label-md text-label-md text-on-surface">Thiết kế</span>
        </a>
        <a className="group bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all" href="#">
          <BookOpenText className="text-tertiary group-hover:text-primary transition-colors" size={36} />
          <span className="font-label-md text-label-md text-on-surface">Văn học</span>
        </a>
      </div>
    </section>
  );
};

export default FeaturedCategories;
