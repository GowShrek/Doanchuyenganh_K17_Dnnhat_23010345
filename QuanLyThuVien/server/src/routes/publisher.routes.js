const express = require('express');
const router = express.Router();
const PublisherController = require('../controller/publisher.controller');
const { asyncHandler, authAdmin, authAdminOrLibrarian } = require('../auth/checkAuth');

router.get('/', asyncHandler(PublisherController.getAll));
router.get('/:id', asyncHandler(PublisherController.getById));
router.post('/', authAdminOrLibrarian, asyncHandler(PublisherController.create));
router.put('/:id', authAdminOrLibrarian, asyncHandler(PublisherController.update));
router.patch('/:id/toggle', authAdminOrLibrarian, asyncHandler(PublisherController.toggleActive));
router.delete('/:id', authAdmin, asyncHandler(PublisherController.delete));

module.exports = router;
