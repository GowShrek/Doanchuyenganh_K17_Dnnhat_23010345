import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Tag, Tooltip, Popconfirm, message, Empty, Avatar,
    Modal, Form, Input, Select, Badge, Spin, Timeline,
} from 'antd';
import { Search, Plus, Pencil, Trash2, Lock, Unlock, History, BookOpen, CheckCircle, XCircle, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
    requestGetAllUserWithFilter,
    requestCreateUserByAdmin,
    requestUpdateUserAdmin,
    requestDeleteUserAdmin,
    requestToggleUserActive,
} from '../../config/userRequest';
import { requestGetBorrows } from '../../config/borrowRequest';
import moment from 'moment';

const { Option } = Select;

const ROLE_LABELS = {
    reader: { label: 'Độc giả', color: 'blue' },
    librarian: { label: 'Thủ thư', color: 'purple' },
    admin: { label: 'Admin', color: 'red' },
};

// ── Avatar placeholder ───────────────────────────────────────────────
const UserAvatar = ({ user, size = 40 }) => {
    if (user.avatar) return <Avatar size={size} src={user.avatar} />;
    const initials = (user.fullName || 'U').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
    const colors = ['#a30014', '#1d4ed8', '#15803d', '#7e22ce', '#b45309'];
    const color = colors[(user.id || 0) % colors.length];
    return <Avatar size={size} style={{ backgroundColor: color, fontWeight: 700, fontSize: size / 2.5 }}>{initials}</Avatar>;
};

// ── Status config ────────────────────────────────────────────────────
const BORROW_STATUS = {
    pending:    { label: 'Chờ duyệt',   color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={13}/> },
    approved:   { label: 'Đang mượn',   color: 'bg-blue-100 text-blue-700',     icon: <BookOpen size={13}/> },
    returned:   { label: 'Đã trả',      color: 'bg-green-100 text-green-700',   icon: <CheckCircle size={13}/> },
    overdue:    { label: 'Quá hạn',     color: 'bg-red-100 text-red-700',       icon: <AlertTriangle size={13}/> },
    rejected:   { label: 'Từ chối',     color: 'bg-gray-100 text-gray-500',     icon: <XCircle size={13}/> },
    lost:       { label: 'Mất sách',    color: 'bg-red-200 text-red-800',       icon: <XCircle size={13}/> },
    damaged:    { label: 'Hư hỏng',     color: 'bg-orange-100 text-orange-700', icon: <AlertTriangle size={13}/> },
};

// ── Modal Lịch sử mượn ───────────────────────────────────────────────
const ReaderHistoryModal = ({ open, onClose, reader }) => {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (open && reader) fetchHistory(1);
    }, [open, reader]);

    const fetchHistory = async (p = 1) => {
        setLoading(true);
        try {
            const res = await requestGetBorrows({ userId: reader.id, page: p, limit: 8 });
            setBorrows(res.metadata?.borrows || []);
            setTotal(res.metadata?.total || 0);
            setPage(p);
        } catch {
            message.error('Không thể tải lịch sử mượn');
        } finally {
            setLoading(false);
        }
    };

    const historyColumns = [
        {
            title: 'Sách',
            render: (_, row) => {
                const img = Array.isArray(row.book?.coverImage) ? row.book?.coverImage[0] : row.book?.coverImage;
                return (
                    <div className="flex items-center gap-3">
                        {img
                            ? <img src={img} alt="" className="w-8 h-11 object-cover rounded shrink-0" />
                            : <div className="w-8 h-11 bg-red-50 rounded flex items-center justify-center shrink-0"><BookOpen size={14} className="text-red-400" /></div>
                        }
                        <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{row.book?.title}</p>
                            <p className="text-xs text-gray-400">{row.borrowCode}</p>
                        </div>
                    </div>
                );
            },
            width: 240,
        },
        {
            title: 'Ngày mượn',
            render: (_, row) => <span className="text-sm text-gray-600">{moment(row.borrowDate).format('DD/MM/YYYY')}</span>,
            width: 110,
        },
        {
            title: 'Hạn trả',
            render: (_, row) => (
                <span className={`text-sm ${moment().isAfter(row.dueDate) && row.status === 'approved' ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                    {moment(row.dueDate).format('DD/MM/YYYY')}
                </span>
            ),
            width: 110,
        },
        {
            title: 'Ngày trả',
            render: (_, row) => <span className="text-sm text-gray-500">{row.returnDate ? moment(row.returnDate).format('DD/MM/YYYY') : '—'}</span>,
            width: 110,
        },
        {
            title: 'Trạng thái',
            render: (_, row) => {
                const s = BORROW_STATUS[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-500', icon: null };
                return (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${s.color}`}>
                        {s.icon}{s.label}
                    </span>
                );
            },
            width: 110,
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={760}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                        <History size={18} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-base">Lịch sử mượn sách</p>
                        <p className="text-xs text-gray-400 font-normal">{reader?.fullName} — {reader?.studentId || reader?.email}</p>
                    </div>
                </div>
            }
        >
            {loading ? (
                <div className="py-12 flex justify-center"><Spin size="large" /></div>
            ) : borrows.length === 0 ? (
                <Empty description="Chưa có lịch sử mượn sách" className="py-10" />
            ) : (
                <Table
                    dataSource={borrows}
                    columns={historyColumns}
                    rowKey="id"
                    size="small"
                    pagination={{
                        current: page,
                        total,
                        pageSize: 8,
                        onChange: fetchHistory,
                        showTotal: (t) => `Tổng ${t} lượt mượn`,
                        size: 'small',
                    }}
                    scroll={{ x: 680 }}
                />
            )}
        </Modal>
    );
};

