const DashboardService = require('../services/dashboard.service');
const { OK } = require('../core/success.response');

class DashboardController {
    async getDashboardStats(req, res) {
        const data = await DashboardService.getDashboardStats();
        new OK({
            message: 'Get dashboard stats success',
            metadata: data,
        }).send(res);
    }
}

module.exports = new DashboardController();
