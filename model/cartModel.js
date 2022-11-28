const mongoose = require('mongoose')

//Products Schema //

const cartProductSchema = new mongoose.Schema({
    
    productId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    },

    quantity :{
        type :Number,
        default :1
    }
})




//Cart Schema //

const cartSchema = new mongoose.Schema({
    
    userId :{
        type :mongoose.Schema.Types.ObjectId,
        ref : 'users'
    },

    cartProducts :{
        type :[cartProductSchema]
    },

    subtotal :{
        type : Number,
    }
})

const cartModel = mongoose.model('carts',cartSchema)
module.exports = cartModel