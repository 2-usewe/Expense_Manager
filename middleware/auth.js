
var middl={}

middl.isLoggedIn=function(req,res,next)
{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Permission Denied!! Please LogIn first !!!!");
    res.redirect("/login");
}

middl.isLoggedIn1=function(req,res,next)
{
    if(req.isAuthenticated()){
        return res.redirect("/user");
    }
    res.render("../views/autherizations/login");
}


module.exports=middl;