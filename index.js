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
const axios = require('axios');
const { URLSearchParams } = require('url')
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
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));


const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: function (req, file, cb) {
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
    limits: { fileSize: 1 * 1024 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

const uploadImageTest = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('test_image');


const uploadImageCard = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb); // ตรวจสอบประเภทไฟล์ที่อนุญาต
    }
}).fields([
    { name: 'card_image', maxCount: 1 }, // รับไฟล์รูปภาพการ์ด
    { name: 'vocab[0][image]', maxCount: 1 }, // รับไฟล์รูปภาพคำศัพท์
    { name: 'vocab[1][image]', maxCount: 1 }, // เพิ่มรูปภาพคำศัพท์เพิ่มเติม
    // สามารถเพิ่ม field ตามจำนวนคำศัพท์ที่ต้องการ
]);



const uploadImageLesson = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('lesson_image');



app.get('/add-test', checkLogin, (req, res) => {
    res.render('pages/add-test', { user: req.session.user });
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
            res.render('pages/test-detail', { test: result[0] ,user: req.session.user});
        } else {
            res.status(404).send('Test not found');
        }
    });
});






app.get('/tests', (req, res) => {
    console.log('User in session:', req.session.user);
    const user = req.session.user || null;


    const sqlTests = 'SELECT * FROM tests';
    connection.query(sqlTests, (err, testResults) => {
        if (err) {
            console.error('Error fetching tests: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }


        const sqlCards = 'SELECT * FROM card';
        connection.query(sqlCards, (err, cardResults) => {
            if (err) {
                console.error('Error fetching cards: ', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.render('pages/tests', { tests: testResults, cards: cardResults, user });
        });
    });
});



app.get('/card/:id', (req, res) => {
    const cardId = req.params.id;

    const sqlCardDetail = 'SELECT * FROM card WHERE card_id = ?';
    connection.query(sqlCardDetail, [cardId], (err, cardResults) => {
        if (err) {
            console.error('Error fetching card details: ', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (cardResults.length === 0) {
            return res.status(404).send('Card not found');
        }

        const card = cardResults[0];

        const sqlVocabDetail = 'SELECT * FROM vocab WHERE card_id = ?';
        connection.query(sqlVocabDetail, [cardId], (err, vocabResults) => {
            if (err) {
                console.error('Error fetching vocab details: ', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.render('pages/card-detail', { card, vocab: vocabResults });
        });
    });
});

app.get('/vocab-game/:card_id', (req, res) => {
    const cardId = req.params.card_id; // Get the card_id from the URL
    const query = 'SELECT * FROM vocab WHERE card_id = ?'; // Query to fetch the vocab based on card_id

    // Fetch the correct vocab using the card_id
    connection.query(query, [cardId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching vocab');
        }

        if (results.length === 0) {
            return res.status(404).send('Vocab not found'); // This occurs if no vocab is associated with the card_id
        }

        const correctVocab = results[Math.floor(Math.random() * results.length)]; // Get a random vocab

        // Fetch remaining vocab for random selection (excluding the correct vocab)
        const remainingQuery = 'SELECT * FROM vocab WHERE card_id = ? AND id != ?'; // Exclude the correct vocab
        connection.query(remainingQuery, [cardId, correctVocab.id], (err, remainingResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching remaining vocab');
            }

            if (remainingResults.length === 0) {
                return res.render('pages/score-summary', { score: req.session.score });
            }

            let randomVocab;
            do {
                randomVocab = remainingResults[Math.floor(Math.random() * remainingResults.length)];
            } while (randomVocab.id === correctVocab.id);

            res.render('pages/vocab-game', { correctVocab, randomVocab, user: req.session.userId, user: req.session.user });
        });
    });
});



app.get('/add-card', checkLogin, (req, res) => {
    console.log('User in session:', req.session.user);
    const user = req.session.user || null;

    res.render('pages/add-card', { user });
});



app.post('/add-card', uploadImageCard, (req, res) => {
    const { card_name, card_description, vocab } = req.body;
    const cardImage = req.files['card_image'] ? req.files['card_image'][0].filename : 'default.jpg';

    console.log("Card Name:", card_name);
    console.log("Card Description:", card_description);
    console.log("Vocab:", vocab); // ตรวจสอบคำศัพท์ที่ถูกส่งมา
    console.log("Files:", req.files); // ตรวจสอบไฟล์ที่ถูกส่งมา

    const sqlInsertCard = "INSERT INTO card (card_name, card_description, image) VALUES (?, ?, ?)";

    connection.beginTransaction((err) => {
        if (err) { throw err; }

        connection.query(sqlInsertCard, [card_name, card_description, cardImage], (err, result) => {
            if (err) {
                return connection.rollback(() => {
                    console.error("Error inserting card:", err);
                    res.status(500).json({ success: false, message: "Error inserting card" });
                });
            }

            const cardId = result.insertId;

            if (Array.isArray(vocab) && vocab.length > 0) {
                const vocabInsertQueries = vocab.map((word, index) => {
                    const vocabImage = req.files[`vocab[${index}][image]`] ? req.files[`vocab[${index}][image]`][0].filename : 'default.jpg';

                    const sqlInsertVocab = "INSERT INTO vocab (japanese_word, reading, translation, image, card_id) VALUES (?, ?, ?, ?, ?)";
                    console.log(`Inserting vocab: ${JSON.stringify(word)} with image: ${vocabImage}`);

                    return new Promise((resolve, reject) => {
                        connection.query(sqlInsertVocab, [word['japanese_word'], word['reading'], word['translation'], vocabImage, cardId], (err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(vocabInsertQueries).then(() => {
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error("Transaction commit failed:", err);
                                res.status(500).json({ success: false, message: "Transaction commit failed" });
                            });
                        }
                        res.json({ success: true, message: "Card and vocab added successfully!" });
                    });
                }).catch((err) => {
                    return connection.rollback(() => {
                        console.error("Error inserting vocab:", err);
                        res.status(500).json({ success: false, message: "Error inserting vocab" });
                    });
                });
            } else {
                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error("Transaction commit failed:", err);
                            res.status(500).json({ success: false, message: "Transaction commit failed" });
                        });
                    }
                    res.json({ success: true, message: "Card added successfully without vocab!" });
                });
            }
        });
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
            user: req.session.user,
            lessons: lessons,
            translation: null,
            error: null
        });
    });
});




