const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: { // Storing username for absolute guarantee as requested or just populate? Populate is better, but saving username is faster for reads. Let's do both or just populate. User guide says "Save the usernames".
        type: String, 
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPromoted: {
        type: Boolean,
        default: false
    },
    comments: [CommentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);
