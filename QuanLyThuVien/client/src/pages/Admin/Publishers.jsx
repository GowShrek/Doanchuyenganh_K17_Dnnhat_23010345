import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Modal, Form, Tag, Tooltip, Popconfirm, message, Empty } from 'antd';
import { Search, Plus, Pencil, Trash2, Building2, Globe, Phone, Mail, MapPin } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    requestGetPublishers,
    requestCreatePublisher,
    requestUpdatePublisher,
    requestDeletePublisher,
    requestTogglePublisherActive,
} from '../../config/publisherRequest';

// ─── Modal Thêm / Sửa ────────────────────────────────────────────────────────
const PublisherModal = ({ open, onClose, editData, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isEdit = !!editData;

    useEffect(() => {
        if (open) {
            isEdit ? form.setFieldsValue({
                name: editData.name,
                address: editData.address || '',
                phone: editData.phone || '',
                email: editData.email || '',
                website: editData.website || '',
                description: editData.description || '',
            }) : form.resetFields();
        }
    }, [open, editData]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            isEdit
                ? await requestUpdatePublisher(editData.id, values)
                : await requestCreatePublisher(values);
            message.success(isEdit ? 'Cập nhật thành công!' : 'Thêm nhà xuất bản thành công!');
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
                    <Building2 size={18} style={{ color: '#a30014' }} />
                    <span className="font-bold">{isEdit ? 'Chỉnh sửa nhà xuất bản' : 'Thêm nhà xuất bản mới'}</span>
                </div>
            }
            footer={null}
            width={600}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="mt-4">
                <Form.Item
                    name="name"
                    label={<span className="font-medium text-gray-700">Tên nhà xuất bản</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tên NXB' }]}
                >
                    <Input size="large" placeholder="VD: NXB Giáo Dục Việt Nam" className="rounded-lg" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="phone" label={<span className="font-medium text-gray-700">Số điện thoại</span>}>
                        <Input size="large" prefix={<Phone size={14} className="text-gray-400" />} placeholder="024 XXXX XXXX" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item name="email" label={<span className="font-medium text-gray-700">Email</span>}>
                        <Input size="large" prefix={<Mail size={14} className="text-gray-400" />} placeholder="contact@nxb.vn" className="rounded-lg" />
                    </Form.Item>
                </div>

                <Form.Item name="website" label={<span className="font-medium text-gray-700">Website</span>}>
                    <Input size="large" prefix={<Globe size={14} className="text-gray-400" />} placeholder="https://www.nxb.vn" className="rounded-lg" />
                </Form.Item>

                <Form.Item name="address" label={<span className="font-medium text-gray-700">Địa chỉ</span>}>
                    <Input size="large" prefix={<MapPin size={14} className="text-gray-400" />} placeholder="Số nhà, đường, quận, thành phố" className="rounded-lg" />
                </Form.Item>

                <Form.Item name="description" label={<span className="font-medium text-gray-700">Mô tả</span>}>
                    <Input.TextArea rows={3} placeholder="Mô tả về nhà xuất bản..." className="rounded-lg" />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-2">
                    <Button onClick={onClose} size="large" className="rounded-lg">Hủy</Button>
                    <Button
                        type="primary" htmlType="submit" loading={loading} size="large" className="rounded-lg font-semibold"
                        style={{ backgroundColor: '#a30014', borderColor: '#a30014' }}
                    >
                        {isEdit ? 'Lưu thay đổi' : 'Thêm NXB'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────
const InfoItem = ({ icon: Icon, label, value, link }) => (
    value ? (
        <div className="flex items-start gap-2">
            <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
                <span className="text-xs text-gray-400">{label}: </span>
                {link
                    ? <a href={value} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{value}</a>
                    : <span className="text-sm text-gray-700">{value}</span>
                }
            </div>
        </div>
    ) : null
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const PublishersPage = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetPublishers({ search, page, limit: 10 });
            setData(res.metadata?.publishers || []);
            setTotal(res.metadata?.total || 0);
        } catch {
            message.error('Không thể tải danh sách nhà xuất bản');
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggle = async (id) => {
        try { await requestTogglePublisherActive(id); message.success('Đã cập nhật'); fetchData(); }
        catch { message.error('Có lỗi xảy ra'); }
    };

    const handleDelete = async (id) => {
        try { await requestDeletePublisher(id); message.success('Đã xóa nhà xuất bản'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Không thể xóa'); }
    };

    const columns = [
        {
            title: 'STT', width: 55,
            render: (_, __, idx) => <span className="text-gray-400 text-sm">{(page - 1) * 10 + idx + 1}</span>,
        },
        {
            title: 'Nhà xuất bản', dataIndex: 'name',
            render: (name, row) => (
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-sm"
                            style={{ backgroundColor: '#a30014' }}>
                            {name[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-900">{name}</p>
                            {row.website && (
                                <a href={row.website} target="_blank" rel="noreferrer"
                                    className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    <Globe size={10} /> {row.website.replace('https://', '')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Liên hệ',
            render: (_, row) => (
                <div className="space-y-1">
                    {row.phone && <div className="flex items-center gap-1 text-xs text-gray-500"><Phone size={11} />{row.phone}</div>}
                    {row.email && <div className="flex items-center gap-1 text-xs text-gray-500"><Mail size={11} />{row.email}</div>}
                </div>
            ),
        },
        {
            title: 'Địa chỉ', dataIndex: 'address',
            render: (addr) => addr
                ? <span className="text-xs text-gray-500 flex items-start gap-1"><MapPin size={11} className="mt-0.5 shrink-0" />{addr}</span>
                : <span className="text-xs text-gray-300 italic">Chưa có</span>,
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
                            : <Tag color="default" className="m-0 rounded-full px-3 font-medium cursor-pointer">Đã ẩn</Tag>
                        }
                    </button>
                </Tooltip>
            ),
        },
        {
            title: 'Thao tác', width: 110, align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip title="Chỉnh sửa">
                        <button onClick={() => { setEditData(row); setModalOpen(true); }}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Pencil size={14} />
                        </button>
                    </Tooltip>
                    <Popconfirm title="Xóa nhà xuất bản này?" description="Hành động này không thể hoàn tác."
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

    return (
        <AdminLayout title="Quản lý nhà xuất bản" subtitle="Danh sách các nhà xuất bản trong hệ thống">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tìm kiếm nhà xuất bản..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm"
                    />
                </div>
                <button
                    onClick={() => { setEditData(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm whitespace-nowrap transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#a30014', color: '#ffffff' }}
                >
                    <Plus size={16} />
                    Thêm NXB
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                    { label: 'Tổng NXB', value: total },
                    { label: 'Đang hoạt động', value: data.filter(d => d.isActive).length },
                    { label: 'Tổng sách', value: data.reduce((s, d) => s + (d.bookCount || 0), 0) },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900">{s.value}</p>
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
                    locale={{ emptyText: <Empty description="Chưa có nhà xuất bản nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    pagination={{
                        current: page, total, pageSize: 10,
                        onChange: (p) => setPage(p),
                        showTotal: (t) => `Tổng ${t} nhà xuất bản`,
                        showSizeChanger: false,
                    }}
                    expandable={{
                        expandedRowRender: (row) => (
                            <div className="py-2 px-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {row.description || <span className="italic text-gray-400">Chưa có mô tả.</span>}
                                </p>
                            </div>
                        ),
                        rowExpandable: (row) => !!row.description,
                    }}
                />
            </div>

            <PublisherModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editData={editData}
                onSuccess={fetchData}
            />
        </AdminLayout>
    );
};

export default PublishersPage;
