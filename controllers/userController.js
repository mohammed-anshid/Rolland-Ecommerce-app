const userModel = require('../model/userModel')
const productModel = require('../model/productModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment');
const bannerModel = require('../model/bannerModel')
const cartModel = require('../model/cartModel')
const addressModel = require('../model/addressModel')
const wishlistModel = require('../model/wishlistModel')
const orderModel = require('../model/orderModel')
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { token } = require('morgan')
const { ConversationPage } = require('twilio/lib/rest/conversations/v1/conversation');
const couponModel = require('../model/couponModel');
const { response } = require('express');
const { RegulatoryComplianceList } = require('twilio/lib/rest/numbers/v2/regulatoryCompliance');
const categoryModel = require('../model/categoryModel');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


exports.renderHomePage = async (req, res) => {
    
    try { 
        const token = req.cookies.jwt
        
        const BannerDtls = await bannerModel.find({})
        const productList = await productModel.find({ isHide: false }).limit(6)
        const categoryFilter = await categoryModel.find({})
    
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const user = await userModel.findById(userId)
            let userEmail = user.email
            
            const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
            const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
            
            res.locals.cartData = cartData
            res.locals.userWish = wishlist

            res.render('user/index-3', { token, userEmail, productList, BannerDtls ,categoryFilter});

        } else {
            res.render('user/index-3', { token:"", productList, BannerDtls,categoryFilter });
        }
    } catch (error) {
        console.log(error);
    }

}


exports.renderLoginPage = (req, res) => {
    res.render('user/login', { token: "", emailpasserr: "", passerr: "", allerr: "", banerr: "" })
}

exports.renderSignupPage = async (req, res) => {
    res.render('user/signup', { token: "", emailerr: "", passerr: "", allerr: "" })
}


//sign-up

exports.userSignup = async (req, res) => {

    try {

        const { fullname, email, phonenumber, password, repassword } = req.body
        const user = await userModel.findOne({ email: email })
        if (user) {
    
            res.render('user/signup', { token: "", emailerr: "email already exists", passerr: "", allerr: "" })
    
        } else {
            if (fullname && email && phonenumber && password && repassword) {
                if (password == repassword) {
    
                    client.verify.v2.services('VAe4a5576a3aae41eb26fc5a66d7cc92df')
                        .verifications
                        .create({ to: `+91${phonenumber}`, channel: 'sms' })
                        .then(verification => console.log(verification.status))
                        .catch(err => console.log(err))
    
                    req.session.userData = req.body
    
                    res.redirect('/verify')
    
                } else {
                    res.render('user/signup', { token: "", emailerr: "", passerr: "Your password not matched", allerr: "" });
                }
    
            } else {
                res.render('user/signup', { token: "", emailerr: "", passerr: "", allerr: "All feilds are required" });
    
            }
        }

    } catch (error) {
        
    }

}

//otp verification 
exports.renderOtpPage = (req, res) => {
    res.render('user/otp', { token: "" })
}
//very OTP
exports.verifyOtp = async (req, res) => {

    try {
        const otp = req.body.otp
        console.log(otp);
        const verifyNumber = req.session.userData.phonenumber
    
        client.verify.v2.services('VAe4a5576a3aae41eb26fc5a66d7cc92df')
            .verificationChecks
            .create({ to: `+91${verifyNumber}`, code: otp })
            .then(async (verification_check) => {
                console.log(verification_check.status, 'test ok')
    
                if (verification_check.status == "approved") {
    
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(req.session.userData.password, salt)
                        const doc = new userModel({
    
                            fullname: req.session.userData.fullname,
                            email: req.session.userData.email,
                            phonenumber: req.session.userData.phonenumber,
                            password: hashPassword,
    
                        })
    
                        await doc.save()
                        const signed_user = await userModel.findOne({ email: req.session.userData.email })
    
                        const token = jwt.sign({ userId: signed_user._id }, process.env.JWT_KEY, { expiresIn: '3d' })
                        res.cookie('jwt', token, { httpOnly: true })
                        res.redirect('/')
    
                    } catch (err) {
                        console.log(err)
                    }
                }
    
            })

    } catch (error) {
        
    }


}

