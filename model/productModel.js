const mongoose = require('mongoose')


const productSchema = mongoose.Schema({

    productname :{
        type : String,
        required :true,
    },

    

    description :{
        type :String,
        required :[true ,'Product must have a description'],
        minlen : [20 , 'Product description have minimum 20 words']
    },

    category :{
        // type : mongoose.Schema.Types.ObjectId,
        // ref : 'categories',
        type:String,
        required:true
        
    },

    productimage :{
        type :Array
    },

    stock :{
        type :Number,
        required :[true, 'Product stock must be provided']
    },

    price :{
        type :Number,
        required :[true ,'Product price must be provided'],
    },

    discount :{
        type :Number,
        default :0,
    },

    brands :{
        type :String,
        required :true,
    },

    isHide :{
        type :Boolean,
        default :false,
    }
},
{
    timestamps :true
}
)

const productModel = mongoose.model('products',productSchema)
module.exports = productModel