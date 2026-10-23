const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Article = sequelize.define('Article', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    thumbnail: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'draft',
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'articles',
    timestamps: true,
});

module.exports = Article;
