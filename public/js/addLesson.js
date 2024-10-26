let conversationIndex = 0; // ตัวแปรเก็บดัชนีบทสนทนา
let lineNumber = 1; // เริ่มจาก 1 สำหรับ Line Number

document.getElementById('add-conversation').addEventListener('click', function () {
    const conversationsDiv = document.getElementById('conversations');

    // Create a new dialogue section
    const newDialogueSection = document.createElement('div');
    newDialogueSection.className = 'dialogue-section';

    newDialogueSection.innerHTML = `
    <div class="left-character-dialogues">
        <h3>Left Character (${conversationIndex + 1})</h3>
        <div class="left-dialogue">
            <label for="left-dialogue">Japanese:</label>
            <textarea name="conversations[${conversationIndex}][left_text][]" rows="2" required
                aria-label="Japanese Dialogue"></textarea><br><br>

            <label for="left-dialogue-romaji">Romaji:</label>
            <input type="text" name="conversations[${conversationIndex}][left_romaji][]" required
                aria-label="Romaji Dialogue"><br><br>

            <label for="left-dialogue-translation">Translation:</label>
            <textarea name="conversations[${conversationIndex}][left_translation][]" rows="2" required
                aria-label="Translation"></textarea><br><br>

            <label for="line-number-left">Line Number:</label>
            <input type="number" name="conversations[${conversationIndex}][line_number_left][]" value="${lineNumber}" readonly>
        </div>
    </div>
    <button type="button" class="add-left-dialogue">Add Left Dialogue</button>

    <div class="right-character-dialogues">
        <h3>Right Character (${conversationIndex + 1})</h3>
        <div class="right-dialogue">
            <label for="right-dialogue">Japanese:</label>
            <textarea name="conversations[${conversationIndex}][right_text][]" rows="2" required
                aria-label="Japanese Dialogue"></textarea><br><br>

            <label for="right-dialogue-romaji">Romaji:</label>
            <input type="text" name="conversations[${conversationIndex}][right_romaji][]" required
                aria-label="Romaji Dialogue"><br><br>

            <label for="right-dialogue-translation">Translation:</label>
            <textarea name="conversations[${conversationIndex}][right_translation][]" rows="2" required
                aria-label="Translation"></textarea><br><br>

            <label for="line-number-right">Line Number:</label>
            <input type="number" name="conversations[${conversationIndex}][line_number_right][]" value="${lineNumber + 1}" readonly>
        </div>
    </div>
    <button type="button" class="add-right-dialogue">Add Right Dialogue</button>
    `;

    conversationsDiv.appendChild(newDialogueSection);
    conversationIndex++; // เพิ่มดัชนีบทสนทนาทุกครั้งที่เพิ่มบทสนทนา
    lineNumber += 2; // เพิ่ม lineNumber ทุกครั้งที่เพิ่มบทสนทนา
});


// Update line number function
function updateLineNumber(index, side) {
    const leftJapanese = document.querySelector(`textarea[name="conversations[${index}][left_text][]"]`).value;
    const leftRomaji = document.querySelector(`input[name="conversations[${index}][left_romaji][]"]`).value;
    const leftTranslation = document.querySelector(`textarea[name="conversations[${index}][left_translation][]"]`).value;

    const rightJapanese = document.querySelector(`textarea[name="conversations[${index}][right_text][]"]`).value;
    const rightRomaji = document.querySelector(`input[name="conversations[${index}][right_romaji][]"]`).value;
    const rightTranslation = document.querySelector(`textarea[name="conversations[${index}][right_translation][]"]`).value;

    if (side === 'left') {
        const lineNumberInput = document.querySelector(`input[name="conversations[${index}][line_number][]"]`);
        lineNumberInput.value = leftJapanese ? leftJapanese : leftRomaji ? leftRomaji : leftTranslation ? leftTranslation : '';
    } else if (side === 'right') {
        const lineNumberInput = document.querySelector(`input[name="conversations[${index}][line_number][]"]`);
        lineNumberInput.value = rightJapanese ? rightJapanese : rightRomaji ? rightRomaji : rightTranslation ? rightTranslation : '';
    }
}

