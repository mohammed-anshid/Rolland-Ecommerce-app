const express  = require('express');
const router = express.Router();
const userController = require('../../controllers/userController')
const env = require('dotenv');
env.config()


router.get('/',userController.renderHomePage);
router.get('/login',userController.renderLoginPage);
router.get('/signup',userController.renderSignupPage);
router.get('/logout',userController.userLogout)
//otp
router.get('/verify',userController.renderOtpPage);
router.post('/verify',userController.verifyOtp)

router.get('/viewitem',userController.view_product)
//products List //
router.get('/shop',userController.productsList)

//Cart Routes //
router.get('/cart',userController.renderCartPage)
router.post('/add-to-cart',userController.addItemToCart)
router.post('/change-quantity',userController.change_Quantities)
router.post ('/delete-cart-product',userController.deleteCartProduct)

//Wish List // 
router.get('/wishlist',userController.renderWishList)
router.post('/add-to-wishlist',userController.addToWishlist)
router.post('/remove-wish-prod',userController.removeWishProduct)

//Profile and Address Management //
router.get('/account',userController.renderMyAccountPage)
router.get('/address',userController.renderAddressPage)
router.get('/newaddress',userController.renderAdd_address)
router.get('/edit-address',userController.renderEditAddress)
router.get('/profile',userController.renderEditProfilePage)
router.get('/orders',userController.userOrders)
router.get('/cancel',userController.cancelOrder)

router.post('/newaddress',userController.addAdress)
router.post('/edit-address',userController.editAddress)
router.post('/editprofile',userController.editProfile)
router.post('/delete-address',userController.deleteUserAddress)

//Checkout payment Management //
router.get('/checkout',userController.renderCheckoutPage)
router.post('/place-order',userController.placeOrder)
router.get('/ordersuccess',userController.orderSuccess)
router.post('/verify-payment',userController.verifyPayment)

//coupon 
router.post('/verify-coupon',userController.verifyCoupons)

//filter
router.get('/filter-shop',userController.filterShop)

//Signup and Login Mangement //
router.post('/signup',userController.userSignup);
router.post('/login',userController.userSignin);

//404 page
router.get('/404',userController.render404Page)


module.exports = router