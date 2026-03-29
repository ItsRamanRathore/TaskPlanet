const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./user/User');
const Post = require('./post/Post');

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
            { username: 'Sneha Kapur', email: 'sneha@taskplanet.com', password: hashedPassword },
            { username: 'Vikram Singh', email: 'vikram@taskplanet.com', password: hashedPassword },
            { username: 'Ananya Iyer', email: 'ananya@taskplanet.com', password: hashedPassword },
            { username: 'Rahul Mehta', email: 'rahul@taskplanet.com', password: hashedPassword },
            { username: 'Kavita Reddy', email: 'kavita@taskplanet.com', password: hashedPassword }
        ]);

        const [ashish, priya, rohan, sneha, vikram, ananya, rahul, kavita] = users;

        // Create Posts
        const postsData = [
            {
                user: ashish._id,
                content: 'Legend बनों ।\n- फालतू दिखावा मत करो।\n- कम बातें किया करो।\n- दूसरों की Help किया करो।\n- बकवास को नजरअंदाज करो।\n#motivation #legend #taskplanet',
                imageUrl: 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [priya._id, rohan._id, sneha._id],
                isPromoted: true,
                createdAt: new Date(Date.now() - 3600000 * 48)
            },
            {
                user: priya._id,
                content: 'Just launched my first community task on TaskPlanet! Excited to see the response. 🚀 #freelancing #tasks #newbeginnings',
                imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [ashish._id, sneha._id],
                createdAt: new Date(Date.now() - 3600000 * 24)
            },
            {
                user: vikram._id,
                content: 'Expert Tips for Digital Marketing 2026! 📈\n1. AI Personalization\n2. Voice Search Optimization\n3. Short-form Video focus.\n#marketing #tips #growth',
                imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                isPromoted: true,
                likes: [ashish._id, rahul._id],
                createdAt: new Date(Date.now() - 3600000 * 12)
            },
            {
                user: ananya._id,
                content: 'Working from the mountains this week! 🏔️ Best productivity hack: Change your scenery. #remotework #mountains #lifestyle',
                imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [rohan._id, kavita._id, sneha._id],
                createdAt: new Date(Date.now() - 3600000 * 8)
            },
            {
                user: rahul._id,
                content: 'Coding the future, one commit at a time. 💻 My journey with MERN stack continues! #coding #javascript #developer',
                imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [ananya._id, vikram._id],
                createdAt: new Date(Date.now() - 3600000 * 4)
            },
            {
                user: kavita._id,
                content: 'Happy to announce that I have completed my 100th task on TaskPlanet! 🎉 Hard work pays off. #achievement #freelance #milestone',
                imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                likes: [ashish._id, priya._id, rahul._id, ananya._id],
                createdAt: new Date(Date.now() - 3600000 * 2)
            },
            {
                user: sneha._id,
                content: 'Consistency is key. 🔑 Keep pushing forward, no matter how small the step. #success #consistency #growth',
                imageUrl: '',
                likes: [priya._id, sneha._id, rohan._id],
                createdAt: new Date(Date.now() - 3600000 * 1)
            }
        ];

        await Post.insertMany(postsData);

        console.log(`Database seeded successfully with ${users.length} users and ${postsData.length} posts!`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