// ── Modal tạo / sửa ─────────────────────────────────────────────────
const UserModal = ({ open, onClose, onSuccess, editUser }) => {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEdit = !!editUser;

    useEffect(() => {
        if (open) {
            if (isEdit) {
                form.setFieldsValue({
                    fullName: editUser.fullName,
                    email: editUser.email,
                    phone: editUser.phone || '',
                    studentId: editUser.studentId || '',
                    department: editUser.department || '',
                    className: editUser.className || '',
                    role: editUser.role,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ role: 'reader' });
            }
        }
    }, [open, editUser]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (isEdit) {
                await requestUpdateUserAdmin(editUser.id, values);
                message.success('Cập nhật tài khoản thành công');
            } else {
                await requestCreateUserByAdmin(values);
                message.success('Tạo tài khoản thành công');
            }
            onSuccess();
            onClose();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <div className="flex items-center gap-2 py-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fef2f2' }}>
                        <UserCheck size={16} style={{ color: '#a30014' }} />
                    </div>
                    <span className="font-bold text-gray-900">{isEdit ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</span>
                </div>
            }
            footer={null}
            width={560}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="mt-4">
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item name="fullName" label={<span className="font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></span>}
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]} className="col-span-2">
                        <Input size="large" placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item name="email" label={<span className="font-medium text-gray-700">Email <span className="text-red-500">*</span></span>}
                        rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input size="large" placeholder="example@email.com" disabled={isEdit} />
                    </Form.Item>

                    {!isEdit && (
                        <Form.Item name="password" label={<span className="font-medium text-gray-700">Mật khẩu <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, min: 6, message: 'Ít nhất 6 ký tự' }]}>
                            <Input.Password size="large" placeholder="Tối thiểu 6 ký tự" />
                        </Form.Item>
                    )}

                    {user?.role === 'admin' ? (
                        <Form.Item name="role" label={<span className="font-medium text-gray-700">Vai trò</span>}
                            className={isEdit ? '' : 'col-span-1'}>
                            <Select size="large">
                                <Option value="reader">Độc giả</Option>
                                <Option value="librarian">Thủ thư</Option>
                                <Option value="admin">Admin</Option>
                            </Select>
                        </Form.Item>
                    ) : (
                        <Form.Item name="role" hidden>
                            <Input />
                        </Form.Item>
                    )}

                    <Form.Item name="phone" label={<span className="font-medium text-gray-700">Số điện thoại</span>}>
                        <Input size="large" placeholder="0912 345 678" />
                    </Form.Item>

                    <Form.Item name="studentId" label={<span className="font-medium text-gray-700">MSSV</span>}>
                        <Input size="large" placeholder="21IT123456" />
                    </Form.Item>

                    <Form.Item name="department" label={<span className="font-medium text-gray-700">Khoa</span>}>
                        <Input size="large" placeholder="Công nghệ thông tin" />
                    </Form.Item>

                    <Form.Item name="className" label={<span className="font-medium text-gray-700">Lớp</span>}>
                        <Input size="large" placeholder="CNTT21A" />
                    </Form.Item>
                </div>

                <div className="flex gap-3 justify-end mt-2">
                    <button type="button" onClick={onClose}
                        className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Hủy
                    </button>
                    <button type="submit" disabled={loading}
                        className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: '#a30014' }}>
                        {loading ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản')}
                    </button>
                </div>
            </Form>
        </Modal>
    );
};

