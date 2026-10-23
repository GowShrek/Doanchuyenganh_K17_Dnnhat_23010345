const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Genre = sequelize.define(
    'Genre',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            comment: 'Tên thể loại',
        },
        slug: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
        },
        description: { type: DataTypes.TEXT, allowNull: true },
        color: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: '#a30014',
            comment: 'Màu tag hiển thị',
        },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        bookCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'genres', timestamps: true }
);

module.exports = Genre;
