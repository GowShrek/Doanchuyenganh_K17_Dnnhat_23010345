import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, InputNumber, Tag, Tooltip, Popconfirm, message, Empty, Select, Spin } from 'antd';
import { Search, Plus, Pencil, Trash2, Globe, User, BookOpen, Library } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    requestGetAuthors, requestCreateAuthor, requestUpdateAuthor,
    requestDeleteAuthor, requestToggleAuthorActive,
} from '../../config/authorRequest';
import { requestGetBooksForStaff } from '../../config/bookRequest';

const NATIONALITIES = ['Việt Nam', 'Hoa Kỳ', 'Anh Quốc', 'Pháp', 'Nhật Bản', 'Hàn Quốc', 'Trung Quốc', 'Nga', 'Đức', 'Brazil', 'Khác'];

// Avatar chữ cái
const AuthorAvatar = ({ name, size = 10 }) => {
    const colors = ['#a30014', '#7c3aed', '#2563eb', '#059669', '#d97706', '#0891b2', '#db2777'];
    const idx = name?.charCodeAt(0) % colors.length || 0;
    return (
        <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}
            style={{ backgroundColor: colors[idx], width: size * 4, height: size * 4 }}>
            {name?.[0]?.toUpperCase() || '?'}
        </div>
    );
};

