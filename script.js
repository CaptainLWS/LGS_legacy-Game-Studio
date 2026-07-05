// ============================================
// LEGACY GAME STUDIOS - INTERACTIVE FEATURES
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFormHandling();
    initializeScrollEffects();
    initializeInteractiveElements();
    initializeCardReveal();
});

// ============================================
// NAVIGATION & MOBILE MENU
// ============================================

function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            toggleHamburgerAnimation(this);
        });
    }

    // Close menu when link is clicked
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        });
    });
}

function toggleHamburgerAnimation(hamburger) {
    hamburger.classList.toggle('active');
}

// ============================================
// FORM HANDLING
// ============================================

function initializeFormHandling() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = this.querySelector('input[name="name"]').value;
            const email = this.querySelector('input[name="email"]').value;
            const subject = this.querySelector('input[name="subject"]').value;
            const message = this.querySelector('textarea[name="message"]').value;

            const data = { name, email, subject, message };

            // Validate form
            if (!validateForm(data)) {
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }

            // Submit form (would normally send to backend)
            console.log('Form Data:', data);
            showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
            
            // Reset form
            this.reset();
        });
    }
}

function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return data.name.trim() !== '' && 
           emailRegex.test(data.email) && 
           data.message.trim() !== '';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('notification-exit');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// SCROLL EFFECTS
// ============================================

function initializeScrollEffects() {
    // Parallax effect for hero section using requestAnimationFrame
    const hero = document.querySelector('.hero');
    
    if (hero) {
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    // Use transform instead of background-position for better performance
                    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}

// ============================================
// CARD REVEAL WITH INTERSECTION OBSERVER
// ============================================

function initializeCardReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                cardObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards
    const cards = document.querySelectorAll('.game-card, .production-card, .stat');
    cards.forEach(card => {
        cardObserver.observe(card);
    });
}

// ============================================
// INTERACTIVE ELEMENTS
// ============================================

function initializeInteractiveElements() {
    // Button hover effects using CSS classes
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.classList.add('btn-hovered');
        });
        
        btn.addEventListener('mouseleave', function() {
            this.classList.remove('btn-hovered');
        });
    });

    // Game card click effects
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', function() {
            const gameTitle = this.querySelector('h3').textContent;
            console.log('Game clicked:', gameTitle);
            showNotification(`Thanks for your interest in ${gameTitle}!`, 'info');
        });
    });
}

// ============================================
// SMOOTH SCROLL ANIMATION
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================
// ANIMATIONS & STYLES
// ============================================

const style = document.createElement('style');
style.textContent = `
    /* Notification Styles */
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        color: white;
        border-radius: 4px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    }

    .notification-success {
        background: #4caf50;
    }

    .notification-error {
        background: #f44336;
    }

    .notification-info {
        background: #2196F3;
    }

    .notification-exit {
        animation: slideOut 0.3s ease-out;
    }

    /* Card Reveal Animation */
    .game-card, .production-card, .stat {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .game-card.reveal, .production-card.reveal, .stat.reveal {
        opacity: 1;
        transform: translateY(0);
    }

    /* Button Hover State */
    .btn-hovered {
        transform: translateY(-2px) !important;
    }

    /* Mobile Menu Active State */
    .nav-links.active {
        display: flex !important;
    }

    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// LAZY LOAD IMAGES
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}
