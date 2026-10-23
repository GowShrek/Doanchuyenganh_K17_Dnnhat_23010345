const express = require('express');
const router = express.Router();
const AuthorController = require('../controller/author.controller');
const { asyncHandler, authAdmin, authAdminOrLibrarian } = require('../auth/checkAuth');

router.get('/', asyncHandler(AuthorController.getAll));
router.get('/:id', asyncHandler(AuthorController.getById));
router.post('/', authAdminOrLibrarian, asyncHandler(AuthorController.create));
router.put('/:id', authAdminOrLibrarian, asyncHandler(AuthorController.update));
router.patch('/:id/toggle', authAdminOrLibrarian, asyncHandler(AuthorController.toggleActive));
router.delete('/:id', authAdmin, asyncHandler(AuthorController.delete));

module.exports = router;