// ─── Modal Danh sách sách của tác giả ───────────────────────────────────────
const AuthorBooksModal = ({ open, onClose, author }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (open && author) fetchBooks(1);
    }, [open, author]);

    const fetchBooks = async (p = 1) => {
        setLoading(true);
        try {
            const res = await requestGetBooksForStaff({ authorId: author.id, page: p, limit: 8 });
            setBooks(res.metadata?.books || []);
            setTotal(res.metadata?.total || 0);
            setPage(p);
        } catch {
            message.error('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    };

    const bookColumns = [
        {
            title: 'Sách',
            render: (_, row) => {
                const img = Array.isArray(row.coverImage) ? row.coverImage[0] : row.coverImage;
                return (
                    <div className="flex items-center gap-3">
                        {img
                            ? <img src={img} alt="" className="w-8 h-11 object-cover rounded shrink-0" />
                            : <div className="w-8 h-11 bg-red-50 rounded flex items-center justify-center shrink-0"><BookOpen size={14} className="text-red-400"/></div>
                        }
                        <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{row.title}</p>
                            <p className="text-xs text-gray-400">ISBN: {row.isbn || '—'}</p>
                        </div>
                    </div>
                );
            },
            width: 250,
        },
        {
            title: 'Thể loại',
            render: (_, row) => row.genre?.name
                ? <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">{row.genre.name}</span>
                : <span className="text-gray-300 text-xs">—</span>,
            width: 130,
        },
        {
            title: 'Năm XB',
            dataIndex: 'publishedYear',
            render: (v) => <span className="text-sm text-gray-600">{v || '—'}</span>,
            width: 90,
        },
        {
            title: 'Trong kho',
            render: (_, row) => (
                <span className={`text-sm font-semibold ${row.availableQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.availableQuantity}/{row.totalQuantity}
                </span>
            ),
            width: 100,
        },
        {
            title: 'Trạng thái',
            render: (_, row) => row.isActive
                ? <Tag color="success" className="rounded-full">Công khai</Tag>
                : <Tag color="default" className="rounded-full">Đã ẩn</Tag>,
            width: 100,
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={780}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Library size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-base">Sách của tác giả</p>
                        <p className="text-xs text-gray-400 font-normal">
                            {author?.fullName}{author?.penName ? ` (${author.penName})` : ''}
                        </p>
                    </div>
                </div>
            }
        >
            {loading ? (
                <div className="py-12 flex justify-center"><Spin size="large" /></div>
            ) : books.length === 0 ? (
                <Empty description="Tác giả này chưa có đầu sách nào" className="py-10" />
            ) : (
                <Table
                    dataSource={books}
                    columns={bookColumns}
                    rowKey="id"
                    size="small"
                    pagination={{
                        current: page,
                        total,
                        pageSize: 8,
                        onChange: fetchBooks,
                        showTotal: (t) => `Tổng ${t} đầu sách`,
                        size: 'small',
                    }}
                    scroll={{ x: 670 }}
                />
            )}
        </Modal>
    );
};

// ─── Modal Thêm / Sửa ────────────────────────────────────────────────────────
const AuthorModal = ({ open, onClose, editData, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEdit = !!editData;

    useEffect(() => {
        if (open) {
            isEdit ? form.setFieldsValue({
                fullName: editData.fullName, penName: editData.penName || '',
                bio: editData.bio || '', birthYear: editData.birthYear || null,
                nationality: editData.nationality || 'Việt Nam',
                email: editData.email || '', website: editData.website || '',
            }) : form.resetFields();
        }
    }, [open, editData]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            isEdit ? await requestUpdateAuthor(editData.id, values) : await requestCreateAuthor(values);
            message.success(isEdit ? 'Cập nhật tác giả thành công!' : 'Thêm tác giả thành công!');
            onSuccess(); onClose();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally { setLoading(false); }
    };

    return (
        <Modal open={open} onCancel={onClose}
            title={<div className="flex items-center gap-2"><User size={18} style={{ color: '#a30014' }} /><span className="font-bold">{isEdit ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'}</span></div>}
            footer={null} width={580} destroyOnClose>
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="fullName" label={<span className="font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></span>}
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                        <Input size="large" placeholder="Nguyễn Văn A" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item name="penName" label={<span className="font-medium text-gray-700">Bút danh</span>}>
                        <Input size="large" placeholder="Bút danh (nếu có)" className="rounded-lg" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="birthYear" label={<span className="font-medium text-gray-700">Năm sinh</span>}>
                        <InputNumber size="large" min={1000} max={new Date().getFullYear()} placeholder="1900" className="w-full rounded-lg" />
                    </Form.Item>
                    <Form.Item name="nationality" label={<span className="font-medium text-gray-700">Quốc tịch</span>}>
                        <Select size="large" placeholder="Chọn quốc tịch" className="rounded-lg">
                            {NATIONALITIES.map(n => <Select.Option key={n} value={n}>{n}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="email" label={<span className="font-medium text-gray-700">Email</span>}>
                        <Input size="large" placeholder="author@email.com" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item name="website" label={<span className="font-medium text-gray-700">Website</span>}>
                        <Input size="large" prefix={<Globe size={14} className="text-gray-400" />} placeholder="https://..." className="rounded-lg" />
                    </Form.Item>
                </div>

                <Form.Item name="bio" label={<span className="font-medium text-gray-700">Tiểu sử</span>}>
                    <Input.TextArea rows={4} placeholder="Giới thiệu về tác giả..." className="rounded-lg" />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">Hủy</button>
                    <button type="submit" disabled={loading}
                        className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: '#a30014' }}>
                        {loading ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Thêm tác giả')}
                    </button>
                </div>
            </Form>
        </Modal>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AuthorsPage = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [booksAuthor, setBooksAuthor] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetAuthors({ search, page, limit: 10 });
            setData(res.metadata?.authors || []);
            setTotal(res.metadata?.total || 0);
        } catch { message.error('Không thể tải danh sách tác giả'); }
        finally { setLoading(false); }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggle = async (id) => {
        try { await requestToggleAuthorActive(id); message.success('Đã cập nhật'); fetchData(); }
        catch { message.error('Có lỗi'); }
    };

    const handleDelete = async (id) => {
        try { await requestDeleteAuthor(id); message.success('Đã xóa tác giả'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Không thể xóa'); }
    };

    const columns = [
        { title: 'STT', width: 55, render: (_, __, idx) => <span className="text-gray-400 text-sm">{(page - 1) * 10 + idx + 1}</span> },
        {
            title: 'Tác giả', dataIndex: 'fullName',
            render: (name, row) => (
                <div className="flex items-center gap-3">
                    <AuthorAvatar name={name} />
                    <div>
                        <p className="font-semibold text-sm text-gray-900">{name}</p>
                        {row.penName && <p className="text-xs text-gray-400">Bút danh: {row.penName}</p>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Thông tin',
            render: (_, row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        {row.birthYear && <span>{row.birthYear}</span>}
                        {row.nationality && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{row.nationality}</span>
                        )}
                    </div>
                    {row.website && (
                        <a href={row.website} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                            <Globe size={10} /> {row.website.replace('https://', '').replace('http://', '')}
                        </a>
                    )}
                </div>
            ),
        },
        {
            title: 'Tiểu sử',
            dataIndex: 'bio',
            render: (bio) => (
                <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                    {bio || <span className="italic text-gray-300">Chưa có tiểu sử</span>}
                </p>
            ),
        },
        {
            title: 'Số sách', dataIndex: 'bookCount', width: 90, align: 'center',
            render: (count) => (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">{count}</span>
            ),
        },
        {
            title: 'Trạng thái', dataIndex: 'isActive', width: 120, align: 'center',
            render: (isActive, row) => (
                <Tooltip title={isActive ? 'Nhấn để ẩn' : 'Nhấn để hiện'}>
                    <button onClick={() => handleToggle(row.id)}>
                        {isActive
                            ? <Tag color="success" className="m-0 rounded-full px-3 font-medium cursor-pointer">Hoạt động</Tag>
                            : <Tag color="default" className="m-0 rounded-full px-3 font-medium cursor-pointer">Đã ẩn</Tag>}
                    </button>
                </Tooltip>
            ),
        },
        {
            title: 'Thao tác', width: 135, align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip title="Xem danh sách sách">
                        <button onClick={() => setBooksAuthor(row)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <BookOpen size={14} />
                        </button>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <button onClick={() => { setEditData(row); setModalOpen(true); }}
                            className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <Pencil size={14} />
                        </button>
                    </Tooltip>
                    <Popconfirm title="Xóa tác giả này?" description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(row.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Tooltip title="Xóa">
                            <button className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    // Phân loại quốc tịch
    const nationalities = [...new Set(data.map(d => d.nationality).filter(Boolean))];

    return (
        <AdminLayout title="Quản lý tác giả" subtitle="Danh sách tác giả trong hệ thống thư viện">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm kiếm tác giả, bút danh..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm" />
                </div>
                <button onClick={() => { setEditData(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm whitespace-nowrap transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#a30014', color: '#ffffff' }}>
                    <Plus size={16} /> Thêm tác giả
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Tổng tác giả', value: total },
                    { label: 'Đang hoạt động', value: data.filter(d => d.isActive).length },
                    { label: 'Trong nước', value: data.filter(d => d.nationality === 'Việt Nam').length },
                    { label: 'Quốc tế', value: data.filter(d => d.nationality && d.nationality !== 'Việt Nam').length },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
                    locale={{ emptyText: <Empty description="Chưa có tác giả nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    pagination={{ current: page, total, pageSize: 10, onChange: (p) => setPage(p), showTotal: (t) => `Tổng ${t} tác giả`, showSizeChanger: false }}
                    expandable={{
                        expandedRowRender: (row) => (
                            <div className="px-4 py-3 bg-gray-50 rounded-lg mx-4 mb-3">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {row.bio || <span className="italic text-gray-400">Chưa có tiểu sử.</span>}
                                </p>
                            </div>
                        ),
                        rowExpandable: (row) => !!row.bio,
                    }}
                />
            </div>

            <AuthorModal open={modalOpen} onClose={() => setModalOpen(false)} editData={editData} onSuccess={fetchData} />

            <AuthorBooksModal
                open={!!booksAuthor}
                onClose={() => setBooksAuthor(null)}
                author={booksAuthor}
            />
        </AdminLayout>
    );
};

export default AuthorsPage;
