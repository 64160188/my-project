// public/js/form-script.js

let questionCount = 0;

function addQuestion() {
    questionCount++;
    const questionContainer = document.createElement('div');
    questionContainer.className = 'question';
    questionContainer.id = `question-${questionCount}`;
    
    questionContainer.innerHTML = `
        <button type="button" class="remove-question" onclick="removeQuestion(${questionCount})">Remove Question</button>
        <div class="form-group">
            <label for="question-${questionCount}-text">Question ${questionCount}</label>
            <input type="text" id="question-${questionCount}-text" name="question-${questionCount}-text" placeholder="Enter your question" required>
        </div>
        <div id="question-${questionCount}-choices" class="choices">
            <div class="choice-group">
                <input type="text" name="question-${questionCount}-choice-1" placeholder="Choice 1" required>
                <button type="button" onclick="addChoice(${questionCount})">Add Choice</button>
            </div>
        </div>
    `;
    
    document.getElementById('questions-container').appendChild(questionContainer);
}

function removeQuestion(questionId) {
    const questionElement = document.getElementById(`question-${questionId}`);
    questionElement.remove();
}

function addChoice(questionId) {
    const choiceCount = document.querySelectorAll(`#question-${questionId}-choices .choice-group`).length + 1;
    const choiceGroup = document.createElement('div');
    choiceGroup.className = 'choice-group';
    
    choiceGroup.innerHTML = `
        <input type="text" name="question-${questionId}-choice-${choiceCount}" placeholder="Choice ${choiceCount}" required>
        <button type="button" onclick="removeChoice(this)">Remove Choice</button>
    `;
    
    document.getElementById(`question-${questionId}-choices`).appendChild(choiceGroup);
}

function removeChoice(button) {
    button.parentElement.remove();
}

document.getElementById('lessonForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData(this);
    for (let [name, value] of formData) {
        console.log(name, value);
    }
    
    alert('Form submitted successfully!');
    this.reset();
    document.getElementById('questions-container').innerHTML = '';
    questionCount = 0;
});
