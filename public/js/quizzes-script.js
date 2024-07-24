document.addEventListener('DOMContentLoaded', function () {
    fetchQuizzes();
});

function fetchQuizzes() {
    fetch('/api/quizzes') 
        .then(response => response.json())
        .then(data => {
            displayQuizzes(data);
        })
        .catch(error => console.error('Error fetching quizzes:', error));
}

function displayQuizzes(quizzesData) {
    const quizzesList = document.getElementById('quizzes-list');
    quizzesList.innerHTML = '';

    quizzesData.forEach(quiz => {
        const quizElement = document.createElement('div');
        quizElement.classList.add('quiz');

        const quizTitle = document.createElement('h2');
        quizTitle.textContent = quiz.quiz_title;
        quizElement.appendChild(quizTitle);

        const quizDescription = document.createElement('p');
        quizDescription.textContent = quiz.quiz_description;
        quizElement.appendChild(quizDescription);

        const startButton = document.createElement('button');
        startButton.textContent = 'Start Quiz';
        startButton.addEventListener('click', () => {
            startQuiz(quiz.quiz_id); 
        });
        quizElement.appendChild(startButton);

        quizzesList.appendChild(quizElement);
    });
}

function startQuiz(quizId) {
}
