const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: String },
  level: { type: String },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  file: { type: Buffer, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paper', PaperSchema);
