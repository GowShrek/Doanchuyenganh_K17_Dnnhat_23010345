const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const ApiKey = sequelize.define(
    'ApiKey',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        publicKey: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        privateKey: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
    },
    {
        tableName: 'api_keys',
        timestamps: true,
    }
);

module.exports = ApiKey;
