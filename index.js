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

// ตั้งค่าการเชื่อมต่อกับฐานข้อมูล MySQL
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node_project_chanpe"
});

//Connection to the MySQL database
connection.connect((error) => {
    if (error) {
        console.error('Error connecting to the database: ', error);
    } else {
        console.log('Connected to the database');
    }
});

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    // ดึงข้อมูลสินค้าจากฐานข้อมูล
    connection.query('SELECT * FROM products WHERE id = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error fetching product: ', err);
            res.status(500).send('Internal Server Error');
        } else if (result.length > 0) {
            res.render('pages/product-detail', { product: result[0] });
        } else {
            res.status(404).send('Product not found');
        }
    });
});

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

// แก้ไขเส้นทาง /cart-test เพื่อดึงข้อมูลสินค้าและส่งไปยังหน้า cart-test.ejs
app.get('/cart-test', (req, res) => {
    connection.query("SELECT * FROM products", (err, result) => {
        if (err) {
            console.error('Error fetching products: ', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('pages/cart-test', { products: result });
        }
    });
});
