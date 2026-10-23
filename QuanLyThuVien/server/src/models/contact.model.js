const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'replied'),
        defaultValue: 'pending',
    }
}, {
    tableName: 'contacts',
    timestamps: true,
});

module.exports = Contact;
