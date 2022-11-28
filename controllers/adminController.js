const adminModel = require('../model/adminModel')
const userModel = require('../model/userModel')
const categoriesModel = require('../model/categoryModel')
const productModel = require('../model/productModel')
const bannerModel = require('../model/bannerModel')
const orderModel = require('../model/orderModel')
const couponModel = require('../model/couponModel')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const cloudinary = require('../utils/cloudinary')
const { response } = require('express')
const { db } = require('../model/userModel')



exports.renderAdminLogin = async (req, res) => {
    const token = req.cookies.jwts

    if (token) {
        res.redirect('/admin/dashboard')

    } else {
        res.render('admin/sign-in', { token: "" })
    }

}

exports.renderDashboard = async (req, res) => {
    const token = req.cookies.jwts
    const userCount = await userModel.find().count()

    const todaySales = await orderModel.aggregate([
        {$match: { orderStatus: "delivered" }},
        {$group: { _id:{ $dayOfMonth: '$createdAt' }, dailyTotal: { $sum: "$totalAmount" } }},
        {$sort: { _id: -1 }},
        { $limit: 1}
    ])
    const yearSales = await orderModel.aggregate([
        {$match: { orderStatus: "delivered" }},
        {$group: { _id:{$year: '$createdAt' }, yearTotal: { $sum: "$totalAmount" } }},
        {$sort: { _id: -1 }},
        { $limit: 1}  
    ])

    const todayOrders = await orderModel.find({orderStatus:"placed"}).count()

    const salesReports = await orderModel.aggregate([
        {

            $match: { orderStatus: "delivered" }
        },

        {
            $group: { _id: { $dayOfMonth: '$createdAt' }, dailyTotal: { $sum: "$totalAmount" } }
        },

        {
            $sort: { _id: -1 }
        },

        {
            $limit: 7
        }
    ])

    const monthlySales = await orderModel.aggregate([

        {
            $match: {orderStatus:"delivered"}
        },

        {
            $group :{_id:{$month:"$createdAt"},total:{$sum:"$totalAmount"}}
        },
        {
            $sort: { _id: -1 }
        },
        {
            $limit: 9
        }
    ])
   
    const monCancels = await orderModel.aggregate([
        {
            $match: { orderStatus: "cancelled" }
        },

        {
            $unwind: "$items" 
        },

        { 
            $group:{_id:{$month:"$createdAt"},count:{$sum:1}}
        },
        {$sort: { _id: -1 }},
        { $limit: 9}

    ])

    res.locals.monCancels = monCancels
    res.locals.userCount = userCount
    res.locals.todaySales = todaySales
    res.locals.yearSales = yearSales
    res.locals.todayOrders = todayOrders

    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const adminId = decoded.adminId
        const admin = await adminModel.findById(adminId)
        const adminEmail = admin.email
        res.render('admin/dashboard', { token, adminEmail, salesReports,monthlySales })
    } else {
        res.redirect('/admin')
    }

}

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email && password) {
            const admin = await adminModel.findOne({ email: email })
            if (admin != null) {
                isMatched = await bcrypt.compare(password, admin.password)
                if (email === admin.email && isMatched) {

                    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_KEY, { expiresIn: '3d' })
                    res.cookie('jwts', token, { httpOnly: true })
                    res.redirect('/admin/dashboard')
                } else {
                    res.send({ "status": "Your email or password incorrect" })
                }

            } else {
                res.send({ "status": "User not exist" })
            }

        } else {
            res.send({ "status": "All feilds are required" })
        }

    } catch (err) {
        console.log(err)
    }
}

//User-Management

exports.user_list = async (req, res) => {
    const user = await userModel.find({})

    res.render('admin/users', { user, moment: moment })
}

exports.user_Ban = async (req, res) => {
    const banEmail = req.query.email
    await userModel.updateOne({ email: banEmail }, { isBanned: true })
    res.redirect('/admin/users')
}

exports.user_unBan = async (req, res) => {
    const unBanEmail = req.query.email
    await userModel.updateOne({ email: unBanEmail }, { isBanned: false })
    res.redirect('/admin/users')
}


//Category-Management-start

exports.category_list = async (req, res) => {
    const category = await categoriesModel.find({})
    res.render('admin/categories', { category })
}

