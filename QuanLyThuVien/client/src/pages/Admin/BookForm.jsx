import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Select, Switch, message, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { requestCreateBook, requestUpdateBook, requestGetBookById } from '../../config/bookRequest';
import { requestGetCategories } from '../../config/categoryRequest';
import { requestGetGenres } from '../../config/genreRequest';
import { requestGetPublishers } from '../../config/publisherRequest';
import { requestGetAuthors } from '../../config/authorRequest';
import { requestUploadImages, requestDeleteImage } from '../../config/uploadRequest';

const { TextArea } = Input;
const LANGUAGES = [
    'Tiếng Việt',
    'Tiếng Anh',
    'Tiếng Nhật',
    'Tiếng Pháp',
    'Tiếng Trung',
    'Tiếng Đức',
    'Tiếng Nga',
    'Khác',
];

// ── Multi Image Uploader ─────────────────────────────────────────────────────
const MultiImageUploader = ({ value = [], onChange }) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const images = Array.isArray(value) ? value : (value ? [value] : []);

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE = 5 * 1024 * 1024;
    const MAX_COUNT = 10;

    const handleFiles = async (fileList) => {
        const files = Array.from(fileList);
        const remaining = MAX_COUNT - images.length;
        if (remaining <= 0) { message.warning(`Tối đa ${MAX_COUNT} ảnh`); return; }
        const toUpload = files.slice(0, remaining);

        // Validate
        for (const f of toUpload) {
            if (!ALLOWED.includes(f.type)) { message.error(`${f.name}: chỉ chấp nhận JPG/PNG/WEBP/GIF`); return; }
            if (f.size > MAX_SIZE) { message.error(`${f.name}: tối đa 5MB`); return; }
        }

        setUploading(true);
        try {
            const res = await requestUploadImages(toUpload);
            const newUrls = res.metadata.map(f => f.url);
            const updated = [...images, ...newUrls];
            onChange?.(updated);
            message.success(`Đã upload ${newUrls.length} ảnh`);
        } catch (err) {
            message.error(err?.response?.data?.message || 'Upload thất bại');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleRemove = (idx) => {
        const updated = images.filter((_, i) => i !== idx);
        onChange?.(updated);
    };

    const handleSetPrimary = (idx) => {
        if (idx === 0) return;
        const updated = [...images];
        const [item] = updated.splice(idx, 1);
        updated.unshift(item);
        onChange?.(updated);
        message.success('Đã đặt làm ảnh chính');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (!uploading) handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-3">
            {/* Grid ảnh đã upload */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                            style={{ aspectRatio: '2/3' }}>
                            <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                            {/* Badge ảnh chính */}
                            {idx === 0 && (
                                <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: '#a30014' }}>Chính</span>
                            )}
                            {/* Hover actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                                {idx !== 0 && (
                                    <button type="button" onClick={() => handleSetPrimary(idx)}
                                        className="text-[10px] px-2 py-1 rounded bg-white/90 text-gray-800 font-medium hover:bg-white transition-colors">
                                        Đặt làm chính
                                    </button>
                                )}
                                <button type="button" onClick={() => handleRemove(idx)}
                                    className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors">
                                    <X size={11} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Slot thêm */}
                    {images.length < MAX_COUNT && (
                        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-red-300 transition-colors"
                            style={{ aspectRatio: '2/3' }}
                            onClick={() => !uploading && inputRef.current?.click()}
                            onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                            {uploading
                                ? <Spin size="small" />
                                : <><Upload size={16} className="text-gray-300 mb-1" />
                                    <span className="text-[10px] text-gray-400">Thêm ảnh</span></>}
                        </div>
                    )}
                </div>
            )}

            {/* Khi chưa có ảnh nào */}
            {images.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-red-300 transition-colors"
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                    {uploading ? <Spin /> : (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                <ImageIcon size={24} className="text-gray-300" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-400">Kéo thả hoặc <span className="text-red-500 font-medium">nhấn để chọn</span></p>
                                <p className="text-[10px] text-gray-300 mt-0.5">Tối đa {MAX_COUNT} ảnh · JPG, PNG, WEBP · ≤5MB</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Nút chọn nhiều ảnh */}
            {images.length > 0 && images.length < MAX_COUNT && (
                <button type="button" onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                    <Upload size={14} />
                    {uploading ? 'Đang upload...' : `Chọn thêm ảnh (${images.length}/${MAX_COUNT})`}
                </button>
            )}

            <input ref={inputRef} type="file" multiple
                accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                onChange={e => handleFiles(e.target.files)} />
        </div>
    );
};

