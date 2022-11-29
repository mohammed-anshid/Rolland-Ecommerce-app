const express = require('express');
const app = express();
const logger = require('morgan');
const mongoose = require('mongoose')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session')
const env = require('dotenv');
env.config()

const adminRouters = require('./routes/admin/adminRouters')
const userRouter = require('./routes/user/userRouters')

// const userRouter = require('./routes/user/userRoutes')


app.use(logger('dev'))
app.use(express.urlencoded({extended:false}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'))
app.use(session({secret:'molla',cookie:{maxAge:60000}}))
app.set('views','views')
app.set('view engine','ejs')
app.use(cookieParser())

//cache clear

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next()
})

//DataBase Connection

const mongoDB = "mongodb+srv://anshy:iTtgULzohdF2Qbgv@cluster0.v4grub1.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || 3000;

mongoose.connect(mongoDB,{
    useNewUrlParser : true,
    useUnifiedTopology : true,
}).then(()=>app.listen(PORT,()=>
    console.log(`Connection established and running on port ${PORT}`)
)).catch((err)=>{
    console.log('Connection failed',err);
});

//Routers

app.use('/admin',adminRouters)
app.use('/',userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});
  
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error/404');
});