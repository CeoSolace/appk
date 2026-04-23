const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, maxlength: 1000 },
    repoUrl: { type: String },
    liveDemoUrl: { type: String },
    screenshots: { type: [ImageSchema], default: [] },
    featured: { type: Boolean, default: false },
    private: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);