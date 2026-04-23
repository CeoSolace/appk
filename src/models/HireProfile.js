const mongoose = require('mongoose');

const HireProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isActive: { type: Boolean, default: false },
    skills: [{ type: String }],
    categories: [{ type: String }],
    pricing: { type: String },
    availability: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HireProfile', HireProfileSchema);