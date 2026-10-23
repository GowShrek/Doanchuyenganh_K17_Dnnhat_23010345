const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ApiKey } = require('../models/index');
const { AuthFailureError } = require('../core/error.response');

require('dotenv').config();

const createApiKey = async (userId) => {
    const findApiKey = await ApiKey.findOne({ where: { userId } });
    if (findApiKey) {
        return findApiKey;
    }

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

    const privateKeyString = privateKey.export({ type: 'pkcs8', format: 'pem' });
    const publicKeyString = publicKey.export({ type: 'spki', format: 'pem' });

    const newApiKey = await ApiKey.create({ userId, publicKey: publicKeyString, privateKey: privateKeyString });
    return newApiKey;
};

const createToken = async (payload) => {
    const findApiKey = await ApiKey.findOne({ where: { userId: payload.id } });

    if (!findApiKey?.privateKey) {
        throw new Error('Private key not found for user');
    }

    return jwt.sign(payload, findApiKey.privateKey, {
        algorithm: 'RS256',
        expiresIn: '15m',
    });
};

const createRefreshToken = async (payload) => {
    const findApiKey = await ApiKey.findOne({ where: { userId: payload.id } });

    if (!findApiKey?.privateKey) {
        throw new Error('Private key not found for user');
    }

    return jwt.sign(payload, findApiKey.privateKey, {
        algorithm: 'RS256',
        expiresIn: '7d',
    });
};

const verifyToken = async (token) => {
    try {
        // Decode để lấy userId
        const decoded = jwt.decode(token);
        if (!decoded?.id) throw new AuthFailureError('Vui lòng đăng nhập lại');

        const findApiKey = await ApiKey.findOne({ where: { userId: decoded.id } });

        if (!findApiKey) {
            throw new AuthFailureError('Vui lòng đăng nhập lại');
        }

        return jwt.verify(token, findApiKey.publicKey, {
            algorithms: ['RS256'],
        });
    } catch (error) {
        throw new AuthFailureError('Vui lòng đăng nhập lại');
    }
};

module.exports = {
    createApiKey,
    createToken,
    createRefreshToken,
    verifyToken,
};
