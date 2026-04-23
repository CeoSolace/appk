const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiters
const signupLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });

// Signup routes
router.get('/signup', authController.getSignup);
router.post(
  '/signup',
  signupLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.postSignup
);

// Login routes
router.get('/login', authController.getLogin);
router.post(
  '/login',
  loginLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.postLogin
);

// Logout
router.get('/logout', authController.logout);

// Landing page
router.get('/', (req, res) => {
  res.render('landing', { title: 'Home' });
});

module.exports = router;