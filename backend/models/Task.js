const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:      { type: String, enum: ['pending','in_progress','completed','blocked'], default: 'pending' },
  priority:    { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
  dueDate:     { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