exports.add_category = async (req, res) => {
    const { category_name, category_description } = req.body
    if (req.file) {
        var { filename } = req.file
        console.log(req.file);
        //    console.log(category_thumbnail);
        await categoriesModel.create({ category_name: category_name, category_description: category_description, folder: filename })

        res.redirect('/admin/categories')
    } else {
        res.send("errror")
    }

}

exports.edit_category = async (req, res) => {
    const { categoryname, categorydes } = req.body
    const categoryId = req.query.id

    //  

    await categoriesModel.findByIdAndUpdate(categoryId, {
        category_name: categoryname,
        category_description: categorydes
    })
    res.redirect('/admin/categories')
}

exports.delete_category = async (req, res) => {
    const cateId = req.query.id
    await categoriesModel.findByIdAndRemove(cateId, {})
    res.redirect('/admin/categories')
}
//-----------------------------------> Category-Management-end <---------------------------------//

//Product-Management-start

exports.products_list = async (req, res) => {
    const productsInfos = await productModel.find({}).populate('category')
    console.log(productsInfos, '---------')
    res.render('admin/products', { productsInfos })
}

exports.renderAddProduct = async (req, res) => {
    const categoryName = await categoriesModel.find({})
    res.render('admin/addproduct', { categoryName })
}

//Add-products

exports.addProduct = async (req, res) => {
    const files = req.files
    // console.log(files)
    const { productname, description, category, stock, price, discount, tags } = req.body
    // console.log(req.body);
    try {

        let arr = []
        for (var i = 0; i < req.files.length; i++) {
            const result = await cloudinary.uploader.upload(req.files[i].path)

            arr.push({
                image_url: result.secure_url,
                public_id: result.public_id
            })

        }
        // console.log(arr)
        //instance of productimage



        await productModel.create({
            productname: productname,
            description: description,
            category: category,
            stock: stock,
            discount: discount,
            price: price,
            brands: tags,
            productimage: arr,
        })
        res.redirect('/admin/products')

    } catch (error) {
        return res.status(500).send({
            message: error.message,
            //   console.log(err);
        });
    }

}

//Edit Products
exports.renderEditproduct = async (req, res) => {
    const productId = req.query.id
    // console.log(productId)
    const categoryNames = await categoriesModel.find({})
    const productsDetails = await productModel.findOne({ _id: productId })
    // console.log(productsDetails)
    res.render('admin/editproduct', { categoryNames, productsDetails })

}

//Soft Delete Product
exports.deleteProduct = async (req, res) => {

    const prodId = req.query.id
    await productModel.findByIdAndUpdate(prodId, {
        $set: { isHide: true }
    })

    res.redirect('/admin/products')
}

exports.editProduct = async (req, res) => {
    const { editProductname, editDescription, editPrice, editDiscount, editStock, editTags, editCategory } = req.body
    const { id } = req.query
    const imgFiles = req.files
    console.log(imgFiles);

    //
    if (imgFiles[0]) {
        let prod = await productModel.findById(id)


        for (var i = 0; i < prod.productimage.length; i++) {
            await cloudinary.uploader.destroy(prod.productimage[i].public_id)
        }

        let editedArr = []
        for (var i = 0; i < imgFiles.length; i++) {
            const results = await cloudinary.uploader.upload(req.files[i].path)

            editedArr.push({
                image_url: results.secure_url,
                public_id: results.public_id
            })
        }
        await productModel.findByIdAndUpdate(id, {
            productname: editProductname,
            description: editDescription,
            category: editCategory,
            stock: editStock,
            price: editPrice,
            discount: editDiscount,
            brands: editTags,
            productimage: editedArr,
        }).then(() => {
            res.redirect('/admin/products')
        })

    } else {


        await productModel.findByIdAndUpdate(id, {
            productname: editProductname,
            description: editDescription,
            category: editCategory,
            stock: editStock,
            price: editPrice,
            discount: editDiscount,
            brands: editTags,

        }).then(() => {
            res.redirect('/admin/products')
        })

    }

}


//Banner Mangement //

exports.renderBannerList = async (req, res) => {
    const BannerDetail = await bannerModel.find({})

    res.render('admin/banner', { BannerDetail })
}

