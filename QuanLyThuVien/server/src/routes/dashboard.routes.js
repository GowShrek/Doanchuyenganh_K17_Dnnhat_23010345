const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboard.controller');
const { asyncHandler, authAdminOrLibrarian } = require('../auth/checkAuth');

router.get('/', authAdminOrLibrarian, asyncHandler(dashboardController.getDashboardStats));

module.exports = router;
