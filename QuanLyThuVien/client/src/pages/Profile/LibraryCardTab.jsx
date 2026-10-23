import React from 'react';
import { BookOpen } from 'lucide-react';

const LibraryCard = ({ user }) => (
    <div className="rounded-2xl p-6 text-white relative overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #a30014 0%, #c92127 50%, #7f0010 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-2xl"
            style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 blur-xl"
            style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

        <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold">Thẻ Thư Viện</h3>
                    <p className="text-xs opacity-70 uppercase tracking-widest mt-0.5">Hệ Thống Quản Lý Thư Viện</p>
                </div>
                <BookOpen size={28} className="opacity-80" />
            </div>

            {/* User info */}
            <div className="space-y-3 mb-6">
                <div>
                    <p className="text-[11px] opacity-60 uppercase tracking-wider">Sinh viên</p>
                    <p className="text-lg font-bold">{user?.fullName || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[11px] opacity-60 uppercase tracking-wider">MSSV</p>
                        <p className="text-sm font-semibold">{user?.studentId || '—'}</p>
                    </div>
                    <div>
                        <p className="text-[11px] opacity-60 uppercase tracking-wider">Khoa</p>
                        <p className="text-sm font-semibold">{user?.department || '—'}</p>
                    </div>
                </div>
            </div>

            {/* Footer: QR + email */}
            <div className="flex justify-between items-end border-t border-white/20 pt-4">
                {/* Simple QR placeholder */}
                <div className="bg-white rounded-lg p-1.5">
                    <div className="w-14 h-14 grid grid-cols-3 gap-0.5">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className={`rounded-sm ${[0,1,3,4,5,7,8].includes(i) ? 'bg-gray-900' : 'bg-white'}`} />
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] opacity-50">Email</p>
                    <p className="text-xs opacity-80 font-medium truncate max-w-[140px]">{user?.email}</p>
                </div>
            </div>
        </div>
    </div>
);

const LibraryCardTab = ({ user }) => (
    <div className="max-w-sm mx-auto space-y-4">
        <LibraryCard user={user} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-sm text-gray-500 space-y-2">
            <p className="font-semibold text-gray-700">Hướng dẫn sử dụng thẻ</p>
            <p>Xuất trình thẻ thư viện khi đến mượn/trả sách tại quầy.</p>
            <p>Không được dùng thẻ của người khác. Vi phạm sẽ bị thu hồi thẻ.</p>
        </div>
    </div>
);

export default LibraryCardTab;
