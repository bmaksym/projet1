const express = require("express");
const app = new express();
const morgan = require('morgan');
const methodOverride = require("method-override");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");

const dotenv = require('dotenv');
dotenv.config({path:'./configuration.env'}); 

app.use(connectFlash());
app.use(cookieParser("my_secret_code"));
app.use(expressSession({
    secret : "my_secret_code",
    cookie: {
        maxAge : 4000000
    },
    resave: false,
    saveUninitialized: false,
}));

app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    next();
});

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride("_method"));  
app.use('/', express.static('public'));
app.use(morgan('tiny'));

app.set("view engine","ejs");



const userRoutes = require('./routes/users');
app.use(userRoutes);

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Server is up and running http://localhost:${PORT}.`);
});




