const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userData.userId })
            .populate('sender', 'username')
            .populate('postId', 'content')
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notifications', error: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.userData.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error marking notification as read', error: error.message });
    }
});

module.exports = router;