//sign-in
exports.userSignin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email && password) {
            const User = await userModel.findOne({ email: email })
            if (!User.isBanned) {
                if (User != null) {
                    isMatched = await bcrypt.compare(password, User.password)
                    if (User.email === email && isMatched) {

                        const token = jwt.sign({ userId: User._id }, process.env.JWT_KEY, { expiresIn: '3d' })
                        res.cookie('jwt', token, { httpOnly: true })
                        res.redirect('/')

                    } else {
                        res.render('user/login', { token: "", emailpasserr: "Your email or password is incorrect", passerr: "", allerr: "", banerr: "" });
                    }

                } else {
                    res.render('user/login', { token: "", emailpasserr: "", passerr: "User don't exist", allerr: "", banerr: "" });
                }

            } else {
                res.render('user/login', { token: "", emailpasserr: "", passerr: "", allerr: "", banerr: "Your account suspended" })
            }

        } else {
            res.render('user/login', { token: "", emailpasserr: "", passerr: "", allerr: "All feilds are required", banerr: "" });
        }
    } catch (err) {
        console.log(err)
    }
}
//View-Products

exports.view_product = async (req, res) => {
    try {
        const token = req.cookies.jwt
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        const prodId = req.query.id
        const prodDetails = await productModel.findById(prodId)
        const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
        const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
        res.locals.cartData = cartData
        res.locals.userWish = wishlist
        console.log(prodDetails)
        res.render('user/product-view', { token: "", emailerr: "", passerr: "", allerr: "", prodDetails })
    } catch (error) {
        // next(error)
    }

}
//Product List //


exports.productsList = async (req, res) => {

    try {
        const token = req.cookies.jwt
        let productsLists = await productModel.find({ isHide: false })
        let categoryFilter = await categoryModel.find({})
        const filterBrands = req.query.brands
        const filterCategory = req.query.category
        console.log(filterCategory,"------------------");

     if(filterBrands){
        
        if(Array.isArray(filterBrands)){
    
             productsLists = productsLists.filter(obj =>{
                return (filterBrands.includes(obj.brands)) 
            })
           
        }else{
    
            productsLists = productsLists.filter(obj=>{
                return (filterBrands === obj.brands)   
            })
            
        }
     }
     if(filterCategory){

        if(Array.isArray(filterCategory)){

            productsLists = productsLists.filter(obj=>{
                return (filterCategory.includes(obj.category))
            })

        }else{

            productsLists = productsLists.filter(obj=>{
                return (filterCategory === obj.category)
            })
        }
     }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const user = await userModel.findById(userId)
            let userEmail = user.email
            const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
            const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
            res.locals.userWish = wishlist
            if (user.isBanned) {
                res.render('user/shop-list', { productsLists,categoryFilter, cartData, token: "" })
            } else {
                res.render('user/shop-list', { token, userEmail, productsLists, cartData,categoryFilter });
            }

        } else {
            res.render('user/shop-list', { token:"", productsLists , categoryFilter});
        }
    } catch (error) {
        console.log(error);
    }


}

exports.filterShop = async(req,res) => {

    try {
        const token = req.cookies.jwt
        const category = req.query.category

        let productsLists = await productModel.find({ isHide: false })
        const categoryFilter = await categoryModel.find({})
        res.locals.categoryFilter = categoryFilter

        if(category){
            productsLists = productsLists.filter(obj=>{
                return (category === obj.category)
            })
        }
         
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const user = await userModel.findById(userId)
            let userEmail = user.email
            const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
            const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
            res.locals.userWish = wishlist

            if (user.isBanned) {
                res.render('user/shop-list', { productsLists, cartData, token: "" })
            } else {
                res.render('user/shop-list', { token, userEmail, productsLists, cartData });
            }

        } else {
            res.render('user/shop-list', { token, productsLists });
        }
    } catch (error) {
        console.log(error);
    }
}


//---Add to Cart & Cart Mangement---//
async function getTotal(token) {

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId
    const cartData = await cartModel.findOne({ userId }).populate('userId').populate('cartProducts.productId')
    return total = cartData.cartProducts.reduce((acc, cur) => (acc + cur.productId.price * cur.quantity), 0)
}

