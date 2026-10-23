import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { requestGetMyBorrows } from '../../config/borrowRequest';
import { requestGetMyFines } from '../../config/fineRequest';
import { requestUploadAvatar } from '../../config/userRequest';

import { NAV_ITEMS } from './constants';
import ProfileSidebar from './ProfileSidebar';
import ProfileInfo from './ProfileInfo';
import LibraryCardTab from './LibraryCardTab';
import BorrowHistory from './BorrowHistory';
import FinesList from './FinesList';
import EditProfileModal from './EditProfileModal';

const ProfilePage = () => {
    const { user, logout, fetchUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState('profile');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [borrows, setBorrows] = useState([]);
    const [fines, setFines] = useState([]);
    const [loadingBorrows, setLoadingBorrows] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) navigate('/login');
    }, [user]);

    // Xử lý redirect từ cổng thanh toán VNPay/MoMo (tab mới sau khi trả về)
    useEffect(() => {
        const tab = searchParams.get('tab');
        const payment = searchParams.get('payment');
        if (tab === 'fines') setActiveTab('fines');
        if (payment === 'success') {
            message.success('Thanh toán thành công! Trạng thái phiếu phạt đã được cập nhật.');
            setSearchParams({}, { replace: true });
            // Signal cho các tab khác cũng đang mở profile
            localStorage.setItem('fine_payment_success', Date.now().toString());
            requestGetMyFines({ limit: 20 }).then(f => setFines(f.metadata?.fines || [])).catch(() => {});
        } else if (payment === 'fail') {
            message.error('Thanh toán không thành công. Vui lòng thử lại.');
            setSearchParams({}, { replace: true });
        }
    }, []); // eslint-disable-line

    // Lắng nghe signal từ tab thanh toán (cross-tab via localStorage)
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'fine_payment_success') {
                message.success('Thanh toán thành công! Đang cập nhật...');
                setActiveTab('fines');
                requestGetMyFines({ limit: 20 }).then(f => setFines(f.metadata?.fines || [])).catch(() => {});
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Load borrow + fine data
    const loadData = () => {
        if (!user) return;
        setLoadingBorrows(true);
        Promise.all([requestGetMyBorrows({ limit: 20 }), requestGetMyFines({ limit: 20 })])
            .then(([b, f]) => {
                setBorrows(b.metadata?.borrows || []);
                setFines(f.metadata?.fines || []);
            })
            .catch(() => {})
            .finally(() => setLoadingBorrows(false));
    };

    const reloadFines = () => {
        requestGetMyFines({ limit: 20 }).then(f => setFines(f.metadata?.fines || [])).catch(() => {});
    };

    useEffect(() => { loadData(); }, [user]);

    // Avatar upload
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData();
        form.append('avatar', file);
        setUploadingAvatar(true);
        try {
            await requestUploadAvatar(form);
            await fetchUser?.();
            message.success('Cập nhật ảnh đại diện thành công');
        } catch {
            message.error('Không thể tải ảnh lên');
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Computed values
    const currentBorrows = borrows.filter((b) => ['approved', 'overdue'].includes(b.status));
    const overdueBorrows = borrows.filter((b) => b.status === 'overdue');
    const unpaidFines = fines.filter((f) => f.status === 'unpaid');
    const totalUnpaid = unpaidFines.reduce((s, f) => s + Number(f.amount), 0);

    // Render active tab content
    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <ProfileInfo
                        user={user}
                        uploadingAvatar={uploadingAvatar}
                        onAvatarChange={handleAvatarChange}
                        onEditOpen={() => setEditOpen(true)}
                        currentBorrows={currentBorrows}
                        overdueBorrows={overdueBorrows}
                        totalUnpaid={totalUnpaid}
                    />
                );
            case 'card':
                return <LibraryCardTab user={user} />;
            case 'borrows':
                return (
                    <BorrowHistory
                        borrows={borrows}
                        currentBorrows={currentBorrows}
                        overdueBorrows={overdueBorrows}
                        loading={loadingBorrows}
                        onBorrowsChanged={loadData}
                    />
                );
            case 'fines':
                return <FinesList fines={fines} totalUnpaid={totalUnpaid} onFinesPaid={reloadFines} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar — desktop always visible, mobile slide-in */}
            <div
                className={`fixed top-0 left-0 h-screen z-40 transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <ProfileSidebar
                    user={user}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setSidebarOpen={setSidebarOpen}
                    unpaidCount={unpaidFines.length}
                    logout={logout}
                />
            </div>

            {/* Main content */}
            <main className="flex-1 lg:ml-64 min-h-screen">
                {/* Mobile top bar */}
                <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-600"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <span className="text-sm font-bold text-gray-900">
                        {NAV_ITEMS.find((n) => n.key === activeTab)?.label}
                    </span>
                </div>

                {/* Page content */}
                <div className="p-4 md:p-8 mx-auto">
                    <div className="hidden lg:block mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {NAV_ITEMS.find((n) => n.key === activeTab)?.label}
                        </h1>
                    </div>
                    {renderContent()}
                </div>
            </main>

            {/* Edit profile modal */}
            <EditProfileModal
                open={editOpen}
                user={user}
                onClose={() => setEditOpen(false)}
                onSuccess={() => fetchUser?.()}
            />
        </div>
    );
};

export default ProfilePage;
