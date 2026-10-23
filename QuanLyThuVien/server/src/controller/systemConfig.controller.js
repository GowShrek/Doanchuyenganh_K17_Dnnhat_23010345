const SystemConfigService = require('../services/systemConfig.service');
const { OK } = require('../core/success.response');

class SystemConfigController {
    getAll = async (req, res) => {
        const data = await SystemConfigService.getAllDetailed();
        return new OK({ message: 'OK', metadata: data }).send(res);
    };

    update = async (req, res) => {
        // req.body là object { EMAIL_USER: '...', CLIENT_ID: '...' }
        const data = await SystemConfigService.updateMultiple(req.body);
        return new OK({ message: 'Cập nhật cấu hình thành công', metadata: data }).send(res);
    };
}

module.exports = new SystemConfigController();
