const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    email :{
        type : String,
        require : true,
        trim : true,
    },
    password :{
        type :String,
        require : true,
        trim : true,
        minlenght :[8]
    }
})

const adminModel = mongoose.model('admins',adminSchema)
module.exports = adminModel