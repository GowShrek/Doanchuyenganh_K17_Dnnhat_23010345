const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Author = sequelize.define(
    'Author',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        fullName: { type: DataTypes.STRING(200), allowNull: false, comment: 'Họ và tên tác giả' },
        slug: { type: DataTypes.STRING(250), allowNull: false, unique: true },
        penName: { type: DataTypes.STRING(200), allowNull: true, comment: 'Bút danh' },
        bio: { type: DataTypes.TEXT, allowNull: true, comment: 'Tiểu sử' },
        birthYear: { type: DataTypes.INTEGER, allowNull: true, comment: 'Năm sinh' },
        nationality: { type: DataTypes.STRING(100), allowNull: true, defaultValue: 'Việt Nam', comment: 'Quốc tịch' },
        email: { type: DataTypes.STRING(150), allowNull: true },
        website: { type: DataTypes.STRING(300), allowNull: true },
        avatar: { type: DataTypes.STRING(500), allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        bookCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'authors', timestamps: true }
);

module.exports = Author;
