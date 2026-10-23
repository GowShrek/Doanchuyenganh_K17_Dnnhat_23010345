import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Modal, Form, Tag, Tooltip, Popconfirm, message, Empty, ColorPicker } from 'antd';
import { Search, Plus, Pencil, Trash2, Tag as TagIcon } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    requestGetGenres,
    requestCreateGenre,
    requestUpdateGenre,
    requestDeleteGenre,
    requestToggleGenreActive,
} from '../../config/genreRequest';

// ─── Modal Thêm / Sửa ────────────────────────────────────────────────────────
const GenreModal = ({ open, onClose, editData, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [color, setColor] = useState('#a30014');
    const isEdit = !!editData;

    useEffect(() => {
        if (open) {
            if (isEdit) {
                form.setFieldsValue({ name: editData.name, description: editData.description || '' });
                setColor(editData.color || '#a30014');
            } else {
                form.resetFields();
                setColor('#a30014');
            }
        }
    }, [open, editData]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values, color };
            if (isEdit) {
                await requestUpdateGenre(editData.id, payload);
                message.success('Cập nhật thể loại thành công!');
            } else {
                await requestCreateGenre(payload);
                message.success('Thêm thể loại thành công!');
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
                <div className="flex items-center gap-2">
                    <TagIcon size={18} style={{ color: '#a30014' }} />
                    <span className="font-bold">{isEdit ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}</span>
                </div>
            }
            footer={null}
            width={480}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="mt-4" size="large">
                <Form.Item
                    name="name"
                    label={<span className="font-medium text-gray-700">Tên thể loại</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tên thể loại' }]}
                >
                    <Input placeholder="VD: Tiểu thuyết, Trinh thám..." className="rounded-lg" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={<span className="font-medium text-gray-700">Mô tả</span>}
                >
                    <Input.TextArea rows={2} placeholder="Mô tả ngắn..." className="rounded-lg" />
                </Form.Item>

                {/* Color picker */}
                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Màu tag</label>
                    <div className="flex items-center gap-3 flex-wrap">
                        {['#a30014','#7c3aed','#2563eb','#db2777','#0891b2','#059669','#d97706','#374151','#b45309','#16a34a'].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className="w-7 h-7 rounded-full transition-all"
                                style={{
                                    backgroundColor: c,
                                    outline: color === c ? `3px solid ${c}` : 'none',
                                    outlineOffset: '2px',
                                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-500">Xem trước: </span>
                        <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: color + '20', color }}
                        >
                            {form.getFieldValue('name') || 'Tên thể loại'}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                    <Button onClick={onClose} size="large" className="rounded-lg">Hủy</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        className="rounded-lg font-semibold"
                        style={{ backgroundColor: '#a30014', borderColor: '#a30014' }}
                    >
                        {isEdit ? 'Lưu thay đổi' : 'Thêm thể loại'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const GenresPage = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetGenres({ search, page, limit: 12 });
            setData(res.metadata?.genres || []);
            setTotal(res.metadata?.total || 0);
        } catch {
            message.error('Không thể tải danh sách thể loại');
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggle = async (id) => {
        try {
            await requestToggleGenreActive(id);
            message.success('Đã cập nhật trạng thái');
            fetchData();
        } catch { message.error('Có lỗi xảy ra'); }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteGenre(id);
            message.success('Đã xóa thể loại');
            fetchData();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể xóa');
        }
    };

    const columns = [
        {
            title: 'STT',
            width: 55,
            render: (_, __, idx) => <span className="text-gray-400 text-sm">{(page - 1) * 12 + idx + 1}</span>,
        },
        {
            title: 'Thể loại',
            dataIndex: 'name',
            render: (name, row) => (
                <div className="flex items-center gap-3">
                    <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ backgroundColor: (row.color || '#a30014') + '20', color: row.color || '#a30014' }}
                    >
                        {name}
                    </span>
                    <span className="text-xs text-gray-400">{row.slug}</span>
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            render: (desc) => (
                <span className="text-sm text-gray-500">
                    {desc || <span className="italic text-gray-300">Chưa có mô tả</span>}
                </span>
            ),
        },
        {
            title: 'Số sách',
            dataIndex: 'bookCount',
            width: 90,
            align: 'center',
            render: (count) => (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                    {count}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            width: 120,
            align: 'center',
            render: (isActive, row) => (
                <Tooltip title={isActive ? 'Nhấn để ẩn' : 'Nhấn để hiện'}>
                    <button onClick={() => handleToggle(row.id)}>
                        {isActive
                            ? <Tag color="success" className="m-0 rounded-full px-3 font-medium cursor-pointer">Hiển thị</Tag>
                            : <Tag color="default" className="m-0 rounded-full px-3 font-medium cursor-pointer">Đã ẩn</Tag>
                        }
                    </button>
                </Tooltip>
            ),
        },
        {
            title: 'Thao tác',
            width: 110,
            align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip title="Chỉnh sửa">
                        <button
                            onClick={() => { setEditData(row); setModalOpen(true); }}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                        >
                            <Pencil size={14} />
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title="Xóa thể loại này?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(row.id)}
                        okText="Xóa" cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
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

    return (
        <AdminLayout title="Quản lý thể loại" subtitle="Phân loại sách theo thể loại nội dung">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm kiếm thể loại..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={() => { setEditData(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm whitespace-nowrap transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#a30014', color: '#ffffff' }}
                >
                    <Plus size={16} />
                    Thêm thể loại
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                    { label: 'Tổng thể loại', value: total },
                    { label: 'Đang hiển thị', value: data.filter(d => d.isActive).length },
                    { label: 'Đang ẩn', value: data.filter(d => !d.isActive).length },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Tag preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Xem trước tags</p>
                <div className="flex flex-wrap gap-2">
                    {data.filter(d => d.isActive).map((g) => (
                        <span
                            key={g.id}
                            className="text-xs font-semibold px-3 py-1 rounded-full"
                            style={{ backgroundColor: (g.color || '#a30014') + '20', color: g.color || '#a30014' }}
                        >
                            {g.name}
                        </span>
                    ))}
                    {data.filter(d => d.isActive).length === 0 && (
                        <span className="text-sm text-gray-400 italic">Chưa có thể loại nào</span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: <Empty description="Chưa có thể loại nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    pagination={{
                        current: page, total, pageSize: 12,
                        onChange: (p) => setPage(p),
                        showTotal: (t) => `Tổng ${t} thể loại`,
                        showSizeChanger: false,
                    }}
                />
            </div>

            <GenreModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editData={editData}
                onSuccess={fetchData}
            />
        </AdminLayout>
    );
};

export default GenresPage;
