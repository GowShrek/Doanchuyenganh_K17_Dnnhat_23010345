import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
    { label: 'Tổng quan', icon: 'dashboard', href: '/admin', allowedRoles: ['admin', 'librarian'] },
    {
        label: 'Quản lý sách',
        icon: 'library_books',
        href: '/admin/books',
        group: 'Thư viện',
        allowedRoles: ['admin', 'librarian'],
    },
    {
        label: 'Bài viết (Blog)',
        icon: 'article',
        href: '/admin/articles',
        group: 'Thư viện',
        allowedRoles: ['admin'],
    },
    {
        label: 'Quản lý người dùng',
        icon: 'group',
        href: '/admin/readers',
        group: 'Người dùng',
        allowedRoles: ['admin', 'librarian'],
    },
    {
        label: 'Danh mục sách',
        icon: 'category',
        href: '/admin/categories',
        group: 'Thư mục',
        allowedRoles: ['admin'],
    },
    {
        label: 'Thể loại',
        icon: 'style',
        href: '/admin/genres',
        group: 'Thư mục',
        allowedRoles: ['admin'],
    },
    {
        label: 'Nhà xuất bản',
        icon: 'business',
        href: '/admin/publishers',
        group: 'Thư mục',
        allowedRoles: ['admin'],
    },
    {
        label: 'Tác giả',
        icon: 'person_edit',
        href: '/admin/authors',
        group: 'Thư mục',
        allowedRoles: ['admin'],
    },
    {
        label: 'Quản lý mượn trả',
        icon: 'swap_horiz',
        href: '/admin/borrows',
        group: 'Nghiệp vụ',
        allowedRoles: ['admin', 'librarian'],
    },
    {
        label: 'Quản lý tiền phạt',
        icon: 'payments',
        href: '/admin/fines',
        group: 'Nghiệp vụ',
        allowedRoles: ['admin', 'librarian'],
    },
    {
        label: 'Đánh giá sách',
        icon: 'reviews',
        href: '/admin/reviews',
        group: 'Nghiệp vụ',
        allowedRoles: ['admin'],
    },
    {
        label: 'Hộp thư liên hệ',
        icon: 'mail',
        href: '/admin/contacts',
        group: 'Nghiệp vụ',
        allowedRoles: ['admin'],
    },
    {
        label: 'Cấu hình hệ thống',
        icon: 'settings_applications',
        href: '/admin/configs',
        group: 'Nghiệp vụ',
        allowedRoles: ['admin'],
    },
    {
        label: 'Báo cáo thống kê',
        icon: 'description',
        href: '/admin/reports',
        group: 'Nghiệp vụ',
        allowedRoles: ['admin', 'librarian'],
    },
];

const AdminSidebar = ({ mobileOpen, onClose }) => {
    const { pathname } = useLocation();
    const { logout, user } = useAuth();

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="px-5 pt-6 pb-4 border-b border-outline-variant/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#a30014] rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">library_books</span>
                    </div>
                    <div>
                        <h1 className="text-[15px] font-bold text-[#a30014] leading-tight tracking-tight">
                            {user?.role === 'librarian' ? 'Staff Portal' : 'Admin Portal'}
                        </h1>
                        <p className="text-[11px] text-gray-500 font-medium">Fahasa Digital</p>
                    </div>
                </div>
            </div>

            {/* Quick Action */}
            <div className="px-4 py-4">
                <Link
                    to="/admin/books/new"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                    style={{ backgroundColor: '#a30014', color: '#ffffff' }}
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm sách mới
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 overflow-y-auto pb-2">
                {(() => {
                    const rendered = [];
                    let lastGroup = null;

                    const basePath = user?.role === 'librarian' ? '/staff' : '/admin';

                    // Filter items based on role and inject dynamic basePath
                    const filteredNavs = NAV_ITEMS
                        .filter(item => item.allowedRoles.includes(user?.role))
                        .map(item => ({
                            ...item,
                            href: item.href.replace('/admin', basePath)
                        }));

                    filteredNavs.forEach((item) => {
                        const isActive =
                            pathname === item.href || (item.href !== basePath && pathname.startsWith(item.href));
                        const group = item.group || null;

                        // Render group header khi group thay đổi
                        if (group && group !== lastGroup) {
                            rendered.push(
                                <p
                                    key={`group-${group}`}
                                    className="text-[10px] font-semibold uppercase tracking-wider px-2 mt-4 mb-1"
                                    style={{ color: '#906f6c' }}
                                >
                                    {group}
                                </p>,
                            );
                            lastGroup = group;
                        }

                        // Header "Tổng quan" không có group
                        if (!group && lastGroup === null) {
                            rendered.push(
                                <p
                                    key="group-main"
                                    className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1"
                                    style={{ color: '#906f6c' }}
                                >
                                    Menu chính
                                </p>,
                            );
                            lastGroup = '__main__';
                        }

                        rendered.push(
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={onClose}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5"
                                style={
                                    isActive ? { backgroundColor: '#a30014', color: '#ffffff' } : { color: '#5c403d' }
                                }
                            >
                                <span
                                    className="material-symbols-outlined text-[20px] shrink-0"
                                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                >
                                    {item.icon}
                                </span>
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.badge && (
                                    <span
                                        className="text-[10px] rounded-full px-1.5 py-0.5 font-bold shrink-0"
                                        style={
                                            isActive
                                                ? { backgroundColor: '#ffffff', color: '#a30014' }
                                                : { backgroundColor: '#ba1a1a', color: '#ffffff' }
                                        }
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>,
                        );
                    });

                    return rendered;
                })()}
            </nav>

            {/* Bottom */}
            <div className="px-3 pb-4 pt-3 border-t border-outline-variant/40 mt-2 space-y-0.5">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Đăng xuất
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/60 z-40 shadow-sm">
                {sidebarContent}
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
                    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/60 z-50 md:hidden shadow-xl">
                        {sidebarContent}
                    </aside>
                </>
            )}
        </>
    );
};

export default AdminSidebar;
