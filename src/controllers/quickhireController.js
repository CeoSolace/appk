const HireProfile = require('../models/HireProfile');
const WorkProof = require('../models/WorkProof');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { validationResult } = require('express-validator');

// Dashboard - manage QuickHire profile
exports.dashboard = async (req, res) => {
  try {
    let hire = await HireProfile.findOne({ userId: req.session.userId });
    if (!hire) {
      hire = new HireProfile({ userId: req.session.userId });
      await hire.save();
    }
    const proofs = await WorkProof.find({ userId: req.session.userId });
    res.render('dashboard/quickhire/index', { title: 'QuickHire', hire, proofs, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).render('dashboard/quickhire/index', { title: 'QuickHire', hire: {}, proofs: [], errors: [{ msg: 'Error loading hire profile.' }] });
  }
};

// Update QuickHire profile
exports.postDashboard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let hire = await HireProfile.findOne({ userId: req.session.userId });
    const proofs = await WorkProof.find({ userId: req.session.userId });
    return res.status(400).render('dashboard/quickhire/index', { title: 'QuickHire', hire, proofs, errors: errors.array() });
  }
  try {
    const update = {
      isActive: req.body.isActive === 'on',
      skills: req.body.skills ? req.body.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      categories: req.body.categories ? req.body.categories.split(',').map((c) => c.trim()).filter(Boolean) : [],
      pricing: req.body.pricing,
      availability: req.body.availability,
    };
    await HireProfile.findOneAndUpdate({ userId: req.session.userId }, update, { new: true, upsert: true });
    res.redirect('/dashboard/quickhire');
  } catch (err) {
    console.error(err);
    res.status(500).render('dashboard/quickhire/index', { title: 'QuickHire', hire: req.body, proofs: [], errors: [{ msg: 'Server error' }] });
  }
};

// Listing of active hire profiles
exports.hireIndex = async (req, res) => {
  try {
    const query = { isActive: true };
    const hireProfiles = await HireProfile.find(query).populate('userId');
    const profiles = await Profile.find({ userId: { $in: hireProfiles.map((h) => h.userId._id) } });
    // Map for easy lookup
    const profileMap = {};
    profiles.forEach((p) => (profileMap[p.userId] = p));
    res.render('hire/index', { title: 'Hire Talent', hireProfiles, profileMap });
  } catch (err) {
    console.error(err);
    res.status(500).render('hire/index', { title: 'Hire Talent', hireProfiles: [], profileMap: {} });
  }
};

// View a user's hire profile
exports.hireProfile = async (req, res, next) => {
  const username = req.params.username.toLowerCase();
  try {
    const user = await User.findOne({ username });
    if (!user) return next();
    const hire = await HireProfile.findOne({ userId: user._id });
    if (!hire || !hire.isActive) return next();
    const profile = await Profile.findOne({ userId: user._id });
    const proofs = await WorkProof.find({ userId: user._id });
    res.render('hire/show', { title: `${profile.displayName} - Hire`, user, profile, hire, proofs });
  } catch (err) {
    next(err);
  }
};