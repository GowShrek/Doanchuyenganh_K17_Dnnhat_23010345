import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell, BellOff, Check, CheckCheck, Trash2,
    BookOpen, RefreshCw, AlertTriangle, Clock,
    X, ExternalLink,
} from 'lucide-react';
import {
    requestGetNotifications,
    requestMarkNotificationRead,
    requestMarkAllNotificationsRead,
    requestDeleteNotification,
} from '../../config/notificationRequest';
import { useAuth } from '../../contexts/AuthContext';

// ── Icon theo loại thông báo ──────────────────────────────────────
const TYPE_CFG = {
    borrow_approved:     { icon: <BookOpen size={14} />,       cls: 'bg-green-100 text-green-600',  label: 'Duyệt mượn' },
    borrow_rejected:     { icon: <X size={14} />,              cls: 'bg-red-100 text-red-600',      label: 'Từ chối' },
    borrow_returned:     { icon: <Check size={14} />,          cls: 'bg-gray-100 text-gray-500',    label: 'Trả sách' },
    renew_approved:      { icon: <RefreshCw size={14} />,      cls: 'bg-blue-100 text-blue-600',    label: 'Gia hạn OK' },
    renew_rejected:      { icon: <RefreshCw size={14} />,      cls: 'bg-orange-100 text-orange-600',label: 'Gia hạn từ chối' },
    reservation_ready:   { icon: <Bell size={14} />,           cls: 'bg-purple-100 text-purple-600',label: 'Sách có rồi' },
    reservation_expired: { icon: <BellOff size={14} />,        cls: 'bg-gray-100 text-gray-400',    label: 'Hết hạn' },
    overdue_warning:     { icon: <Clock size={14} />,          cls: 'bg-yellow-100 text-yellow-600',label: 'Sắp quá hạn' },
    overdue_notice:      { icon: <AlertTriangle size={14} />,  cls: 'bg-red-100 text-red-600',      label: 'Quá hạn' },
    fine_created:        { icon: <AlertTriangle size={14} />,  cls: 'bg-red-100 text-red-600',      label: 'Phiếu phạt' },
};

const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
};

const NotificationBell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const pollRef = useRef(null);

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!user) return;
        if (!silent) setLoading(true);
        try {
            const res = await requestGetNotifications({ limit: 15 });
            setNotifications(res.metadata?.notifications || []);
            setUnread(res.metadata?.unread || 0);
        } catch {}
        finally { if (!silent) setLoading(false); }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        // Poll mỗi 30 giây
        pollRef.current = setInterval(() => fetchNotifications(true), 30000);
        return () => clearInterval(pollRef.current);
    }, [fetchNotifications, user]);

    // Đóng khi click ngoài
    useEffect(() => {
        const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => { setOpen(o => !o); if (!open) fetchNotifications(); };

    const handleRead = async (n) => {
        if (!n.isRead) {
            await requestMarkNotificationRead(n.id).catch(() => {});
            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
            setUnread(u => Math.max(0, u - 1));
        }
        if (n.link) { setOpen(false); navigate(n.link); }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await requestDeleteNotification(id).catch(() => {});
        setNotifications(prev => prev.filter(x => x.id !== id));
    };

    const handleMarkAll = async () => {
        await requestMarkAllNotificationsRead().catch(() => {});
        setNotifications(prev => prev.map(x => ({ ...x, isRead: true })));
        setUnread(0);
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button onClick={handleOpen}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                <Bell size={18} />
                {unread > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center px-0.5 leading-none"
                        style={{ backgroundColor: '#a30014' }}>
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">Thông báo {unread > 0 && <span className="text-xs font-semibold text-red-600">({unread} mới)</span>}</span>
                        {unread > 0 && (
                            <button onClick={handleMarkAll} className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                                <CheckCheck size={12} /> Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-sm text-gray-400">Đang tải...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <BellOff size={28} className="mx-auto mb-2 text-gray-200" />
                                <p className="text-sm text-gray-400">Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const cfg = TYPE_CFG[n.type] || TYPE_CFG.overdue_notice;
                                return (
                                    <div key={n.id} onClick={() => handleRead(n)}
                                        className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 relative group
                                            ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                                        {/* Icon */}
                                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${cfg.cls}`}>
                                            {cfg.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <p className={`text-xs font-bold leading-snug line-clamp-1 ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {n.title}
                                                </p>
                                                {!n.isRead && <div className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />}
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                {timeAgo(n.createdAt)}
                                                {n.link && <ExternalLink size={9} className="text-gray-300" />}
                                            </p>
                                        </div>

                                        {/* Delete btn */}
                                        <button onClick={(e) => handleDelete(e, n.id)}
                                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-50 text-center">
                            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                Xem tất cả thông báo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
