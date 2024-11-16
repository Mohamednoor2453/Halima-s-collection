require('dotenv').config();

const express = require('express');
const User = require('../model/user.js');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const router = express.Router();

// Email format validation
const regExEmail = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z]+\.[a-zA-Z]+$/;

// Password regex: must contain at least one uppercase, one lowercase, one number, and one special character, with a minimum length of 8
const regExPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const adminMail = process.env.ADMIN_EMAIL.trim().toLowerCase();

// User Registration
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!regExEmail.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!regExPassword.test(password)) {
            return res.status(400).json({
                message: "Password must meet requirements."
            });
        }

        // Fetch adminMail from environment variables and convert to lowercase
        const adminMail = process.env.ADMIN_EMAIL?.toLowerCase();

        // Check if user already exists
        let user = await User.findOne({ email: email.trim().toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'User with that email already exists' });
        }

        // Hash the password and assign role
        const hashedPassword = await bcrypt.hash(password, 12);
        const role = email.trim().toLowerCase() === adminMail ? 'admin' : 'user';

        console.log('Email:', email.trim().toLowerCase(), 'Admin Email:', adminMail, 'Assigned Role:', role);

        // Create new user
        const newUser = new User({
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: role,
        });

        await newUser.save();
        console.log('New user saved to DB with role:', role);
        res.status(200).redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});



// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(400).json({ message: 'No user with that email', flash: "No user with that email", redirectUrl: '/register' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Incorrect Password', flash: 'Incorrect Password' });
        }

        req.session.user = {
            userId: user._id,
            email: user.email,
            role: user.role
        };
        console.log("Session created:", req.session.user);

        // Log the user role to confirm it's set correctly
        if (req.session.user.role === 'admin') {
            console.log('Admin logged in:', req.session.user.email);
            return res.status(200).redirect('/admin');  // Ensure admin page redirection
        } else {
            console.log('User logged in:', req.session.user.email);
            return res.status(200).redirect('/');  // Default user redirection
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Error in logging out' });
        }

        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully', redirectUrl: '/home' });
    });
});




// Reset Password Routes
router.get('/reseting_password/:token', async (req, res) => {
    const { token } = req.params;
    console.log('Received token');
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            req.flash('error', 'Invalid or expired token');
            return res.redirect('/forget_password');
        }
        res.render('reset-password.ejs', { token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            req.flash('error', 'Invalid or expired token');
            return res.redirect('/forget_password');
        }

        if (!regExPassword.test(password)) {
            req.flash('error', 'Password must meet complexity requirements');
            return res.redirect(`/auth/reset-password/${token}`);
        }

        user.password = await bcrypt.hash(password, 12);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        req.flash('success', 'Password reset successful');
        res.redirect('/login');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
