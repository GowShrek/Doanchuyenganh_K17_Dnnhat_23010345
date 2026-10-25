import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Tag, Tooltip, Popconfirm, message, Empty, Avatar,
    Modal, Input, Select, Drawer, Descriptions, Badge,
} from 'antd';
import { Search, CheckCircle, XCircle, RotateCcw, Eye, BookOpen, RefreshCw, Printer } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import BorrowSlipPrint from '../../components/admin/BorrowSlipPrint';
import { getAvatarSrc } from '../../utils/avatar';
import {
    requestGetBorrows, requestGetBorrowStats,
    requestApproveBorrow, requestRejectBorrow, requestReturnBook,
    requestApproveRenew, requestRejectRenew,
} from '../../config/borrowRequest';

const { TextArea } = Input;
const { Option } = Select;

// ── Trạng thái phiếu mượn ────────────────────────────────────────
const STATUS_CONFIG = {
    pending:  { label: 'Chờ duyệt',   color: 'orange' },
    approved: { label: 'Đang mượn',   color: 'blue'   },
    returned: { label: 'Đã trả',      color: 'green'  },
    rejected: { label: 'Từ chối',     color: 'default'},
    overdue:  { label: 'Quá hạn',     color: 'red'    },
    lost:     { label: 'Mất sách',    color: 'purple' },
};

const StatusTag = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'default' };
    return <Tag color={cfg.color} className="rounded-full font-medium text-xs px-2">{cfg.label}</Tag>;
};