exports.renderCartPage = async (req, res) => {
    try {
        const cartId = req.query.id
        const token = req.cookies.jwt
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const userData = await userModel.findById(userId)
            let userEmail = userData.email
            const cartData = await cartModel.findOne({userId }).populate('cartProducts.productId')
            const wishlist = await wishlistModel.findOne({userId }).populate('products.item')
            const categoryFilter = await categoryModel.find({})
            res.locals.categoryFilter = categoryFilter
            res.locals.userWish = wishlist

            if (cartData) {
                const total = await getTotal(token)
                res.locals.total = total
                res.locals.cartData = cartData
                res.locals.userEmail = userEmail
            } else {
                res.locals.total = 0
                res.locals.cartData = 0
            }
    
    
            if (userData.isBanned) {
                res.render('user/cart', { token: '' })
            } else {
                res.render('user/cart', { token })
            }
    
        } else {
            res.send('<script>alert("please login first"); window.location.href = "/login";</script>')
        }
        
    } catch (error) {
        
    }

}

exports.addItemToCart = async (req, res) => {
    try {
        const token = req.cookies.jwt
        const { productId } = req.body

        // const decoded = jwt.verify(token, process.env.JWT_KEY);
        // const userId = decoded.userId
        if (token) {

            let cartProdObj = {
                productId: productId,
                quantity: 1
            }
            // console.log('cartobject',cartProdObj);
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const userCart = await cartModel.findOne({ userId: userId }).populate('userId').populate('cartProducts.productId')
            // console.log(userCart)
            if (userCart) {

                let prodExist = userCart.cartProducts.some(data => data.productId._id == productId)
                if (prodExist) {

                    const index = userCart.cartProducts.findIndex(data => data.productId._id == productId)
                    userCart.cartProducts[index].quantity += 1;
                    await userCart.save()
                    res.send(true)
                } else {

                    const doc = await cartModel.findOne({ userId: userId }).populate('userId').populate('cartProducts.productId')
                    doc.cartProducts.push(cartProdObj)
                    await doc.save()
                    res.send(true)
                }

            } else {
                let cartObj = {
                    userId: userId,
                    cartProducts: [cartProdObj]
                }
                await cartModel.create(cartObj).then((response) => {
                    res.send('success')
                }).catch((err) => {
                    res.send(err)
                })
            }



        } else {
            res.render('user/login')
            res.json(false)
        }
    } catch (error) {
    
    }
    
}

//Change Cart Quantity 

module.exports.change_Quantities = async (req, res) => {
    try {
        const token = req.cookies.jwt
        const { cart, product, count, Quantity } = req.body
        // console.log(req.body)
        if (count == -1 && Quantity == 1) {

            await cartModel.findByIdAndUpdate(cart, {
                $pull: { 'cartProducts': { productId: product } }

            }).populate('cartProducts.productId').then((response) => {
                res.status({ productRemoved: true })
            })

        } else {
            await cartModel.findOneAndUpdate({ _id: cart, 'cartProducts.productId': product }, {

                $inc: { 'cartProducts.$.quantity': count }
            }).populate('cartProducts.productId').then(async (response) => {
                const total = await getTotal(token)
                res.json({ response: true, total: total })
            })
        }

    } catch (error) {
    
    }  
    
}

module.exports.deleteCartProduct = async (req, res) => {
    try {
        const { cartId, dltproductId } = req.body
        // const cartDatas = await cartModel.findById(cartId)
        // console.log(cartDatas)
        await cartModel.findByIdAndUpdate(cartId, {
    
            $pull: { 'cartProducts': { productId: dltproductId } }
    
        }).then((response) => {
            res.json({ productDeleted: true })
    
        }).catch((err) => {
    
            res.send(err)
        })
    } catch (error) {
        
    }
  

}
//Wish List Mangement
exports.renderWishList = async (req, res) => {

    try {
        const token = req.cookies.jwt
    if (token) {
        res.locals.token = token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        const user = await userModel.findById(userId)
        let userEmail = user.email
        const userWishlist = await wishlistModel.findOne({ userId }).populate('userId').populate('products.item')
        const cartData = await cartModel.findOne({ userId: userId }).populate('userId').populate('cartProducts.productId')
        const categoryFilter = await categoryModel.find({})
        res.locals.categoryFilter = categoryFilter
        res.locals.userWish = userWishlist
        res.locals.cartData = cartData
        res.render('user/wishlist', { userEmail })
    } else {

        res.send('<script>alert("please login first"); window.location.href = "/login";</script>')
    }
    } catch (error) {
        
    }
    

}

