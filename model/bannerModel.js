const mongoose = require('mongoose')


const bannerSchema = mongoose.Schema({

    prodname :{
        type :String,
        require : true
    },
    
    bannerimages :{
        type :Array,
        
    },

    offername :{
        type :String,
        require :true,
    },

    offerprice :{
        type :Number,
        require :true,
    },
    
    oldprice :{
        type :Number
    }

})
const bannerModel = mongoose.model('banners', bannerSchema)
module.exports = bannerModel