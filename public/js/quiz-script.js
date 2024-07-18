// quiz-script.js

function submitQuiz() {
    const answers = []; // Array เก็บคำตอบที่ผู้ใช้เลือก
    const questions = document.querySelectorAll('.question');

    questions.forEach(question => {
        const choices = question.querySelectorAll('input[type="radio"]');
        let selectedChoice = null;

        choices.forEach(choice => {
            if (choice.checked) {
                selectedChoice = choice.value;
            }
        });

        answers.push(selectedChoice);
    });

    // ตรวจสอบคำตอบ
    // ในตัวอย่างนี้จะเพียงแค่แสดงผลคำตอบที่ถูกต้องออกทาง console.log สำหรับการทดสอบ
    console.log(answers); // แทนที่จะทำการเรียก API หรือฐานข้อมูลเพื่อตรวจสอบคำตอบ

    // ส่วนนี้คุณสามารถเขียนโค้ดเพื่อเรียก API หรือตรวจสอบคำตอบในฐานข้อมูลได้ตามต้องการ
    // เช่น fetch API, axios, หรือการใช้งานฝังเบาเฟิร์มเว็บ

    // เช่น
    // fetch('/check-answers', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ answers: answers })
    // }).then(response => response.json())
    //   .then(data => {
    //       console.log(data); // แสดงผลลัพธ์จากการตรวจสอบคำตอบ
    //       // ทำการแสดงผลลัพธ์ที่หน้าเว็บ เช่นผลคะแนนหรืออื่น ๆ
    //   })
    //   .catch(error => console.error('Error checking answers:', error));
}
