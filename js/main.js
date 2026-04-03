/**
 * LearnBridge - Main.js
 * Main Entry Point
 * Initializes all modules and functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    console.log('Initializing LearnBridge...');
    
    await loadSidebar();
    initSidebar();
    initNavigation();
    initThemeToggle();
    initMobileMenu();
    initAnimations();
    
    if (typeof initAuth === 'function') initAuth();
    if (typeof initQuiz === 'function') initQuiz();
    if (typeof initPoll === 'function') initPoll();
    if (typeof initGamification === 'function') initGamification();
    
    // Fallback: if sidebarContainer wasn't found, setActiveNavItem might not have been called.
    if (!document.getElementById('sidebarContainer')) {
        setActiveNavItem();
    }
    
    updateWelcomeMessage();
    
    console.log('LearnBridge initialized successfully!');
}

async function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebarContainer');
    if (!sidebarContainer) {
        console.error('Sidebar container not found');
        return;
    }
    
    try {
        const response = await fetch('sidebar.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sidebarHTML = await response.text();
        sidebarContainer.innerHTML = sidebarHTML;
        
        // Set active nav item based on current page
        setActiveNavItem();
    } catch (error) {
        console.error('Error loading sidebar:', error);
    }
}

function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    const isSPA = document.querySelectorAll('.content-section').length > 1;
    if (isSPA) {
        // Keep whatever is currently set as active or default to first
        return;
    }
    
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === 'index.html' && href.includes('dashboard'))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function updateWelcomeMessage() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const welcomeHeading = document.querySelector('.welcome-content h2');
        if (welcomeHeading) {
            welcomeHeading.textContent = 'Welcome back, ' + user.username + '!';
        }
    }
}

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
        
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
        }
    }
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-item a');
    const isSPA = document.querySelectorAll('.content-section').length > 1;
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (isSPA) {
                // Determine target page from data-page attribute directly on the anchor or parent li
                const navItem = link.closest('.nav-item');
                const targetPage = link.getAttribute('data-page') || navItem.getAttribute('data-page');
                
                if (targetPage) {
                    e.preventDefault();
                    
                    // Update active state in nav
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    navItem.classList.add('active');
                    
                    // Show corresponding section
                    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
                    const targetSection = document.getElementById(targetPage);
                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                    
                    // Update page title text
                    const pageTitle = document.querySelector('.page-title');
                    if (pageTitle) {
                        // Special cases for title text could go here, for now capitalize the target
                        pageTitle.textContent = targetPage.charAt(0).toUpperCase() + targetPage.slice(1);
                    }
                }
            }
            
            // On mobile, close sidebar after clicking a nav link
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('active');
            }
        });
    });
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
        
        if (darkModeToggle) {
            darkModeToggle.checked = theme === 'dark';
        }
    }
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
        
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                sidebar.classList.remove('active');
            }
        });
    }
}

function initAnimations() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    const progressBars = document.querySelectorAll('.progress-fill, .mini-fill, .subject-fill, .option-fill');
    
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.transition = 'width 1s ease';
            bar.style.width = width;
        }, 500);
    });
    
    const allButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-danger');
    
    allButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                width: 20px;
                height: 20px;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%) scale(0);
                animation: ripple 0.6s linear;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: translate(-50%, -50%) scale(20);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    const leaderboardRows = document.querySelectorAll('.leaderboard-table tbody tr');
    
    leaderboardRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.background = 'var(--bg-tertiary)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
        });
    });
    
    const activityItems = document.querySelectorAll('.activity-list li');
    
    activityItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 300 + (index * 150));
    });
    
    const actionBtns = document.querySelectorAll('.action-btn');
    
    actionBtns.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            btn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        }, 200 + (index * 100));
    });
    
    const statItems = document.querySelectorAll('.stat-item');
    
    statItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.LearnBridge = {
    initApp,
    initSidebar,
    initNavigation,
    initThemeToggle,
    initMobileMenu,
    initAnimations,
    debounce,
    throttle
};
