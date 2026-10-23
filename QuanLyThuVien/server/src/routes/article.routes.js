const express = require('express');
const router = express.Router();
const ctrl = require('../controller/article.controller');
const { asyncHandler, authAdminOrLibrarian } = require('../auth/checkAuth');

// Public routes
router.get('/', asyncHandler(ctrl.getAll));
router.get('/slug/:slug', asyncHandler(ctrl.getBySlug));

// Admin routes
router.get('/:id', authAdminOrLibrarian, asyncHandler(ctrl.getById));
router.post('/', authAdminOrLibrarian, asyncHandler(ctrl.create));
router.put('/:id', authAdminOrLibrarian, asyncHandler(ctrl.update));
router.delete('/:id', authAdminOrLibrarian, asyncHandler(ctrl.delete));
router.patch('/:id/toggle-status', authAdminOrLibrarian, asyncHandler(ctrl.toggleStatus));

module.exports = router;
