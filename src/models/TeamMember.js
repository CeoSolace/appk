const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['member', 'captain'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ensure a user cannot join the same team twice
TeamMemberSchema.index({ team: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('TeamMember', TeamMemberSchema);