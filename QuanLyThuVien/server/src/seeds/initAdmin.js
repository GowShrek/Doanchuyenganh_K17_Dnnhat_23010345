/**
 * Init admin account on first startup
 * Email: admin@gmail.com / Password: 123456
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/connectDB');
const User = require('../models/users.model');

async function initAdmin() {
    try {
        await sequelize.authenticate();
        // Sync all tables first
        await sequelize.sync();

        const email = 'admin@gmail.com';
        const existing = await User.findOne({ where: { email } });

        if (existing) {
            console.log('ℹ️  Admin account already exists, skipping.');
        } else {
            const hashed = await bcrypt.hash('123456', 10);
            await User.create({
                fullName: 'Quản trị viên',
                email,
                password: hashed,
                role: 'admin',
                isActive: true,
            });
            console.log('✅ Admin account created: admin@gmail.com / 123456');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ initAdmin error:', err.message);
        process.exit(1);
    }
}

initAdmin();
