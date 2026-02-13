
// Sticky Header Transformation
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
        navbar.style.padding = "10px 0";
    } else {
        navbar.classList.remove('scrolled');
        navbar.style.boxShadow = "none";
        navbar.style.padding = "20px 0";
    }
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Cart Functionality
let cart = [];
const cartCountElements = document.querySelectorAll('.cart-count');
const cartIcons = document.querySelectorAll('.cart-icon, .floating-cart');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalAmountElement = document.getElementById('cartTotalAmount');

function toggleCart(e) {
    if (e) e.preventDefault();
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

function addToCart(name, price) {
    // Check if item already exists
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    updateCartUI();

    // Animation for feedback
    cartCountElements.forEach(el => {
        el.style.transform = "scale(1.5)";
        setTimeout(() => {
            el.style.transform = "scale(1)";
        }, 200);
    });

    // Open cart automatically when item added for better UX
    if (!cartDrawer.classList.contains('active')) {
        toggleCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    // Update counts
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => el.textContent = totalItems);

    // Pulse effect if items in cart
    if (totalItems > 0) {
        cartIcons.forEach(icon => icon.classList.add('pulse'));
    } else {
        cartIcons.forEach(icon => icon.classList.remove('pulse'));
    }

    // Update items list
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Keranjang Anda kosong</div>';
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Hapus</button>
            </div>
        `).join('');
    }

    // Update total
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalAmountElement.textContent = `Rp ${totalAmount.toLocaleString('id-ID')}`;
}

function checkoutToWhatsApp() {
    if (cart.length === 0) {
        alert("Keranjang Anda masih kosong!");
        return;
    }

    const adminNumber = "6285836695103"; // Sesuaikan dengan nomor admin
    let message = "*Halo Lamisha Bakehouse, saya ingin memesan:*\n\n";

    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Jumlah: ${item.quantity}\n`;
        message += `   Harga: Rp ${item.price.toLocaleString('id-ID')}\n`;
        message += `   Subtotal: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n\n`;
    });

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `*Total Keseluruhan: Rp ${totalAmount.toLocaleString('id-ID')}*\n\n`;
    message += "Terima kasih!";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}

// Exit Intent Popup
const exitPopup = document.getElementById('exitPopup');
let hasShownPopup = false;

// Show on mouse leave (Desktop)
document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 0 && !hasShownPopup) {
        showPopup();
    }
});

// Show on timer (Mobile fallback)
setTimeout(() => {
    if (!hasShownPopup) {
        // Only show if user hasn't scrolled much (inactive)
        if (window.scrollY < 300) {
            showPopup();
        }
    }
}, 10000); // 10 seconds

function showPopup() {
    exitPopup.classList.add('active'); // Add class for animation
    exitPopup.style.display = 'flex';
    hasShownPopup = true;
}

function closeModal() {
    exitPopup.classList.remove('active');
    setTimeout(() => {
        exitPopup.style.display = 'none';
    }, 500); // Wait for transition
}

// Close popup on outside click
exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) {
        closeModal();
    }
});

// Mobile Menu Toggle
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

menuBtn.addEventListener('click', () => {
    // Simple toggle for demo
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.backgroundColor = '#fff';
        navLinks.style.padding = '20px';
        navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    }
});
