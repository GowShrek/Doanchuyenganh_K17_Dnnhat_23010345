const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'books', key: 'id' },
        comment: 'ID sách được đánh giá',
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        comment: 'ID độc giả đánh giá',
    },

    rating: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: { min: 1, max: 5 },
        comment: 'Điểm đánh giá 1-5 sao',
    },

    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Bình luận của độc giả',
    },

    isHidden: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Admin có thể ẩn đánh giá không phù hợp',
    },
}, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
        // Mỗi user chỉ đánh giá 1 lần mỗi cuốn sách
        { unique: true, fields: ['bookId', 'userId'] },
    ],
});

module.exports = Review;
