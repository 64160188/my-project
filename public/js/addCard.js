function addCard() {
    // ค้นหาส่วนที่ต้องการเพิ่มการ์ด (Container)
    const cardsContainer = document.getElementById('cards-container');
    
    // สร้าง div ใหม่สำหรับการ์ด
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');  // กำหนด class ให้กับการ์ดใหม่

    // กำหนดเนื้อหาภายในการ์ด (เช่น รูปภาพ หัวข้อ และคำบรรยาย)
    cardDiv.innerHTML = `
        <div class="card-header">
            <h3>Card Title</h3>
        </div>
        <div class="card-body">
            <p>This is the content of the card.</p>
        </div>
        <div class="card-footer">
            <button onclick="alert('Button inside card clicked!')">Click Me</button>
        </div>
    `;

    // เพิ่มการ์ดที่สร้างใหม่ลงใน container
    cardsContainer.appendChild(cardDiv);
}
