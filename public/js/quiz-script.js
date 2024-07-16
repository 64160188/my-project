const quizData = [
    {
        question: "What is the capital of France?",
        choices: ["London", "Paris", "Berlin", "Madrid"],
        correctAnswer: "Paris"
    },
    {
        question: "Who painted the Mona Lisa?",
        choices: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correctAnswer: "Leonardo da Vinci"
    },
    // Add more questions as needed
];

const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result');

function loadQuiz() {
    quizData.forEach((quiz, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.innerHTML = `
            <h3>Question ${index + 1}: ${quiz.question}</h3>
            ${quiz.choices.map(choice => `
                <input type="radio" name="question-${index}" value="${choice}">
                <label>${choice}</label><br>
            `).join('')}
        `;
        quizContainer.appendChild(questionDiv);
    });
}

function submitQuiz() {
    let correctCount = 0;
    const answers = [];
    const quizQuestions = document.querySelectorAll('.question');
    
    quizQuestions.forEach((question, index) => {
        const selectedAnswer = question.querySelector('input:checked');
        if (selectedAnswer) {
            answers.push(selectedAnswer.value);
            if (selectedAnswer.value === quizData[index].correctAnswer) {
                correctCount++;
            }
        }
    });
    
    const totalQuestions = quizData.length;
    const score = (correctCount / totalQuestions) * 100;
    
    resultContainer.innerHTML = `
        <h2>Quiz Result</h2>
        <p>You got ${correctCount} out of ${totalQuestions} correct (${score.toFixed(2)}%)</p>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    loadQuiz();
});
