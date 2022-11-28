const mongoose = require('mongoose');




const couponSchema = new mongoose.Schema({
    couponCode :{
        type:String,
        required:true,
    },

    couponAmountType :{
        type:String,
        required:true,
    },

    couponAmount:{
        type:Number,
        required:true,
    },

    minCartAmount :{
        type:Number,
    },

    minRadeemAmount :{
        type:Number,
        required:true
    },

    expirydate :{
        type :Date
    },

    limit :{
        type:Number,
        required:true
    }

},{timestamps:true}
)

const couponModel = mongoose.model('coupons',couponSchema)
module.exports = couponModel