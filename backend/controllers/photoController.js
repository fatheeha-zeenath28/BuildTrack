const multer = require('multer');
const path   = require('path');
const Photo  = require('../models/Photo');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const fileFilter = (req, file, cb) =>
  file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'), false);

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

exports.getPhotos = async (req, res) => {
  try {
    const filter = req.query.project ? { project: req.query.project } : {};
    const photos = await Photo.find(filter)
      .populate('uploadedBy', 'name')
      .populate('project', 'title')
      .sort('-createdAt');
    res.json({ photos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const photo = await Photo.create({
      project:    req.body.project,
      uploadedBy: req.user._id,
      filename:   req.file.filename,
      url:        `/uploads/${req.file.filename}`,
      caption:    req.body.caption,
      category:   req.body.category || 'progress',
    });
    res.status(201).json({ photo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
