const { User, ApiKey, Otp } = require('../models/index');
const { createToken, createRefreshToken, createApiKey, verifyToken } = require('../utils/jwt');
const { google } = require('googleapis');
const SystemConfigService = require('./systemConfig.service');
const jwt = require('jsonwebtoken');
const { ConflictRequestError, BadRequestError } = require('../core/error.response');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const SendMailForgotPassword = require('../utils/sendMailForgotPassword');
const { Op } = require('sequelize');

require('dotenv').config();

class UserService {
    // ===================== ĐĂNG KÝ =====================
    async createUser(data) {
        const { fullName, email, password, role = 'reader', studentId, department, className, phone } = data;

        // Kiểm tra email đã tồn tại chưa
        const findUser = await User.findOne({ where: { email } });
        if (findUser) {
            throw new ConflictRequestError('Email đã tồn tại');
        }

        const saltRounds = 10;
        const passwordHash = bcrypt.hashSync(password, saltRounds);

        // Chỉ cho phép tự đăng ký với role 'reader'
        // Role 'admin' và 'librarian' chỉ admin mới tạo được
        const newUser = await User.create({
            fullName,
            email,
            password: passwordHash,
            role: 'reader', // luôn là reader khi tự đăng ký
            studentId: studentId || null,
            department: department || null,
            className: className || null,
            phone: phone || null,
            typeLogin: 'email',
            isActive: true,
        });

        await createApiKey(newUser.id);
        const token = await createToken({ id: newUser.id });
        const refreshToken = await createRefreshToken({ id: newUser.id });

        return { token, refreshToken };
    }

    // ===================== ĐĂNG NHẬP =====================
    async login(data) {
        const { email, password } = data;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        if (user.typeLogin === 'google') {
            throw new BadRequestError('Tài khoản này đăng nhập bằng Google');
        }
        if (!user.isActive) {
            throw new BadRequestError('Tài khoản đã bị khóa. Vui lòng liên hệ thủ thư');
        }

        const checkPassword = bcrypt.compareSync(password, user.password);
        if (!checkPassword) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }

        // Xoá api key cũ nếu có rồi tạo mới
        await ApiKey.destroy({ where: { userId: user.id } });
        await createApiKey(user.id);

        const token = await createToken({ id: user.id });
        const refreshToken = await createRefreshToken({ id: user.id });