app.post("/", async (req, res) => {

    const sql = 'SELECT title, image FROM lessons';

    connection.query(sql, async (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Internal Server Error');
        }

        const lessons = results;

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
                lessons: lessons,
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
                user: req.session.userId,
                user: req.session.user
            });
        });
    });
});

app.get('/login', (req, res) => {
    res.render('pages/login', { user: req.session.userId });
});



app.get('/questions', (req, res) => {
    res.render('pages/questions');
});

app.get('/sign_up', (req, res) => {
    res.render('pages/sign_up', { user: req.session.userId });
});


app.get('/lessons', (req, res) => {
    const sql = 'SELECT * FROM lessons';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching lessons:', err);
            res.status(500).send('Error fetching lessons from the database');
        } else {
            res.render('pages/lessons', { lessons: results, user: req.session.user });
        }
    });
});


app.get('/lessons/:id', (req, res) => {
    const lessonId = parseInt(req.params.id, 10);
    if (isNaN(lessonId)) {
        return res.status(400).send('Invalid lesson ID');
    }

    const lessonQuery = 'SELECT * FROM lessons WHERE lesson_id = ?';
    connection.query(lessonQuery, [lessonId], (err, lessonResults) => {
        if (err || lessonResults.length === 0) {
            console.error('Error fetching lesson:', err);
            return res.status(500).send('Error fetching lesson');
        }

        const lesson = lessonResults[0];

        const charactersQuery = 'SELECT * FROM characters WHERE lesson_id = ?';
        connection.query(charactersQuery, [lessonId], (err, characterResults) => {
            if (err) {
                console.error('Error fetching characters:', err);
                return res.status(500).send('Error fetching characters');
            }

            const conversationQuery = `
                SELECT * FROM conversation_lines 
                WHERE lesson_id = ?
                ORDER BY line_number
            `;
            connection.query(conversationQuery, [lessonId], (err, conversationResults) => {
                if (err) {
                    console.error('Error fetching conversation lines:', err);
                    return res.status(500).send('Error fetching conversation lines');
                }

                const dragAndDropQuery = `
                    SELECT * FROM drag_and_drop_questions 
                    WHERE lesson_id = ?
                `;
                connection.query(dragAndDropQuery, [lessonId], (err, dragAndDropResults) => {
                    if (err) {
                        console.error('Error fetching Drag and Drop questions:', err);
                        return res.status(500).send('Error fetching Drag and Drop questions');
                    }

                    const hasGame = dragAndDropResults.length > 0;

                    res.render('pages/lesson-detail', {
                        lesson,
                        user: req.session.user,
                        characters: characterResults,
                        conversationLines: conversationResults,
                        hasGame,
                    });
                });
            });
        });
    });
});



