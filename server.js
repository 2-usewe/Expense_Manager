const express=require('express');
const dotenv=require('dotenv');
const morgan=require('morgan');
const bodyParser=require('body-parser');
const path=require('path')
const app=express();
dotenv.config({path:'config.env'})
const port=process.env.PORT;
const connectdb=require('./database/connection');
const Users=require('./models/users');
const expressSanitizer = require("express-sanitizer");
const passport = require("passport");
const flash = require("connect-flash");app.use(expressSanitizer());
app.use(flash());

const Homeroute=require('./routes/home');
const Accountroute=require('./routes/accounts');
const Transactionroute=require('./routes/transaction');


app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(expressSanitizer());
app.use('/css',express.static(path.resolve(__dirname,'assets/css')));
//app.use('/js',express.static(path.resolve(__dirname,'assets/js')));
app.use(flash());
connectdb();

//passport
app.use(require("express-session")({
    secret: "i am the best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(Users.createStrategy());

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

//User Configuration
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    res.locals.warning = req.flash("warning");
    next();
})

//Useing routes

app.use(Homeroute);
app.use(Accountroute);
app.use(Transactionroute);




app.listen(port,()=>{
    console.log(`http//localhost:${port}`);
})