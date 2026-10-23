const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Book = sequelize.define(
    'Book',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING(300), allowNull: false, comment: 'Tên sách' },
        slug: { type: DataTypes.STRING(350), allowNull: false, unique: true },
        isbn: { type: DataTypes.STRING(20), allowNull: true, unique: true, comment: 'Mã ISBN' },
        description: { type: DataTypes.TEXT, allowNull: true, comment: 'Mô tả / Tóm tắt' },
        coverImage: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Danh sách ảnh bìa (JSON array of URLs)',
        },
        publishYear: { type: DataTypes.INTEGER, allowNull: true, comment: 'Năm xuất bản' },
        language: { type: DataTypes.STRING(50), allowNull: true, defaultValue: 'Tiếng Việt', comment: 'Ngôn ngữ' },
        pageCount: { type: DataTypes.INTEGER, allowNull: true, comment: 'Số trang' },
        price: { type: DataTypes.DECIMAL(12, 0), allowNull: true, comment: 'Giá bìa (VNĐ)' },
        // Quản lý số lượng
        totalQuantity: { type: DataTypes.INTEGER, defaultValue: 1, comment: 'Tổng số lượng' },
        availableQuantity: { type: DataTypes.INTEGER, defaultValue: 1, comment: 'Còn trong kho' },
        borrowedQuantity: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Đang cho mượn' },
        lostQuantity: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Đã mất' },
        damagedQuantity: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'Đã hỏng' },
        // Trạng thái
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, comment: 'Hiển thị/ẩn' },
        // FK
        categoryId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'categories', key: 'id' } },
        publisherId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'publishers', key: 'id' } },
    },
    { tableName: 'books', timestamps: true }
);

module.exports = Book;
