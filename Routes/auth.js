require('dotenv').config();

const express = require('express')
const {User} = require('../model/user.js')
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const session = require('express-session')

const router = express.Router()

//email format validation i.e start with letter end with valid domain name
const regExEmail = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z]+\.[a-zA-Z]+$/;

//Setting up session midleware
router.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false } 
    })
  );


router.post('/Register', async(req, res)=>{
    
    const {email, password} = req.body
    try {

        if (!regExEmail.test(email)) {
            return res.status(400).json({ message: 'Invalid email format', flash: 'Invalid email format' });
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

          await newUser.save()//saving user to db
          res.status(200).json({message: 'Registration was successfully done'})

    } catch (error) {
        res.status(500).json({error:  error.message})
    }

})

router.post('/Login', async(req, res, done)=>{
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

        if(user.email === 'halima14collection550@gmail.com'){
            return res.status(200).json({message:'Login successfully',  redirectUrl: '/admin' })
        }
        else {
            return res.status(200).json({ message: 'Login successfully', redirectUrl: '/product' });
          }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
} )



// Logout route
router.post('/Logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Error in logging out' });
      }
      res.status(200).json({ message: 'Logged out successfully', redirectUrl: '/home' });
    });
  });
module.exports = router