const nodemailer = require('nodemailer')
const fs = require('fs')

function sendMail(){
    const userEmail = req.body.email

    const destination = req.body.destination




let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'halima14collection@gmail.com',
    pass: 'sage xjmz scsz tosl'
  }
});

let mailOptions = {
  from: 'halima14collection@gmail.com',
  to: userEmail,
  subject: 'Your Order',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}

module.exports = sendMail