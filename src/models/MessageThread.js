const mongoose = require('mongoose');

const MessageThreadSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    archivedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Unique thread constraint for pairs (two participants) - not enforced automatically

module.exports = mongoose.model('MessageThread', MessageThreadSchema);