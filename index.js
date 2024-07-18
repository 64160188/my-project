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
    destination: path.join(__dirname, 'public/uploads'), // Update destination folder here
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


// ตรวจสอบประเภทไฟล์
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

// ตั้งค่า Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('lesson_image');

// Routes
app.get('/add-lesson', (req, res) => {
    res.render('pages/add-lesson');
});


app.post('/addLessonAndQuestions', (req, res) => {
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

        const { lesson_name, lesson_description } = req.body;
        const lesson_image = req.file ? req.file.filename : 'default.jpg';

        const sql = 'INSERT INTO Lessons (name, description, image) VALUES (?, ?, ?)';
        connection.query(sql, [lesson_name, lesson_description, lesson_image], (err, lessonResult) => {
            if (err) {
                console.error('Error inserting lesson:', err);
                return res.status(500).json({ success: false, message: 'Error adding lesson' });
            }

            const lessonId = lessonResult.insertId; // แก้ lessonResult เป็น result ที่ได้จาก callback ของ query


            
            // Prepare questions data
            const questions = req.body.questions;
            const answers = req.body.answers;
            const correctChoices = req.body.correct_choices;
            
            const questionData = questions.map((question, index) => [
                question,
                answers[index * 4],
                answers[index * 4 + 1],
                answers[index * 4 + 2],
                answers[index * 4 + 3],
                correctChoices[index],
                lessonId
            ]);
            
            const questionSql = 'INSERT INTO questions (question, choice1, choice2, choice3, choice4, correct_choice, lesson_id) VALUES ?';
            
            // Insert questions into database
            connection.query(questionSql, [questionData], (err, questionResult) => {
                if (err) {
                    console.error('Error inserting questions:', err);
                    return res.status(500).json({ success: false, message: 'Error adding questions' });
                }
            
                res.json({ success: true, lessonId: lessonId, message: 'Lesson and questions added successfully' });
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


app.get('/lessons/:id', (req, res) => {
    const lessonId = parseInt(req.params.id);
    connection.query('SELECT * FROM Lessons WHERE lesson_id = ?', [lessonId], (err, result) => {
        if (err) {
            console.error('Error fetching lesson: ', err);
            res.status(500).send('Internal Server Error');
        } else if (result.length > 0) {
            res.render('pages/lesson-detail', { lesson: result[0] });
        } else {
            res.status(404).send('Lesson not found');
        }
    });
});


app.get('/lessons', (req, res) => {
    const sql = 'SELECT * FROM Lessons';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching lessons: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('pages/lessons', { lessons: results });
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
    const lessonId = req.params.id;

    connection.query('SELECT * FROM lessons WHERE lesson_id = ?', [lessonId], (err, lessonResults) => {
        if (err) {
            console.error('Error fetching lesson:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (lessonResults.length === 0) {
            res.status(404).send('Lesson not found');
            return;
        }

        const lesson = lessonResults[0];

        connection.query('SELECT * FROM questions WHERE lesson_id = ?', [lessonId], (err, questionResults) => {
            if (err) {
                console.error('Error fetching questions:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.render('pages/questions', { lesson: lesson, questions: questionResults });
        });
    });
});





// Example route to render the homepage
app.get('/', (req, res) => {
    res.render('pages/index');
});

// Example route to render the quiz page
app.get('/quiz', (req, res) => {
    res.render('pages/quiz');
});

// Example route to render the questions page
app.get('/questions', (req, res) => {
    res.render('pages/questions');
});

// Example route to handle POST request to add a new lesson
app.post('/addLesson', (req, res) => {
    const { name, description, image } = req.body;
    const sql = 'INSERT INTO Lessons (name, description, image_url) VALUES (?, ?, ?)';
    connection.query(sql, [name, description, image], (err, result) => {
        if (err) {
            console.error('Error adding new lesson: ', err);
            res.status(500).send('Failed to add new lesson');
        } else {
            console.log('New lesson added successfully');
            res.redirect('/lessons'); // Redirect back to lessons page or wherever appropriate
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
