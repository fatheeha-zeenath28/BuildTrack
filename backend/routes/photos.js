const express = require('express');
const router  = express.Router();
const { getPhotos, uploadPhoto, deletePhoto, upload } = require('../controllers/photoController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/',       getPhotos);
router.post('/',      authorize('admin','engineer'), upload.single('photo'), uploadPhoto);
router.delete('/:id', authorize('admin','engineer'), deletePhoto);

module.exports = router;
