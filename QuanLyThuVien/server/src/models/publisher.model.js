const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Publisher = sequelize.define(
    'Publisher',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
        slug: { type: DataTypes.STRING(250), allowNull: false, unique: true },
        address: { type: DataTypes.STRING(500), allowNull: true, comment: 'Địa chỉ' },
        phone: { type: DataTypes.STRING(20), allowNull: true },
        email: { type: DataTypes.STRING(150), allowNull: true },
        website: { type: DataTypes.STRING(300), allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        logo: { type: DataTypes.STRING(500), allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        bookCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: 'publishers', timestamps: true }
);

module.exports = Publisher;
