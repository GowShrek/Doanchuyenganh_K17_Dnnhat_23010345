import React, { useState, useEffect } from 'react';
import { Modal, message, Spin } from 'antd';
import { requestCreateArticle, requestUpdateArticle, requestGetArticleById } from '../../../config/articleRequest';
import { requestUploadImage } from '../../../config/uploadRequest';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ArticleForm = ({ isOpen, onClose, articleId }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        thumbnail: '',
        content: '',
        status: 'draft',
    });

    useEffect(() => {
        if (isOpen) {
            if (articleId) {
                fetchArticle(articleId);
            } else {
                setFormData({ title: '', thumbnail: '', content: '', status: 'draft' });
            }
        }
    }, [isOpen, articleId]);

    const fetchArticle = async (id) => {
        try {
            setLoading(true);
            const res = await requestGetArticleById(id);
            if (res.metadata) {
                setFormData({
                    title: res.metadata.title,
                    thumbnail: res.metadata.thumbnail || '',
                    content: res.metadata.content,
                    status: res.metadata.status,
                });
            }
        } catch (error) {
            message.error('Lỗi khi tải thông tin bài viết');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const res = await requestUploadImage(file);
            if (res.metadata && res.metadata.url) {
                setFormData({ ...formData, thumbnail: res.metadata.url });
                message.success('Tải ảnh lên thành công');
            }
        } catch (error) {
            message.error('Lỗi tải ảnh');
        } finally {
            setUploading(false);
            e.target.value = null; // reset input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            return message.error('Vui lòng nhập tiêu đề và nội dung');
        }

        try {
            setSubmitting(true);
            if (articleId) {
                await requestUpdateArticle(articleId, formData);
                message.success('Cập nhật thành công');
            } else {
                await requestCreateArticle(formData);
                message.success('Thêm bài viết thành công');
            }
            onClose(true); // pass true to trigger reload
        } catch (error) {
            message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <Modal
            title={articleId ? "Sửa bài viết" : "Thêm bài viết mới"}
            open={isOpen}
            onCancel={() => !submitting && onClose()}
            footer={null}
            width={800}
            destroyOnClose
            centered
        >
            {loading ? (
                <div className="flex justify-center p-10"><Spin /></div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Tiêu đề */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Nhập tiêu đề..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Ảnh đại diện */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh đại diện (Thumbnail)</label>
                            <div className="flex items-center gap-4">
                                {formData.thumbnail && (
                                    <img src={formData.thumbnail} alt="thumb" className="w-20 h-14 object-cover rounded shadow-sm" />
                                )}
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="draft">Bản nháp (Ẩn)</option>
                                <option value="published">Xuất bản (Hiển thị)</option>
                            </select>
                        </div>
                    </div>

                    {/* Nội dung (React Quill) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung bài viết <span className="text-red-500">*</span></label>
                        <div className="bg-white rounded-lg border border-gray-200">
                            <ReactQuill 
                                theme="snow" 
                                value={formData.content} 
                                onChange={(val) => setFormData({ ...formData, content: val })} 
                                modules={modules}
                                className="h-64 mb-12"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="px-5 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="px-6 py-2 font-semibold text-white rounded-xl transition-colors disabled:opacity-50"
                            style={{ backgroundColor: '#a30014' }}
                        >
                            {submitting ? 'Đang lưu...' : 'Lưu bài viết'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default ArticleForm;
