const mongoose = require('mongoose')

//Address Schema 
const addressSchema = mongoose.Schema({

    fullName :{
        type :String,
        required : true,
    },

    mobileNumber :{
        type :String,
        required : true,
    },

    pincode :{
        type :Number,
        required :true,
    },

    houseAddress :{
        type :String,
        required :true,
    },

    streetAddress :{
        type :String,
        required :true,
    },

    landMark :{
        type:String,
    },

    cityName :{
        type :String,
        required :true 
    },

    state :{
        type:String,
    }

})


//User Address Schema //

const userAddress = mongoose.Schema({

    userId :{
        type : mongoose.Schema.Types.ObjectId,
        ref :'users'
    },
    
    userAddresses :{
        type :[addressSchema],
    }

},{timestamps : true}
) 

const userAddressModel = mongoose.model('addresses', userAddress)
module.exports = userAddressModel