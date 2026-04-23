const MessageThread = require('../models/MessageThread');
const Message = require('../models/Message');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Inbox index
exports.inbox = async (req, res) => {
  try {
    const threads = await MessageThread.find({ participants: req.session.userId }).sort({ updatedAt: -1 });
    res.render('messages/index', { title: 'Inbox', threads });
  } catch (err) {
    console.error(err);
    res.status(500).render('messages/index', { title: 'Inbox', threads: [] });
  }
};

// View a thread
exports.viewThread = async (req, res, next) => {
  const threadId = req.params.threadId;
  try {
    const thread = await MessageThread.findById(threadId);
    if (!thread || !thread.participants.includes(req.session.userId)) {
      return res.status(403).render('errors/403');
    }
    const messages = await Message.find({ thread: threadId }).sort({ createdAt: 1 });
    // Determine the other participant for display
    const otherUserId = thread.participants.find((id) => id.toString() !== req.session.userId);
    const otherUser = otherUserId ? await User.findById(otherUserId) : null;
    res.render('messages/thread', { title: 'Conversation', thread, messages, otherUser });
  } catch (err) {
    next(err);
  }
};

// Send a message in a thread
exports.sendMessage = async (req, res) => {
  const threadId = req.params.threadId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(`/messages/${threadId}`);
  }
  const content = req.body.content?.trim();
  if (!content) return res.redirect(`/messages/${threadId}`);
  try {
    const thread = await MessageThread.findById(threadId);
    if (!thread || !thread.participants.includes(req.session.userId)) {
      return res.status(403).render('errors/403');
    }
    const message = new Message({ thread: threadId, sender: req.session.userId, content });
    await message.save();
    thread.updatedAt = new Date();
    await thread.save();
    res.redirect(`/messages/${threadId}`);
  } catch (err) {
    console.error(err);
    res.redirect(`/messages/${threadId}`);
  }
};

// Start a new thread (contact user) with userId
exports.startThread = async (req, res) => {
  const targetUserId = req.params.userId;
  if (targetUserId === req.session.userId) return res.redirect('/messages');
  try {
    // Check if existing thread between two participants
    let thread = await MessageThread.findOne({ participants: { $all: [req.session.userId, targetUserId], $size: 2 } });
    if (!thread) {
      thread = new MessageThread({ participants: [req.session.userId, targetUserId] });
      await thread.save();
    }
    res.redirect(`/messages/${thread._id}`);
  } catch (err) {
    console.error(err);
    res.redirect('/messages');
  }
};