// ── Main Page ────────────────────────────────────────────────────────
const ReadersPage = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('reader');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [historyUser, setHistoryUser] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetAllUserWithFilter({
                search: search || undefined,
                role: roleFilter || undefined,
                page,
                limit: 10,
            });
            setData(res.metadata?.users || []);
            setTotal(res.metadata?.total || 0);
        } catch {
            message.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggleActive = async (user) => {
        try {
            await requestToggleUserActive(user.id, !user.isActive);
            message.success(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
            fetchData();
        } catch { message.error('Có lỗi xảy ra'); }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteUserAdmin(id);
            message.success('Đã xóa tài khoản');
            fetchData();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể xóa');
        }
    };

    const handleEdit = (user) => {
        setEditUser(user);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setEditUser(null);
        setModalOpen(true);
    };

    const columns = [
        {
            title: 'STT', width: 55,
            render: (_, __, idx) => <span className="text-gray-400 text-sm">{(page - 1) * 10 + idx + 1}</span>,
        },
        {
            title: 'Người dùng', width: 280,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <UserAvatar user={row} />
                    <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 leading-snug">{row.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{row.email}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Vai trò', width: 110,
            render: (_, row) => {
                const r = ROLE_LABELS[row.role] || { label: row.role, color: 'default' };
                return <Tag color={r.color} className="rounded-full font-medium text-xs px-2">{r.label}</Tag>;
            },
        },
        {
            title: 'Thông tin', width: 200,
            render: (_, row) => (
                <div className="text-xs space-y-0.5 text-gray-500">
                    {row.studentId && <p>MSSV: <span className="font-medium text-gray-700">{row.studentId}</span></p>}
                    {row.department && <p>Khoa: {row.department}</p>}
                    {row.className && <p>Lớp: {row.className}</p>}
                    {row.phone && <p>SĐT: {row.phone}</p>}
                </div>
            ),
        },
        {
            title: 'Đăng nhập', width: 110,
            render: (_, row) => (
                <Tag color={row.typeLogin === 'google' ? 'orange' : 'default'} className="text-xs">
                    {row.typeLogin === 'google' ? 'Google' : 'Email'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái', width: 120, align: 'center',
            render: (_, row) => (
                <Tooltip title={row.isActive ? 'Nhấn để khóa' : 'Nhấn để mở khóa'}>
                    <button onClick={() => handleToggleActive(row)}>
                        {row.isActive
                            ? <Badge status="success" text={<span className="text-xs font-medium text-green-700">Hoạt động</span>} />
                            : <Badge status="error" text={<span className="text-xs font-medium text-red-600">Bị khóa</span>} />
                        }
                    </button>
                </Tooltip>
            ),
        },
        {
            title: 'Ngày tạo', width: 110,
            render: (_, row) => (
                <span className="text-xs text-gray-400">
                    {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                </span>
            ),
        },
        {
            title: 'Thao tác', width: 155, align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Tooltip title="Lịch sử mượn">
                        <button onClick={() => setHistoryUser(row)}
                            className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-colors">
                            <History size={14} />
                        </button>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <button onClick={() => handleEdit(row)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Pencil size={14} />
                        </button>
                    </Tooltip>
                    <Tooltip title={row.isActive ? 'Khóa tài khoản' : 'Mở khóa'}>
                        <button onClick={() => handleToggleActive(row)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                row.isActive
                                    ? 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}>
                            {row.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                    </Tooltip>
                    {user?.role === 'admin' && (
                        <Popconfirm
                            title="Xóa tài khoản này?"
                            description="Hành động này không thể hoàn tác."
                            onConfirm={() => handleDelete(row.id)}
                            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                            <Tooltip title="Xóa">
                                <button className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </Tooltip>
                        </Popconfirm>
                    )}
                </div>
            ),
        },
    ];

    // Stats
    const activeCount = data.filter(d => d.isActive).length;
    const lockedCount = data.filter(d => !d.isActive).length;

    return (
        <AdminLayout title="Quản lý người dùng" subtitle="Danh sách tài khoản độc giả, thủ thư và admin">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tên, email, MSSV..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm"
                    />
                </div>
                {user?.role === 'admin' && (
                    <Select
                        value={roleFilter}
                        onChange={(val) => { setRoleFilter(val); setPage(1); }}
                        style={{ width: 160 }}
                        size="large"
                        allowClear
                        placeholder="Tất cả vai trò"
                    >
                        <Option value="reader">Độc giả</Option>
                        <Option value="librarian">Thủ thư</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                )}
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm whitespace-nowrap transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#a30014', color: '#ffffff' }}>
                    <Plus size={16} /> Thêm tài khoản
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Tổng tài khoản', value: total, color: 'text-gray-900' },
                    { label: 'Đang hoạt động', value: activeCount, color: 'text-green-700' },
                    { label: 'Bị khóa', value: lockedCount, color: 'text-red-600' },
                    { label: 'Trang hiện tại', value: data.length, color: 'text-blue-700' },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: <Empty description="Chưa có tài khoản nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    pagination={{
                        current: page,
                        total,
                        pageSize: 10,
                        onChange: (p) => setPage(p),
                        showTotal: (t) => `Tổng ${t} tài khoản`,
                        showSizeChanger: false,
                    }}
                />
            </div>

            {/* Modal tạo / sửa */}
            <UserModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditUser(null); }}
                onSuccess={fetchData}
                editUser={editUser}
            />

            {/* Modal lịch sử mượn */}
            <ReaderHistoryModal
                open={!!historyUser}
                onClose={() => setHistoryUser(null)}
                reader={historyUser}
            />
        </AdminLayout>
    );
};

export default ReadersPage;
