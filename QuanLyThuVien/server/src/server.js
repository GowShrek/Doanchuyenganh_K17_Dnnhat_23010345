const express = require('express');
const app = express();
const port = 3000;

require('dotenv').config();

const { connectDB } = require('./config/connectDB');

// Load models & associations
require('./models/index');

const routes = require('./routes/index.routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Kết nối MySQL
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.URL_CLIENT,
        credentials: true,
    })
);

app.use(express.static(path.join(__dirname, '../src')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
routes(app);

// Error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(`[ERROR] ${err.message}`);
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);

    // ── Cron: nhắc quá hạn mỗi ngày lúc 8:00 sáng ────────────────
    const NotificationService = require('./services/notification.service');
    const scheduleDailyReminder = () => {
        const now = new Date();
        const nextRun = new Date();
        nextRun.setHours(8, 0, 0, 0);
        if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1); // nếu đã qua 8h thì hôm sau

        const delay = nextRun - now;
        setTimeout(async () => {
            try { await NotificationService.sendOverdueReminders(); }
            catch (e) { console.error('[CRON] overdue reminder error:', e.message); }
            setInterval(async () => {
                try { await NotificationService.sendOverdueReminders(); }
                catch (e) { console.error('[CRON] overdue reminder error:', e.message); }
            }, 24 * 60 * 60 * 1000); // lặp mỗi 24h
        }, delay);

        const h = String(nextRun.getHours()).padStart(2, '0');
        const m = String(nextRun.getMinutes()).padStart(2, '0');
        console.log(`[CRON] Overdue reminder scheduled at ${nextRun.toDateString()} ${h}:${m}`);
    };
    scheduleDailyReminder();
});
