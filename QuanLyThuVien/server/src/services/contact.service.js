const { Contact } = require('../models');
const { NotFoundError, BadRequestError } = require('../core/error.response');

class ContactService {
    static async create(data) {
        const contact = await Contact.create(data);
        return contact;
    }

    static async getAll({ page = 1, limit = 10, status }) {
        const where = {};
        if (status) {
            where.status = status;
        }

        const { count, rows } = await Contact.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        return {
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            contacts: rows
        };
    }

    static async updateStatus(id, status) {
        const contact = await Contact.findByPk(id);
        if (!contact) throw new NotFoundError('Không tìm thấy tin nhắn liên hệ');

        await contact.update({ status });
        return contact;
    }

    static async delete(id) {
        const contact = await Contact.findByPk(id);
        if (!contact) throw new NotFoundError('Không tìm thấy tin nhắn liên hệ');
        await contact.destroy();
        return { ok: true };
    }
}

module.exports = ContactService;
