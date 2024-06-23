// index.js
var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');

var app = express();

// บอกให้ express ใช้ folder public
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Ensure this line points to your views directory

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.listen(3000, function() {
    console.log('Server is running on port 3000');
});

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.get('/cart', (req, res) => {
    res.render('pages/cart');
});

app.get('/quiz', (req, res) => {
    res.render('pages/quiz');
});

app.get('/cart-test', (req, res) => {
    res.render('pages/cart-test');
});
