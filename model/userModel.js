const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    fullname :{
        type:String,
        required:true,
        trim:true,
    },
    email :{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowecase:true,
    },
    phonenumber :{
        type:String,
        required:true,
    },
    password :{
        type:String,
        required:true,
        trim:true,
        minlength:[8]
    },
    isBanned :{
        type :Boolean,
        default :false,
    }

},
{
    timestamps :true,
}

);

const usermodel = mongoose.model("users",userSchema)
module.exports = usermodel