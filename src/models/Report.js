const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['user', 'project', 'team', 'scrim', 'other'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    reason: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);