const mongoose = require('mongoose')


const wishlistSchema = mongoose.Schema({
    userId :{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required:true,

    },

    products :[{
        item:{
            type:mongoose.Schema.Types.ObjectId,
            ref :'products',
            required:true
        }


    }],
    
},{timestamps:true}
)

const wishlistModel = mongoose.model('wishlists',wishlistSchema)
module.exports = wishlistModel