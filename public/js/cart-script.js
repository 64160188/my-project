// public/js/cart-script.js
/*
document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.product-item button');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.parentElement.querySelector('h3').innerText;
            alert(`${productName} has been added to your cart!`);
            // Here you can add the logic to actually add the item to the cart
        });
    });
});
*/

function filterCategory(category) {
    let products = document.querySelectorAll('.product');
    products.forEach(product => {
        if (category === 'all') {
            product.style.display = 'block';
        } else {
            if (product.classList.contains(category)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        }
    });
}

// เริ่มต้นให้แสดงสินค้าทั้งหมด
filterCategory('all');
