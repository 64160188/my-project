const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const axios =require('axios');
const {URLSearchParams} = require('url')
const FormData = require('form-data');

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
    saveUninitialized: false,
    cookie: { secure: false }
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
});

const uploadImageTest = multer({
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
    uploadImageTest(req, res, function (err) {
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
    console.log('User in session:', req.session.user);
    const user = req.session.user || null;

    const sql = 'SELECT * FROM tests';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tests: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('pages/tests', { tests: results, user });
    });
});



app.get('/products', (req, res) => {
    const user = req.session.user || null;

    connection.query("SELECT * FROM products", (err, result) => {
        if (err) {
            console.error('Error fetching products: ', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('pages/products', { products: result, user: user });
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
    const sql = 'SELECT title, image FROM lessons';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }

        
        const lessons = results;

        
        res.render('pages/index', { 
            user: req.session.userId, 
            lessons: lessons,
            translation: null, 
            error: null});
    });
});




app.post("/", async (req, res) => {
    const { text, targetLang } = req.body;

    
    const data = new FormData();
    //data.append('source_language', 'en');
    data.append('target_language', 'th');
    data.append('source_language', 'ja');
    //data.append('target_language', targetLang);
    data.append('text', text);

    const options = {
        method: 'POST',
        url: 'https://text-translator2.p.rapidapi.com/translate',
        headers: {
            'x-rapidapi-key': '90c9180ba3msh0d293e3f3103817p1bb520jsn21eceb74e1c8',
            'x-rapidapi-host': 'text-translator2.p.rapidapi.com',
            ...data.getHeaders()
        },
        data: data
    };

    try {
        const response = await axios.request(options);
        const translatedText = response.data.data.translatedText;
        
        
        res.render('pages/index', {
            user: req.session.userId,
            lessons: [],
            translation: translatedText,
            error: null
        });

    } catch (error) {
        console.error('Error fetching translation:', error.message);
        
        res.render('pages/index', {
            user: req.session.userId,
            lessons: lessons,
            translation: null,
            error: "Error fetching data. Please try again."
        });
    }
});



app.get('/characters', (req, res) => {
    const hiraganaQuery = 'SELECT * FROM hiragana_characters';
    connection.query(hiraganaQuery, (err, hiraganaResults) => {
        if (err) throw err;

        const katakanaQuery = 'SELECT * FROM katakana_characters';
        connection.query(katakanaQuery, (err, katakanaResults) => {
            if (err) throw err;

            res.render('pages/characters', {
                hiragana: hiraganaResults,
                katakana: katakanaResults,
                user: req.session.userId
            });
        });
    });
});

app.get('/login', (req, res) => {
    res.render('pages/login', { user: req.session.userId });
});



app.get('/quiz', (req, res) => {
    res.render('pages/quiz');
});


app.get('/questions', (req, res) => {
    res.render('pages/questions');
});

app.get('/sign_up', (req, res) => {
    res.render('pages/sign_up');
});

app.get('/lessons', (req, res) => {
    const sql = 'SELECT * FROM lessons';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching lessons: ', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('pages/lessons', { lessons: results, user: req.session.user });
        }
    });
});


app.get('/lessons/:id', (req, res) => {
    const lessonId = parseInt(req.params.id);
    connection.query('SELECT * FROM lessons WHERE lesson_id = ?', [lessonId], (err, result) => {
        if (err) {
            console.error('Error fetching lesson: ', err);
            res.status(500).send('Internal Server Error');
        } else if (result.length > 0) {
            const tabType = req.query.tab || 'characters';
            res.render('pages/lesson-detail', { lesson: result[0], tab: tabType });
        } else {
            res.status(404).send('Lesson not found');
        }
    });
});



app.get('/lessons/:id/content', (req, res) => {
    const lessonId = parseInt(req.params.id, 10);
    const type = req.query.type;

    let sql;
    let params = [lessonId];

    switch (type) {
        case 'characters':
            sql = 'SELECT * FROM characters WHERE lesson_id = ?';
            break;
        case 'conversation':
            sql = `
                SELECT 
                    c.title AS conversation_title, 
                    l.character_id, 
                    ch.character_name, 
                    l.content, 
                    l.romaji, 
                    l.translation 
                FROM conversations c
                JOIN conversation_lines l ON c.id = l.conversation_id
                JOIN characters ch ON l.character_id = ch.id
                WHERE c.lesson_id = ?
                ORDER BY l.id`;
            break;
        case 'practice':
            sql = 'SELECT * FROM practices WHERE lesson_id = ?';
            break;
        default:
            return res.status(400).send('Invalid tab type');
    }

    connection.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching content: ', err);
            return res.status(500).send('Internal Server Error');
        }

        res.json(results);
    });
});




