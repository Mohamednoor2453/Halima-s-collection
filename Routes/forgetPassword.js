// require('dotenv').config();
// const express = require('express');
// const { User } = require('../model/user.js');
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const flash = require('connect-flash');
// const crypto = require('crypto');
// const session = require('express-session');

// const router = express.Router();
// const regExEmail = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z]+\.[a-zA-Z]+$/;
// const regExPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// // Forget password route
// router.post('/forget_password', async (req, res) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             req.flash('error', 'No user with that email');
//             return res.redirect('/forget_password');
//         }

//         const resetToken = crypto.randomBytes(32).toString('hex');
//         user.resetToken = resetToken;
//         user.resetTokenExpiry = Date.now() + 3600000;
//         await user.save();

//         const resetLink = `http://localhost:8000/auth/reset-password/${resetToken}`;
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Password Reset',
//             html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`
//         };

//         await transporter.sendMail(mailOptions);
//         req.flash('info', 'Password reset email sent');
//         res.redirect('/login');
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Reset password routes
// router.get('/reset-password/:token', async (req, res) => {
//     const { token } = req.params;
//     try {
//         const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
//         if (!user) {
//             req.flash('error', 'Invalid or expired token');
//             return res.redirect('/forget_password');
//         }
//         res.render('reset-password', { token });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// router.post('/reset-password/:token', async (req, res) => {
//     const { token } = req.params;
//     const { password } = req.body;
//     try {
//         const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
//         if (!user) {
//             req.flash('error', 'Invalid or expired token');
//             return res.redirect('/forget_password');
//         }

//         if (!regExPassword.test(password)) {
//             req.flash('error', 'Password must meet complexity requirements');
//             return res.redirect(`/auth/reset-password/${token}`);
//         }

//         user.password = await bcrypt.hash(password, 12);
//         user.resetToken = undefined;
//         user.resetTokenExpiry = undefined;
//         await user.save();

//         req.flash('success', 'Password reset successful');
//         res.redirect('/login');
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;





// // Forget password route
// router.post('/forget_password', async (req, res) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             req.flash('error', 'No user with that email');
//             return res.redirect('/forget_password');
//         }

//         const resetToken = crypto.randomBytes(32).toString('hex');
//         user.resetToken = resetToken;
//         user.resetTokenExpiry = Date.now() + 3600000;
//         await user.save();

//         const resetLink = `http://localhost:8000/auth/reset-password/${resetToken}`;
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Password Reset',
//             html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`
//         };

//         await transporter.sendMail(mailOptions);
//         req.flash('info', 'Password reset email sent');
//         res.redirect('/login');
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Reset password routes
// router.get('/reset-password/:token', async (req, res) => {
//     const { token } = req.params;
//     try {
//         const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
//         if (!user) {
//             req.flash('error', 'Invalid or expired token');
//             return res.redirect('/forget_password');
//         }
//         res.render('reset-password', { token });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// router.post('/reset-password/:token', async (req, res) => {
//     const { token } = req.params;
//     const { password } = req.body;
//     try {
//         const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
//         if (!user) {
//             req.flash('error', 'Invalid or expired token');
//             return res.redirect('/forget_password');
//         }

//         if (!regExPassword.test(password)) {
//             req.flash('error', 'Password must meet complexity requirements');
//             return res.redirect(`/auth/reset-password/${token}`);
//         }

//         user.password = await bcrypt.hash(password, 12);
//         user.resetToken = undefined;
//         user.resetTokenExpiry = undefined;
//         await user.save();

//         req.flash('success', 'Password reset successful');
//         res.redirect('/login');
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;