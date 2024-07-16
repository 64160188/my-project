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



document.getElementById('lessonForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('/addLessonAndQuestions', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = `/successPage?lessonId=${data.lessonId}`;
        } else {
            document.getElementById('result-container').innerHTML = data.message;
            document.getElementById('result-container').style.display = 'block';
        }
    })
    .catch(error => console.error('Error:', error));
});
