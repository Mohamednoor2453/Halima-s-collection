// middleware/authMiddleware.js
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // User is authenticated, proceed to the next middleware or route handler
        return next();
    } else {
        // User is not authenticated
        return res.status(401).json({ message: 'Unauthorized access. Please log in first.', redirectUrl: '/auth/Login' });
    }
}

module.exports = isAuthenticated;
