import React, { useState } from 'react';
import { Form, Input, Button, Divider, message, Spin } from 'antd';
import { Mail, Lock, Eye, EyeOff, Library, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { requestLogin } from '../../config/userRequest';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await requestLogin({ email: values.email, password: values.password });
            await fetchUser();
            message.success('Đăng nhập thành công!');
            
            const role = res.metadata?.user?.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'librarian') navigate('/staff');
            else navigate('/');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Đăng nhập thất bại';
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fdf2f3] via-white to-[#fdf2f3] flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#a30014] to-[#6b0009] flex-col justify-center items-center p-16 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/5" />
                <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute top-1/3 right-8 w-32 h-32 rounded-full bg-white/5" />

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Library size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Fahasa Digital
                    </h1>
                    <p className="text-red-200 text-lg leading-relaxed max-w-sm">
                        Thư viện số hiện đại – Kết nối tri thức không giới hạn cho sinh viên và giảng viên
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-6">
                        {[
                            { label: 'Đầu sách', value: '15K+' },
                            { label: 'Độc giả', value: '8.9K' },
                            { label: 'Lượt mượn', value: '2.1K' },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 rounded-xl p-4">
                                <p className="text-2xl font-bold text-white">{s.value}</p>
                                <p className="text-red-200 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <Library size={28} className="text-primary" />
                        <span className="text-xl font-bold text-primary">Fahasa Digital</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
                    <p className="text-gray-500 mb-8">Chào mừng bạn quay lại! Vui lòng nhập thông tin để tiếp tục.</p>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label={<span className="font-medium text-gray-700">Email</span>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input
                                prefix={<Mail size={16} className="text-gray-400 mr-1" />}
                                placeholder="email@example.com"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span className="font-medium text-gray-700">Mật khẩu</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                            <Input.Password
                                prefix={<Lock size={16} className="text-gray-400 mr-1" />}
                                placeholder="Nhập mật khẩu"
                                className="rounded-lg"
                                iconRender={(visible) =>
                                    visible ? <Eye size={16} /> : <EyeOff size={16} />
                                }
                            />
                        </Form.Item>

                        <div className="flex justify-end mb-4">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:text-red-700 font-medium"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            className="h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#a30014', borderColor: '#a30014' }}
                        >
                            {!loading && <span>Đăng nhập</span>}
                            {!loading && <ArrowRight size={18} />}
                        </Button>
                    </Form>

                    <p className="text-center mt-6 text-gray-500 text-sm">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:text-red-700">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
