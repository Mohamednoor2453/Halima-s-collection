require('dotenv').config();

const express = require('express')
const {User} = require('../model/user.js')
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const session = require('express-session')
const MongoStore = require('connect-mongo');

const router = express.Router()

//email format validation i.e start with letter end with valid domain name
const regExEmail = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z]+\.[a-zA-Z]+$/;


// Password regex: must contain at least one uppercase, one lowercase, one number, and one special character, with a minimum length of 8
const regExPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;




  const adminMail = process.env.ADMIN_EMAIL

router.post('/register', async(req, res)=>{
    
    const {email, password} = req.body
    try {

        if (!regExEmail.test(email)) {
            return res.status(400).json({ message: 'Invalid email format', flash: 'Invalid email format' });
          }

          if(!regExPassword.test(password)){
            return res.status(400).json({message: "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.", flash: 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.'})
          }
        let user = await User.findOne({email})

        //cchecking if user is already registered
        if(user){
            return res.status(400).json({message: 'User with that email already exist'})
        }

        let hashedPassword = await bcrypt.hash(password, 12)//hashing and salting the password before saving it to db

        //creating a new user  
        const newUser = new User({
            email: email,
            password: hashedPassword
          })

          await newUser.save()
          console.log('new user saved to db')
          //saving user to db
          res.status(200).redirect('/login')

    } catch (error) {
        res.status(500).json({error:  error.message})
    }

})

router.post('/login', async (req, res) => {
    const { email, password } = req.body


    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'No user with that email', flash: "No user with that email", redirectUrl: '/register' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Incorrect Password', flash: 'Incorrect Password' });
        }

        // Store userId in session
        req.session.user = {
            userId: user._id,
            email: user.email
        };
        console.log("Session created:", req.session.user);

        if (user.email === adminMail) {
            return res.status(200).redirect('/admin')
        } else {
            return res.status(200).redirect('/');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//logout route

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Error in logging out' });
      }
  
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).json({ message: 'Logged out successfully', redirectUrl: '/home' });
    });
  });
  

// Reset password routes
router.get('/reseting_password/:token', async (req, res) => {
    const { token } = req.params;
    console.log ('received token')
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
module.exports = router