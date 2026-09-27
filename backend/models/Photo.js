const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename:    { type: String, required: true },
  url:         { type: String, required: true },
  caption:     { type: String },
  category:    { type: String, enum: ['progress','issue','completion','other'], default: 'progress' },
}, { timestamps: true });

module.exports = mongoose.model('Photo', photoSchema);
