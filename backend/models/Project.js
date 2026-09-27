const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  location:    { type: String },
  status:      { type: String, enum: ['planning','active','on_hold','completed'], default: 'planning' },
  progress:    { type: Number, min: 0, max: 100, default: 0 },
  startDate:   { type: Date },
  endDate:     { type: Date },
  budget:      { type: Number, default: 0 },
  admin:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  engineers:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  clients:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
