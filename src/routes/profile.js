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
    body('displayName')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Display name must be between 3 and 50 characters'),

    body('bio')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must be at most 500 characters'),

    body('location')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location must be at most 100 characters'),

    body('tags')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 200 })
      .withMessage('Tags must be at most 200 characters'),

    body('github')
      .optional({ checkFalsy: true })
      .trim()
      .isURL({ require_protocol: true })
      .withMessage('GitHub URL must include https:// and be valid'),

    body('twitter')
      .optional({ checkFalsy: true })
      .trim()
      .isURL({ require_protocol: true })
      .withMessage('Twitter URL must include https:// and be valid'),

    body('linkedin')
      .optional({ checkFalsy: true })
      .trim()
      .isURL({ require_protocol: true })
      .withMessage('LinkedIn URL must include https:// and be valid'),

    body('twitch')
      .optional({ checkFalsy: true })
      .trim()
      .isURL({ require_protocol: true })
      .withMessage('Twitch URL must include https:// and be valid'),

    body('youtube')
      .optional({ checkFalsy: true })
      .trim()
      .isURL({ require_protocol: true })
      .withMessage('YouTube URL must include https:// and be valid'),

    body('website')
      .optional({ checkFalsy: true })
      .trim()
      .isURL({ require_protocol: true })
      .withMessage('Website URL must include https:// and be valid'),
  ],
  profileController.postEditProfile
);

module.exports = router;
