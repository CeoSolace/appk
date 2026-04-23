const express = require('express');
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter for messaging
const messageLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.get('/', requireAuth, messageController.inbox);
router.get('/new/:userId', requireAuth, messageController.startThread);
router.get('/:threadId', requireAuth, messageController.viewThread);
router.post(
  '/:threadId',
  requireAuth,
  messageLimiter,
  [body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message cannot be empty')],
  messageController.sendMessage
);

module.exports = router;