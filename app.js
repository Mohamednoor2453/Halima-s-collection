// app.js

require('dotenv').config();

const express = require('express');
const methodOverride = require('method-override')
const bodyParser = require('body-parser');
const ejs = require('ejs')

const path = require('path');
const mongoose = require('mongoose');


const app = express();
const session = require('express-session');
const flash = require('express-flash');




// Import routes
const routesRouter = require('./Routes/route.js');
const adminRouter = require('./Routes/admin.js');
const productRouter = require('./Routes/products.js')
const cartRouter = require('./Routes/cart.js')
const oderRouter = require('./Routes/oder.js')
const authRouter = require('./Routes/auth.js')
const sendMail = require('./email.js')

//authentication middleware
// const isAuthenticated = require('./middleware/authMiddleware.js');

// Middleware for serving static files and parsing body data
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

//seting ejs view engine
app.set('view engine','ejs')
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Use routes
app.use('/', routesRouter);
app.use('/admin', adminRouter);
app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/oder', oderRouter)
app.use('/auth', authRouter)



// Database connection
const dbURL = process.env.dbURL;
mongoose.connect(dbURL)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error(err));


    // Rendering 404 page for mispath
app.use((req, res) => {
    console.log('404 handler triggered');
    res.status(404).render('404');
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

// Start the server
const port = process.env.PORT || 3000; // Provide a default port if `process.env.PORT` is undefined


app.listen(port, () => {
    console.log(`Server is up, listening for requests on port ${port}`);
});

