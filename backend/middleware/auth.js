const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            console.log('Auth failed: No token provided');
            return res.status(401).json({ message: 'Authentication failed: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        req.userData = { userId: decoded.userId, username: decoded.username };
        next();
    } catch (error) {
        console.log('Auth failed: Invalid token', error.message);
        return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
};
