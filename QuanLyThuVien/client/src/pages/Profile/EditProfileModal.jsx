import React, { useEffect, useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { Edit3, Loader2 } from 'lucide-react';
import { message } from 'antd';
import { requestUpdateUser } from '../../config/userRequest';

const EditProfileModal = ({ open, user, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && user) {
            form.setFieldsValue({
                fullName:   user.fullName,
                phone:      user.phone,
                department: user.department,
                className:  user.className,
            });
        }
    }, [open, user]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await requestUpdateUser(values);
            message.success('Cập nhật thành công');
            onSuccess();
            onClose();
        } catch (err) {
            if (err?.response) message.error(err?.response?.data?.message || 'Có lỗi xảy ra');
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
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <Edit3 size={16} style={{ color: '#a30014' }} />
                    </div>
                    <span className="font-bold text-gray-900">Chỉnh sửa hồ sơ</span>
                </div>
            }
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                    <Input size="large" placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại">
                    <Input size="large" placeholder="0901234567" />
                </Form.Item>
                <Form.Item name="department" label="Khoa / Chuyên ngành">
                    <Input size="large" placeholder="Công nghệ thông tin" />
                </Form.Item>
                <Form.Item name="className" label="Lớp">
                    <Input size="large" placeholder="CNTT2021A" />
                </Form.Item>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Hủy
                    </button>
                    <button onClick={handleSave} disabled={loading}
                        className="px-5 py-2 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                        style={{ backgroundColor: '#a30014' }}>
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Lưu thay đổi
                    </button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditProfileModal;
