/* ============================================================
   MAIN.JS - CORE FUNCTIONALITY
   Navigation, interactions, theme toggle, smooth features
   ============================================================ */

class WebsiteCore {
    constructor() {
        this.initializeTheme();
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupFormHandlers();
        this.setupAccessibility();
        this.initializeSmoothScrolling();
        this.setupNewsletterHandler();
    }

    initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('wemetTheme') || 'light';
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                localStorage.setItem('wemetTheme', isDark ? 'dark' : 'light');
                themeToggle.style.transform = isDark ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        }
    }

    setupNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Navbar appears on scroll down
        let lastScrollTop = 0;
        const navbar = document.getElementById('navbar');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                navbar.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
            } else {
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.article-card, .featured-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    }

    setupFormHandlers() {
        const contactForm = document.getElementById('contactForm');
        const newsletterForm = document.getElementById('newsletterForm');
        const guestbookForm = document.getElementById('guestbookForm');

        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showSuccessMessage('Thank you for your message! We\'ll be in touch soon.');
                contactForm.reset();
            });
        }

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showSuccessMessage('Successfully subscribed to our newsletter!');
                newsletterForm.reset();
            });
        }

        if (guestbookForm) {
            guestbookForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showSuccessMessage('Thank you for signing our guestbook!');
                guestbookForm.reset();
            });
        }
    }

    setupAccessibility() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Skip to main content
            if (e.key === 's' && e.ctrlKey) {
                document.getElementById('home')?.focus();
                e.preventDefault();
            }
            
            // Close dialogs
            if (e.key === 'Escape') {
                const interfaces = document.querySelectorAll('.hidden');
                interfaces.forEach(el => {
                    if (!el.classList.contains('hidden')) {
                        el.classList.add('hidden');
                    }
                });
            }
        });

        // Focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }

    initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    setupNewsletterHandler() {
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                localStorage.setItem('newsletterEmail', email);
                this.showSuccessMessage('Welcome to our newsletter! Check your email for confirmation.');
                newsletterForm.reset();
            });
        }
    }

    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: linear-gradient(135deg, #0047AB 0%, #001F54 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteCore();
});

// Add animations to stylesheet
const style = document.createElement('style');
style.textContent = `
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

    .keyboard-nav *:focus {
        outline: 3px solid #0047AB;
        outline-offset: 2px;
    }

    .article-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        cursor: pointer;
    }

    body.dark-mode .article-card {
        background: rgba(26, 26, 26, 0.9);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .article-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 30px rgba(0, 71, 171, 0.2);
    }

    .article-content {
        padding: 20px;
    }

    .article-category {
        display: inline-block;
        background: linear-gradient(135deg, #0047AB 0%, #001F54 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: 12px;
    }

    .article-card h3 {
        font-family: 'Playfair Display', serif;
        font-size: 1.3rem;
        color: #001F54;
        margin-bottom: 10px;
        line-height: 1.4;
    }

    body.dark-mode .article-card h3 {
        color: #B0D4FF;
    }

    .article-card p {
        color: #666;
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 15px;
    }

    body.dark-mode .article-card p {
        color: #CCC;
    }

    .article-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: #0047AB;
    }

    .read-time {
        font-weight: 600;
    }
`;
document.head.appendChild(style);