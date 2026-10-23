const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        define: {
            timestamps: true,
            underscored: false,
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connected successfully');

        // sync({ alter: true }) chỉ dùng 1 lần khi thay đổi schema.
        // Dùng sync() thông thường để tránh tích lũy index thừa.
        await sequelize.sync();
        console.log('✅ All tables synced');
    } catch (error) {
        console.error('❌ Failed to connect to MySQL:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
