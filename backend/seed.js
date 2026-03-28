const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');

require('dotenv').config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskplanet');
        console.log('Connected to MongoDB');

        // Clear existing
        await User.deleteMany({});
        await Post.deleteMany({});
        console.log('Cleared existing data');

        const hashedPassword = await bcrypt.hash('password123', 12);

        // Create Users
        const users = await User.insertMany([
            { username: 'Ashish Tiwari', email: 'ashish@taskplanet.com', password: hashedPassword },
            { username: 'Priya Sharma', email: 'priya@taskplanet.com', password: hashedPassword },
            { username: 'Rohan Verma', email: 'rohan@taskplanet.com', password: hashedPassword },
            { username: 'Sneha Kapur', email: 'sneha@taskplanet.com', password: hashedPassword }
        ]);

        const ashish = users[0];
        const priya = users[1];
        const rohan = users[2];
        const sneha = users[3];

        // Create Posts
        const posts = await Post.insertMany([
            {
                user: ashish._id,
                content: 'Legend बनों ।\n- फालतू दिखावा मत करो।\n- कम बातें किया करो।\n- दूसरों की Help किया करो।\n- बकवास को नजरअंदाज करो।\n#motivation #legend #taskplanet',
                imageUrl: 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [priya._id, rohan._id, sneha._id],
                shares: [priya._id],
                comments: [
                    { user: priya._id, username: priya.username, text: 'Bilkul sahi baat kahi sir!' },
                    { user: rohan._id, username: rohan.username, text: 'Pure gold advice.' }
                ],
                createdAt: new Date(Date.now() - 3600000 * 24) // 1 day ago
            },
            {
                user: priya._id,
                content: 'Just launched my first task on TaskPlanet! Excited to see the response. 🚀 #freelancing #tasks #newbeginnings',
                imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [ashish._id, sneha._id],
                shares: [],
                comments: [
                    { user: ashish._id, username: ashish.username, text: 'Good luck Priya! You will do great.' }
                ],
                createdAt: new Date(Date.now() - 3600000 * 5) // 5 hours ago
            },
            {
                user: rohan._id,
                content: 'Helping someone today felt amazing. Remember, a small act of kindness goes a long way. ❤️ #kindness #help #community',
                imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [ashish._id, priya._id, sneha._id],
                shares: [sneha._id],
                comments: [],
                createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
            },
            {
                user: sneha._id,
                content: 'Late night sessions are the most productive for me. Who else is a night owl? 🦉💻 #coding #productivity #nightowl',
                imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [rohan._id],
                shares: [],
                comments: [
                    { user: rohan._id, username: rohan.username, text: 'Definitely me! The peace at 2 AM is unmatched.' }
                ],
                createdAt: new Date(Date.now() - 3600000 * 0.5) // 30 mins ago
            },
            {
                user: ashish._id,
                content: 'Consistency is key. 🔑 Keep pushing forward, no matter how small the step. #success #consistency #growth',
                imageUrl: '',
                likes: [priya._id, sneha._id, rohan._id],
                shares: [priya._id, rohan._id],
                comments: [],
                createdAt: new Date(Date.now())
            }
        ]);

        console.log('Database seeded successfully with 4 users and 5 posts!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
