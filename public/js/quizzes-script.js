document.addEventListener('DOMContentLoaded', function () {
    fetchQuizzes(); // เมื่อโหลดหน้าเว็บเสร็จสิ้น ให้ดึงข้อมูลบททดสอบมาแสดง
});

function fetchQuizzes() {
    fetch('/api/quizzes') // เปลี่ยน URL ตาม API endpoint ของคุณ
        .then(response => response.json())
        .then(data => {
            displayQuizzes(data); // แสดงรายชื่อบททดสอบที่ได้รับ
        })
        .catch(error => console.error('Error fetching quizzes:', error));
}

function displayQuizzes(quizzesData) {
    const quizzesList = document.getElementById('quizzes-list');
    quizzesList.innerHTML = ''; // เคลียร์เนื้อหาที่มีอยู่ใน quizzesList ก่อนที่จะเพิ่มบททดสอบใหม่

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
            startQuiz(quiz.quiz_id); // เมื่อคลิกปุ่ม Start Quiz จะเรียกฟังก์ชัน startQuiz
        });
        quizElement.appendChild(startButton);

        quizzesList.appendChild(quizElement);
    });
}

function startQuiz(quizId) {
    // เพิ่มโค้ดสำหรับเริ่มทำบททดสอบ ในที่นี้คุณอาจจะนำผู้ใช้ไปยังหน้าบททดสอบที่เกี่ยวข้องหรือทำการตรวจสอบในที่นี้
    // คุณสามารถเพิ่มการดำเนินการเพิ่มเติมได้ตามความต้องการ
}
