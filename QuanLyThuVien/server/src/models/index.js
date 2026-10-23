const User = require('./users.model');
const ApiKey = require('./apiKey.model');
const Otp = require('./otp.model');
const Category = require('./category.model');
const Genre = require('./genre.model');
const Publisher = require('./publisher.model');
const Author = require('./author.model');
const Book = require('./book.model');
const { BookAuthor, BookGenre } = require('./book.junction');
const Borrow = require('./borrow.model');
const Fine = require('./fine.model');
const Review = require('./review.model');
const Reservation = require('./reservation.model');
const Notification = require('./notification.model');
const SystemConfig = require('./systemConfig.model');
const Article = require('./article.model');
const Contact = require('./contact.model');

// ── User Associations ──────────────────────────────────────────────
User.hasOne(ApiKey, { foreignKey: 'userId', onDelete: 'CASCADE' });
ApiKey.belongsTo(User, { foreignKey: 'userId' });

// ── Book → Category / Publisher (belongsTo) ────────────────────────
Book.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });

Book.belongsTo(Publisher, { foreignKey: 'publisherId', as: 'publisher' });
Publisher.hasMany(Book, { foreignKey: 'publisherId', as: 'books' });

// ── Book <-> Author (many-to-many) ─────────────────────────────────
Book.belongsToMany(Author, { through: BookAuthor, foreignKey: 'bookId', as: 'authors' });
Author.belongsToMany(Book, { through: BookAuthor, foreignKey: 'authorId', as: 'books' });

// ── Book <-> Genre (many-to-many) ──────────────────────────────────
Book.belongsToMany(Genre, { through: BookGenre, foreignKey: 'bookId', as: 'genres' });
Genre.belongsToMany(Book, { through: BookGenre, foreignKey: 'genreId', as: 'books' });

// ── Borrow Associations ────────────────────────────────────────────
Borrow.belongsTo(User, { foreignKey: 'userId', as: 'reader' });
User.hasMany(Borrow, { foreignKey: 'userId', as: 'borrows' });

Borrow.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(Borrow, { foreignKey: 'bookId', as: 'borrows' });

// ── Fine Associations ────────────────────────────────────────
Fine.belongsTo(Borrow, { foreignKey: 'borrowId', as: 'borrow' });
Borrow.hasMany(Fine, { foreignKey: 'borrowId', as: 'fines' });

Fine.belongsTo(User, { foreignKey: 'userId', as: 'reader' });
User.hasMany(Fine, { foreignKey: 'userId', as: 'fines' });

// ── Review Associations ────────────────────────────────────────────
Review.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(Review, { foreignKey: 'bookId', as: 'reviews' });

Review.belongsTo(User, { foreignKey: 'userId', as: 'reviewer' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

// ── Reservation Associations ───────────────────────────────────────
Reservation.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(Reservation, { foreignKey: 'bookId', as: 'reservations' });

Reservation.belongsTo(User, { foreignKey: 'userId', as: 'reader' });
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });

// ── Notification Associations ──────────────────────────────────────
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// ── Article Associations ───────────────────────────────────────────
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });

module.exports = {
    User, ApiKey, Otp,
    Category, Genre, Publisher, Author,
    Book, BookAuthor, BookGenre,
    Borrow, Fine, Review, Reservation, Notification, SystemConfig, Article, Contact
};