app.get('/add-lesson', (req, res) => {
    res.render('add-lesson', { user: req.session.user });
});
app.post('/lessons/add', (req, res) => {
    uploadLesson(req, res, (err) => {
        if (err) {
            return res.status(400).send(err.message);
        }

        const { title, description } = req.body;
        const image = req.file ? req.file.filename : 'default.jpg';

        const sql = 'INSERT INTO lessons (title, description, image, created_by) VALUES (?, ?, ?, ?)';
        connection.query(sql, [title, description, image, req.session.userId], (err, result) => {
            if (err) {
                console.error('Error adding lesson:', err);
                return res.status(500).send('Error adding lesson');
            }
            res.redirect('/lessons');
        });
    });
});

app.get('/vocab', (req, rexs) => {
    const sql = 'SELECT `id`, `japanese_word`, `reading`, `translation`, `image` FROM `vocab`';
    
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching vocabularies: ', err);
            return res.status(500).send('Internal Server Error');
        }

        
        res.render('pages/vocab', { vocabularies: results ,user: req.session.userId});
    });
});

app.get('/vocab-game', (req, res) => {
    const query = 'SELECT * FROM vocab';
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching vocab');
        }

        
        if (results.length < 2) {
            return res.status(400).send('Not enough vocab entries');
        }

        
        const correctVocab = results[Math.floor(Math.random() * results.length)];
        let randomVocab;
        do {
            randomVocab = results[Math.floor(Math.random() * results.length)];
        } while (randomVocab.id === correctVocab.id);

        
        res.render('pages/vocab-game', { correctVocab, randomVocab, user: req.session.userId });
    });
});



/*
app.get('/cardmatc', (req, res) => {
    const sql = 'SELECT `id`, `japanese_word`, `reading`, `translation`, `image` FROM `vocab`';
    
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching vocabularies: ', err);
            return res.status(500).send('Internal Server Error');
        }

        
        res.render('pages/cardmatc', { vocabularies: results ,user: req.session.userId});
    });
});
*/




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














app.get('/login', (req, res) => {
    const user = req.session.user || null;
    res.render('pages/login', { user: user });
});



app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    connection.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error querying user:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).send('Internal Server Error');
                }

                if (isMatch) {
                    req.session.userId = user.id;
                    req.session.user = user; 
                    return res.redirect('/');
                } else {
                    return res.status(401).send('Incorrect password');
                }
            });
        } else {
            return res.status(404).send('User not found'); 
        }
    });
});


function checkLogin(req, res, next) {
    if (req.cookies.user_sid && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', checkLogin, (req, res) => {
    res.send('/index');
});

app.get('/tests', checkLogin, (req, res) => {
    res.send('/tests');
});



app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    
    if (!username || !email || !password) {
        return res.status(400).send('Please provide all required fields: username, email, and password');
    }

    
    const checkSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    connection.query(checkSql, [username, email], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Error checking user');
        }

        if (results.length > 0) {
            return res.status(400).send('Username or email already in use');
        }

        
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Error signing up');
            }

            
            const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
            const values = [username, email, hashedPassword, 'student'];

            connection.query(sql, values, (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).send('Error signing up');
                }

                
                req.session.userId = result.insertId;
                res.redirect('/complete-profile');
            });
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});


app.get('/complete-profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/signup');
    }
    res.render('pages/complete-profile');
});



app.post('/complete-profile', (req, res) => {
    const { address, phone } = req.body;
    const userId = req.session.userId;

    if (!address || !phone) {
        return res.status(400).send('Please provide all required information');
    }

    const sql = 'UPDATE users SET address = ?, phone = ? WHERE id = ?';
    connection.query(sql, [address, phone, userId], (err, result) => {
        if (err) {
            console.error('Error updating user profile:', err);
            return res.status(500).send('Error updating profile');
        }
        res.redirect('/profile');
    });
});

app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});




app.get('/profile', (req, res) => {
    const userId = req.session.userId; 
    if (!userId) {
        return res.redirect('/login');
    }

    connection.query('SELECT * FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Database query error');
        }
        if (result.length === 0) {
            return res.status(404).send('User not found');
        }
        res.render('pages/profile', { user: result[0] });
    });
});

app.post('/update-profile', upload.single('profile_pic'), (req, res) => {
    const userId = req.session.userId;
    const { username, email } = req.body;
    let profilePicture = req.file ? `${req.file.filename}` : null;

    connection.query('SELECT profile_picture FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching current profile picture:', err);
            return res.status(500).send('Error fetching current profile picture');
        }

        if (!profilePicture) {
            profilePicture = results[0].profile_picture;
        }

        
        connection.query('UPDATE users SET username = ?, email = ?, profile_picture = ? WHERE id = ?',
            [username, email, profilePicture, userId], (err, result) => {
                if (err) {
                    console.error('Database update error:', err);
                    return res.status(500).send('Database update error');
                }
                res.redirect('/profile');
            });
    });
});





app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
