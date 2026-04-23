const mongoose = require('mongoose');

const ScrimPostSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, maxlength: 500 },
    region: { type: String },
    schedule: { type: Date },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScrimPost', ScrimPostSchema);