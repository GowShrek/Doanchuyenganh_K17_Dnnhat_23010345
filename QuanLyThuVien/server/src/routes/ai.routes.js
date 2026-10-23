const express = require('express');
const router = express.Router();
const ctrl = require('../controller/ai.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

// Cho phép cả guest (không login) — user login sẽ nhận gợi ý cá nhân hoá hơn
const optionalAuth = (req, res, next) => {
    authUser(req, res, () => next()).catch(() => next());
};

router.post('/chat', optionalAuth, asyncHandler(ctrl.chat));

module.exports = router;
