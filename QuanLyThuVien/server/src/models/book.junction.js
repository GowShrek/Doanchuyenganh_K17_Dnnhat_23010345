const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

// Book <-> Author (many-to-many)
const BookAuthor = sequelize.define(
    'BookAuthor',
    {
        bookId: { type: DataTypes.INTEGER, primaryKey: true },
        authorId: { type: DataTypes.INTEGER, primaryKey: true },
    },
    { tableName: 'book_authors', timestamps: false }
);

// Book <-> Genre (many-to-many)
const BookGenre = sequelize.define(
    'BookGenre',
    {
        bookId: { type: DataTypes.INTEGER, primaryKey: true },
        genreId: { type: DataTypes.INTEGER, primaryKey: true },
    },
    { tableName: 'book_genres', timestamps: false }
);

module.exports = { BookAuthor, BookGenre };
