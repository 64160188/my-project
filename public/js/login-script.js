document.addEventListener('DOMContentLoaded', function() {
    // ตัวอย่างค่าตัวแปรสถานะการเข้าสู่ระบบ
    // คุณต้องตั้งค่า this variable ตามจริงหรือจาก API
    var isLoggedIn = false; // สมมุติว่าเรามีวิธีการที่จะแสดงสถานะนี้
    var username = ''; // ชื่อผู้ใช้, ดึงจากเซิร์ฟเวอร์หรือ API
    var loginLink = document.getElementById('login-link');
    var signUpLink = document.getElementById('sign-up-link');
    var profileLink = document.getElementById('profile-link');

    // ทำการเช็คสถานะการเข้าสู่ระบบจากเซิร์ฟเวอร์
    fetch('/api/check-login') // เส้นทาง API ของคุณ
        .then(response => response.json())
        .then(data => {
            isLoggedIn = data.loggedIn; // { loggedIn: true/false }
            username = data.username; // { username: "User" }
            
            if (isLoggedIn) {
                loginLink.textContent = 'Sign Out';
                loginLink.href = '/logout'; // เปลี่ยนเป็นเส้นทางออกจากระบบ
                signUpLink.style.display = 'none'; // ซ่อนลิงก์สมัครสมาชิก
                profileLink.textContent = `Hello, ${username}`; // แสดงชื่อผู้ใช้
                profileLink.style.display = 'block'; // แสดงลิงก์โปรไฟล์
            } else {
                loginLink.textContent = 'Login';
                loginLink.href = '/login'; // เปลี่ยนเป็นเส้นทางเข้าสู่ระบบ
                signUpLink.style.display = 'block'; // แสดงลิงก์สมัครสมาชิก
                profileLink.style.display = 'none'; // ซ่อนลิงก์โปรไฟล์
            }
        })
        .catch(error => console.error('Error fetching login status:', error));
});
