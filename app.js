// app.js

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Import routes
const routesRouter = require('./Routes/route.js');
const adminRouter = require('./Routes/admin.js');
const productRouter = require('./Routes/products.js')
const cartRouter = require('./Routes/cart.js')
const oderRouter = require('./Routes/oder.js')

// Middleware for serving static files and parsing body data
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use routes
app.use('/', routesRouter);
app.use('/admin', adminRouter);
app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/oder', oderRouter)



// Database connection
const dbURL = process.env.dbURL;
mongoose.connect(dbURL)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error(err));

// Start the server
const port = process.env.PORT || 3000; // Provide a default port if `process.env.PORT` is undefined

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
app.listen(port, () => {
    console.log(`Server is up, listening for requests on port ${port}`);
});
