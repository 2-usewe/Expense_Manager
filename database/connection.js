const mongoose=require('mongoose');
const connectdb=async()=>{
    try{
        const con=await mongoose.connect('mongodb://localhost:27017/exep',{
            useNewUrlParser: true,
            //useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log(`mongoDB connected:${con.connection.host}`);

    }
    catch(err){
        console.log(err);

    }
}
module.exports=connectdb;
    