exports.addToWishlist = async (req, res) => {

    try {
        const token = req.cookies.jwt
        const { productId } = req.body
        if (token) {

            let wishProdObj = {
                item: productId
            }
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const userWishlist = await wishlistModel.findOne({ userId })

            if (userWishlist) {
                let wishProdExist = userWishlist.products.some(data => data.item == productId)
                if (wishProdExist) {
                    const extWish = await wishlistModel.findOne({ userId }, { 'products.item': productId })
                    extWish.products.splice(0, 1)
                    await extWish.save().then((response) => {
                        res.json({ response: false, rem: true })
                    })
                } else {
                    const doc = await wishlistModel.findOne({ userId })
                    doc.products.push(wishProdObj)
                    doc.save().then((response) => {
                        res.json(true)
                    })
                }

            } else {
                let wishlistObj = {
                    userId: userId,
                    products: [wishProdObj]
                }

                await wishlistModel.create(wishlistObj).then((response) => {
                    res.send('success')
                })
            }
        } else {
            // res.redirect('/login')
            res.json(false)
        }
    } catch (error) {
        
    }
    
}

//Delete wish product
module.exports.removeWishProduct = async (req, res) => {
    try {
        const { wishlistId, productId } = req.body

        await wishlistModel.findByIdAndUpdate(wishlistId, {
            $pull: { 'products': { item: productId } }
        }).then((response) => {
            res.json({ prodremoved: true })
        }).catch((err) => {
            res.json(false)
        })
    } catch (error) {
        
    }


}

//Profile And Address Management//
exports.renderMyAccountPage = async (req, res) => {

    try {
        const token = req.cookies.jwt
        res.locals.token = token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        const user = await userModel.findById(userId)
        let userEmail = user.email
        const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
        const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
        const categoryFilter = await categoryModel.find({})
        res.locals.categoryFilter = categoryFilter
        res.locals.cartData = cartData
        res.locals.userWish = wishlist
        res.render('user/account', { userEmail })
    } catch (error) {
        
    }
  
}


exports.renderAddressPage = async (req, res) => {

    try {
        const token = req.cookies.jwt
        res.locals.token = token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        const user = await userModel.findById(userId)
        let userEmail = user.email
        const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
        const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
        const categoryFilter = await categoryModel.find({})
        res.locals.categoryFilter = categoryFilter
        res.locals.cartData = cartData
        res.locals.userWish = wishlist
        const userAddressData = await addressModel.findOne({ userId: userId }).populate('userId')
        res.render('user/address', { userEmail, userAddressData })
    } catch (error) {
        
    }

}

//Add Address 

exports.renderAdd_address = async (req, res) => {

    try {
        const token = req.cookies.jwt
        res.locals.token = token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        const user = await userModel.findById(userId)
        let userEmail = user.email
        const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
        const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
        const categoryFilter = await categoryModel.find({})
        res.locals.categoryFilter = categoryFilter
        res.locals.cartData = cartData
        res.locals.userWish = wishlist
        res.render('user/addAddress', { userEmail })
    } catch (error) {
        
    }

}

