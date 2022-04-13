const mongoose=require('mongoose');
var transactionSchema=mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Accounts'
    },
    type:{
        type:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    amount:{
        type:Number
    },
    description:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    }

});
var Transactions=mongoose.model('Transactions',transactionSchema);
module.exports=Transactions;