// form-script.js

function addChoice(button) {
    const choicesContainer = button.parentElement.querySelector('.choices');
    const choiceCount = choicesContainer.children.length;
    const newChoiceIndex = choiceCount + 1;

    const newChoiceDiv = document.createElement('div');
    newChoiceDiv.classList.add('choice');

    const newChoiceInput = document.createElement('input');
    newChoiceInput.type = 'text';
    newChoiceInput.name = `question_${button.parentElement.id}_choice_${newChoiceIndex}`;
    newChoiceInput.required = true;

    const newAnswerBtn = document.createElement('button');
    newAnswerBtn.type = 'button';
    newAnswerBtn.classList.add('answer-btn');
    newAnswerBtn.textContent = 'False';
    newAnswerBtn.setAttribute('data-is-correct', 'false');

    newAnswerBtn.addEventListener('click', function() {
        const isCorrect = this.getAttribute('data-is-correct') === 'true';

        
        choicesContainer.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.classList.add('selected');

        
        console.log(`Selected answer is correct: ${isCorrect}`);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete Choice';
    deleteBtn.addEventListener('click', function() {
        newChoiceDiv.remove();
    });

    newChoiceDiv.appendChild(newChoiceInput);
    newChoiceDiv.appendChild(newAnswerBtn);
    newChoiceDiv.appendChild(deleteBtn);
    choicesContainer.appendChild(newChoiceDiv);
}

function deleteChoice(button) {
    const choiceDiv = button.parentElement;
    choiceDiv.remove();
}

function addQuestion() {
    
}

function submitForm() {
    const form = document.getElementById('lessonForm');
    const formData = new FormData(form);
    const questions = [];

    
    formData.forEach((value, key) => {
        const [prefix, questionId, choiceId] = key.split('_');

        if (prefix === 'question') {
            const questionIndex = parseInt(questionId) - 1;
            const choiceIndex = parseInt(choiceId) - 1;

            if (!questions[questionIndex]) {
                questions[questionIndex] = {
                    question_text: value,
                    choices: []
                };
            } else if (choiceId) {
                questions[questionIndex].choices.push({
                    choice_text: value,
                    is_correct: false
                });
            }
        }
    });

    // Send questions data to the server
    fetch('/submit-questions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions: questions })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        // Handle success response here (e.g., show a success message)
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error here (e.g., show an error message)
    });
}

// Add event listener to answer buttons
document.querySelectorAll('.answer-btn').forEach(button => {
    button.addEventListener('click', () => {
        const isCorrect = button.getAttribute('data-is-correct') === 'true';

        // Update UI (optional)
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        button.classList.add('selected');

        // Optionally handle logic to set correct answer in data
        // Example: Update data model or UI based on user selection
        console.log(`Selected answer is correct: ${isCorrect}`);
    });
});
