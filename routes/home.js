const express=require('express');
const router=express.Router();
const Users = require('../models/users');
const Accounts=require('../models/accounts');
var passport=require("passport");
const middl=require('../middleware/auth');
const nodemailer = require("nodemailer"); 
const bcrypt=require('bcrypt');
const transport=require('../Mail/transport');
const {check,validationResult}=require("express-validator");
const jwt=require('jsonwebtoken');
//Home Page
router.get('/',(req,res)=>{
    res.render('../views/index');
})

//New user register
router.get('/signup',(req,res)=>{
    res.render('../views/autherizations/signup');
})
router.post("/signup",[check("password","Password Must be of more than 8 characters").isLength({min:8})],function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        req.flash("error",errors.errors[0].msg);
        return res.redirect("/signup");
    }
    bcrypt.hash(req.body.password, 10, async function(err, hash) {
        if(err){
            return res.json({
                message:"somthing wrong try later!",
                error:err
            });
        }
        else{
            var newUser=new Users({
                username:req.body.username,
                email:req.body.email,
                phone:req.body.phone,
                password:hash
            })
        }
    //var newUser=new Users({username:req.body.username,email:req.body.email});
        Users.register(newUser,req.body.password,function(err,user){
            if(err)
            {
                console.log(err);
                req.flash("error","User with the given email is already registered");
                return res.redirect("/signup");
            }
            passport.authenticate("local")(req,res,function(){
                var name="Personal Account";
                var desc="Personal Use";
                var members=req.user._id;
                var transactions=[];
                var flag=1;
                var newAccount={accountname:name,description:desc,members:members,transactions:transactions};
                Accounts.create(newAccount,function(err,newlyCreated){
                    if(err){
                        console.log(err);
                        return res.redirect("/");
                    }
                    let Mailoption=({
                        from:"eman.iron2022@gmail.com",
                        to:newUser.email,
                        subject:'Confirmation Mail!!',
                        html:`<h3>Hello ${newUser.username}</h3><br>
                        <p><h4><b>Welcome to Expense Manager.........!<b></h4></p>`
                    })
                    transport.sendMail(Mailoption,function(err,data){
                        if(err){
                            console.log("error occour mail not send.");
                        }
                        else{
                            console.log("maill send successfully.");
                        }
                    })
                    req.flash("success","Personal Account Created ");
                    res.redirect("/user"); 
                }) 
                 
            });
        });

    })  
})

router.get('/login',(req,res)=>{
    res.render('../views/autherizations/login');
})
router.post("/login",passport.authenticate("local",{
    successRedirect:"/user",
    failureRedirect: "/login",
    successFlash: 'Welcome !',
    failureFlash: 'Invalid username or password.'
}),function(req,res){
    Users.find({email:email})
    .exec()
    .then(user=>{
    bcrypt.compare(req.body.password,Users[0].password,function(err,result){
        if(err){
            res.status(404).json({
                message:'authentication faild.'
            })
        }
        if(result){
           
            res.status(201).redirect('/user');
            
        }
        else{
            res.status(404).json({
                message:"authentication failed"})
        }  
    })
    })
});
  
router.get('/logout',(req,res)=>{
    req.logOut();
    req.flash("success","Logged You Out!!!!!")
    res.redirect("/");
})

module.exports=router;