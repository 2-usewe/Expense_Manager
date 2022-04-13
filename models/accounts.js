const mongoose=require('mongoose');
var accountSchema=mongoose.Schema({
    accountname:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    }],
    transactions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Transactions'
    }]    
})
var Accounts=mongoose.model('Accounts',accountSchema);
module.exports=Accounts;