const multer  = require('multer')
const fs = require("fs");
const path = require('path')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/admin/CategoryUploads/');
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "_" + Date.now() + path.extname(file.originalname)
      );
    },
}); 

const upload = multer({ storage: storage });

module.exports = upload