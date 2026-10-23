const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Fine = sequelize.define('Fine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    borrowId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID phiếu mượn liên quan',
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID độc giả bị phạt',
    },

    type: {
        type: DataTypes.ENUM('overdue', 'lost', 'damaged'),
        allowNull: false,
        comment: 'Loại phạt: quá hạn / mất sách / hư hỏng',
    },

    amount: {
        type: DataTypes.DECIMAL(12, 0),
        allowNull: false,
        defaultValue: 0,
        comment: 'Số tiền phạt (VND)',
    },

    paidAmount: {
        type: DataTypes.DECIMAL(12, 0),
        allowNull: false,
        defaultValue: 0,
        comment: 'Số tiền đã nộp',
    },

    status: {
        type: DataTypes.ENUM('unpaid', 'paid', 'waived'),
        allowNull: false,
        defaultValue: 'unpaid',
        comment: 'Trạng thái: chưa nộp / đã nộp / được miễn',
    },

    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Lý do phạt hoặc lý do miễn phạt',
    },

    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Thời gian nộp tiền',
    },

    paidBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID thủ thư xác nhận thu tiền',
    },

    paymentMethod: {
        type: DataTypes.ENUM('cash', 'vnpay', 'momo'),
        allowNull: true,
        comment: 'Phương thức thanh toán online',
    },
}, {
    tableName: 'fines',
    timestamps: true,
});

module.exports = Fine;
