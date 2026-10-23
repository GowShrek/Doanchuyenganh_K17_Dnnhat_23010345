const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },

    type: {
        type: DataTypes.ENUM(
            'borrow_approved',    // Phiếu mượn được duyệt
            'borrow_rejected',    // Phiếu mượn bị từ chối
            'borrow_returned',    // Xác nhận trả sách
            'renew_approved',     // Gia hạn được duyệt
            'renew_rejected',     // Gia hạn bị từ chối
            'reservation_ready',  // Đặt trước — sách đã có
            'reservation_expired',// Đặt trước hết hạn
            'overdue_warning',    // Sắp quá hạn (D-1, D-3)
            'overdue_notice',     // Đã quá hạn
            'fine_created',       // Phiếu phạt mới
            'admin_new_borrow',   // (Admin) Yêu cầu mượn mới
            'admin_new_renew',    // (Admin) Yêu cầu gia hạn mới
        ),
        allowNull: false,
    },

    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },

    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },

    // Link đi kèm (VD: /books/:id, /my/borrows)
    link: {
        type: DataTypes.STRING(300),
        allowNull: true,
    },

    // Dữ liệu gốc tuỳ loại thông báo (borrowId, reservationId, ...)
    refId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
        { fields: ['userId', 'isRead'] },
        { fields: ['userId', 'createdAt'] },
    ],
});

module.exports = Notification;
