let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser');

let indexRouter = require('./routes/index');
let salesRouter = require('./routes/sales');
let usersRouter = require('./routes/users');
let carsRouter = require('./routes/cars');
let customersRouter = require('./routes/customers');
let itemsRouter = require('./routes/items');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// let cors = require('cors')
// const {createProxyMiddleware} = require('http-proxy-middleware');
// app.use('/', createProxyMiddleware({
//     target: 'http://127.0.0.1:4000/', //original url
//     changeOrigin: true,
//     //secure: false,
//     onProxyRes: function (proxyRes, req, res) {
//         proxyRes.headers['Access-Control-Allow-Origin'] = '*';
//     }
// }));
// app.use(cors());


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://root:<password>@cluster0.jub0d.mongodb.net/<dbname>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


app.all("*",function(req,res,next){
    //设置允许跨域的域名，*代表允许任意域名跨域
    // res.header("Access-Control-Allow-Origin","http://127.0.0.1:3000");
    res.header("Access-Control-Allow-Origin","*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers","content-type");
    //跨域允许的请求方式
    res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.sendStatus(200);  //让options尝试请求快速结束
    else
        next();
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express,static("public"));

app.use(bodyParser.urlencoded({extended: false}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sales', salesRouter);
app.use('/cars', carsRouter);
app.use('/customers', customersRouter);
app.use('/items', itemsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