// ── Main Form ─────────────────────────────────────────────────────────────────
const BookForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEdit);
    const [coverImages, setCoverImages] = useState([]);

    const [categories, setCategories] = useState([]);
    const [genres, setGenres] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        Promise.all([
            requestGetCategories({ limit: 100 }).then((r) => setCategories(r.metadata?.categories || [])),
            requestGetGenres({ limit: 100 }).then((r) => setGenres(r.metadata?.genres || [])),
            requestGetPublishers({ limit: 100 }).then((r) => setPublishers(r.metadata?.publishers || [])),
            requestGetAuthors({ limit: 200 }).then((r) => setAuthors(r.metadata?.authors || [])),
        ]).catch(() => message.warning('Không thể tải một số dữ liệu'));
    }, []);

    useEffect(() => {
        if (isEdit) {
            setPageLoading(true);
            requestGetBookById(id)
                .then((res) => {
                    const book = res.metadata;
                    form.setFieldsValue({
                        title: book.title,
                        isbn: book.isbn || '',
                        description: book.description || '',
                        publishYear: book.publishYear,
                        language: book.language || 'Tiếng Việt',
                        pageCount: book.pageCount,
                        price: book.price,
                        totalQuantity: book.totalQuantity,
                        availableQuantity: book.availableQuantity,
                        borrowedQuantity: book.borrowedQuantity || 0,
                        lostQuantity: book.lostQuantity || 0,
                        categoryId: book.categoryId,
                        publisherId: book.publisherId,
                        authorIds: book.authors?.map((a) => a.id) || [],
                        genreIds: book.genres?.map((g) => g.id) || [],
                        isActive: book.isActive,
                    });
                    setCoverImages(Array.isArray(book.coverImage) ? book.coverImage : (book.coverImage ? [book.coverImage] : []));
                })
                .catch(() => {
                    message.error('Không tìm thấy sách');
                    navigate('/admin/books');
                })
                .finally(() => setPageLoading(false));
        } else {
            form.setFieldsValue({
                language: 'Tiếng Việt',
                totalQuantity: 1,
                availableQuantity: 1,
                borrowedQuantity: 0,
                lostQuantity: 0,
                isActive: true,
            });
        }
    }, [id]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values, coverImage: coverImages, authorIds: values.authorIds || [], genreIds: values.genreIds || [] };
            if (isEdit) {
                await requestUpdateBook(id, payload);
                message.success('Cập nhật sách thành công!');
            } else {
                await requestCreateBook(payload);
                message.success('Thêm sách thành công!');
            }
            navigate('/admin/books');
        } catch (err) {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleTotalChange = (val) => {
        const borrowed = form.getFieldValue('borrowedQuantity') || 0;
        const lost = form.getFieldValue('lostQuantity') || 0;
        form.setFieldValue('availableQuantity', Math.max(0, (val || 0) - borrowed - lost));
    };

    if (pageLoading)
        return (
            <AdminLayout title={isEdit ? 'Chỉnh sửa sách' : 'Thêm sách mới'}>
                <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                </div>
            </AdminLayout>
        );

    return (
        <AdminLayout
            title={isEdit ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
            subtitle={
                isEdit ? 'Cập nhật thông tin sách trong hệ thống' : 'Nhập thông tin để thêm sách mới vào thư viện'
            }
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── LEFT ── */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Thông tin cơ bản */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <BookOpen size={18} style={{ color: '#a30014' }} /> Thông tin cơ bản
                            </h3>

                            <Form.Item
                                name="title"
                                label={
                                    <span className="font-medium text-gray-700">
                                        Tên sách <span className="text-red-500">*</span>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]}
                            >
                                <Input size="large" placeholder="Nhập tên sách..." className="rounded-lg" />
                            </Form.Item>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="isbn" label={<span className="font-medium text-gray-700">ISBN</span>}>
                                    <Input size="large" placeholder="978-x-xxx-xxxxx-x" className="rounded-lg" />
                                </Form.Item>
                                <Form.Item
                                    name="language"
                                    label={<span className="font-medium text-gray-700">Ngôn ngữ</span>}
                                >
                                    <Select size="large" options={LANGUAGES.map((l) => ({ value: l, label: l }))} />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                    name="publishYear"
                                    label={<span className="font-medium text-gray-700">Năm xuất bản</span>}
                                >
                                    <InputNumber
                                        size="large"
                                        min={1000}
                                        style={{ width: '100%' }}
                                        max={new Date().getFullYear()}
                                        placeholder="2024"
                                        className="w-full"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="pageCount"
                                    label={<span className="font-medium text-gray-700">Số trang</span>}
                                >
                                    <InputNumber size="large" min={1} placeholder="300" style={{ width: '100%' }} className="w-full" />
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="description"
                                label={<span className="font-medium text-gray-700">Mô tả / Tóm tắt</span>}
                            >
                                <TextArea rows={5} placeholder="Tóm tắt nội dung sách..." className="rounded-lg" />
                            </Form.Item>
                        </div>

                        {/* Phân loại */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Phân loại</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                    name="categoryId"
                                    label={<span className="font-medium text-gray-700">Danh mục sách</span>}
                                >
                                    <Select
                                        size="large"
                                        allowClear
                                        placeholder="Chọn danh mục"
                                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="publisherId"
                                    label={<span className="font-medium text-gray-700">Nhà xuất bản</span>}
                                >
                                    <Select
                                        size="large"
                                        allowClear
                                        showSearch
                                        placeholder="Chọn NXB"
                                        filterOption={(input, opt) =>
                                            opt.label.toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={publishers.map((p) => ({ value: p.id, label: p.name }))}
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item
                                name="authorIds"
                                label={<span className="font-medium text-gray-700">Tác giả</span>}
                            >
                                <Select
                                    size="large"
                                    mode="multiple"
                                    allowClear
                                    showSearch
                                    placeholder="Chọn tác giả"
                                    filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
                                    options={authors.map((a) => ({
                                        value: a.id,
                                        label: a.penName ? `${a.fullName} (${a.penName})` : a.fullName,
                                    }))}
                                />
                            </Form.Item>
                            <Form.Item
                                name="genreIds"
                                label={<span className="font-medium text-gray-700">Thể loại</span>}
                            >
                                <Select
                                    size="large"
                                    mode="multiple"
                                    allowClear
                                    placeholder="Chọn thể loại"
                                    options={genres.map((g) => ({ value: g.id, label: g.name }))}
                                />
                            </Form.Item>
                        </div>

                        {/* Số lượng */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Quản lý số lượng</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    {
                                        name: 'totalQuantity',
                                        label: 'Tổng SL',
                                        hint: 'Tổng số quyển',
                                        onChange: handleTotalChange,
                                    },
                                    { name: 'availableQuantity', label: 'Còn kho', hint: 'Tự tính' },
                                    { name: 'borrowedQuantity', label: 'Đang mượn', hint: '' },
                                    { name: 'lostQuantity', label: 'Đã mất', hint: '' },
                                ].map((f) => (
                                    <Form.Item
                                        key={f.name}
                                        name={f.name}
                                        initialValue={0}
                                        label={<span className="text-xs font-medium text-gray-600">{f.label}</span>}
                                    >
                                        <InputNumber
                                            size="large"
                                            min={0}
                                            style={{ width: '100%' }}
                                            className="w-full rounded-lg"
                                            onChange={f.onChange}
                                            disabled={f.name === 'availableQuantity'}
                                        />
                                    </Form.Item>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                "Còn kho" = Tổng - Đang mượn - Đã mất (tự động)
                            </p>
                        </div>
                    </div>

                    {/* ── RIGHT ── */}
                    <div className="space-y-5">
                        {/* Ảnh bìa */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Ảnh bìa sách</h3>
                            <MultiImageUploader value={coverImages} onChange={setCoverImages} />
                        </div>

                        {/* Giá & Trạng thái */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Giá & Trạng thái</h3>
                            <Form.Item
                                name="price"
                                label={<span className="font-medium text-gray-700">Giá bìa (VNĐ)</span>}
                            >
                                <InputNumber
                                    size="large"
                                    min={0}
                                    step={1000}
                                    style={{ width: '100%' }}
                                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(v) => v.replace(/,/g, '')}
                                    placeholder="85,000"
                                    className="w-full rounded-lg"
                                />
                            </Form.Item>
                            <Form.Item
                                name="isActive"
                                label={<span className="font-medium text-gray-700">Hiển thị sách</span>}
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
                            </Form.Item>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{ backgroundColor: '#a30014' }}
                            >
                                <Save size={16} />
                                {loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm sách mới'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/books')}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft size={16} /> Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </Form>
        </AdminLayout>
    );
};

export default BookForm;
