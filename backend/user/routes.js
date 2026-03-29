const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');
const Notification = require('./Notification');
const auth = require('./middleware');

const router = express.Router();

// --- Auth Routes ---

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide username, email, and password' });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1d' }
        );
        res.status(201).json({ message: 'User created successfully', token, userId: newUser._id, username: newUser.username });
    } catch (error) {
        res.status(500).json({ message: 'Server error during signup', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1d' }
        );
        res.status(200).json({ message: 'Login successful', token, userId: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

// --- User Profile/Social Routes ---

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
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollowId);
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId);
            res.status(200).json({ message: "Unfollowed successfully", isFollowing: false });
        } else {
            currentUser.following.push(userToFollowId);
            userToFollow.followers.push(currentUserId);
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

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userData.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- Notification Routes ---

// Get all notifications
router.get('/notifications', auth, async (req, res) => {
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
router.put('/notifications/:id/read', auth, async (req, res) => {
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
