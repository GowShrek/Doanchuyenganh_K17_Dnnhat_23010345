import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Spin, message, Divider } from 'antd';
import { Mail, Key, Sparkles, Settings } from 'lucide-react';
import { requestGetSystemConfigs, requestUpdateSystemConfigs } from '../../config/systemConfigRequest';
import AdminLayout from '../../layouts/AdminLayout';

const SystemConfig = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const res = await requestGetSystemConfigs();
            const data = res.metadata || [];
            const initialValues = data.reduce((acc, conf) => {
                acc[conf.key] = conf.value;
                return acc;
            }, {});
            form.setFieldsValue(initialValues);
        } catch (error) {
            message.error('Không thể tải cấu hình hệ thống');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values) => {
        setSaving(true);
        try {
            await requestUpdateSystemConfigs(values);
            message.success('Cập nhật cấu hình thành công!');
        } catch (error) {
            message.error('Lỗi khi cập nhật cấu hình');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Cấu hình hệ thống" subtitle="Quản lý biến môi trường và API Keys">
                <div className="p-8 text-center">
                    <Spin size="large" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Cấu hình hệ thống" subtitle="Quản lý các biến môi trường và cấu hình dịch vụ bên ngoài">
            <div className="mx-auto">
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    {/* ── Email & OAuth ── */}
                    <Card className="mb-6 shadow-sm border border-gray-100 rounded-xl">
                        <div
                            className="flex items-center gap-2 mb-4 text-primary font-semibold text-lg"
                            style={{ color: '#a30014' }}
                        >
                            <Mail size={20} /> Cấu hình Email (Gửi mã OTP)
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            Cấu hình Google OAuth2 để hệ thống tự động gửi email cấp lại mật khẩu.
                        </p>

                        <Form.Item
                            name="EMAIL_USER"
                            label="Email Gửi (Gmail)"
                            rules={[{ required: true, message: 'Vui lòng nhập Email' }]}
                        >
                            <Input placeholder="ví dụ: admin@gmail.com" />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="CLIENT_ID"
                                label="Google Client ID"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                            >
                                <Input placeholder="Nhập Client ID..." />
                            </Form.Item>
                            <Form.Item
                                name="CLIENT_SECRET"
                                label="Google Client Secret"
                                rules={[{ required: true, message: 'Bắt buộc' }]}
                            >
                                <Input.Password placeholder="Nhập Client Secret..." />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="REDIRECT_URI"
                            label="Redirect URI"
                            rules={[{ required: true, message: 'Bắt buộc' }]}
                        >
                            <Input placeholder="https://developers.google.com/oauthplayground" />
                        </Form.Item>

                        <Form.Item
                            name="REFRESH_TOKEN"
                            label="Refresh Token"
                            rules={[{ required: true, message: 'Bắt buộc' }]}
                        >
                            <Input.Password placeholder="Nhập Refresh Token..." />
                        </Form.Item>
                    </Card>

                    {/* ── AI Config ── */}
                    <Card className="mb-6 shadow-sm border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2 mb-4 text-purple-600 font-semibold text-lg">
                            <Sparkles size={20} /> Cấu hình AI Gợi Ý
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            Nhập API Key của Groq Cloud để trợ lý AI có thể hoạt động.
                        </p>

                        <Form.Item
                            name="GROQ_API_KEY"
                            label="Groq API Key"
                            rules={[{ required: true, message: 'Vui lòng nhập API Key' }]}
                        >
                            <Input.Password
                                placeholder="gsk_..."
                                prefix={<Key size={14} className="text-gray-400 mr-1" />}
                            />
                        </Form.Item>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button onClick={loadConfigs} disabled={saving}>
                            Hủy thay đổi
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                            style={{ backgroundColor: '#a30014' }}
                        >
                            Lưu cấu hình
                        </Button>
                    </div>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default SystemConfig;
