import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Card, Button, message, Spin, Row, Col } from 'antd';
import { Download, FileText, BookOpen, Users, RotateCcw, AlertTriangle, Receipt } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { requestGetBooks } from '../../config/bookRequest';
import { requestGetAllUserWithFilter } from '../../config/userRequest';
import { requestGetBorrows } from '../../config/borrowRequest';
import { requestGetFines } from '../../config/fineRequest';
import moment from 'moment';

const REPORTS = [
    {
        id: 'books',
        title: 'Danh sách Đầu sách',
        description: 'Báo cáo toàn bộ danh sách sách hiện có trong thư viện, bao gồm số lượng kho, trạng thái đang mượn và thông tin phân loại.',
        icon: <BookOpen size={32} className="text-blue-500" />,
        bg: 'bg-blue-50'
    },
    {
        id: 'readers',
        title: 'Danh sách Độc giả',
        description: 'Báo cáo danh sách người dùng (độc giả) đã đăng ký, thông tin liên hệ, MSSV và trạng thái hoạt động.',
        icon: <Users size={32} className="text-green-500" />,
        bg: 'bg-green-50'
    },
    {
        id: 'borrows',
        title: 'Danh sách Mượn trả',
        description: 'Báo cáo lịch sử các giao dịch mượn/trả sách, ngày mượn, hạn trả và tình trạng phiếu mượn.',
        icon: <RotateCcw size={32} className="text-orange-500" />,
        bg: 'bg-orange-50'
    },
    {
        id: 'overdue',
        title: 'Sách Quá hạn',
        description: 'Báo cáo các trường hợp mượn sách đã quá hạn trả nhưng chưa hoàn trả cho thư viện.',
        icon: <AlertTriangle size={32} className="text-red-500" />,
        bg: 'bg-red-50'
    },
    {
        id: 'fines',
        title: 'Doanh thu Tiền phạt',
        description: 'Báo cáo danh sách các khoản phạt đã thu (quá hạn, làm mất, làm hỏng sách) và tổng doanh thu.',
        icon: <Receipt size={32} className="text-purple-500" />,
        bg: 'bg-purple-50'
    }
];

const ReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [activeReport, setActiveReport] = useState(null);

    const handleExport = async (reportId, type) => {
        setLoading(true);
        setActiveReport(reportId);
        const hide = message.loading(`Đang tạo file ${type.toUpperCase()}...`, 0);
        
        try {
            let data = [];
            let columns = [];
            let title = '';
            let filename = '';

            // Fetch data based on report ID
            switch (reportId) {
                case 'books':
                    const booksRes = await requestGetBooks({ limit: 10000 });
                    data = booksRes.metadata?.books || [];
                    title = 'BÁO CÁO DANH SÁCH ĐẦU SÁCH';
                    filename = 'DanhSachSach';
                    columns = [
                        { title: 'Tên sách', dataIndex: 'title' },
                        { title: 'ISBN', dataIndex: 'isbn' },
                        { title: 'Tác giả', dataIndex: 'author', render: (val) => val?.penName || val?.fullName || '' },
                        { title: 'Thể loại', dataIndex: 'genre', render: (val) => val?.name || '' },
                        { title: 'Nhà xuất bản', dataIndex: 'publisher', render: (val) => val?.name || '' },
                        { title: 'Năm XB', dataIndex: 'publishedYear' },
                        { title: 'Tổng SL', dataIndex: 'totalQuantity' },
                        { title: 'Trong kho', dataIndex: 'availableQuantity' },
                        { title: 'Đang mượn', dataIndex: 'borrowedQuantity' }
                    ];
                    break;
                
                case 'readers':
                    const usersRes = await requestGetAllUserWithFilter({ limit: 10000, role: 'reader' });
                    data = usersRes.metadata?.users || [];
                    title = 'BÁO CÁO DANH SÁCH ĐỘC GIẢ';
                    filename = 'DanhSachDocGia';
                    columns = [
                        { title: 'Họ và Tên', dataIndex: 'fullName' },
                        { title: 'MSSV', dataIndex: 'studentId' },
                        { title: 'Email', dataIndex: 'email' },
                        { title: 'Số điện thoại', dataIndex: 'phone' },
                        { title: 'Khoa', dataIndex: 'department' },
                        { title: 'Lớp', dataIndex: 'class' },
                        { title: 'Trạng thái', dataIndex: 'isActive', render: (val) => val ? 'Hoạt động' : 'Đã khóa' }
                    ];
                    break;

                case 'borrows':
                    const borrowsRes = await requestGetBorrows({ limit: 10000 });
                    data = borrowsRes.metadata?.borrows || [];
                    title = 'BÁO CÁO DANH SÁCH MƯỢN TRẢ';
                    filename = 'DanhSachMuonTra';
                    columns = [
                        { title: 'Mã phiếu', dataIndex: 'borrowCode' },
                        { title: 'Độc giả', dataIndex: 'reader', render: (val) => val?.fullName || '' },
                        { title: 'MSSV', dataIndex: 'reader', render: (val) => val?.studentId || '' },
                        { title: 'Tên sách', dataIndex: 'book', render: (val) => val?.title || '' },
                        { title: 'Ngày mượn', dataIndex: 'borrowDate', render: (val) => val ? moment(val).format('DD/MM/YYYY') : '' },
                        { title: 'Hạn trả', dataIndex: 'dueDate', render: (val) => val ? moment(val).format('DD/MM/YYYY') : '' },
                        { title: 'Ngày trả', dataIndex: 'returnDate', render: (val) => val ? moment(val).format('DD/MM/YYYY') : 'Chưa trả' },
                        { title: 'Trạng thái', dataIndex: 'status' }
                    ];
                    break;

                case 'overdue':
                    const overdueRes = await requestGetBorrows({ limit: 10000, status: 'overdue' });
                    data = overdueRes.metadata?.borrows || [];
                    title = 'BÁO CÁO SÁCH QUÁ HẠN';
                    filename = 'SachQuaHan';
                    columns = [
                        { title: 'Mã phiếu', dataIndex: 'borrowCode' },
                        { title: 'Độc giả', dataIndex: 'reader', render: (val) => val?.fullName || '' },
                        { title: 'MSSV', dataIndex: 'reader', render: (val) => val?.studentId || '' },
                        { title: 'Số điện thoại', dataIndex: 'reader', render: (val) => val?.phone || '' },
                        { title: 'Tên sách', dataIndex: 'book', render: (val) => val?.title || '' },
                        { title: 'Hạn trả', dataIndex: 'dueDate', render: (val) => val ? moment(val).format('DD/MM/YYYY') : '' },
                        { title: 'Số ngày trễ', dataIndex: 'dueDate', render: (val) => val ? moment().diff(moment(val), 'days') + ' ngày' : '' }
                    ];
                    break;

                case 'fines':
                    const finesRes = await requestGetFines({ limit: 10000 });
                    data = finesRes.metadata?.fines || [];
                    title = 'BÁO CÁO DOANH THU TIỀN PHẠT';
                    filename = 'DoanhThuTienPhat';
                    columns = [
                        { title: 'Mã phiếu mượn', dataIndex: 'borrow', render: (val) => val?.borrowCode || '' },
                        { title: 'Độc giả', dataIndex: 'user', render: (val) => val?.fullName || '' },
                        { title: 'Lý do phạt', dataIndex: 'reason' },
                        { title: 'Số tiền (VNĐ)', dataIndex: 'amount', render: (val) => val ? val.toLocaleString('vi-VN') : '0' },
                        { title: 'Trạng thái', dataIndex: 'status', render: (val) => val === 'paid' ? 'Đã thu' : 'Chưa thu' },
                        { title: 'Ngày ghi nhận', dataIndex: 'createdAt', render: (val) => val ? moment(val).format('DD/MM/YYYY') : '' }
                    ];
                    break;

                default:
                    throw new Error('Report type not supported');
            }

            if (data.length === 0) {
                message.warning('Không có dữ liệu để xuất báo cáo!');
                return;
            }

            // Execute export
            let success = false;
            if (type === 'excel') {
                success = exportToExcel(data, columns, filename, title);
            } else if (type === 'pdf') {
                success = exportToPDF(data, columns, filename, title);
            }

            if (success) {
                message.success(`Đã tải xuống file ${type.toUpperCase()} thành công!`);
            }

        } catch (error) {
            console.error('Lỗi xuất báo cáo:', error);
            message.error('Có lỗi xảy ra trong quá trình tạo file báo cáo.');
        } finally {
            hide();
            setLoading(false);
            setActiveReport(null);
        }
    };

    return (
        <AdminLayout title="Báo cáo thống kê" subtitle="Kết xuất dữ liệu hệ thống ra các định dạng Excel, PDF phục vụ lưu trữ và báo cáo">
            <div className="max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {REPORTS.map((report) => (
                        <Card 
                            key={report.id} 
                            className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            styles={{ body: { padding: '24px' } }}
                        >
                            <div className="flex gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${report.bg}`}>
                                    {report.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                                    <p className="text-sm text-gray-500 mb-5 leading-relaxed line-clamp-3">
                                        {report.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            type="default" 
                                            icon={<FileText size={16} />} 
                                            className="h-10 rounded-xl flex items-center font-semibold text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
                                            onClick={() => handleExport(report.id, 'excel')}
                                            loading={loading && activeReport === report.id}
                                            disabled={loading}
                                        >
                                            Xuất Excel
                                        </Button>
                                        <Button 
                                            type="default" 
                                            icon={<Download size={16} />} 
                                            className="h-10 rounded-xl flex items-center font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                            onClick={() => handleExport(report.id, 'pdf')}
                                            loading={loading && activeReport === report.id}
                                            disabled={loading}
                                        >
                                            Xuất PDF
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ReportsPage;