app.get('/lessons/:id/content', (req, res) => {
    const lessonId = parseInt(req.params.id, 10);
    const type = req.query.type;

    if (isNaN(lessonId)) {
        return res.status(400).send('Invalid lesson ID');
    }

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
                ORDER BY l.line_number`;
            break;
        case 'practice':
            sql = 'SELECT * FROM practices WHERE lesson_id = ?';
            break;
        default:
            return res.status(400).send('Invalid tab type');
    }

    connection.query(sql, params, (err, results) => {
        if (err) {
            console.error(`Error fetching ${type} content:`, err);
            return res.status(500).send(`Error fetching ${type} content`);
        }

        res.json(results);
    });
});



app.get('/add-lesson', checkLogin, (req, res) => {
    res.render('pages/add-lesson', { user: req.session.user });
});



app.post('/add-lesson', uploadImageLesson, async (req, res) => {

    const { title, description, characters, conversations } = req.body;
    const lessonImage = req.file ? `${req.file.filename}` : 'default.jpg';
    const created_by = req.session.user.id;

    // SQL Query to Insert Lesson Data
    const lessonQuery = 'INSERT INTO lessons (title, description, image, created_by) VALUES (?, ?, ?, ?)';

    try {
        const lessonResult = await new Promise((resolve, reject) => {
            connection.query(lessonQuery, [title, description, lessonImage, created_by], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });

        const lessonId = lessonResult.insertId;

        // Insert Characters and save their IDs
        const characterPromises = characters.map((character) => {
            const characterQuery = 'INSERT INTO characters (lesson_id, character_name, description, created_by) VALUES (?, ?, ?, ?)';
            return new Promise((resolve, reject) => {
                connection.query(characterQuery, [lessonId, character.character_name, character.description, created_by], (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result.insertId); // Return the character ID
                });
            });
        });

        // Wait for all character inserts to complete and get their IDs
        const characterIds = await Promise.all(characterPromises);

        // Insert Conversations
        const conversationPromises = conversations.map((conversation, conversationIndex) => {
            // Get left dialogues
            const leftDialogues = conversation.left_text || [];
            const rightDialogues = conversation.right_text || [];
            let lineNumber = 1;  // สำหรับทั้ง left และ right dialogues

            leftDialogues.forEach((text, index) => {
                const leftRomaji = conversation.left_romaji[index];
                const leftTranslation = conversation.left_translation[index];
                const characterId = characterIds[0]; // Assume first character for left dialogue

                const conversationLineQuery = 'INSERT INTO conversation_lines (character_id, line_number, content, romaji, translation, lesson_id) VALUES (?, ?, ?, ?, ?, ?)';
                connection.query(conversationLineQuery, [characterId, lineNumber++, text, leftRomaji, leftTranslation, lessonId], (err) => {
                    if (err) console.error(err);
                });
            });

            rightDialogues.forEach((text, index) => {
                const rightRomaji = conversation.right_romaji[index];
                const rightTranslation = conversation.right_translation[index];
                const characterId = characterIds[1]; // Assume second character for right dialogue

                const conversationLineQuery = 'INSERT INTO conversation_lines (character_id, line_number, content, romaji, translation, lesson_id) VALUES (?, ?, ?, ?, ?, ?)';
                connection.query(conversationLineQuery, [characterId, lineNumber++, text, rightRomaji, rightTranslation, lessonId], (err) => {
                    if (err) console.error(err);
                });
            });

        });

        // Wait for all conversation inserts to complete
        await Promise.all(conversationPromises);

        // ส่ง lessonId กลับไปยัง client เพื่อใช้ในการ redirect
        res.json({ success: true, message: 'Lesson added successfully!', lessonId: lessonId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});






app.get('/DragandDropGame/:lesson_id', (req, res) => {
    const lessonId = req.params.lesson_id;
    console.log("Lesson ID:", lessonId);

    res.render('pages/DragandDropGame', { user: req.session.userId, lessonId: lessonId });
});



app.get('/drag-and-drop-game/:lesson_id', (req, res) => {
    const lessonId = req.params.lesson_id;
    console.log("Lesson ID:", lessonId);

    const questionsQuery = 'SELECT * FROM drag_and_drop_questions WHERE lesson_id = ?';
    const answersQuery = 'SELECT * FROM drag_and_drop_answers WHERE topic_id = ?';

    connection.query(questionsQuery, [lessonId], (err, questions) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (questions.length > 0) {
            const topicId = questions[0].topic_id;

            connection.query(answersQuery, [topicId], (err, answers) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({ questions, answers });
            });
        } else {
            res.json({ questions: [], answers: [] });
        }
    });
});



app.get('/add-dad', (req, res) => {
    const lessonId = req.query.lesson_id;
    const topicId = req.query.topic_id;
    console.log('Lesson ID:', lessonId);
    console.log('Lesson ID:', lessonId);
    res.render('pages/add-dad', { lesson_id: lessonId, topic_id: topicId });
});

app.post('/add-question', (req, res) => {
    console.log(req.body); // ตรวจสอบว่า req.body มีค่าอะไรบ้าง
    const { lessonId, sentence, answers, correct_answer } = req.body;

    // ตรวจสอบค่าที่สำคัญ
    console.log('lessonId:', lessonId);
    console.log('sentence:', sentence);
    console.log('answers:', answers);
    console.log('correct_answer:', correct_answer);

    if (!lessonId || !sentence || !answers || answers.length < 1 || correct_answer === undefined) {
        return res.status(400).json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' });
    }

    console.log(`Adding question for lesson ID: ${lessonId}`);

    connection.beginTransaction((err) => {
        if (err) {
            console.log('Error starting transaction:', err);
            return res.status(500).json({ success: false, error: 'ไม่สามารถเริ่มการทำธุรกรรมได้' });
        }

        // คิวรีเพื่อหาค่า Topic ID ล่าสุด
        const getLatestTopicIdQuery = 'SELECT MAX(id) AS latestTopicId FROM drag_and_drop_questions';
        connection.query(getLatestTopicIdQuery, (err, results) => {
            if (err) {
                return connection.rollback(() => res.status(500).json({ success: false, error: err.message }));
            }

            const newTopicId = (results[0].latestTopicId || 0) + 1; // new topic id

            // คิวรีเพื่อเพิ่มคำถาม
            const insertQuestionQuery = 'INSERT INTO drag_and_drop_questions (lesson_id, sentence, topic_id) VALUES (?, ?, ?)';
            connection.query(insertQuestionQuery, [lessonId, sentence, newTopicId], (err, result) => {
                if (err) {
                    return connection.rollback(() => res.status(500).json({ success: false, error: err.message }));
                }

                const questionId = result.insertId; // ไอดีของคำถามใหม่
                let correctAnswerId = null; // ไอดีของคำตอบที่ถูกต้อง

                // สร้างคำสัญญาสำหรับการเพิ่มคำตอบ
                const insertAnswerPromises = answers.map((answer, index) => {
                    return new Promise((resolve, reject) => {
                        const insertAnswerQuery = 'INSERT INTO drag_and_drop_answers (answer, topic_id) VALUES (?, ?)';
                        connection.query(insertAnswerQuery, [answer, newTopicId], (err, result) => {
                            if (err) return reject(err);

                            if (index === parseInt(correct_answer)) { // เปลี่ยนแปลงที่นี่
                                correctAnswerId = result.insertId; // ถ้าคำตอบเป็นคำตอบที่ถูกต้องให้เก็บไอดีไว้
                            }
                            resolve();
                        });
                    });
                });

                Promise.all(insertAnswerPromises)
                    .then(() => {
                        console.log('All answers inserted. Correct answer ID:', correctAnswerId); // เช็คค่าที่นี่

                        // อัพเดทคำถามให้มี correct_answer_id
                        const updateQuestionQuery = 'UPDATE drag_and_drop_questions SET correct_answer_id = ? WHERE id = ?';
                        connection.query(updateQuestionQuery, [correctAnswerId, questionId], (err) => {
                            if (err) return connection.rollback(() => res.status(500).json({ success: false, error: err.message }));

                            connection.commit((err) => {
                                if (err) return connection.rollback(() => res.status(500).json({ success: false, error: err.message }));
                                res.json({ success: true }); // ส่งค่ากลับเมื่อสำเร็จ
                            });
                        });
                    })
                    .catch(err => {
                        console.log('Error inserting answers:', err);
                        connection.rollback(() => res.status(500).json({ success: false, error: err.message }));
                    });
            });
        });
    });
});








app.get('/get-answers', (req, res) => {
    const query = 'SELECT id, answer FROM drag_and_drop_answers'; // ดึงข้อมูลคำตอบจากฐานข้อมูล
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});



/*
app.get('/card-detail/:id', (req, rexs) => {
    const vocabId = req.params.id;

    const sql = 'SELECT `id`, `japanese_word`, `reading`, `translation`, `image` FROM `vocab` WHERE `id` = ?'; // ใช้ WHERE เพื่อเลือกเฉพาะ id ที่ตรงกัน
    connection.query(sql, [vocabId], (err, results) => {
        if (err) {
            console.error('Error fetching vocabularies: ', err);
            return rexs.status(500).send('Internal Server Error');
        }

        
        if (results.length === 0) {
            return rexs.status(404).send('Vocabulary not found');
        }

        const vocab = results[0];
        rexs.render('pages/card-detail', { vocab, user: req.session.userId });
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
*/
////////////

app.get('/vocab', (req, res) => { // ตรวจสอบว่าใช้ 'res' ที่นี่
    const sql = 'SELECT `id`, `japanese_word`, `reading`, `translation`, `image` FROM `vocab`';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching vocabularies: ', err);
            return res.status(500).send('Internal Server Error'); // ใช้ 'res' ที่นี่
        }

        // ส่งข้อมูลไปยัง EJS Template
        res.render('pages/vocab', { vocabularies: results, user: req.session.userId });
    });
});

app.get('/vocab-game', (req, res) => {
    const query = 'SELECT * FROM vocab';
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching vocab');
        }

        if (req.session.vocabList) {
            if (req.session.vocabList.length === 0) {
                return res.render('pages/score-summary', { score: req.session.score });
            }
        } else {
            req.session.vocabList = results.slice();
            req.session.score = 0;
        }

        const randomIndex = Math.floor(Math.random() * req.session.vocabList.length);
        const correctVocab = req.session.vocabList[randomIndex];

        req.session.vocabList.splice(randomIndex, 1);
        let randomVocab;
        do {
            randomVocab = req.session.vocabList[Math.floor(Math.random() * req.session.vocabList.length)];
        } while (randomVocab.id === correctVocab.id);

        res.render('pages/vocab-game', { correctVocab, randomVocab, user: req.session.userId });
    });
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
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}


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
                res.redirect('/');
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


app.delete('/delete-profile', checkLogin, async (req, res) => {
    try {
        const userId = req.session.userId; // รับ id ของผู้ใช้งานจาก session

        // ลบผู้ใช้งานจากฐานข้อมูล
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);

        // เคลียร์ session เพื่อออกจากระบบ
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error logging out' });
            }
            res.clearCookie('userId');
            res.json({ success: true, message: 'Profile deleted' });
        });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ success: false, message: 'Error deleting profile' });
    }
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});