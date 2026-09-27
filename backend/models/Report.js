const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  content:     { type: String, required: true },
  weather:     { type: String },
  workers:     { type: Number, default: 0 },
  issues:      [{ description: String, severity: { type: String, enum: ['low','medium','high'] } }],
  reportDate:  { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
