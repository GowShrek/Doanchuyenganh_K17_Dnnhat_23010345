const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Otp = sequelize.define(
    'Otp',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        otp: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        tableName: 'otps',
        timestamps: true,
    }
);

module.exports = Otp;
