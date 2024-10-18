let questionCount = 1;

function addQuestion() {
    const questionsContainer = document.getElementById('questions-container');
    const questionNumber = questionsContainer.children.length + 1;

    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    questionDiv.setAttribute('data-question-number', questionNumber);

    questionDiv.innerHTML = `
        <label for="question_${questionNumber}">คำถาม ${questionNumber}</label>
        <input type="text" id="question_${questionNumber}" name="questions[]" required>
        <br><br>
        <label>ตัวเลือก:</label><br>
        <input type="text" id="answer_${questionNumber}_1" name="answers[]" required>
        <input type="radio" id="correct_${questionNumber}_1" name="correct_choices[${questionNumber - 1}]" value="1" required>
        <label for="correct_${questionNumber}_1">คำตอบที่ถูกต้อง</label>
        <br><br>
        <input type="text" id="answer_${questionNumber}_2" name="answers[]" required>
        <input type="radio" id="correct_${questionNumber}_2" name="correct_choices[${questionNumber - 1}]" value="2" required>
        <label for="correct_${questionNumber}_2">คำตอบที่ถูกต้อง</label>
        <br><br>
        <input type="text" id="answer_${questionNumber}_3" name="answers[]" required>
        <input type="radio" id="correct_${questionNumber}_3" name="correct_choices[${questionNumber - 1}]" value="3" required>
        <label for="correct_${questionNumber}_3">คำตอบที่ถูกต้อง</label>
        <br><br>
        <input type="text" id="answer_${questionNumber}_4" name="answers[]" required>
        <input type="radio" id="correct_${questionNumber}_4" name="correct_choices[${questionNumber - 1}]" value="4" required>
        <label for="correct_${questionNumber}_4">คำตอบที่ถูกต้อง</label>
        <br><br>
    `;

    questionsContainer.appendChild(questionDiv);
}

document.getElementById('testForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('/addTestAndQuestions', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = `/successPage?testId=${data.testId}`;
            } else {
                document.getElementById('result-container').innerHTML = data.message;
                document.getElementById('result-container').style.display = 'block';
            }
        })
        .catch(error => console.error('Error:', error));
});


function filterCategory(category) {
    const lessonItems = document.querySelectorAll('.lesson-item');
    const cardGame = document.getElementById('cardGame');

    lessonItems.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    if (category === 'card') {
        cardGame.style.display = 'grid';
        document.getElementById('lessonGrid').style.display = 'none';
    } else {
        cardGame.style.display = 'none';
        document.getElementById('lessonGrid').style.display = 'grid';
    }
}


const cards = document.querySelectorAll('.card');
const resultDiv = document.getElementById('result');
let flippedCards = [];
let score = 0;

cards.forEach(card => {
    card.addEventListener('click', () => {
        if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                checkMatch();
            }
        }
    });
});

function checkMatch() {
    const [firstCard, secondCard] = flippedCards;

    if (firstCard.dataset.translation === secondCard.dataset.translation) {
        score++;
        resultDiv.textContent = `Score: ${score}`;
        flippedCards = [];
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}