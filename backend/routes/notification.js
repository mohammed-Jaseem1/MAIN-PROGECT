const express = require('express');
const Notification = require('../models/Notification');

const router = express.Router();

// Create a notification
router.post('/', async (req, res) => {
  try {
    const { target, title, body } = req.body;
    if (!target || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const notification = new Notification({ target, title, body });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification', details: err.message });
  }
});

// Get notifications for a target (student or teacher)
router.get('/:target', async (req, res) => {
  try {
    const { target } = req.params;
    if (!['student', 'teacher'].includes(target)) {
      return res.status(400).json({ error: 'Invalid target' });
    }
    const notifications = await Notification.find({ target }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// Mark all as read for a target
router.patch('/:target/mark-all-read', async (req, res) => {
  try {
    const { target } = req.params;
    if (!['student', 'teacher'].includes(target)) {
      return res.status(400).json({ error: 'Invalid target' });
    }
    await Notification.updateMany({ target, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read', details: err.message });
  }
});

module.exports = router;
