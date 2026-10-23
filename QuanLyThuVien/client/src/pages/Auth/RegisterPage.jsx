import React, { useState } from 'react';
import { Form, Input, Button, message, Steps } from 'antd';
import {
    Mail, Lock, Eye, EyeOff, Library, User,
    Phone, GraduationCap, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { requestRegister } from '../../config/userRequest';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const onFinish = async (values) => {
        if (values.password !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        try {
            await requestRegister({
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                studentId: values.studentId,
                department: values.department,
                className: values.className,
                phone: values.phone,
            });
            await fetchUser();
            message.success('Đăng ký thành công! Chào mừng bạn đến với Fahasa Digital.');
            navigate('/');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Đăng ký thất bại';
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fdf2f3] via-white to-[#fdf2f3] flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#a30014] to-[#6b0009] flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute top-[-60px] left-[-60px] w-72 h-72 rounded-full bg-white/5" />
                <div className="absolute bottom-[-40px] right-[-40px] w-56 h-56 rounded-full bg-white/5" />

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Library size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Fahasa Digital</h1>
                    <p className="text-red-200 text-base leading-relaxed max-w-xs">
                        Đăng ký tài khoản độc giả để được mượn sách, đặt trước và nhận thông báo mới nhất.
                    </p>

                    <div className="mt-10 space-y-4">
                        {[
                            { icon: '📚', text: 'Mượn sách trực tuyến dễ dàng' },
                            { icon: '🔔', text: 'Nhận thông báo nhắc nhở hạn trả' },
                            { icon: '⭐', text: 'Đánh giá và gợi ý sách AI' },
                        ].map((item) => (
                            <div key={item.text} className="flex items-center gap-3 text-left">
                                <span className="text-2xl">{item.icon}</span>
                                <span className="text-red-100 text-sm">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-lg py-8">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-6 lg:hidden">
                        <Library size={24} className="text-primary" />
                        <span className="text-lg font-bold text-primary">Fahasa Digital</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Tạo tài khoản</h2>
                    <p className="text-gray-500 mb-8 text-sm">Điền thông tin của bạn để bắt đầu sử dụng thư viện số.</p>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                        size="large"
                    >
                        {/* Row 1: Họ tên + SĐT */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <Form.Item
                                name="fullName"
                                label={<span className="font-medium text-gray-700">Họ và tên</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input
                                    prefix={<User size={15} className="text-gray-400 mr-1" />}
                                    placeholder="Nguyễn Văn A"
                                    className="rounded-lg"
                                />
                            </Form.Item>
                            <Form.Item
                                name="phone"
                                label={<span className="font-medium text-gray-700">Số điện thoại</span>}
                            >
                                <Input
                                    prefix={<Phone size={15} className="text-gray-400 mr-1" />}
                                    placeholder="0901234567"
                                    className="rounded-lg"
                                />
                            </Form.Item>
                        </div>

                        {/* Row 2: MSSV + Khoa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <Form.Item
                                name="studentId"
                                label={<span className="font-medium text-gray-700">MSSV</span>}
                            >
                                <Input
                                    prefix={<GraduationCap size={15} className="text-gray-400 mr-1" />}
                                    placeholder="22110001"
                                    className="rounded-lg"
                                />
                            </Form.Item>
                            <Form.Item
                                name="department"
                                label={<span className="font-medium text-gray-700">Khoa</span>}
                            >
                                <Input
                                    placeholder="Công nghệ thông tin"
                                    className="rounded-lg"
                                />
                            </Form.Item>
                        </div>

                        {/* Email */}
                        <Form.Item
                            name="email"
                            label={<span className="font-medium text-gray-700">Email</span>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input
                                prefix={<Mail size={15} className="text-gray-400 mr-1" />}
                                placeholder="email@example.com"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        {/* Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            <Form.Item
                                name="password"
                                label={<span className="font-medium text-gray-700">Mật khẩu</span>}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<Lock size={15} className="text-gray-400 mr-1" />}
                                    placeholder="Mật khẩu"
                                    className="rounded-lg"
                                    iconRender={(visible) =>
                                        visible ? <Eye size={15} /> : <EyeOff size={15} />
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                label={<span className="font-medium text-gray-700">Xác nhận mật khẩu</span>}
                                rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
                            >
                                <Input.Password
                                    prefix={<Lock size={15} className="text-gray-400 mr-1" />}
                                    placeholder="Nhập lại"
                                    className="rounded-lg"
                                    iconRender={(visible) =>
                                        visible ? <Eye size={15} /> : <EyeOff size={15} />
                                    }
                                />
                            </Form.Item>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            className="h-12 rounded-lg text-base font-semibold"
                            style={{ backgroundColor: '#a30014', borderColor: '#a30014' }}
                        >
                            {!loading && 'Đăng ký tài khoản'}
                        </Button>
                    </Form>

                    <p className="text-center mt-6 text-gray-500 text-sm">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:text-red-700">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
