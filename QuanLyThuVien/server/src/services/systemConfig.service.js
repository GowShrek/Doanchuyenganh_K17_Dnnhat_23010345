const { SystemConfig } = require('../models/index');
const { NotFoundError } = require('../core/error.response');

class SystemConfigService {
    // ── Lấy tất cả cấu hình ─────────────────────────────────────────
    static async getAll() {
        const configs = await SystemConfig.findAll();
        return configs.reduce((acc, conf) => {
            acc[conf.key] = conf.value;
            return acc;
        }, {});
    }

    // ── Lấy chi tiết kèm description (cho Admin form) ───────────────
    static async getAllDetailed() {
        return await SystemConfig.findAll();
    }

    // ── Lấy giá trị của 1 key ───────────────────────────────────────
    static async get(key, defaultValue = null) {
        const conf = await SystemConfig.findByPk(key);
        return conf ? conf.value : defaultValue;
    }

    // ── Cập nhật nhiều key cùng lúc ─────────────────────────────────
    static async updateMultiple(updates) {
        // updates = { EMAIL_USER: '...', CLIENT_ID: '...' }
        const promises = Object.entries(updates).map(async ([key, value]) => {
            const conf = await SystemConfig.findByPk(key);
            if (conf) {
                return conf.update({ value });
            } else {
                return SystemConfig.create({ key, value });
            }
        });
        await Promise.all(promises);
        return { ok: true };
    }
}

module.exports = SystemConfigService;
