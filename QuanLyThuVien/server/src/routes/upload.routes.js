const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../config/multer');
const { OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const { authAdminOrLibrarian } = require('../auth/checkAuth');

// POST /api/upload/image - Upload 1 ảnh
router.post('/image', authAdminOrLibrarian, upload.single('image'), (req, res, next) => {
    try {
        if (!req.file) throw new BadRequestError('Vui lòng chọn file ảnh');
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        new OK({
            message: 'Upload ảnh thành công',
            metadata: { url: fileUrl, filename: req.file.filename, originalName: req.file.originalname, size: req.file.size },
        }).send(res);
    } catch (err) { next(err); }
});

// POST /api/upload/images - Upload nhiều ảnh (tối đa 10)
router.post('/images', authAdminOrLibrarian, upload.array('images', 10), (req, res, next) => {
    try {
        if (!req.files?.length) throw new BadRequestError('Vui lòng chọn ít nhất 1 ảnh');
        const files = req.files.map(f => ({
            url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`,
            filename: f.filename,
            originalName: f.originalname,
            size: f.size,
        }));
        new OK({ message: `Upload ${files.length} ảnh thành công`, metadata: files }).send(res);
    } catch (err) { next(err); }
});

// DELETE /api/upload/image/:filename - Xóa ảnh
router.delete('/image/:filename', authAdminOrLibrarian, (req, res, next) => {
    try {
        const filePath = path.join(__dirname, '../../uploads', req.params.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        new OK({ message: 'Đã xóa ảnh' }).send(res);
    } catch (err) { next(err); }
});

module.exports = router;