exports.addAdress = async (req, res) => {

    try {
        const token = req.cookies.jwt
        const AddressData = { ...req.body }
        if (token) {

            let AddressObj = {
                fullName: AddressData.fullname,
                mobileNumber: AddressData.phonenumber,
                pincode: AddressData.pincode,
                houseAddress: AddressData.housedetails,
                streetAddress: AddressData.streetdetails,
                landMark: AddressData.landmark,
                cityName: AddressData.city,
                state: AddressData.state
            }
            const decode = jwt.verify(token, process.env.JWT_KEY)
            const userId = decode.userId
            const userAddress = await addressModel.findOne({ userId: userId })
            if (userAddress) {

                const userAdrs = await addressModel.findOne({ userId: userId }).populate('userId')
                userAdrs.userAddresses.push(AddressObj)
                await userAdrs.save().then((resp) => {
                        res.redirect('/address')
                }).catch((err) => {
                    res.send(err)
                })


            } else {

                let userAddressObj = {
                    userId: userId,
                    userAddresses: [AddressObj]
                }
                await addressModel.create(userAddressObj).then((resp) => {
                    res.redirect('/address')
                })
            }

        } else {
            res.send('login first')
        }
    } catch (error) {
        
    }
    
}

//Edit Address

exports.renderEditAddress = async (req, res) => {

    try {
        const addressIndex = req.query.index
        const token = req.cookies.jwt
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        const user = await userModel.findById(userId)
        let userEmail = user.email
        const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
        const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
        const categoryFilter = await categoryModel.find({})
        const userAddress = await addressModel.findOne({ userId })
        const curAd = userAddress.userAddresses[addressIndex]
    
        res.locals.token = token
        res.locals.curAd = curAd
        res.locals.index = addressIndex
        res.locals.cartData = cartData
        res.locals.userWish = wishlist
        res.locals.categoryFilter = categoryFilter
    
        res.render('user/editAddress', { userEmail, userAddress })
    } catch (error) {
        
    }

}

exports.editAddress = async (req, res) => {

    try {
        const editData = { ...req.body }
        const token = req.cookies.jwt
        const addressIndex = req.query.index
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const userAddress = await addressModel.findOne({ userId })
            console.log(editData);
            userAddress.userAddresses[addressIndex] = { ...editData };
            await userAddress.save();
    
            res.redirect('/address')
        }
    } catch (error) {
        
    }

}

//Delete Address 
module.exports.deleteUserAddress = async (req, res) => {

    try {
        const token = req.cookies.jwt
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        const index = req.body.index
        console.log(index)
    
        const address = await addressModel.findOne({ userId });
        address.userAddresses.splice(index, 1)
        await address.save()
    
        res.json({
            status: 'success'
        })
    } catch (error) {
        
    }


}


//Edit Profile

exports.renderEditProfilePage = async (req, res,next) => {

    try {

        const token = req.cookies.jwt
        res.locals.token = token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        
        const userData = await userModel.findById(userId)
        let userEmail = userData.email
        const cartData = await cartModel.findOne({userId}).populate('cartProducts.productId')
        const wishlist = await wishlistModel.findOne({userId}).populate('products.item')
        const categoryFilter = await categoryModel.find({})
        res.locals.categoryFilter = categoryFilter
        res.locals.cartData = cartData
        res.locals.userWish = wishlist
        res.render('user/editProfile', { userEmail, userData })

    } catch (error) {
        res.send(error)
        console.log(error);
        next(error)
    }

}


exports.editProfile = async (req, res) => {

    try {
        const profile = { ...req.body }
        const token = req.cookies.jwt
    
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const profileData = await userModel.findById(userId)
            if (profile.profileName && profile.profileEmail && profile.profilePhonenumber && profile.oldpassword && profile.profilePassword && profile.reprofilePassword) {
                if (profile.profilePassword == profile.reprofilePassword) {
                    isMatched = await bcrypt.compare(profile.oldpassword, profileData.password)
                    if (isMatched) {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(profile.profilePassword, salt)
                        await userModel.findByIdAndUpdate(userId, {
                            fullname: profile.profileName,
                            email: profile.profileEmail,
                            phonenumber: profile.profilePhonenumber,
                            password: hashPassword
                        })
                        res.send('success updated')
                        // res.redirect('/profile')
                    } else {
                        res.send('your invalid password')
                    }
                } else {
                    res.send('2 passwords are must be same')
                }
    
            } else {
                res.send('all fields are required')
            }
    
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        res.send(error)
    }

}

