const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const router = express.Router();


const app = express();

app.use(express.static('public')); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node_project_chanpe"
});

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

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'), 
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});



function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}


const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('test_image');

app.get('/add-test', (req, res) => {
    res.render('pages/add-test');
});



app.post('/addTestAndQuestions', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Max limit is 5MB.' });
            }
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).json({ success: false, message: 'Error uploading file' });
        }

        const { test_name, test_description, questions, answers, correct_choices } = req.body;
        const test_image = req.file ? req.file.filename : 'default.jpg';

        const sql = 'INSERT INTO tests (name, description, image) VALUES (?, ?, ?)';
        connection.query(sql, [test_name, test_description, test_image], (err, testResult) => {
            if (err) {
                console.error('Error inserting test:', err);
                return res.status(500).json({ success: false, message: 'Error adding test' });
            }

            const testId = testResult.insertId;

            const questionData = questions.map((question, index) => [
                question,
                answers[index * 4],
                answers[index * 4 + 1],
                answers[index * 4 + 2],
                answers[index * 4 + 3],
                correct_choices[index],
                testId
            ]);

            const questionSql = 'INSERT INTO questions (question, choice1, choice2, choice3, choice4, correct_choice, test_id) VALUES ?';
            
            connection.query(questionSql, [questionData], (err, questionResult) => {
                if (err) {
                    console.error('Error inserting questions:', err);
                    return res.status(500).json({ success: false, message: 'Error adding questions' });
                }
            
                res.json({ success: true, testId: testId, message: 'Test and questions added successfully' });
            });
        });
    });
});










app.get('/product/:id', (req, res) => {
    const productId = parseInt(req.params.id);
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

app.get('/tests/:id', (req, res) => {
    const testId = parseInt(req.params.id);
    connection.query('SELECT * FROM tests WHERE test_id = ?', [testId], (err, result) => {
        if (err) {
            console.error('Error fetching test: ', err);
            res.status(500).send('Internal Server Error');
        } else if (result.length > 0) {
            res.render('pages/test-detail', { test: result[0] });
        } else {
            res.status(404).send('Test not found');
        }
    });
});



app.get('/tests', (req, res) => {
    const sql = 'SELECT * FROM tests';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tests: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('pages/tests', { tests: results });
    });
});



app.get('/products', (req, res) => {
    connection.query("SELECT * FROM products", (err, result) => {
        if (err) {
            console.error('Error fetching products: ', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('pages/products', { products: result });
        }
    });
});

app.get('/questions/:id', (req, res) => {
    const testId = req.params.id;

    
    connection.query('SELECT * FROM tests WHERE test_id = ?', [testId], (err, testResults) => {
        if (err) {
            console.error('Error fetching test:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (testResults.length === 0) {
            res.status(404).send('Test not found');
            return;
        }

        const test = testResults[0];

        
        connection.query('SELECT * FROM questions WHERE test_id = ?', [testId], (err, questionResults) => {
            if (err) {
                console.error('Error fetching questions:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.render('pages/questions', { test: test, questions: questionResults });
        });
    });
});

app.post('/submit-quiz/:testId', (req, res) => {
    const testId = req.params.testId;
    const userAnswers = req.body; 
    
    connection.query('SELECT * FROM questions WHERE test_id = ?', [testId], (err, questions) => {
        if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).send('Internal Server Error');
        }

        let score = 0;
        questions.forEach((question, index) => {
            const userAnswer = userAnswers[`question${index}`];
            if (userAnswer && parseInt(userAnswer) === question.correct_choice) {
                score++;
            }
        });

        res.render('pages/quiz-results', {
            testId: testId,
            score: score,
            totalQuestions: questions.length,
            userAnswers: userAnswers,
            questions: questions
        });
    });
});





app.get('/', (req, res) => {
    res.render('pages/index');
});


app.get('/quiz', (req, res) => {
    res.render('pages/quiz');
});


app.get('/questions', (req, res) => {
    res.render('pages/questions');
});


app.post('/addTest', (req, res) => {
    const { name, description, image } = req.body;
    const sql = 'INSERT INTO tests (name, description, image) VALUES (?, ?, ?)';
    connection.query(sql, [name, description, image], (err, result) => {
        if (err) {
            console.error('Error adding new test: ', err);
            res.status(500).send('Failed to add new test');
        } else {
            console.log('New test added successfully');
            res.redirect('/tests'); 
        }
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
