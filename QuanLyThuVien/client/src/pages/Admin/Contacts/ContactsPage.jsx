import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import { requestGetContacts, requestUpdateContactStatus, requestDeleteContact } from '../../../config/contactRequest';
import { message, Pagination, Popconfirm, Tag, Spin, Modal } from 'antd';
import { Mail, Trash2, CheckCircle, MailOpen } from 'lucide-react';

const ContactsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');

    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await requestGetContacts({ page, limit: 10, status: statusFilter });
            if (res.metadata) {
                setContacts(res.metadata.contacts);
                setTotal(res.metadata.total);
            }
        } catch (error) {
            message.error('Lỗi lấy danh sách liên hệ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [page, statusFilter]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await requestUpdateContactStatus(id, status);
            message.success('Cập nhật trạng thái thành công');
            fetchContacts();
            if (isModalOpen && selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status });
            }
        } catch (error) {
            message.error('Lỗi cập nhật trạng thái');
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteContact(id);
            message.success('Xóa tin nhắn thành công');
            if (contacts.length === 1 && page > 1) setPage(page - 1);
            else fetchContacts();
            setIsModalOpen(false);
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    const handleViewMessage = (contact) => {
        setSelectedMessage(contact);
        setIsModalOpen(true);
    };

    return (
        <AdminLayout title="Hộp thư / Liên hệ" subtitle="Quản lý các góp ý và tin nhắn từ độc giả.">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {/* Header Actions */}
                <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-auto"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="replied">Đã phản hồi</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                            <Spin />
                        </div>
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Người gửi</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {contacts.map((contact) => (
                                <tr key={contact.id} className={`hover:bg-gray-50/50 transition-colors ${contact.status === 'pending' ? 'bg-red-50/20' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{contact.name}</span>
                                            <span className="text-sm text-gray-500">{contact.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[300px]">{contact.subject}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {contact.status === 'replied' ? (
                                            <Tag color="green" className="m-0">Đã phản hồi</Tag>
                                        ) : (
                                            <Tag color="orange" className="m-0">Chờ xử lý</Tag>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewMessage(contact)}
                                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <MailOpen size={18} />
                                            </button>
                                            <Popconfirm
                                                title="Xóa tin nhắn"
                                                description="Bạn có chắc chắn muốn xóa thư liên hệ này không?"
                                                onConfirm={() => handleDelete(contact.id)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <button className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </Popconfirm>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && contacts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Mail size={48} className="text-gray-300" />
                                            <p>Hộp thư trống</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                        <Pagination
                            current={page}
                            total={total}
                            pageSize={10}
                            onChange={(p) => setPage(p)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>

            {/* Modal Xem chi tiết */}
            <Modal
                title="Chi tiết tin nhắn liên hệ"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
                centered
            >
                {selectedMessage && (
                    <div className="space-y-4 mt-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm mb-2">
                                <span className="font-semibold text-gray-500">Người gửi:</span>
                                <span className="font-bold text-gray-900">{selectedMessage.name}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm mb-2">
                                <span className="font-semibold text-gray-500">Email:</span>
                                <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">{selectedMessage.email}</a>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm mb-2">
                                <span className="font-semibold text-gray-500">Ngày gửi:</span>
                                <span className="text-gray-700">{new Date(selectedMessage.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                <span className="font-semibold text-gray-500">Tiêu đề:</span>
                                <span className="font-semibold text-gray-900">{selectedMessage.subject}</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 min-h-[150px]">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {selectedMessage.message}
                            </p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <div>
                                {selectedMessage.status === 'pending' ? (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <CheckCircle size={18} /> Đánh dấu đã phản hồi
                                    </button>
                                ) : (
                                    <Tag color="green" className="px-3 py-1.5 text-sm m-0">Đã phản hồi</Tag>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`}
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Trả lời qua Email
                                </a>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default ContactsPage;