//Order Management //
exports.userOrders = async (req, res) => {

    try {
        const token = req.cookies.jwt
        if (token) {
            res.locals.token = token
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const user = await userModel.findById(userId)
            let userEmail = user.email
            const userWishlist = await wishlistModel.findOne({ userId }).populate('userId').populate('products.item')
            const cartData = await cartModel.findOne({ userId: userId }).populate('userId').populate('cartProducts.productId')
            const categoryFilter = await categoryModel.find({})
            res.locals.userWish = userWishlist
            res.locals.cartData = cartData
            res.locals.categoryFilter = categoryFilter
            const userOrders = await orderModel.find({ userId: userId }).populate({
                path: 'items',
                populate: {
                    path: 'productId',
                    model: 'products'
                }
            })
            res.locals.orders = userOrders
            res.render('user/order', { userEmail, moment: moment })
        } else {
    
            res.send('<script>alert("please login first"); window.location.href = "/login";</script>')
        }
    } catch (error) {
        
    }


}

//Cancel orders

exports.cancelOrder = async(req,res)=>{
    try {
        
        const orderId = req.query.id
        const order = await orderModel.findById(orderId)
        order.orderStatus = 'cancelled'
        order.save()
        res.redirect('/orders')
        
    } catch (error) {
        
    }
    
}


//Payment Checkout Management//

exports.renderCheckoutPage = async (req, res) => {

    try {
        const token = req.cookies.jwt
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const user = await userModel.findById(userId)
            let userEmail = user.email
            const userData = await userModel.findById(userId)
            const cartData = await cartModel.findOne({ userId: userId }).populate('userId').populate('cartProducts.productId')
            const wishlist = await wishlistModel.findOne({ userId }).populate('userId').populate('products.item')
            const userAddress = await addressModel.findOne({ userId })
            const categoryFilter = await categoryModel.find({})
            res.locals.categoryFilter = categoryFilter
            res.locals.addressData = userAddress || null
            res.locals.userWish = wishlist || null
            if (cartData) {
                const total = await getTotal(token)
                res.locals.total = total
                res.locals.cartData = cartData
            } else {
                res.locals.total = 0
                res.locals.cartData = 0
            }
    
            if (userData.isBanned) {
                res.render('user/checkout', { token: '' })
            } else {
                res.render('user/checkout', { token, userEmail })
            }
    
        } else {
            res.send('<script>alert("please login first"); window.location.href = "/login";</script>')
        } 

    } catch (error) {
        
    }


}

module.exports.placeOrder = async (req, res) => {

    try {
        const disAmount = req.query.discount
        const token = req.cookies.jwt
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId
        const order = { ...req.body }
        const address = await addressModel.findOne({ userId })
        const useraddress = address.userAddresses[order.index]
        const cartData = await cartModel.findOne({ userId: userId }).populate('userId').populate('cartProducts.productId')
        let status = order.payment === 'COD' ? 'placed' : 'pending'
        let total = await getTotal(token)
    
        let orderObj = {
    
            userId: userId,
    
            address: {
                fullName: useraddress.fullName,
                mobileNumber: useraddress.mobileNumber,
                pincode: useraddress.pincode,
                houseAddress: useraddress.houseAddress,
                streetAddress: useraddress.streetAddress,
                landMark: useraddress.landMark,
                cityName: useraddress.cityName,
                state: useraddress.state
            },
    
            paymentMethod: order.payment,
            orderStatus: status,
            items: cartData.cartProducts,
            totalAmount: total
        }
    
        await orderModel.create(orderObj).then(async (data) => {
            const orderId = data._id.toString()
    
            if (order.payment == 'COD') {
                await cartModel.updateOne({ userId: userId }, { $set: { cartProducts: [] } })
                res.json({ status: true })
            } else {
                var instance = new Razorpay({
                    key_id: process.env.KEY_ID,
                    key_secret: process.env.KEY_SECRET,
                });
    
                let amount = total-disAmount
                instance.orders.create({
                    amount: amount * 100,
                    currency: "INR",
                    receipt: orderId,
                }, (err, order) => {
                    res.json({ status: false, order })
                })
            }
    
        })

    } catch (error) {
        
    }


}

