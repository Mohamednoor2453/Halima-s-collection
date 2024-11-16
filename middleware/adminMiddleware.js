// middleware/adminMiddleware.js
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        console.log("Admin access granted:", req.session.user);
        return next();
    }
    console.log("Admin access denied. Redirecting...");
    return res.status(403).json({ message: 'Access denied. Admins only.' });
};

module.exports = isAdmin;
