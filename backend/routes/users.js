const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Follow/Unfollow user
router.put('/:id/follow', auth, async (req, res) => {
    try {
        const userToFollowId = req.params.id;
        const currentUserId = req.userData.userId;

        if (userToFollowId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const currentUser = await User.findById(currentUserId);
        const userToFollow = await User.findById(userToFollowId);

        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = currentUser.following.includes(userToFollowId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollowId);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId);
            res.status(200).json({ message: "Unfollowed successfully", isFollowing: false });
        } else {
            // Follow
            currentUser.following.push(userToFollowId);
            userToFollow.followers.push(currentUserId);

            // Trigger notification
            const newNotification = new Notification({
                recipient: userToFollowId,
                sender: currentUserId,
                type: 'follow'
            });
            await newNotification.save();

            res.status(200).json({ message: "Followed successfully", isFollowing: true });
        }

        await currentUser.save();
        await userToFollow.save();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user profile (to check following status)
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userData.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
