// require('dotenv').config();
const express = require('express');
const User = require('../model/user.js');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const router = express.Router();

// Email format validation
const regExEmail = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z]+\.[a-zA-Z]+$/;
const regExPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const adminMail = process.env.ADMIN_EMAIL.trim().toLowerCase();

const emailPass = process.env.EMAIL_PASSWORD;

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'halima14collection@gmail.com',
        pass: emailPass,
    },
});

// Helper function to send email
async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: 'halima14collection@gmail.com',
            to,
            subject,
            text,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
    }
}

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

        const adminMail = process.env.ADMIN_EMAIL?.toLowerCase();
        let user = await User.findOne({ email: email.trim().toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'User with that email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const role = email.trim().toLowerCase() === adminMail ? 'admin' : 'user';

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

//login route
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

// Forgot Password Route
router.post('/forget_password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            req.flash('error', 'No user with that email');
            // Check if the request is an API call (e.g., from Postman)
            if (req.headers.accept === 'application/json') {
                return res.status(404).json({ message: 'No user with that email' });
            }
            return res.redirect('/forget_password');
        }

        const token = Math.random().toString(36).substring(2);
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        const resetLink = `http://localhost:8000/auth/reseting_password/${token}`;
        const subject = 'Password Reset Request';
        const message = `You requested a password reset. Click the link to reset your password: ${resetLink}\nIf you did not request this, please ignore this email.`;

        await sendEmail(user.email, subject, message);

        req.flash('info', 'Password reset link sent to your email');
        // Return a JSON response for API requests
        if (req.headers.accept === 'application/json') {
            return res.status(200).json({ message: 'Password reset link sent to your email' });
        }
        res.status(201).json({message: "reset password link sent to your email"})
    } catch (error) {
        console.error(error);
        // Return a JSON response for API requests
        if (req.headers.accept === 'application/json') {
            return res.status(500).json({ error: error.message });
        }
        res.status(500).send('An error occurred');
    }
});



// Reset Password Route
router.get('/reseting_password/:token', async (req, res) => {
    const { token } = req.params;
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
