import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, HelpCircle, LogOut } from 'lucide-react';
import { NAV_ITEMS, getAvatarSrc } from './constants';

const ProfileSidebar = ({ user, activeTab, setActiveTab, setSidebarOpen, unpaidCount, logout }) => (
    <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm
        transition-transform duration-300 -translate-x-full lg:translate-x-0`}
        // Note: mobile open state handled by parent via class override
    >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-50">
            <Link to="/" className="flex items-center gap-2">
                <BookOpen size={22} style={{ color: '#a30014' }} />
                <span className="text-lg font-bold" style={{ color: '#a30014' }}>Fahasa Digital</span>
            </Link>
        </div>

        {/* User mini card */}
        <div className="px-6 py-5 text-center border-b border-gray-50">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-red-50 border-2 border-gray-100 mx-auto mb-2 shadow">
                {getAvatarSrc(user?.avatar)
                    ? <img src={getAvatarSrc(user.avatar)} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xl font-bold" style={{ color: '#a30014' }}>{user?.fullName?.[0]?.toUpperCase() || 'U'}</span>
                      </div>
                }
            </div>
            <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
            {user?.studentId && <p className="text-xs text-gray-400">MSSV: {user.studentId}</p>}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                    <button key={item.key}
                        onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                            ${active ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        style={active ? { backgroundColor: '#a30014' } : {}}>
                        <Icon size={17} />
                        {item.label}
                        {item.key === 'fines' && unpaidCount > 0 && (
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold
                                ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
                                {unpaidCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-3 border-t border-gray-50 space-y-1">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <HelpCircle size={17} /> Về trang chủ
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={17} /> Đăng xuất
            </button>
        </div>
    </aside>
);

export default ProfileSidebar;
