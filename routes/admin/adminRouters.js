const express = require('express');
const router = express.Router();
const AdminController = require('../../controllers/adminController');
const upload = require('../../middlewares/categoryUploads')
const uploads = require('../../utils/multer')
const authCheck = require('../../middlewares/authMiddleware');
const { Router } = require('express');


router.get('/dashboard',authCheck.checkAdminAuth,AdminController.renderDashboard);
router.get('/users',authCheck.checkAdminAuth,AdminController.user_list)
router.get('/logout',AdminController.adminLogout)
router.get('/userban',AdminController.user_Ban)
router.get('/userunban',AdminController.user_unBan)
router.get('/categories',authCheck.checkAdminAuth,AdminController.category_list)
router.get('/deletecategory',AdminController.delete_category)

router.get('/products',authCheck.checkAdminAuth,AdminController.products_list)
router.get('/addproduct',AdminController.renderAddProduct)
router.get('/editproduct',AdminController.renderEditproduct)
router.get('/deleteproduct',AdminController.deleteProduct)

router.get('/banner',AdminController.renderBannerList)
router.get('/addbanners',AdminController.renderBannerForm)
router.post('/addbanners',uploads.single('bannerimage'),AdminController.addbannerDetails)
router.get('/editbanner',AdminController.renderEditBannerDetails)
router.post('/editbanner',uploads.single('bannerimage'),AdminController.editBannerDetails)
router.get('/deletebanner',AdminController.deleteBannerDetails)

router.post('/editcategory',AdminController.edit_category)
router.post('/addcategory',upload.single('folder'),AdminController.add_category)
router.post('/addproduct',uploads.any(),AdminController.addProduct)
router.post('/editproduct',uploads.any(),AdminController.editProduct)

router.get('/orders',AdminController.orderList)
router.get('/order-summary',AdminController.orderSummary)
router.post('/change-order-status',AdminController.changeOrder_status)

router.get('/coupons',AdminController.renderCouponList)
router.post('/add-coupons',AdminController.addCoupons)

router.route('/')
   .get(AdminController.renderAdminLogin)
   .post(AdminController.adminLogin)


module.exports = router