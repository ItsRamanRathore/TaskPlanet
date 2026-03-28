const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Notification = require('../models/Notification');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

const router = express.Router();

// Get all posts (Feed)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search && search.trim() !== '') {
            query.content = { $regex: search.trim(), $options: 'i' };
        }

        const posts = await Post.find(query)
            .populate('user', 'username') // Populate post creator
            .populate('comments.user', 'username') // Populate comment creators
            .sort({ isPromoted: -1, createdAt: -1 }); // Promoted first, then newest

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching posts', error: error.message });
    }
});

// Create a post
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { content, isPromoted } = req.body;
        const userId = req.userData.userId;
        let imageUrl = '';

        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        if (!content && !imageUrl) {
            return res.status(400).json({ message: 'Post must have content or an image' });
        }

        const newPost = new Post({
            user: userId,
            content: content || '',
            imageUrl: imageUrl || '',
            isPromoted: isPromoted === 'true' || isPromoted === true
        });

        await newPost.save();

        const populatedPost = await Post.findById(newPost._id).populate('user', 'username');

        res.status(201).json({
            message: 'Post created successfully',
            post: populatedPost
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error creating post', error: error.message });
    }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.userData.userId) {
            return res.status(403).json({ message: 'Unauthorized to edit this post' });
        }

        post.content = content || post.content;
        await post.save();

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating post', error: error.message });
    }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.userData.userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting post', error: error.message });
    }
});

// Like / Unlike a post
router.put('/:id/like', auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userData.userId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already liked
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            // Like
            post.likes.push(userId);
            
            // Trigger notification
            if (post.user.toString() !== userId) {
                const newNotification = new Notification({
                    recipient: post.user,
                    sender: userId,
                    type: 'like',
                    postId: post._id
                });
                await newNotification.save();
            }
        } else {
            // Unlike
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.status(200).json({ message: 'Like updated', likesCount: post.likes.length, likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: 'Server error liking post', error: error.message });
    }
});

// Share / Unshare a post
router.put('/:id/share', auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userData.userId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const shareIndex = post.shares.indexOf(userId);
        if (shareIndex === -1) {
            post.shares.push(userId);
        } else {
            post.shares.splice(shareIndex, 1);
        }

        await post.save();
        res.status(200).json({ message: 'Share updated', sharesCount: post.shares.length, shares: post.shares });
    } catch (error) {
        res.status(500).json({ message: 'Server error sharing post', error: error.message });
    }
});

// Add a comment
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;
        const userId = req.userData.userId;
        const username = req.userData.username;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            user: userId,
            username: username, // Saving username directly as allowed/requested
            text: text
        };

        post.comments.push(newComment);
        await post.save();

        // Trigger notification
        if (post.user.toString() !== userId) {
            const newNotification = new Notification({
                recipient: post.user,
                sender: userId,
                type: 'comment',
                postId: post._id
            });
            await newNotification.save();
        }

        res.status(201).json({ message: 'Comment added', comment: newComment, comments: post.comments });
    } catch (error) {
        res.status(500).json({ message: 'Server error commenting on post', error: error.message });
    }
});

module.exports = router;
