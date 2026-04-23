const { validationResult } = require('express-validator');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Render sign up page
exports.getSignup = (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard/devproof');
  res.render('auth/signup', { title: 'Sign Up', errors: [], data: {} });
};

// Handle sign up
exports.postSignup = async (req, res) => {
  const errors = validationResult(req);
  const { username, email, password } = req.body;
  const data = { username, email };
  if (!errors.isEmpty()) {
    return res.status(400).render('auth/signup', { title: 'Sign Up', errors: errors.array(), data });
  }
  try {
    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).render('auth/signup', {
        title: 'Sign Up',
        errors: [{ msg: 'Email or username already in use' }],
        data,
      });
    }
    const user = new User({ email, username });
    await user.setPassword(password);
    await user.save();
    // Create profile
    const profile = new Profile({ userId: user._id, displayName: username, visibility: {} });
    await profile.save();
    // Set session
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    req.session.username = user.username;
    res.redirect('/dashboard/devproof');
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/signup', {
      title: 'Sign Up',
      errors: [{ msg: 'Server error. Please try again.' }],
      data,
    });
  }
};

// Render login page
exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard/devproof');
  res.render('auth/login', { title: 'Login', errors: [], data: {} });
};

// Handle login
exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  const { identifier, password } = req.body;
  const data = { identifier };
  if (!errors.isEmpty()) {
    return res.status(400).render('auth/login', { title: 'Login', errors: errors.array(), data });
  }
  try {
    const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }] });
    if (!user) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        errors: [{ msg: 'Invalid credentials' }],
        data,
      });
    }
    if (user.isSuspended) {
      return res.status(403).render('auth/login', {
        title: 'Login',
        errors: [{ msg: 'Account is suspended.' }],
        data,
      });
    }
    const valid = await user.validatePassword(password);
    if (!valid) {
      return res.status(400).render('auth/login', {
        title: 'Login',
        errors: [{ msg: 'Invalid credentials' }],
        data,
      });
    }
    // set session
    req.session.userId = user._id.toString();
    req.session.role = user.role;
    req.session.username = user.username;
    res.redirect('/dashboard/devproof');
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/login', {
      title: 'Login',
      errors: [{ msg: 'Server error. Please try again.' }],
      data,
    });
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};