// ── Modal xác nhận trả sách ──────────────────────────────────────
const ReturnModal = ({ open, borrow, onClose, onSuccess }) => {
    const [condition, setCondition] = useState('normal');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (open) { setCondition('normal'); setNote(''); } }, [open]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await requestReturnBook(borrow.id, { condition, note });
            message.success('Xác nhận trả sách thành công');
            onSuccess();
            onClose();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setLoading(false); }
    };

    return (
        <Modal open={open} onCancel={onClose} title={
            <div className="flex items-center gap-2 py-1">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <RotateCcw size={16} className="text-green-600" />
                </div>
                <span className="font-bold text-gray-900">Xác nhận trả sách</span>
            </div>
        } footer={null} destroyOnClose>
            {borrow && (
                <div className="mt-4 space-y-4">
                    <div className="p-3 rounded-xl bg-gray-50 text-sm">
                        <p className="font-semibold text-gray-800">{borrow.book?.title}</p>
                        <p className="text-gray-500 mt-0.5">Độc giả: {borrow.reader?.fullName}</p>
                        <p className="text-gray-500">Hạn trả: {borrow.dueDate}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tình trạng sách</label>
                        <Select value={condition} onChange={setCondition} size="large" className="w-full">
                            <Option value="normal">Bình thường</Option>
                            <Option value="damaged">Hư hỏng</Option>
                            <Option value="lost">Mất sách</Option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
                        <TextArea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Ghi chú thêm..." />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Hủy</button>
                        <button type="button" onClick={handleSubmit} disabled={loading}
                            className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                            style={{ backgroundColor: '#15803d' }}>
                            {loading ? 'Đang lưu...' : 'Xác nhận trả'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// ── Drawer chi tiết ──────────────────────────────────────────────
const BorrowDetailDrawer = ({ open, borrow, onClose }) => (
    <Drawer open={open} onClose={onClose} title="Chi tiết phiếu mượn" width={480}>
        {borrow && (
            <div className="space-y-5">
                {/* Sách */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                    {borrow.book?.coverImage?.[0]
                        ? <img src={borrow.book.coverImage[0]} alt="" className="w-14 h-20 object-cover rounded-lg shrink-0" />
                        : <div className="w-14 h-20 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <BookOpen size={20} style={{ color: '#a30014' }} />
                          </div>
                    }
                    <div>
                        <p className="font-bold text-gray-900 leading-snug">{borrow.book?.title}</p>
                        {borrow.book?.isbn && <p className="text-xs text-gray-400 mt-0.5">ISBN: {borrow.book.isbn}</p>}
                    </div>
                </div>

                <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 600, width: 140 }}>
                    <Descriptions.Item label="Mã phiếu">{borrow.borrowCode}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái"><StatusTag status={borrow.status} /></Descriptions.Item>
                    <Descriptions.Item label="Độc giả">{borrow.reader?.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Email">{borrow.reader?.email}</Descriptions.Item>
                    <Descriptions.Item label="MSSV">{borrow.reader?.studentId || '—'}</Descriptions.Item>
                    <Descriptions.Item label="SĐT">{borrow.reader?.phone || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày mượn">{borrow.borrowDate || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Hạn trả">{borrow.dueDate || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày trả">{borrow.returnDate || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">{borrow.note || '—'}</Descriptions.Item>
                </Descriptions>
            </div>
        )}
    </Drawer>
);

// ── Main Page ────────────────────────────────────────────────────
const BorrowsPage = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ pending: 0, approved: 0, overdue: 0, returnedToday: 0 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [detailBorrow, setDetailBorrow] = useState(null);
    const [returnBorrow, setReturnBorrow] = useState(null);
    const [printBorrow, setPrintBorrow] = useState(null);
    const printRef = React.useRef(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [res, statsRes] = await Promise.all([
                requestGetBorrows({ search: search || undefined, status: statusFilter || undefined, page, limit: 10 }),
                requestGetBorrowStats(),
            ]);
            setData(res.metadata?.borrows || []);
            setTotal(res.metadata?.total || 0);
            setStats(statsRes.metadata || {});
        } catch {
            message.error('Không thể tải dữ liệu');
        } finally { setLoading(false); }
    }, [search, statusFilter, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleApprove = async (id) => {
        try { await requestApproveBorrow(id); message.success('Đã duyệt phiếu mượn'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const handleReject = async (id) => {
        try { await requestRejectBorrow(id); message.success('Đã từ chối phiếu mượn'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const handlePrint = (borrow) => {
        setPrintBorrow(borrow);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleApproveRenew = async (id) => {
        try { await requestApproveRenew(id); message.success('Đã duyệt gia hạn'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const handleRejectRenew = async (id) => {
        try { await requestRejectRenew(id, { renewNote: 'Yêu cầu gia hạn bị từ chối' }); message.success('Đã từ chối gia hạn'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
    };

    const columns = [
        {
            title: 'STT', width: 55,
            render: (_, __, idx) => <span className="text-gray-400 text-sm">{(page - 1) * 10 + idx + 1}</span>,
        },
        {
            title: 'Mã phiếu', dataIndex: 'borrowCode', width: 150,
            render: (code) => <span className="font-mono text-xs font-semibold text-gray-700">{code}</span>,
        },
        {
            title: 'Độc giả', width: 200,
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Avatar size={32} src={getAvatarSrc(row.reader?.avatar)} style={{ backgroundColor: '#a30014', fontSize: 12, fontWeight: 700 }}>
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
            title: 'Sách', width: 220,
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    {row.book?.coverImage?.[0]
                        ? <img src={row.book.coverImage[0]} alt="" className="w-8 h-11 object-cover rounded shrink-0" />
                        : <div className="w-8 h-11 rounded bg-red-50 flex items-center justify-center shrink-0"><BookOpen size={14} style={{ color: '#a30014' }} /></div>
                    }
                    <p className="text-sm text-gray-800 line-clamp-2 leading-snug">{row.book?.title}</p>
                </div>
            ),
        },
        {
            title: 'Ngày mượn', width: 110,
            render: (_, row) => (
                <span className="text-xs text-gray-700">{row.borrowDate || '—'}</span>
            ),
        },
        {
            title: 'Hạn trả', width: 110,
            render: (_, row) => (
                <span className={`text-xs font-semibold ${row.status === 'overdue' ? 'text-red-600' : row.dueDate ? 'text-gray-800' : 'text-gray-400'}`}>
                    {row.dueDate || '—'}
                </span>
            ),
        },
        {
            title: 'Trạng thái', width: 150, align: 'center',
            render: (_, row) => (
                <div className="space-y-1">
                    <StatusTag status={row.status} />
                    {row.renewStatus === 'pending' && (
                        <div><Tag color="geekblue" className="rounded-full text-[10px] font-semibold">Chờ duyệt gia hạn</Tag></div>
                    )}
                </div>
            ),
        },
        {
            title: 'Thao tác', width: 160, align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1.5">
                    {/* In Phiếu */}
                    {['approved', 'overdue'].includes(row.status) && (
                        <Tooltip title="In phiếu mượn">
                            <button onClick={() => handlePrint(row)}
                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                <Printer size={14} />
                            </button>
                        </Tooltip>
                    )}
                    {/* Xem chi tiết */}
                    <Tooltip title="Xem chi tiết">
                        <button onClick={() => setDetailBorrow(row)}
                            className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <Eye size={14} />
                        </button>
                    </Tooltip>
                    {/* Duyệt */}
                    {row.status === 'pending' && (
                        <Popconfirm title="Duyệt phiếu này?" onConfirm={() => handleApprove(row.id)} okText="Duyệt" cancelText="Hủy">
                            <Tooltip title="Duyệt mượn">
                                <button className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors">
                                    <CheckCircle size={14} />
                                </button>
                            </Tooltip>
                        </Popconfirm>
                    )}
                    {/* Từ chối */}
                    {row.status === 'pending' && (
                        <Popconfirm title="Từ chối phiếu này?" onConfirm={() => handleReject(row.id)} okText="Từ chối" cancelText="Hủy" okButtonProps={{ danger: true }}>
                            <Tooltip title="Từ chối">
                                <button className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                                    <XCircle size={14} />
                                </button>
                            </Tooltip>
                        </Popconfirm>
                    )}
                    {/* Xác nhận trả */}
                    {['approved', 'overdue'].includes(row.status) && (
                        <Tooltip title="Xác nhận trả">
                            <button onClick={() => setReturnBorrow(row)}
                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                                <RotateCcw size={14} />
                            </button>
                        </Tooltip>
                    )}
                    {/* Duyệt gia hạn */}
                    {row.renewStatus === 'pending' && (
                        <Popconfirm title="Duyệt yêu cầu gia hạn?" onConfirm={() => handleApproveRenew(row.id)} okText="Duyệt" cancelText="Hủy">
                            <Tooltip title={`Duyệt gia hạn → ${row.renewDueDate}`}>
                                <button className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                    <RefreshCw size={14} />
                                </button>
                            </Tooltip>
                        </Popconfirm>
                    )}
                    {/* Từ chối gia hạn */}
                    {row.renewStatus === 'pending' && (
                        <Popconfirm title="Từ chối gia hạn?" onConfirm={() => handleRejectRenew(row.id)} okText="Từ chối" cancelText="Hủy" okButtonProps={{ danger: true }}>
                            <Tooltip title="Từ chối gia hạn">
                                <button className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 flex items-center justify-center transition-colors">
                                    <XCircle size={14} />
                                </button>
                            </Tooltip>
                        </Popconfirm>
                    )}
                </div>
            ),
        },
    ];

    const STAT_CARDS = [
        { label: 'Chờ duyệt',  value: stats.pending,       color: 'text-orange-600', bg: 'bg-orange-50', status: 'pending'  },
        { label: 'Đang mượn',  value: stats.approved,      color: 'text-blue-700',   bg: 'bg-blue-50',   status: 'approved' },
        { label: 'Quá hạn',    value: stats.overdue,       color: 'text-red-600',    bg: 'bg-red-50',    status: 'overdue'  },
        { label: 'Trả hôm nay',value: stats.returnedToday, color: 'text-green-700',  bg: 'bg-green-50',  status: 'returned' },
    ];

    return (
        <AdminLayout title="Quản lý mượn trả" subtitle="Duyệt yêu cầu, xác nhận trả sách và theo dõi phiếu mượn">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {STAT_CARDS.map(s => (
                    <button key={s.label} onClick={() => { setStatusFilter(s.status); setPage(1); }}
                        className={`rounded-xl p-4 border text-left transition-all hover:shadow-md ${statusFilter === s.status ? 'border-gray-400 shadow-sm' : 'bg-white border-gray-100'}`}>
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tên độc giả, MSSV, email..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm" />
                </div>
                <Select value={statusFilter || undefined} onChange={(v) => { setStatusFilter(v || ''); setPage(1); }}
                    allowClear placeholder="Tất cả trạng thái" style={{ width: 180 }} size="large">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <Option key={k} value={k}>{v.label}</Option>
                    ))}
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
                    locale={{ emptyText: <Empty description="Chưa có phiếu mượn nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    pagination={{
                        current: page, total, pageSize: 10,
                        onChange: (p) => setPage(p),
                        showTotal: (t) => `Tổng ${t} phiếu mượn`,
                        showSizeChanger: false,
                    }}
                />
            </div>

            {/* Chi tiết drawer */}
            <BorrowDetailDrawer open={!!detailBorrow} borrow={detailBorrow} onClose={() => setDetailBorrow(null)} />

            {/* Modal trả sách */}
            <ReturnModal open={!!returnBorrow} borrow={returnBorrow}
                onClose={() => setReturnBorrow(null)} onSuccess={fetchData} />

            {/* Component ẩn dùng để in */}
            {printBorrow && <BorrowSlipPrint ref={printRef} borrow={printBorrow} />}
        </AdminLayout>
    );
};

export default BorrowsPage;
