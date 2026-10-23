import React from 'react';
import { BookOpen, Library, Users, ArrowRightLeft } from 'lucide-react';

const QuickStats = () => {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg -mt-10 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant flex flex-col gap-2 hover:-translate-y-1 transition-transform">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <BookOpen size={20} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Tổng đầu sách</p>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">15,420</h3>
        </div>
        
        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant flex flex-col gap-2 hover:-translate-y-1 transition-transform">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Library size={20} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Tổng bản sách</p>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">42,850</h3>
        </div>
        
        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant flex flex-col gap-2 hover:-translate-y-1 transition-transform">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Users size={20} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Tổng độc giả</p>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">8,930</h3>
        </div>
        
        {/* Stat Card 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant flex flex-col gap-2 hover:-translate-y-1 transition-transform">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <ArrowRightLeft size={20} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Lượt mượn tháng</p>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">2,145</h3>
        </div>
      </div>
    </section>
  );
};

export default QuickStats;
