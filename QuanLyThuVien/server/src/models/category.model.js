const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Category = sequelize.define(
    'Category',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            comment: 'Tên danh mục',
        },
        slug: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
            comment: 'Slug SEO-friendly',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Mô tả danh mục',
        },
        image: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Ảnh đại diện danh mục',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Hiển thị hay ẩn',
        },
        bookCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Số lượng sách (cache)',
        },
    },
    {
        tableName: 'categories',
        timestamps: true,
    }
);

module.exports = Category;
