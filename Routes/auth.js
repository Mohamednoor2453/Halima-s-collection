require('dotenv').config();

const express = require('express')
const {User} = require('../model/user.js')
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const session = require('express-session')

const router = express.Router()

//email format validation i.e start with letter end with valid domain name
const regExEmail = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z]+\.[a-zA-Z]+$/;


// Password regex: must contain at least one uppercase, one lowercase, one number, and one special character, with a minimum length of 8
const regExPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


//Setting up session midleware
router.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false } 
    })
  );

  const adminMail = process.env.ADMIN_EMAIL

  router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    console.log("Form data received:", req.body); // Debugging line

    try {
        // Validate email
        if (!regExEmail.test(email)) {
            console.log('Email validation failed');
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate password
        if (!regExPassword.test(password)) {
            console.log('Password validation failed');
            return res.status(400).json({ message: 'Weak password' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User with that email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Save user to database
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        console.log('User registered successfully');

        res.status(200).redirect('/login');
    } catch (error) {
        console.error('Unexpected error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


router.post('/login', async(req, res, done)=>{
    const {email, password} = req.body

    try {
        let user = await User.findOne({email})

        if (!user){
            return res.status(400).json({message: 'No user with that email', flash: "No user with that email", redirectUrl: '/Register'})

        }

        let isPasswordMatch = await bcrypt.compare(password, user.password)

        if(!isPasswordMatch){

            return res.status(400).json({message: 'Incorrect Password', flash: 'Incorrect Password'})
        }

        //manage session, if login is successfull

        req.session.user ={
            email: user.email
        }

        if(user.email === adminMail){
            return res.status(200).json({message:'Login successfully',  redirectUrl: '/admin' })
        }
        else {
            return res.status(200).redirect('/');
          }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
} )



// Logout route
router.post('/Logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({message: 'Error in logging out' });
      }
      res.status(200).json({ message: 'Logged out successfully', redirectUrl: '/home' });
    });
  });
module.exports = router