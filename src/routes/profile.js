const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, profileController.getEditProfile);
router.post(
  '/',
  requireAuth,
  [
    body('displayName').trim().isLength({ min: 3, max: 50 }).withMessage('Display name must be between 3 and 50 characters'),
    body('bio').trim().isLength({ max: 500 }).withMessage('Bio must be at most 500 characters'),
    body('location').trim().isLength({ max: 100 }).withMessage('Location must be at most 100 characters'),
    body('github').optional().isURL().withMessage('GitHub URL must be valid'),
    body('twitter').optional().isURL().withMessage('Twitter URL must be valid'),
    body('linkedin').optional().isURL().withMessage('LinkedIn URL must be valid'),
    body('twitch').optional().isURL().withMessage('Twitch URL must be valid'),
    body('youtube').optional().isURL().withMessage('YouTube URL must be valid'),
    body('website').optional().isURL().withMessage('Website URL must be valid'),
  ],
  profileController.postEditProfile
);

module.exports = router;