import React, { useState } from 'react';
import {
    Library,
    Search,
    ChevronDown,
    LogOut,
    User,
    Settings,
    Shield,
    BookOpen,
    Receipt,
    Sparkles,
    Bell,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Avatar, Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const ROLE_LABEL = {
    admin: { label: 'Quản trị viên', color: 'bg-red-100 text-red-700' },
    librarian: { label: 'Thủ thư', color: 'bg-blue-100 text-blue-700' },
    reader: { label: 'Độc giả', color: 'bg-green-100 text-green-700' },
};

const NAV_LINKS = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Danh mục', href: '/categories' },
    { label: 'Nổi bật', href: '/featured' },
    { label: 'Tin tức', href: '/articles' },
    { label: 'Liên hệ', href: '/contact' },
];

const AI_NAV = { label: 'AI Gợi ý', href: '/ai-chat', icon: Sparkles };

const Header = () => {
    const { user, loading, logout, isAdmin, isStaff } = useAuth();
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');

    const roleInfo = user ? ROLE_LABEL[user.role] : null;

    const userMenuItems = [
        {
            key: 'profile',
            icon: <User size={15} />,
            label: 'Hồ sơ của tôi',
            onClick: () => navigate('/profile'),
        },
        ...(user?.role === 'reader'
            ? [
                  {
                      key: 'my-borrows',
                      icon: <BookOpen size={15} />,
                      label: 'Lịch sử mượn sách',
                      onClick: () => navigate('/my/borrows'),
                  },
                  {
                      key: 'my-reservations',
                      icon: <Bell size={15} />,
                      label: 'Sách đặt trước',
                      onClick: () => navigate('/my/reservations'),
                  },
                  {
                      key: 'my-fines',
                      icon: <Receipt size={15} />,
                      label: 'Tiền phạt của tôi',
                      onClick: () => navigate('/my/fines'),
                  },
              ]
            : []),
        ...(isAdmin || isStaff
            ? [
                  {
                      key: 'admin',
                      icon: <Shield size={15} />,
                      label: isAdmin ? 'Trang quản trị' : 'Quản lý thư viện',
                      onClick: () => navigate('/admin'),
                  },
              ]
            : []),
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogOut size={15} />,
            label: 'Đăng xuất',
            danger: true,
            onClick: logout,
        },
    ];

    return (
        <header className="bg-white shadow-sm top-0 sticky z-50 border-b border-gray-100">
            <div className="flex items-center w-full px-4 md:px-8 max-w-[1480px] mx-auto h-16 gap-6">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <Library className="text-primary" size={24} />
                    <span className="text-xl font-bold text-primary hidden sm:block">Fahasa Digital</span>
                </Link>

                {/* Search */}
                <div className="flex-1 max-w-md hidden md:block">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchValue.trim()) navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
                            else navigate('/search');
                        }}
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Tìm kiếm sách, tác giả..."
                            />
                        </div>
                    </form>
                </div>

                {/* Nav */}
                <nav className="hidden lg:flex items-center gap-5 flex-1">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className="text-gray-600 hover:text-primary text-sm font-medium transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    {/* AI link */}
                    <Link
                        to={AI_NAV.href}
                        className="flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg hover:opacity-90"
                        style={{ backgroundColor: 'rgba(163,0,20,0.08)', color: '#a30014' }}
                    >
                        <Sparkles size={13} />
                        {AI_NAV.label}
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    {loading ? (
                        <Spin size="small" />
                    ) : user ? (
                        <>
                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* User Dropdown */}
                            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Avatar
                                        size={32}
                                        src={
                                            user.avatar
                                                ? `${import.meta.env.VITE_URL_IMAGE}/src/uploads/avatars/${user.avatar}`
                                                : null
                                        }
                                        style={{ backgroundColor: '#a30014' }}
                                    >
                                        {user.fullName?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-semibold text-gray-800 leading-tight">
                                            {user.fullName}
                                        </span>
                                        {roleInfo && (
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleInfo.color}`}
                                            >
                                                {roleInfo.label}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                                </button>
                            </Dropdown>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                style={{ backgroundColor: '#a30014', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7f0010')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a30014')}
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
