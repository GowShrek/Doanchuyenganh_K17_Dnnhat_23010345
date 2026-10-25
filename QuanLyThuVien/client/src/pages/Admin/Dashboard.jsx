import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import AdminLayout from '../../layouts/AdminLayout';
import { requestGetDashboardStats } from '../../config/dashboardRequest';
import { requestApproveBorrow, requestRejectBorrow } from '../../config/borrowRequest';
import { getAvatarSrc } from '../../utils/avatar';
import { message, Spin } from 'antd';
import { BookOpen } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, iconBg, iconColor, trend, trendLabel, trendUp }) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between gap-3">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <h3 className={`text-2xl font-bold mt-1 ${trendUp === false && label === 'Quá hạn' ? 'text-red-600' : 'text-gray-900'}`}>
                    {value}
                </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
                <span className={`material-symbols-outlined ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1, 'opsz' 24" }}>
                    {icon}
                </span>
            </div>
        </div>
        {trend && (
            <div className="flex items-center gap-1 text-sm">
                <span className={`flex items-center font-semibold ${trendUp === false ? 'text-red-500' : 'text-green-600'}`}>
                    <span className="material-symbols-outlined text-[14px]">
                        {trendUp === false ? 'trending_up' : 'trending_up'}
                    </span>
                    {trend}
                </span>
                <span className="text-gray-400">{trendLabel}</span>
            </div>
        )}
    </div>
);

// ─── Borrow Request Row ───────────────────────────────────────────────────────
const RequestRow = ({ data, onApprove, onReject }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                {data.readerAvatar ? (
                    <img src={data.readerAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {data.readerName?.[0] || 'U'}
                    </div>
                )}
                <div>
                    <p className="font-semibold text-sm text-gray-900">{data.readerName}</p>
                    <p className="text-xs text-gray-500">{data.studentId}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">{data.bookTitle}</p>
            <p className="text-xs text-gray-500">{data.categoryName}</p>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">{data.date}</td>
        <td className="px-6 py-4 text-right">
            <div className="flex justify-end gap-2">
                <button onClick={() => onApprove(data.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors text-white" style={{ backgroundColor: '#a30014' }}>
                    Duyệt
                </button>
                <button onClick={() => onReject(data.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                    Từ chối
                </button>
            </div>
        </td>
    </tr>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        try {
            const res = await requestGetDashboardStats();
            setData(res.metadata);
        } catch (error) {
            message.error('Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try { await requestApproveBorrow(id); message.success('Đã duyệt phiếu mượn'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const handleReject = async (id) => {
        try { await requestRejectBorrow(id); message.success('Đã từ chối phiếu mượn'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    if (loading) return <AdminLayout title="Tổng quan"><div className="flex justify-center p-20"><Spin size="large" /></div></AdminLayout>;
    if (!data) return <AdminLayout title="Tổng quan">Không có dữ liệu</AdminLayout>;

    const STATS = [
        {
            label: 'Tổng sách', value: data.stats.totalBooks.toLocaleString(),
            icon: 'auto_stories', iconBg: 'bg-red-50', iconColor: 'text-primary',
            trend: `${data.stats.totalTitles} tựa sách`, trendLabel: 'hiện có', trendUp: true,
        },
        {
            label: 'Đang mượn', value: data.stats.activeBorrows.toLocaleString(),
            icon: 'collections_bookmark', iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
            trend: `${data.stats.totalBorrows} lượt`, trendLabel: 'mượn tổng cộng', trendUp: true,
        },
        {
            label: 'Quá hạn', value: data.stats.overdueBorrows.toLocaleString(),
            icon: 'warning', iconBg: 'bg-red-50', iconColor: 'text-red-600',
            trend: 'cần xử lý', trendLabel: '', trendUp: false,
        },
        {
            label: 'Tiền phạt (VNĐ)', value: data.stats.totalFines.toLocaleString(),
            icon: 'payments', iconBg: 'bg-gray-100', iconColor: 'text-gray-600',
            trend: 'đã thu', trendLabel: '', trendUp: true,
        },
    ];

    const barData = {
        labels: data.charts.borrowsByMonth.map(m => m.label),
        datasets: [
            { label: 'Lượt mượn', data: data.charts.borrowsByMonth.map(m => m.borrows), backgroundColor: '#a30014', borderRadius: 6, barThickness: 20 },
            { label: 'Lượt trả', data: data.charts.borrowsByMonth.map(m => m.returns), backgroundColor: '#d9e3f9', borderRadius: 6, barThickness: 20 },
        ],
    };

    const barOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 7, font: { family: 'Inter', size: 12 } } } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f0f0f0' }, border: { display: false } },
            x: { grid: { display: false }, border: { display: false } },
        },
    };

    const doughnutData = {
        labels: data.charts.booksByCategory.map(c => c.category),
        datasets: [
            {
                data: data.charts.booksByCategory.map(c => c.count),
                backgroundColor: ['#a30014', '#5e687b', '#ffb3ad', '#d9e3f9', '#ffa500', '#2e8b57'],
                borderWidth: 0, hoverOffset: 6,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { family: 'Inter', size: 12 } } } },
    };

    return (
        <AdminLayout title="Tổng quan" subtitle="Chào mừng trở lại! Đây là tình trạng thư viện hôm nay.">
            {/* Stats Row */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {STATS.map((s) => <StatCard key={s.label} {...s} />)}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Lượt mượn sách (6 tháng)</h3>
                    <div className="h-64"><Bar data={barData} options={barOptions} /></div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Cơ cấu thể loại</h3>
                    <div className="h-64"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
                </div>
            </section>

            {/* Top Tables Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-base font-bold text-gray-900">Top sách mượn nhiều</h3></div>
                    <div className="p-4 space-y-4">
                        {data.topBooks.map((book, idx) => (
                            <div key={book.id} className="flex items-center gap-3">
                                <div className="text-gray-400 font-bold w-4 text-center">{idx + 1}</div>
                                {book.coverImage ? (
                                    <img src={book.coverImage} alt="" className="w-10 h-14 object-cover rounded" />
                                ) : (
                                    <div className="w-10 h-14 bg-red-50 rounded flex items-center justify-center text-red-700"><BookOpen size={16}/></div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">{book.title}</p>
                                </div>
                                <div className="font-bold text-primary">{book.borrowCount} lượt</div>
                            </div>
                        ))}
                        {data.topBooks.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu</p>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-base font-bold text-gray-900">Top độc giả tích cực</h3></div>
                    <div className="p-4 space-y-4">
                        {data.topReaders.map((reader, idx) => (
                            <div key={reader.id} className="flex items-center gap-3">
                                <div className="text-gray-400 font-bold w-4 text-center">{idx + 1}</div>
                                {reader.avatar ? (
                                    <img src={getAvatarSrc(reader.avatar)} alt="" className="w-10 h-10 object-cover rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                        {reader.fullName?.[0]}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">{reader.fullName}</p>
                                    <p className="text-xs text-gray-500">{reader.email}</p>
                                </div>
                                <div className="font-bold text-blue-600">{reader.borrowCount} lượt</div>
                            </div>
                        ))}
                        {data.topReaders.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu</p>}
                    </div>
                </div>
            </section>

            {/* Recent Requests Table */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Yêu cầu mượn sách mới nhất</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Cần xử lý duyệt hoặc từ chối</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-3">Sinh viên</th>
                                <th className="px-6 py-3">Tựa sách</th>
                                <th className="px-6 py-3">Ngày yêu cầu</th>
                                <th className="px-6 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.recentRequests.map((r) => (
                                <RequestRow key={r.id} data={r} onApprove={handleApprove} onReject={handleReject} />
                            ))}
                            {data.recentRequests.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">Chưa có yêu cầu mượn nào chờ duyệt</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </AdminLayout>
    );
};

export default AdminDashboard;
