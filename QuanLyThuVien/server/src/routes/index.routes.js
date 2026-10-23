const userRoutes = require('./users.routes');
const categoryRoutes = require('./category.routes');
const genreRoutes = require('./genre.routes');
const publisherRoutes = require('./publisher.routes');
const authorRoutes = require('./author.routes');
const bookRoutes = require('./book.routes');
const uploadRoutes = require('./upload.routes');
const borrowRoutes = require('./borrow.routes');
const fineRoutes = require('./fine.routes');
const reviewRoutes = require('./review.routes');
const reservationRoutes = require('./reservation.routes');
const notificationRoutes = require('./notification.routes');
const aiRoutes = require('./ai.routes');
const systemConfigRoutes = require('./systemConfig.routes');
const dashboardRoutes = require('./dashboard.routes');
const articleRoutes = require('./article.routes');
const contactRoutes = require('./contact.routes');

function routes(app) {
    app.use('/api/users', userRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/genres', genreRoutes);
    app.use('/api/publishers', publisherRoutes);
    app.use('/api/authors', authorRoutes);
    app.use('/api/books', bookRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/borrows', borrowRoutes);
    app.use('/api/fines', fineRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/reservations', reservationRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/system-configs', systemConfigRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/articles', articleRoutes);
    app.use('/api/contacts', contactRoutes);
}

module.exports = routes;
