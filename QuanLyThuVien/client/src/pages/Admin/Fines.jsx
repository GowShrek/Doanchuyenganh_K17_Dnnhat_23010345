import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Tooltip, Popconfirm, message, Empty, Avatar, Modal, Input, Select } from 'antd';
import { Search, CheckCircle, Gift, BookOpen } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { requestGetFines, requestGetFineStats, requestMarkFinePaid, requestWaiveFine } from '../../config/fineRequest';

const { TextArea } = Input;
const { Option } = Select;

const TYPE_CONFIG = {
    overdue:  { label: 'Quá hạn',   color: 'orange' },
    lost:     { label: 'Mất sách',  color: 'red'    },
    damaged:  { label: 'Hư hỏng',   color: 'purple' },
};

const STATUS_CONFIG = {
    unpaid: { label: 'Chưa nộp', color: 'red'     },
    paid:   { label: 'Đã nộp',   color: 'green'   },
    waived: { label: 'Được miễn',color: 'default' },
};

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

// ── Modal miễn phạt ──────────────────────────────────────────────
const WaiveModal = ({ open, fine, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (open) setReason(''); }, [open]);

    const handleSubmit = async () => {
        if (!reason.trim()) { message.warning('Vui lòng nhập lý do miễn phạt'); return; }
        setLoading(true);
        try {
            await requestWaiveFine(fine.id, reason);
            message.success('Đã miễn phạt');
            onSuccess(); onClose();
        } catch (err) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
        finally { setLoading(false); }
    };

    return (
        <Modal open={open} onCancel={onClose} title={
            <div className="flex items-center gap-2 py-1">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Gift size={16} className="text-purple-600" />
                </div>
                <span className="font-bold text-gray-900">Miễn phạt</span>
            </div>
        } footer={null} destroyOnClose>
            {fine && (
                <div className="mt-4 space-y-4">
                    <div className="p-3 rounded-xl bg-gray-50 text-sm">
                        <p className="font-semibold text-gray-800">{fine.reader?.fullName}</p>
                        <p className="text-gray-500">Loại: {TYPE_CONFIG[fine.type]?.label} — Số tiền: <span className="font-semibold text-red-600">{fmt(fine.amount)}</span></p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Lý do miễn phạt <span className="text-red-500">*</span></label>
                        <TextArea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Nhập lý do..." />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Hủy</button>
                        <button onClick={handleSubmit} disabled={loading}
                            className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 bg-purple-600">
                            {loading ? 'Đang lưu...' : 'Xác nhận miễn phạt'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// ── Main Page ────────────────────────────────────────────────────
const FinesPage = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({});
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [waiveFine, setWaiveFine] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [res, statsRes] = await Promise.all([
                requestGetFines({ search: search || undefined, status: statusFilter || undefined, type: typeFilter || undefined, page, limit: 10 }),
                requestGetFineStats(),
            ]);
            setData(res.metadata?.fines || []);
            setTotal(res.metadata?.total || 0);
            setStats(statsRes.metadata || {});
        } catch { message.error('Không thể tải dữ liệu'); }
        finally { setLoading(false); }
    }, [search, statusFilter, typeFilter, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handlePay = async (id) => {
        try { await requestMarkFinePaid(id); message.success('Đã xác nhận thu tiền phạt'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const columns = [
        {
            title: 'STT', width: 55,
            render: (_, __, idx) => <span className="text-gray-400 text-sm">{(page - 1) * 10 + idx + 1}</span>,
        },
        {
            title: 'Độc giả', width: 220,
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Avatar size={32} src={row.reader?.avatar} style={{ backgroundColor: '#a30014', fontSize: 12, fontWeight: 700 }}>
                        {!row.reader?.avatar && (row.reader?.fullName?.[0] || 'U')}
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{row.reader?.fullName}</p>
                        {row.reader?.studentId && <p className="text-xs text-gray-400">{row.reader.studentId}</p>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Sách', width: 200,
            render: (_, row) => {
                const book = row.borrow?.book;
                const img = Array.isArray(book?.coverImage) ? book.coverImage[0] : book?.coverImage;
                return (
                    <div className="flex items-center gap-2">
                        {img
                            ? <img src={img} alt="" className="w-8 h-11 object-cover rounded shrink-0" />
                            : <div className="w-8 h-11 rounded bg-red-50 flex items-center justify-center shrink-0"><BookOpen size={14} style={{ color: '#a30014' }} /></div>
                        }
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{book?.title || '—'}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{row.borrow?.borrowCode}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Loại phạt', width: 120,
            render: (_, row) => {
                const t = TYPE_CONFIG[row.type] || { label: row.type, color: 'default' };
                return <Tag color={t.color} className="rounded-full font-medium text-xs px-2">{t.label}</Tag>;
            },
        },
        {
            title: 'Số tiền', width: 130, align: 'right',
            render: (_, row) => (
                <span className="font-bold text-sm" style={{ color: row.status === 'unpaid' ? '#dc2626' : '#374151' }}>
                    {fmt(row.amount)}
                </span>
            ),
        },
        {
            title: 'Trạng thái', width: 120, align: 'center',
            render: (_, row) => {
                const s = STATUS_CONFIG[row.status] || { label: row.status, color: 'default' };
                return <Tag color={s.color} className="rounded-full font-medium text-xs px-2">{s.label}</Tag>;
            },
        },
        {
            title: 'Ngày tạo', width: 100,
            render: (_, row) => <span className="text-xs text-gray-400">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</span>,
        },
        {
            title: 'Thao tác', width: 120, align: 'right',
            render: (_, row) => row.status !== 'unpaid' ? null : (
                <div className="flex items-center justify-end gap-1.5">
                    <Popconfirm title="Xác nhận đã thu tiền?" onConfirm={() => handlePay(row.id)} okText="Xác nhận" cancelText="Hủy">
                        <Tooltip title="Thu tiền">
                            <button className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors">
                                <CheckCircle size={14} />
                            </button>
                        </Tooltip>
                    </Popconfirm>
                    <Tooltip title="Miễn phạt">
                        <button onClick={() => setWaiveFine(row)}
                            className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-colors">
                            <Gift size={14} />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const STAT_CARDS = [
        { label: 'Chưa nộp',   value: fmt(stats.unpaidAmount),  count: stats.unpaidCount,  color: 'text-red-600',    status: 'unpaid' },
        { label: 'Đã thu',     value: fmt(stats.paidAmount),    count: stats.paidCount,    color: 'text-green-700',  status: 'paid'   },
        { label: 'Được miễn',  value: fmt(stats.waivedAmount),  count: stats.waivedCount,  color: 'text-gray-500',   status: 'waived' },
        { label: 'Tổng phạt',  value: fmt(stats.totalAmount),   count: stats.totalCount,   color: 'text-gray-900',   status: ''       },
    ];

    return (
        <AdminLayout title="Quản lý tiền phạt" subtitle="Theo dõi và xử lý các khoản tiền phạt mượn sách">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {STAT_CARDS.map(s => (
                    <button key={s.label} onClick={() => { if (s.status) { setStatusFilter(s.status); setPage(1); } }}
                        className={`rounded-xl p-4 border text-left transition-all hover:shadow-md ${statusFilter === s.status && s.status ? 'border-gray-400 shadow-sm' : 'bg-white border-gray-100'}`}>
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.count || 0} phiếu</p>
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tên độc giả, MSSV..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm" />
                </div>
                <Select value={statusFilter || undefined} onChange={v => { setStatusFilter(v || ''); setPage(1); }}
                    allowClear placeholder="Tất cả trạng thái" style={{ width: 170 }} size="large">
                    <Option value="unpaid">Chưa nộp</Option>
                    <Option value="paid">Đã nộp</Option>
                    <Option value="waived">Được miễn</Option>
                </Select>
                <Select value={typeFilter || undefined} onChange={v => { setTypeFilter(v || ''); setPage(1); }}
                    allowClear placeholder="Loại phạt" style={{ width: 150 }} size="large">
                    <Option value="overdue">Quá hạn</Option>
                    <Option value="lost">Mất sách</Option>
                    <Option value="damaged">Hư hỏng</Option>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
                    locale={{ emptyText: <Empty description="Chưa có phiếu phạt nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    pagination={{
                        current: page, total, pageSize: 10,
                        onChange: p => setPage(p),
                        showTotal: t => `Tổng ${t} phiếu phạt`,
                        showSizeChanger: false,
                    }}
                />
            </div>

            <WaiveModal open={!!waiveFine} fine={waiveFine} onClose={() => setWaiveFine(null)} onSuccess={fetchData} />
        </AdminLayout>
    );
};

export default FinesPage;
