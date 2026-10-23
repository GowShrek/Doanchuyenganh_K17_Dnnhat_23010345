const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Reservation = sequelize.define('Reservation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'books', key: 'id' },
        comment: 'Sách được đặt trước',
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        comment: 'Độc giả đặt trước',
    },

    status: {
        type: DataTypes.ENUM('pending', 'notified', 'fulfilled', 'expired', 'cancelled'),
        defaultValue: 'pending',
        comment: 'pending=đang chờ, notified=đã được thông báo có sách, fulfilled=đã mượn được, expired=hết hạn, cancelled=hủy',
    },

    queuePosition: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Vị trí trong hàng chờ',
    },

    notifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Thời điểm được thông báo có sách',
    },

    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Hạn chót giữ chỗ sau khi được thông báo (24-48h)',
    },

    note: {
        type: DataTypes.STRING(300),
        allowNull: true,
        comment: 'Ghi chú của độc giả',
    },
}, {
    tableName: 'reservations',
    timestamps: true,
    indexes: [
        // Mỗi user chỉ đặt 1 lần mỗi cuốn (khi đang pending/notified)
        { unique: true, fields: ['bookId', 'userId'] },
    ],
});

module.exports = Reservation;
