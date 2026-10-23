const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const SystemConfig = sequelize.define('SystemConfig', {
    key: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: 'system_configs',
    timestamps: true,
});

module.exports = SystemConfig;
