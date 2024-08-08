const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config'); // Ensure environment variables are loaded


app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());

//Routes
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const salesRoutes = require('./routes/sales');
const usersRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');


app.use(`/api/category`, categoryRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/orders`, orderRoutes);
app.use(`/api/sales`, salesRoutes);
app.use(`/api/users`, usersRoutes);
app.use(`/api/cart`, cartRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Database Connection is ready...');

        //Server
        app.listen(process.env.PORT, () => {
            console.log(`server is running http://localhost:${process.env.PORT}`);
        });

    })
    .catch((err) => {
        console.log(err);
    });

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});