        return { token, refreshToken };
    }

    // ===================== XÁC THỰC USER =====================
    async authUser(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
        });
        if (!user) {
            throw new BadRequestError('User không tồn tại');
        }
        const userString = JSON.stringify(user);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();
        return auth;
    }

    // ===================== ĐĂNG XUẤT =====================
    async logout(id) {
        await ApiKey.destroy({ where: { userId: id } });
        return { status: 200 };
    }

    // ===================== REFRESH TOKEN =====================
    async refreshToken(refreshToken) {
        const decoded = await verifyToken(refreshToken);
        const user = await User.findByPk(decoded.id);
        if (!user) throw new BadRequestError('User không tồn tại');

        const token = await createToken({ id: user.id });
        return { token };
    }

    // ===================== ĐĂNG NHẬP GOOGLE =====================
    async loginGoogle(credential) {
        // Xác minh chữ ký, aud, iss, exp của ID token bằng khóa công khai của Google trước khi tin vào email
        const audience = process.env.CLIENT_ID || (await SystemConfigService.getAll()).CLIENT_ID;
        if (!audience) throw new BadRequestError('Hệ thống chưa cấu hình Google Client ID');
        let dataToken;
        try {
            const ticket = await new google.auth.OAuth2().verifyIdToken({ idToken: credential, audience });
            dataToken = ticket.getPayload();
        } catch (e) {
            throw new BadRequestError('Thông tin đăng nhập Google không hợp lệ');
        }
        if (!dataToken?.email || !dataToken.email_verified) throw new BadRequestError('Email Google chưa được xác minh');

        let user = await User.findOne({ where: { email: dataToken.email } });

        if (!user) {
            user = await User.create({
                email: dataToken.email,
                fullName: dataToken.name,
                typeLogin: 'google',
                role: 'reader',
                isActive: true,
            });
        }

        if (!user.isActive) {
            throw new BadRequestError('Tài khoản đã bị khóa. Vui lòng liên hệ thủ thư');
        }

        await ApiKey.destroy({ where: { userId: user.id } });
        await createApiKey(user.id);
        const token = await createToken({ id: user.id });
        const refreshToken = await createRefreshToken({ id: user.id });
        return { token, refreshToken };
    }

    // ===================== QUÊN MẬT KHẨU =====================
    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET_CRYPTO, { expiresIn: '5m' });

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        const otpHash = bcrypt.hashSync(otp, 10);

        await Otp.create({ email: user.email, otp: otpHash });
        await SendMailForgotPassword(user.email, otp);

        return { token };
    }

    // ===================== ĐẶT LẠI MẬT KHẨU =====================
    async resetPassword(token, otpUser, newPassword) {
        const decoded = jwt.verify(token, process.env.SECRET_CRYPTO);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        const findOtp = await Otp.findOne({
            where: { email: user.email },
            order: [['createdAt', 'DESC']],
        });

        if (!findOtp) {
            throw new BadRequestError('Mã OTP không hợp lệ');
        }

        const checkOtp = bcrypt.compareSync(otpUser, findOtp.otp);
        if (!checkOtp) {
            throw new BadRequestError('Mã OTP không hợp lệ');
        }

        const passwordHash = bcrypt.hashSync(newPassword, 10);
        await user.update({ password: passwordHash });

        await Otp.destroy({ where: { email: user.email } });

        return { message: 'Đặt lại mật khẩu thành công' };
    }

    // ===================== CẬP NHẬT THÔNG TIN =====================
    async updateUser(id, data) {
        const { fullName, address, phone, birthDay, email, studentId, department, className } = data;
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }

        await user.update({ fullName, address, phone, birthDay, email, studentId, department, className });
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    }

    // ===================== ĐỔI MẬT KHẨU =====================
    async changePassword(id, data) {
        const { currentPassword, newPassword } = data;
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestError('Mật khẩu hiện tại không chính xác');
        }
        const passwordHash = bcrypt.hashSync(newPassword, 10);
        await user.update({ password: passwordHash });
        return { message: 'Đổi mật khẩu thành công' };
    }

    // ===================== UPLOAD AVATAR =====================
    async uploadAvatar(id, filename) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        await user.update({ avatar: filename });
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    }

    // ===================== ADMIN: LẤY DANH SÁCH USER =====================
    async getAllUser({ role, search, page = 1, limit = 20 } = {}) {
        const where = {};
        if (role) where.role = role;
        if (search) {
            where[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { studentId: { [Op.like]: `%${search}%` } },
            ];
        }

        const offset = (page - 1) * limit;
        const { rows, count } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        return { users: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
    }

    // ===================== ADMIN: CẬP NHẬT USER =====================
    async updateUserAdmin(id, data, reqUser) {
        const { fullName, email, phone, address, role, isActive, studentId, department, className } = data;
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        // Thủ thư không được phép sửa tài khoản của Admin hoặc Thủ thư khác
        if (reqUser && reqUser.role === 'librarian') {
            if (user.role !== 'reader') {
                throw new BadRequestError('Bạn không có quyền chỉnh sửa tài khoản này');
            }
            if (role && role !== 'reader') {
                throw new BadRequestError('Bạn không có quyền cấp chức vụ này');
            }
        }

        await user.update({ fullName, email, phone, address, role, isActive, studentId, department, className });
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    }

    // ===================== ADMIN: XÓA USER =====================
    async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }
        await user.destroy();
        return { message: 'Xóa tài khoản thành công' };
    }

    // ===================== ADMIN: TẠO THỦ THƯ / ADMIN =====================
    async createUserByAdmin(data) {
        const { fullName, email, password, role } = data;

        if (!['admin', 'librarian', 'reader'].includes(role)) {
            throw new BadRequestError('Vai trò không hợp lệ');
        }

        const findUser = await User.findOne({ where: { email } });
        if (findUser) {
            throw new ConflictRequestError('Email đã tồn tại');
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        const newUser = await User.create({
            fullName,
            email,
            password: passwordHash,
            role,
            typeLogin: 'email',
            isActive: true,
        });

        return await User.findByPk(newUser.id, { attributes: { exclude: ['password'] } });
    }

    // ===================== ADMIN: KHÓA / MỞ KHÓA TÀI KHOẢN =====================
    async toggleUserActive(id, isActive, reqUser) {
        const user = await User.findByPk(id);
        if (!user) {
            throw new BadRequestError('Tài khoản không tồn tại');
        }

        // Thủ thư không được phép khóa tài khoản của Admin hoặc Thủ thư khác
        if (reqUser && reqUser.role === 'librarian') {
            if (user.role !== 'reader') {
                throw new BadRequestError('Bạn không có quyền thao tác trên tài khoản này');
            }
        }

        await user.update({ isActive });
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    }
}

module.exports = new UserService();