//Add-Banner
exports.renderBannerForm = (req, res) => {
    res.render('admin/addbanners')
}

exports.addbannerDetails = async (req, res) => {
    const file = req.file
    const data = { ...req.body }
    console.log(req.file);


    const bannerImage = await cloudinary.uploader.upload(req.file.path)
    //  console.log(bannerImage);
    let bannerArr = []
    bannerArr.push({
        image_url: bannerImage.secure_url,
        public_id: bannerImage.public_id
    })

    console.log(data.prodname);
    await bannerModel.create({
        prodname: data.prodname,
        offername: data.offername,
        offerprice: data.offerprice,
        oldprice: data.actualprice,
        bannerimages: bannerArr,
    })
    res.redirect('/admin/banner')


}
//Edit Banner
exports.renderEditBannerDetails = async (req, res) => {
    const bannerId = req.query.id
    const bannerInfos = await bannerModel.find({ _id: bannerId })
    res.render('admin/editBanner', { bannerInfos })
}

exports.editBannerDetails = async (req, res) => {
    const file = req.file
    const data = { ...req.body }
    const BannerId = req.query.id
    console.log(data);

    if (file) {
        const BannerDls = await bannerModel.findById(BannerId)
        await cloudinary.uploader.destroy(BannerDls.bannerimages[0].public_id)
    }

    const updatedBanner = await cloudinary.uploader.upload(req.file.path)
    let updatedArr = []
    updatedArr.push({
        image_url: updatedBanner.secure_url,
        public_id: updatedBanner.public_id
    })

    await bannerModel.findByIdAndUpdate(BannerId, {
        prodname: data.prodname,
        offername: data.offername,
        offerprice: data.offerprice,
        oldprice: data.actualname,
        bannerimages: updatedArr
    })
    res.redirect('/admin/banner')
}

//Delete Banner
exports.deleteBannerDetails = async (req, res) => {
    const dltBannerId = req.query.id
    const dltBannerdetails = await bannerModel.findById(dltBannerId)
    await cloudinary.uploader.destroy(dltBannerdetails.bannerimages[0].public_id)
    await bannerModel.findByIdAndRemove(dltBannerId, {})
    res.redirect('/admin/banner')
}

//Order Management
exports.orderList = async (req, res) => {
    try {

        const orders = await orderModel.find({}).populate('userId').populate({
            path: 'items',
            populate: {
                path: 'productId',
                model: 'products'
            }
        }).sort({ createdAt: -1 })

        res.render('admin/orders', { orders, moment: moment })
    } catch (error) {

    }

}

exports.orderSummary = async (req, res) => {

    try {
        const orderId = req.query.id
        const orders = await orderModel.findById(orderId).populate('userId').populate({
            path: 'items',
            populate: {
                path: 'productId',
                model: 'products'
            }
        })

        res.render('admin/order-summary', { orders, moment: moment })
    } catch (error) {

    }

}

module.exports.changeOrder_status = async (req, res) => {
    console.log(req.body)
    try {
        const data = { ...req.body }
        console.log(data);
        await orderModel.findByIdAndUpdate(data.orderId, {
            orderStatus: data.status
        }).then((response) => {
            res.json(true)
        })

    } catch (error) {

    }
}

exports.renderCouponList = async (req, res) => {
    try {

        const couponsData = await couponModel.find({})
        res.locals.couponsData = couponsData
        res.render('admin/coupons')

    } catch (error) {

        return res.status(500).send({
            message: error.message,
        });
    }

}

exports.addCoupons = async (req, res) => {

    try {
        console.log(req.body)
        const couponData = { ...req.body }

        await couponModel.create({
            couponCode: couponData.coupon_code,
            couponAmountType: couponData.fixedandpercentage,
            couponAmount: couponData.couponamount,
            minRadeemAmount: couponData.radeemamount,
            minCartAmount: couponData.cartamount,
            expirydate: couponData.expirydate,
            limit: couponData.usagelimit,
        })

        res.send('success')

    } catch (error) {

        return res.status(500).send({
            message: error.message,
            //   console.log(err);
        });
    }


}



exports.adminLogout = (req, res) => {
    res.cookie('jwts', '', { maxAge: 1 })
    res.redirect('/admin/')
}
