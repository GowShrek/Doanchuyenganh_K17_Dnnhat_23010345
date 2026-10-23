import React from 'react';
import { BookOpen } from 'lucide-react';

const BorrowSlipPrint = React.forwardRef(({ borrow }, ref) => {
    if (!borrow) return null;

    const printDate = new Date().toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <div 
            ref={ref} 
            className="print-only hidden print:block bg-white text-black p-4 font-mono text-[11px] leading-snug w-[80mm] max-w-[80mm] mx-auto"
        >
            {/* Header */}
            <div className="text-center border-b border-black pb-3 mb-3 border-dashed">
                <div className="flex justify-center mb-1">
                    <BookOpen size={20} className="text-black" />
                </div>
                <h1 className="font-bold text-[14px] uppercase tracking-wide">Thư Viện FUTECH</h1>
                <p className="mt-1">Địa chỉ: 123 Đường Sách, TP.HCM</p>
                <p>SĐT: 0123 456 789</p>
            </div>

            {/* Title */}
            <h2 className="text-center font-bold text-[16px] mb-3 uppercase">Phiếu Mượn Sách</h2>

            {/* Thông tin mượn */}
            <div className="mb-3">
                <div className="flex justify-between mb-1">
                    <span className="font-semibold">Mã phiếu:</span>
                    <span>{borrow.borrowCode}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span className="font-semibold">Ngày in:</span>
                    <span>{printDate}</span>
                </div>
            </div>

            <div className="border-t border-black pt-3 mt-2 border-dashed">
                <h3 className="font-bold text-[12px] uppercase mb-1">Độc giả</h3>
                <div className="mb-1">
                    <span className="font-semibold">Họ tên: </span>{borrow.reader?.fullName}
                </div>
                {borrow.reader?.studentId && (
                    <div className="mb-1">
                        <span className="font-semibold">MSSV: </span>{borrow.reader.studentId}
                    </div>
                )}
                {borrow.reader?.phone && (
                    <div className="mb-1">
                        <span className="font-semibold">SĐT: </span>{borrow.reader.phone}
                    </div>
                )}
            </div>

            <div className="border-t border-black pt-3 mt-3 border-dashed">
                <h3 className="font-bold text-[12px] uppercase mb-1">Sách Mượn</h3>
                <div className="mb-1 font-bold">
                    {borrow.book?.title}
                </div>
                {borrow.book?.isbn && (
                    <div className="mb-1 text-[10px]">
                        ISBN: {borrow.book.isbn}
                    </div>
                )}
            </div>

            <div className="border-t border-black pt-3 mt-3 border-dashed">
                <div className="flex justify-between mb-1">
                    <span className="font-semibold">Ngày mượn:</span>
                    <span>{borrow.borrowDate}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span className="font-semibold">Hạn trả:</span>
                    <span className="font-bold">{borrow.dueDate}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black mt-3 pt-3 border-dashed text-center">
                <p className="font-bold mb-1">LƯU Ý</p>
                <p className="italic mb-2">
                    Vui lòng trả sách đúng hạn.<br/>
                    Trễ hạn phạt 2,000đ/ngày.<br/>
                    Làm mất/hỏng đền bù 100% giá trị sách.
                </p>
                <div className="mt-4 pt-4 border-t border-black border-dashed flex justify-between px-2">
                    <div className="text-center">
                        <p className="font-bold mb-8">Thủ thư</p>
                        <p>(Ký tên)</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-8">Người mượn</p>
                        <p>(Ký tên)</p>
                    </div>
                </div>
                <p className="mt-6 text-[10px] text-gray-500">
                    Cảm ơn quý khách!
                </p>
            </div>
        </div>
    );
});

export default BorrowSlipPrint;
