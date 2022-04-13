const mongoose=require('mongoose');
var passportLocalMongoose=require("passport-local-mongoose");
var UserSchema=mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        index:{
            unique:true
        },
        match:/([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+/
    },
    password:{
        type:String,
        required:true
    }
});
UserSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});
var Users=mongoose.model('Users',UserSchema);
module.exports=Users;