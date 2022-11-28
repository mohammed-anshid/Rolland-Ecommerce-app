const multer  = require('multer')
const path = require('path')


const storage = multer.diskStorage({
    
    fileFilter: function (req, file, cb) {
      let ext = path.extname(file.prginalname);
      if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png"){
      cb(new Error('File type is not supported'),false);
      return;
    }
    cb(null, true);
   }
}); 

const uploads = multer({ storage: storage });

module.exports = uploads