exports.orderSuccess = async (req, res) => {

    try {
        const token = req.cookies.jwt
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const user = await userModel.findById(userId)
            let userEmail = user.email
            const userData = await userModel.findById(userId)
            const cartData = await cartModel.findOne({ userId: userId }).populate('userId').populate('cartProducts.productId')
            const wishlist = await wishlistModel.findOne({ userId }).populate('userId').populate('products.item')
            const categoryFilter = await categoryModel.find({})
            const order = await orderModel.find().populate({
                path: 'items',
                populate: {
                    path: 'productId',
                    model: 'products'
                }
            })
                .sort({ updatedAt: -1 })
                .limit(1)
            // console.log(order[0].items[0].productId.productname);
    
            const total = await getTotal(token)
            res.locals.userData = userData
            res.locals.total = total
            res.locals.cartData = cartData
            res.locals.userWish = wishlist
            res.locals.categoryFilter = categoryFilter
            res.locals.order = order
    
            if (userData.isBanned) {
                res.render('user/success', { token: '' })
            } else {
                res.render('user/success', { token, userEmail })
            }
    
        } else {
            res.send('<script>alert("please login first"); window.location.href = "/login";</script>')
        }

    } catch (error) {
        
    }

}

module.exports.verifyPayment = async (req, res) => {

    try {
        const token = req.cookies.jwt
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            const userId = decoded.userId
            const details = req.body
            let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
    
            const orderId = details['order[receipt]']
            if (hmac === details['payment[razorpay_signature]']) {
    
                console.log('order Successfull')
                await cartModel.updateOne({ userId: userId }, { $set: { cartProducts: [] } })
                await orderModel.findByIdAndUpdate(orderId, { $set: { orderStatus: 'placed' } }).then((data) => {
                    res.json({ status: true, data })
                }).catch((err) => {
                    res.data({ status: false, err })
                })
    
            } else {
                res.json({ status: false })
                console.log('payment failed');
            }
    
        }

    } catch (error) {
        
    }

}

module.exports.verifyCoupons = async (req, res) => {

    try {
        const token = req.cookies.jwt
        if (token) {
            console.log(req.body);
            const CODE = req.body.code
            let cartAmount = req.body.cartAmount
            const couponData = await couponModel.findOne({ couponCode: CODE })

            if (couponData != null) {
                if (couponData.expirydate.getTime() >= new Date().getTime()) {

                    if (couponData.limit != 0) {

                        if (couponData.minCartAmount < cartAmount) {


                            if (couponData.couponAmountType == "fixed") {

                                 totalAmount = Math.round(cartAmount - couponData.couponAmount)
                                return res.json({
                                    status:true,
                                    couponMsg: 'Coupon applied',
                                    discounted: totalAmount,
                                    cuted:couponData.couponAmount
                                })
                                
                            } else if (couponData.couponAmountType == "percentage") {
                                const discountPercentage = cartAmount * couponData.couponAmount / 100
                                if( discountPercentage <= couponData.minRadeemAmount ){
                                     totalAmount = Math.round(cartAmount - discountPercentage)
                                    return res.json({
                                        status:true,
                                        couponMsg: 'Coupon applied',
                                        discounted: totalAmount,
                                        cuted:discountPercentage

                                    })

                                } else {
                                     totalAmount = math.round(cartAmount - couponData.minRadeemAmount)
                                    return res.json({
                                        status:true,
                                        couponMsg,
                                        discounted:totalAmount,
                                        cuted:couponData.minRadeemAmount
                                    })

                                }
                            }

                        } else {
                            console.log(`must purchase above of ${couponData.minCartAmount}`);
                        }


                    } else {
                        couponMsg = 'Invalid Coupon'
                        res.json({status:false,couponMsg})
                    }

                } else {
                    couponMsg = 'Invalid expired'
                    res.json({status:false,couponMsg})
                }

            } else {
                couponMsg = 'Invalid Coupon'
                res.json({status:false,couponMsg})
            }

        } else {
            window.location = '/login'
        }


    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

}
exports.render404Page =(req,res)=> {
    res.render('error/404')
}

exports.userLogout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/');
}


