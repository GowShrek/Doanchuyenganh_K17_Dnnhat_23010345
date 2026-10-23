import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { Badge, Popover, Spin, Empty, message } from 'antd';
import { requestGetNotifications, requestMarkNotificationRead } from '../config/notificationRequest';

const ROLE_LABEL = {
    admin: { label: 'Quản trị viên', color: 'text-red-600' },
    librarian: { label: 'Thủ thư', color: 'text-blue-600' },
    reader: { label: 'Độc giả', color: 'text-green-600' },
};

const AdminLayout = ({ children, title = 'Tổng quan', subtitle }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    // Notifications state
    const [notifs, setNotifs] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const [openNotif, setOpenNotif] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoadingNotifs(true);
            const res = await requestGetNotifications({ limit: 10 });
            if (res.metadata) {
                setNotifs(res.metadata.notifications || []);
                setUnreadCount(res.metadata.unread || 0);
            }
        } catch (error) {
            console.error('Lỗi lấy thông báo', error);
        } finally {
            setLoadingNotifs(false);
        }
    };

    useEffect(() => {
        if (user && ['admin', 'librarian'].includes(user.role)) {
            fetchNotifications();
            // Polling mỗi 30s
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleReadNotification = async (item) => {
        try {
            if (!item.isRead) {
                await requestMarkNotificationRead(item.id);
                fetchNotifications();
            }
            setOpenNotif(false);
            if (item.link) {
                navigate(item.link);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const notificationContent = (
        <div className="w-80 max-h-96 overflow-y-auto -mx-3 -my-2">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                <h3 className="font-bold text-gray-900">Thông báo</h3>
                <span className="text-xs text-primary font-semibold">{unreadCount} mới</span>
            </div>
            {loadingNotifs && notifs.length === 0 ? (
                <div className="flex justify-center p-6">
                    <Spin />
                </div>
            ) : notifs.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo nào" />
            ) : (
                <div className="divide-y divide-gray-50">
                    {notifs.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => handleReadNotification(n)}
                            className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${!n.isRead ? 'bg-red-50/30' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p
                                    className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}
                                >
                                    {n.title}
                                </p>
                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">
                                {new Date(n.createdAt).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#f4f5f6]">
            <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            {/* Main content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
                    {/* Hamburger - mobile */}
                    <button
                        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={() => setMobileOpen(true)}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    {/* Page title - desktop */}
                    <div className="hidden md:block">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-3 ml-auto">
                        <Popover
                            content={notificationContent}
                            trigger="click"
                            placement="bottomRight"
                            open={openNotif}
                            onOpenChange={setOpenNotif}
                            overlayInnerStyle={{ padding: 0, borderRadius: '12px' }}
                        >
                            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                                <span className="material-symbols-outlined text-[22px]">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
                                )}
                            </button>
                        </Popover>

                        {/* User */}
                        {user && (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                                    style={{ backgroundColor: '#a30014' }}
                                >
                                    {user.fullName?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-gray-800 leading-tight">{user.fullName}</p>
                                    <p className={`text-[11px] font-medium ${ROLE_LABEL[user.role]?.color}`}>
                                        {ROLE_LABEL[user.role]?.label}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
