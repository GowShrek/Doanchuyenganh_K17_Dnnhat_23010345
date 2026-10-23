import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Tooltip, Popconfirm, message, Empty, Select, Image } from 'antd';
import { Search, Plus, Pencil, Trash2, BookOpen, Eye, EyeOff, QrCode } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { requestGetBooks, requestDeleteBook, requestToggleBookActive } from '../../config/bookRequest';
import { requestGetCategories } from '../../config/categoryRequest';
import BookQRCode from '../../components/BookQRCode';

const LANGUAGES = ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Nhật', 'Tiếng Pháp', 'Tiếng Trung', 'Khác'];

const BooksPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [categoryId, setCategoryId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [qrBook, setQrBook] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await requestGetBooks({ search, page, limit: 10, categoryId: categoryId || undefined });
            setData(res.metadata?.books || []);
            setTotal(res.metadata?.total || 0);
        } catch { message.error('Không thể tải danh sách sách'); }
        finally { setLoading(false); }
    }, [search, page, categoryId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        requestGetCategories({ limit: 100 }).then(r => setCategories(r.metadata?.categories || [])).catch(() => {});
    }, []);

    const handleToggle = async (id) => {
        try { await requestToggleBookActive(id); message.success('Đã cập nhật'); fetchData(); }
        catch { message.error('Có lỗi'); }
    };

    const handleDelete = async (id) => {
        try { await requestDeleteBook(id); message.success('Đã xóa sách'); fetchData(); }
        catch (err) { message.error(err?.response?.data?.message || 'Không thể xóa'); }
    };

    const columns = [
        { title: 'STT', width: 55, render: (_, __, idx) => <span className="text-gray-400 text-sm">{(page - 1) * 10 + idx + 1}</span> },
        {
            title: 'Sách', dataIndex: 'title', width: 300,
            render: (title, row) => (
                <div className="flex items-center gap-3">
                    {(() => {
                        const img = Array.isArray(row.coverImage) ? row.coverImage[0] : row.coverImage;
                        return img
                            ? <Image src={img} alt={title} width={40} height={56} className="rounded object-cover shrink-0" preview={false}
                                fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA1NiI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjU2IiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+" />
                            : <div className="w-10 h-14 rounded bg-red-50 flex items-center justify-center shrink-0">
                                <BookOpen size={18} style={{ color: '#a30014' }} />
                            </div>;
                    })()}
                    <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug">{title}</p>
                        {row.isbn && <p className="text-xs text-gray-400 mt-0.5">ISBN: {row.isbn}</p>}
                        {row.authors?.length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                {row.authors.map(a => a.fullName).join(', ')}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Phân loại',
            render: (_, row) => (
                <div className="space-y-1">
                    {row.category && <Tag color="blue" className="text-xs">{row.category.name}</Tag>}
                    <div className="flex flex-wrap gap-1">
                        {row.genres?.map(g => (
                            <span key={g.id} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{ backgroundColor: (g.color || '#a30014') + '20', color: g.color || '#a30014' }}>
                                {g.name}
                            </span>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            title: 'NXB / Năm',
            render: (_, row) => (
                <div className="text-xs space-y-0.5">
                    {row.publisher && <p className="text-gray-700 font-medium">{row.publisher.name}</p>}
                    {row.publishYear && <p className="text-gray-400">{row.publishYear}</p>}
                </div>
            ),
        },
        {
            title: 'Số lượng',
            render: (_, row) => (
                <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-400">Tổng:</span>
                        <span className="font-bold text-gray-800">{row.totalQuantity}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-green-600">Kho: {row.availableQuantity}</span>
                        <span className="text-blue-500">Mượn: {row.borrowedQuantity}</span>
                        {row.lostQuantity > 0 && <span className="text-red-500">Mất: {row.lostQuantity}</span>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái', dataIndex: 'isActive', width: 110, align: 'center',
            render: (isActive, row) => (
                <Tooltip title={isActive ? 'Nhấn để ẩn' : 'Nhấn để hiện'}>
                    <button onClick={() => handleToggle(row.id)}>
                        {isActive
                            ? <Tag color="success" className="m-0 rounded-full px-3 font-medium cursor-pointer">Hiển thị</Tag>
                            : <Tag color="default" className="m-0 rounded-full px-3 font-medium cursor-pointer">Đã ẩn</Tag>}
                    </button>
                </Tooltip>
            ),
        },
        {
            title: 'Thao tác', width: 110, align: 'right',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip title="QR Code">
                        <button onClick={() => setQrBook(row)}
                            className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors border border-gray-200">
                            <QrCode size={14} />
                        </button>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <button onClick={() => {
                            const basePath = window.location.pathname.startsWith('/staff') ? '/staff' : '/admin';
                            navigate(`${basePath}/books/${row.id}/edit`);
                        }}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Pencil size={14} />
                        </button>
                    </Tooltip>
                    <Popconfirm title="X\u00f3a s\u00e1ch n\u00e0y?" description="H\u00e0nh \u0111\u1ed9ng n\u00e0y kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c."
                        onConfirm={() => handleDelete(row.id)} okText="X\u00f3a" cancelText="H\u1ee7y" okButtonProps={{ danger: true }}>
                        <Tooltip title="X\u00f3a">
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
        <AdminLayout title="Quản lý sách" subtitle="Thêm, sửa, xóa và quản lý kho sách thư viện">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Tên sách, ISBN..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all shadow-sm" />
                </div>
                <Select allowClear placeholder="Lọc theo danh mục" style={{ width: 200 }}
                    onChange={(val) => { setCategoryId(val); setPage(1); }}
                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                    className="rounded-xl" size="large" />
                <button 
                    onClick={() => {
                        const basePath = window.location.pathname.startsWith('/staff') ? '/staff' : '/admin';
                        navigate(`${basePath}/books/new`);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm whitespace-nowrap transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#a30014', color: '#ffffff' }}>
                    <Plus size={16} /> Thêm sách mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                    { label: 'Tổng đầu sách', value: total, color: 'text-gray-900' },
                    { label: 'Đang hiển thị', value: data.filter(d => d.isActive).length, color: 'text-green-700' },
                    { label: 'Tổng kho', value: data.reduce((s, d) => s + (d.availableQuantity || 0), 0), color: 'text-blue-700' },
                    { label: 'Đang mượn', value: data.reduce((s, d) => s + (d.borrowedQuantity || 0), 0), color: 'text-orange-600' },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
                    locale={{ emptyText: <Empty description="Chưa có sách nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    pagination={{ current: page, total, pageSize: 10, onChange: (p) => setPage(p), showTotal: (t) => `Tổng ${t} đầu sách`, showSizeChanger: false }}
                />
            </div>

            <BookQRCode
                open={!!qrBook}
                onClose={() => setQrBook(null)}
                book={qrBook}
            />
        </AdminLayout>
    );
};

export default BooksPage;
