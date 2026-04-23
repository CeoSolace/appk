const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
  },
  { _id: false }
);

const TeamSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, maxlength: 1000 },
    logo: ImageSchema,
    banner: ImageSchema,
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', TeamSchema);