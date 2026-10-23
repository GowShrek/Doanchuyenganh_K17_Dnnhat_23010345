const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Borrow = sequelize.define('Borrow', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    borrowCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Mã phiếu mượn (tự sinh)',
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID độc giả mượn sách',
    },

    bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID sách được mượn',
    },

    borrowDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Ngày mượn thực tế (khi được duyệt)',
    },

    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Hạn trả sách',
    },

    returnDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Ngày trả thực tế',
    },

    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'returned', 'overdue', 'lost'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Trạng thái phiếu mượn',
    },

    note: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Ghi chú',
    },

    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID thủ thư / admin đã duyệt',
    },

    returnedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID thủ thư / admin xác nhận trả',
    },

    // ── Gia hạn ────────────────────────────────────────────────────
    renewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Số lần đã gia hạn',
    },
    renewLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        comment: 'Số lần gia hạn tối đa',
    },
    renewStatus: {
        type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'),
        defaultValue: 'none',
        comment: 'Trạng thái yêu cầu gia hạn hiện tại',
    },
    renewDueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Ngày trả mới đề xuất khi gia hạn',
    },
    renewNote: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Lý do gia hạn / từ chối',
    },
    renewRequestedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Thời điểm gửi yêu cầu gia hạn',
    },
}, {
    tableName: 'borrows',
    timestamps: true,
});

module.exports = Borrow;
