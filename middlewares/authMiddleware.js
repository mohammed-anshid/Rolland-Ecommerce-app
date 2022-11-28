const jwt = require('jsonwebtoken')


module.exports.checkAdminAuth = (req,res,next) => {
    const token = req.cookies.jwts
    if(token){
        next()
    }else if(!token){
        res.redirect('/admin')
    }
}
