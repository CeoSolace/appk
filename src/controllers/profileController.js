const User = require('../models/User');
const Profile = require('../models/Profile');
const Project = require('../models/Project');
const HireProfile = require('../models/HireProfile');
const Team = require('../models/Team');
const { validationResult } = require('express-validator');

// Show public profile
exports.showProfile = async (req, res, next) => {
  const username = req.params.username.toLowerCase();
  try {
    const user = await User.findOne({ username });
    if (!user) return next();
    const profile = await Profile.findOne({ userId: user._id });
    const projects = await Project.find({ owner: user._id, private: false }).limit(10);
    const hire = await HireProfile.findOne({ userId: user._id });
    const teams = await Team.find({ creator: user._id });
    res.render('profiles/show', {
      title: profile?.displayName || user.username,
      user,
      profile,
      projects,
      hire,
      teams,
    });
  } catch (err) {
    next(err);
  }
};

// Edit profile page (dashboard)
exports.getEditProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.session.userId });
    res.render('dashboard/profile', { title: 'Edit Profile', profile, errors: [] });
  } catch (err) {
    res.status(500).render('dashboard/profile', { title: 'Edit Profile', profile: {}, errors: [{ msg: 'Error loading profile.' }] });
  }
};

// Update profile
exports.postEditProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('dashboard/profile', { title: 'Edit Profile', profile: req.body, errors: errors.array() });
  }
  try {
    const update = {
      displayName: req.body.displayName,
      bio: req.body.bio,
      location: req.body.location,
      tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      socials: {
        github: req.body.github,
        twitter: req.body.twitter,
        linkedin: req.body.linkedin,
        twitch: req.body.twitch,
        youtube: req.body.youtube,
        website: req.body.website,
      },
    };
    await Profile.findOneAndUpdate({ userId: req.session.userId }, update, { new: true, upsert: true });
    res.redirect('/dashboard/profile');
  } catch (err) {
    console.error(err);
    res.status(500).render('dashboard/profile', { title: 'Edit Profile', profile: req.body, errors: [{ msg: 'Server error' }] });
  }
};