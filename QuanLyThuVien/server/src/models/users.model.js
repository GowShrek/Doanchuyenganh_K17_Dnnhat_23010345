const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fullName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true, // null nếu đăng nhập bằng Google
        },
        role: {
            type: DataTypes.ENUM('admin', 'librarian', 'reader'),
            defaultValue: 'reader',
            allowNull: false,
        },
        studentId: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'MSSV - Mã số sinh viên (dành cho độc giả)',
        },
        department: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Khoa',
        },
        className: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Lớp',
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        birthDay: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        avatar: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        typeLogin: {
            type: DataTypes.ENUM('email', 'google'),
            defaultValue: 'email',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Trạng thái tài khoản (khóa/mở)',
        },
    },
    {
        tableName: 'users',
        timestamps: true,
    }
);

module.exports = User;
