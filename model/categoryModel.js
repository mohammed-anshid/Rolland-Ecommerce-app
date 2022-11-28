const mongoose = require('mongoose')



const categorySchema = new mongoose.Schema({
    category_name :{
        type :String,
        required :true,
    },
    category_description :{
        type :String,
    },
    folder :{
        type :String
    },
    product_count :{
        type : Number,
    }
},
{
    timestamps:true
}
)

const categoryModel = mongoose.model("categories",categorySchema)
module.exports = categoryModel