// Additional logging for debugging left and right dialogues
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('add-left-dialogue')) {
        console.log('Adding left dialogue...');
        const leftDialogue = document.createElement('div');
        leftDialogue.classList.add('left-dialogue');
        leftDialogue.innerHTML = `
<label for="left-dialogue">Japanese:</label>
<textarea name="conversations[${conversationIndex - 1}][left_text][]" rows="2" required></textarea><br><br>

<label for="left-dialogue-romaji">Romaji:</label>
<input type="text" name="conversations[${conversationIndex - 1}][left_romaji][]" required><br><br>

<label for="left-dialogue-translation">Translation:</label>
<textarea name="conversations[${conversationIndex - 1}][left_translation][]" rows="2" required></textarea><br><br>

<label for="line-number">Line Number:</label>
<input type="number" name="conversations[${conversationIndex - 1}][line_number][]" value="${lineNumber - 2}" readonly>
`;
// แทรก left dialogue ใหม่ใน div ที่เหมาะสม
event.target.previousElementSibling.appendChild(leftDialogue);
    } else if (event.target.classList.contains('add-right-dialogue')) {
        console.log('Adding right dialogue...');
        const rightDialogue = document.createElement('div');
        rightDialogue.classList.add('right-dialogue');
        rightDialogue.innerHTML = `
<label for="right-dialogue">Japanese:</label>
<textarea name="conversations[${conversationIndex - 1}][right_text][]" rows="2" required></textarea><br><br>

<label for="right-dialogue-romaji">Romaji:</label>
<input type="text" name="conversations[${conversationIndex - 1}][right_romaji][]" required><br><br>

<label for="right-dialogue-translation">Translation:</label>
<textarea name="conversations[${conversationIndex - 1}][right_translation][]" rows="2" required></textarea><br><br>

<label for="line-number">Line Number:</label>
<input type="number" name="conversations[${conversationIndex - 1}][line_number][]" value="${lineNumber - 1}" readonly>
`;
// แทรก right dialogue ใหม่ใน div ที่เหมาะสม
event.target.previousElementSibling.appendChild(rightDialogue);
    }
});


// Handle game buttons
document.getElementById('addGameYes').addEventListener('click', function () {
    const lessonForm = document.getElementById('lessonForm');

    lessonForm.addEventListener('submit', function (event) {
        event.preventDefault();
        fetch(lessonForm.action, {
            method: 'POST',
            body: new FormData(lessonForm),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `/add-dad?lesson_id=${data.lessonId}`;
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

    lessonForm.dispatchEvent(new Event('submit'));
});

document.getElementById('addGameNo').addEventListener('click', function () {
    document.getElementById('submit-btn').style.display = 'block';
});


function addDragAndDropGame(lessonId) {
    alert(`Lesson ID: ${lessonId}. Proceed to add Drag and Drop Game.`);

    // Example: window.location.href = `/add_drag_and_drop_game?lesson_id=${lessonId}`;
}


document.getElementById('addGameNo').addEventListener('click', function () {
    document.getElementById('submit-btn').style.display = 'block';
});

document.getElementById('submit-btn').addEventListener('click', function () {
    document.getElementById('lessonForm').submit();
});















let answerCount = 2;

function addAnswer() {
    const newAnswerItem = document.createElement('div');
    newAnswerItem.classList.add('answer-item');
    newAnswerItem.innerHTML = `
        <label for="answer${answerCount + 1}">Answer ${answerCount + 1}:</label>
        <input type="text" id="answer${answerCount + 1}" name="answers[]" required>
        <input type="radio" name="correct_answer" value="${answerCount}"> Correct
    `;
    document.getElementById('answers').appendChild(newAnswerItem);
    answerCount++;
}

function getLessonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lesson_id');
}

window.onload = function () {
    const lessonId = getLessonIdFromUrl();
    if (lessonId) {
        document.getElementById('lessonIdText').innerText = lessonId;

        document.getElementById('dragDropForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const sentence = document.getElementById('sentence').value;
            const answers = Array.from(document.querySelectorAll('input[name="answers[]"]')).map(input => input.value);
            const correctAnswer = document.querySelector('input[name="correct_answer"]:checked').value;

            fetch('/add-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lessonId, sentence, topicId: lessonId, answers, correct_answer: correctAnswer }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('เพิ่มคำถามสำเร็จ');
                        document.getElementById('dragDropForm').reset();
                        answerCount = 2;
                        document.getElementById('answers').innerHTML = `
                        <div class="answer-item">
                            <label for="answer1">Answer 1:</label>
                            <input type="text" id="answer1" name="answers[]" required>
                            <input type="radio" name="correct_answer" value="0" required> Correct
                        </div>
                        <div class="answer-item">
                            <label for="answer2">Answer 2:</label>
                            <input type="text" id="answer2" name="answers[]" required>
                            <input type="radio" name="correct_answer" value="1"> Correct
                        </div>
                    `;
                    } else {
                        alert('เกิดข้อผิดพลาด: ' + data.error);
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    } else {
        document.getElementById('lessonIdText').innerText = 'ไม่พบ lesson_id';
        console.log('ไม่พบ lesson_id ใน URL');
    }
}