// middleware/authMiddleware.js
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.userId) {
        console.log("User session found:", req.session.user);
        return next();
    }
    console.log("User session not found. Redirecting...");
    res.status(401).json({ message: 'You must be logged in to access this resource' });
};

module.exports = isAuthenticated;
