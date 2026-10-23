const express = require('express');
const router = express.Router();
const GenreController = require('../controller/genre.controller');
const { asyncHandler, authAdmin, authAdminOrLibrarian } = require('../auth/checkAuth');

router.get('/', asyncHandler(GenreController.getAll));
router.get('/:id', asyncHandler(GenreController.getById));
router.post('/', authAdminOrLibrarian, asyncHandler(GenreController.create));
router.put('/:id', authAdminOrLibrarian, asyncHandler(GenreController.update));
router.patch('/:id/toggle', authAdminOrLibrarian, asyncHandler(GenreController.toggleActive));
router.delete('/:id', authAdmin, asyncHandler(GenreController.delete));

module.exports = router;
