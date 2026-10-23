import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Modal, Form, Switch, Tag, Tooltip, Popconfirm, message, Empty } from 'antd';
import { Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, FolderOpen } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    requestGetCategories,
    requestCreateCategory,
    requestUpdateCategory,
    requestDeleteCategory,
    requestToggleCategoryActive,
} from '../../config/categoryRequest';

// ─── Modal Thêm / Sửa ──────────────────────────────────────────────────────
const CategoryModal = ({ open, onClose, editData, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEdit = !!editData;

    useEffect(() => {
        if (open) {
            if (isEdit) {
                form.setFieldsValue({
                    name: editData.name,
                    description: editData.description || '',
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editData]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (isEdit) {
                await requestUpdateCategory(editData.id, values);
                message.success('Cập nhật danh mục thành công!');
            } else {
                await requestCreateCategory(values);
                message.success('Thêm danh mục thành công!');
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
                    <FolderOpen size={18} className="text-primary" style={{ color: '#a30014' }} />
                    <span className="font-bold">{isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</span>
                </div>
            }
            footer={null}
            width={520}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                className="mt-4"
                size="large"
            >
                <Form.Item
                    name="name"
                    label={<span className="font-medium text-gray-700">Tên danh mục</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                >
                    <Input placeholder="VD: Giáo trình, Văn học, Kỹ năng..." className="rounded-lg" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={<span className="font-medium text-gray-700">Mô tả</span>}
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Mô tả ngắn về danh mục..."
                        className="rounded-lg"
                    />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={onClose} size="large" className="rounded-lg">
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        className="rounded-lg font-semibold"
                        style={{ backgroundColor: '#a30014', borderColor: '#a30014' }}
                    >
                        {isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
const CategoriesPage = () => {
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
            const res = await requestGetCategories({ search, page, limit: 10 });
            setData(res.metadata?.categories || []);
            setTotal(res.metadata?.total || 0);
        } catch {
            message.error('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggle = async (id) => {
        try {
            await requestToggleCategoryActive(id);
            message.success('Đã cập nhật trạng thái');
            fetchData();
        } catch {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteCategory(id);
            message.success('Đã xóa danh mục');
            fetchData();
        } catch (err) {
            message.error(err?.response?.data?.message || 'Không thể xóa');
        }
    };

    const openAdd = () => { setEditData(null); setModalOpen(true); };
    const openEdit = (row) => { setEditData(row); setModalOpen(true); };

    const columns = [
        {
            title: 'STT',
            width: 60,
            render: (_, __, idx) => <span className="text-gray-400 text-sm">{(page - 1) * 10 + idx + 1}</span>,
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            render: (name, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: '#a30014' }}>
                        {name[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{name}</p>
                        <p className="text-xs text-gray-400">{row.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            render: (desc) => (
                <span className="text-sm text-gray-500 line-clamp-2">
                    {desc || <span className="italic text-gray-300">Chưa có mô tả</span>}
                </span>
            ),
        },
        {
            title: 'Số sách',
            dataIndex: 'bookCount',
            width: 100,
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
                <Tooltip title={isActive ? 'Đang hiển thị – nhấn để ẩn' : 'Đang ẩn – nhấn để hiển thị'}>
                    <button
                        onClick={() => handleToggle(row.id)}
                        className="flex items-center justify-center"
                    >
                        {isActive
                            ? <Tag color="success" className="m-0 rounded-full px-3 font-medium">Hiển thị</Tag>
                            : <Tag color="default" className="m-0 rounded-full px-3 font-medium">Đã ẩn</Tag>
                        }
                    </button>
                </Tooltip>
            ),
        },
        {
            title: 'Thao tác',
            width: 120,
            align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip title="Chỉnh sửa">
                        <button
                            onClick={() => openEdit(row)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                        >
                            <Pencil size={14} />
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title="Xóa danh mục này?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(row.id)}
                        okText="Xóa"
                        cancelText="Hủy"
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
        <AdminLayout title="Quản lý danh mục sách" subtitle="Tổ chức sách theo danh mục rõ ràng">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
                    style={{ backgroundColor: '#a30014', color: '#ffffff' }}
                >
                    <Plus size={16} />
                    Thêm danh mục
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                {[
                    { label: 'Tổng danh mục', value: total, color: 'bg-red-50 text-red-700' },
                    { label: 'Đang hiển thị', value: data.filter(d => d.isActive).length, color: 'bg-green-50 text-green-700' },
                    { label: 'Đang ẩn', value: data.filter(d => !d.isActive).length, color: 'bg-gray-100 text-gray-600' },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color.split(' ')[1]}`}>{s.value}</p>
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
                    locale={{ emptyText: <Empty description="Chưa có danh mục nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    pagination={{
                        current: page,
                        total,
                        pageSize: 10,
                        onChange: (p) => setPage(p),
                        showTotal: (t) => `Tổng ${t} danh mục`,
                        showSizeChanger: false,
                    }}
                    rowClassName="hover:bg-gray-50 transition-colors"
                />
            </div>

            {/* Modal */}
            <CategoryModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editData={editData}
                onSuccess={fetchData}
            />
        </AdminLayout>
    );
};

export default CategoriesPage;
