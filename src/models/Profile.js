const mongoose = require('mongoose');

const SocialsSchema = new mongoose.Schema(
  {
    github: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    twitch: { type: String },
    youtube: { type: String },
    website: { type: String },
  },
  { _id: false }
);

const ImageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
  },
  { _id: false }
);

const VisibilitySchema = new mongoose.Schema(
  {
    showProjects: { type: Boolean, default: true },
    showHire: { type: Boolean, default: true },
    showTeams: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    displayName: { type: String, required: true },
    bio: { type: String, maxlength: 500 },
    avatar: ImageSchema,
    banner: ImageSchema,
    location: { type: String },
    tags: [{ type: String }],
    socials: SocialsSchema,
    visibility: VisibilitySchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', ProfileSchema);