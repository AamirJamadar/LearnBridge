async function initAuth() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/current_user', { credentials: 'include' });
        const data = await res.json();
        if (data.user) {
            updateNavbarForLoggedInUser(data.user);
            // Optionally, we can save a copy to localStorage if other synchronous scripts rely on it
            localStorage.setItem('currentUser', JSON.stringify(data.user)); 
        } else {
            updateNavbarForGuest();
            localStorage.removeItem('currentUser');
        }
    } catch (e) {
        console.error("Backend auth check failed", e);
        var currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            updateNavbarForLoggedInUser(JSON.parse(currentUser));
        } else {
            updateNavbarForGuest();
        }
    }
    
    checkQuizAccess();
    initModals();
    initLoginForm();
    initRegisterForm();
    initPasswordToggles();
    initProfilePhoto();
}

function initModals() {
    var loginModal = document.getElementById('loginModal');
    var registerModal = document.getElementById('registerModal');
    
    if (document.getElementById('loginModalClose')) {
        document.getElementById('loginModalClose').onclick = function() {
            closeModal(loginModal);
        };
    }
    if (document.getElementById('registerModalClose')) {
        document.getElementById('registerModalClose').onclick = function() {
            closeModal(registerModal);
        };
    }
    if (document.getElementById('switchToRegister')) {
        document.getElementById('switchToRegister').onclick = function(e) {
            e.preventDefault();
            closeModal(loginModal);
            setTimeout(function() { openModal(registerModal); }, 300);
        };
    }
    if (document.getElementById('switchToLogin')) {
        document.getElementById('switchToLogin').onclick = function(e) {
            e.preventDefault();
            closeModal(registerModal);
            setTimeout(function() { openModal(loginModal); }, 300);
        };
    }
    var overlayLoginBtn = document.getElementById('overlayLoginBtn');
    if (overlayLoginBtn) {
        overlayLoginBtn.onclick = function() {
            var authOverlay = document.getElementById('authOverlay');
            if (authOverlay) authOverlay.classList.remove('active');
            openModal(loginModal);
        };
    }
    var overlayRegisterBtn = document.getElementById('overlayRegisterBtn');
    if (overlayRegisterBtn) {
        overlayRegisterBtn.onclick = function() {
            var authOverlay = document.getElementById('authOverlay');
            if (authOverlay) authOverlay.classList.remove('active');
            openModal(registerModal);
        };
    }
    if (loginModal) {
        loginModal.onclick = function(e) {
            if (e.target === loginModal) closeModal(loginModal);
        };
    }
    if (registerModal) {
        registerModal.onclick = function(e) {
            if (e.target === registerModal) closeModal(registerModal);
        };
    }
    document.onkeydown = function(e) {
        if (e.key === 'Escape') {
            closeModal(loginModal);
            closeModal(registerModal);
        }
    };
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        var errors = modal.querySelectorAll('.form-error');
        for (var i = 0; i < errors.length; i++) {
            errors[i].classList.remove('show');
        }
        var form = modal.querySelector('form');
        if (form) form.reset();
    }
}

function initLoginForm() {
    var form = document.getElementById('loginForm');
    if (!form) return;
    form.onsubmit = async function(e) {
        e.preventDefault();
        var username = document.getElementById('loginUsername').value.trim();
        var password = document.getElementById('loginPassword').value;
        var errorEl = document.getElementById('loginError');
        
        try {
            const res = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                closeModal(document.getElementById('loginModal'));
                updateNavbarForLoggedInUser(data.user);
                checkQuizAccess();
                showToast(data.message, 'success');
            } else {
                if (errorEl) {
                    errorEl.textContent = data.error || 'Invalid username or password';
                    errorEl.classList.add('active');
                }
            }
        } catch (err) {
            console.error(err);
            if (errorEl) {
                errorEl.textContent = 'Server connection error';
                errorEl.classList.add('active');
            }
        }
    };
}

function initRegisterForm() {
    var form = document.getElementById('registerForm');
    if (!form) return;
    form.onsubmit = async function(e) {
        e.preventDefault();
        var username = document.getElementById('registerUsername').value.trim();
        var email = document.getElementById('registerEmail').value.trim();
        var password = document.getElementById('registerPassword').value;
        var confirmPassword = document.getElementById('registerConfirmPassword').value;
        var errorEl = document.getElementById('registerError');
        
        if (password !== confirmPassword) {
            if (errorEl) {
                errorEl.textContent = 'Passwords do not match';
                errorEl.classList.add('active');
            }
            return;
        }
        if (password.length < 6) {
            if (errorEl) {
                errorEl.textContent = 'Password must be at least 6 characters';
                errorEl.classList.add('show');
            }
            return;
        }
        
        try {
            const res = await fetch('http://127.0.0.1:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include'
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                closeModal(document.getElementById('registerModal'));
                updateNavbarForLoggedInUser(data.user);
                checkQuizAccess();
                showToast(data.message, 'success');
            } else {
                if (errorEl) {
                    errorEl.textContent = data.error || 'Registration failed';
                    errorEl.classList.add('show');
                }
            }
        } catch (err) {
            console.error(err);
            if (errorEl) {
                errorEl.textContent = 'Server connection error';
                errorEl.classList.add('show');
            }
        }
    };
}

function initPasswordToggles() {
    var toggles = document.querySelectorAll('.password-toggle');
    for (var i = 0; i < toggles.length; i++) {
        toggles[i].onclick = function() {
            var wrapper = this.parentElement;
            var input = wrapper.querySelector('input');
            var icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        };
    }
}

function updateNavbarForLoggedInUser(user) {
    var navbarRight = document.querySelector('.navbar-right');
    if (!navbarRight) return;
    var logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.id = 'logoutBtn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.onclick = logout;
    var userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        var userName = userProfile.querySelector('.user-name');
        if (userName) userName.textContent = user.username;
        userProfile.classList.add('logged-in');
        userProfile.appendChild(logoutBtn);
    }
    
    updateDashboardUI(user);
    updateAllProfilePhotos(user.avatar || null);
}

function updateNavbarForGuest() {
    var navbarRight = document.querySelector('.navbar-right');
    if (!navbarRight) return;
    
    // Remove existing auth-buttons if they exist to prevent duplicates
    var existingAuthButtons = navbarRight.querySelector('.auth-buttons');
    if (existingAuthButtons) {
        existingAuthButtons.parentElement.removeChild(existingAuthButtons);
    }
    
    var authButtons = document.createElement('div');
    authButtons.className = 'auth-buttons';
    authButtons.innerHTML = '<button class="btn-auth-nav btn-login-nav" id="navLoginBtn"><i class="fas fa-sign-in-alt"></i> Login</button><button class="btn-auth-nav btn-register-nav" id="navRegisterBtn"><i class="fas fa-user-plus"></i> Register</button>';
    var navLoginBtn = authButtons.querySelector('#navLoginBtn');
    var navRegisterBtn = authButtons.querySelector('#navRegisterBtn');
    if (navLoginBtn) {
        navLoginBtn.onclick = function() {
            openModal(document.getElementById('loginModal'));
        };
    }
    if (navRegisterBtn) {
        navRegisterBtn.onclick = function() {
            openModal(document.getElementById('registerModal'));
        };
    }
    var userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        var userName = userProfile.querySelector('.user-name');
        if (userName) userName.textContent = 'Guest';
        userProfile.classList.remove('logged-in');
        var existingLogoutBtn = document.getElementById('logoutBtn');
        if (existingLogoutBtn) existingLogoutBtn.parentElement.removeChild(existingLogoutBtn);
        navbarRight.insertBefore(authButtons, userProfile);
    }
    
    updateDashboardUI({ username: 'Guest', xp: 0, level: 1 });
    updateAllProfilePhotos(null);
}

async function logout() {
    try {
        await fetch('http://127.0.0.1:5000/api/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
        console.error(e);
    }
    localStorage.removeItem('currentUser');
    updateNavbarForGuest();
    checkQuizAccess();
    showToast('You have been logged out', 'success');
}

function checkQuizAccess() {
    var currentUser = localStorage.getItem('currentUser');
    var authOverlay = document.getElementById('authOverlay');
    if (authOverlay) {
        if (currentUser) {
            authOverlay.classList.remove('active');
        } else {
            var quizSection = document.getElementById('quiz');
            if (quizSection && quizSection.classList.contains('active')) {
                authOverlay.classList.add('active');
            }
        }
    }
}

function updateDashboardUI(user) {
    if (!user) return;
    
    var isNewUser = !user.xp || user.xp === 0;
    
    // Update navbar badges 
    // In our static HTML these are fixed, but if they exist we should update them:
    var xpValue = document.getElementById('xpValue') || document.querySelector('.xp-value');
    var levelBadge = document.querySelector('.level-badge');
    if (xpValue) xpValue.textContent = (user.xp || 0) + ' XP';
    if (levelBadge && levelBadge.textContent.includes('Lv.')) levelBadge.textContent = 'Lv. ' + (user.level || 1);
    
    // Update Dashboard Welcome Text
    var welcomeHeader = document.querySelector('.welcome-content h2');
    if (welcomeHeader) welcomeHeader.textContent = 'Welcome back, ' + user.username + '!';

    // Top Stats Bar
    var statNumbers = document.querySelectorAll('.welcome-stats .stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = isNewUser ? '0' : '12';
        statNumbers[1].textContent = isNewUser ? '0' : '8';
        statNumbers[2].textContent = isNewUser ? '0h' : '24h';
    }

    // Continue Learning Card
    var progressFill = document.querySelector('.course-info .progress-fill');
    var progressText = document.querySelector('.course-info p');
    if (progressFill && progressText) {
        progressFill.style.width = isNewUser ? '0%' : '75%';
        progressText.textContent = isNewUser ? 'Progress: 0%' : 'Progress: 75%';
    }

    // Recent Activity List
    var activityList = document.querySelector('.activity-list');
    if (activityList) {
        if (isNewUser) {
            activityList.innerHTML = '<li style="text-align: center; color: var(--text-secondary); opacity: 1; transform: none; display:block; padding: 20px;">No recent activity yet.<br><br>Start a course or take a quiz to earn XP!</li>';
        } else {
            activityList.innerHTML = `
                <li>
                    <div class="activity-icon" style="background: #4ade80;">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="activity-info">
                        <p>Completed "CSS Flexbox" quiz</p>
                        <span>2 hours ago</span>
                    </div>
                </li>
                <li>
                    <div class="activity-icon" style="background: #60a5fa;">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="activity-info">
                        <p>Started "Python Basics" course</p>
                        <span>Yesterday</span>
                    </div>
                </li>
            `;
        }
    }
}

function initQuizAccessCheck() {
    var quizNavItem = document.querySelector('[data-page="quiz"]');
    if (quizNavItem) {
        quizNavItem.onclick = function() {
            setTimeout(checkQuizAccess, 100);
        };
    }
}

function showToast(message, type) {
    var existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.parentElement.removeChild(existingToast);
    var toast = document.createElement('div');
    toast.className = 'toast-notification toast-' + type;
    toast.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i><span>' + message + '</span>';
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: ' + (type === 'success' ? 'rgba(74, 222, 128, 0.9)' : 'rgba(239, 68, 68, 0.9)') + '; color: white; padding: 15px 25px; border-radius: 10px; display: flex; align-items: center; gap: 10px; z-index: 3000; animation: slideIn 0.3s ease; box-shadow: 0 5px 20px rgba(0,0,0,0.3);';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() { toast.parentElement.removeChild(toast); }, 300);
    }, 3000);
}

var style = document.createElement('style');
style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
document.head.appendChild(style);

initQuizAccessCheck();

function initProfilePhoto() {
    var photoInput = document.getElementById('profilePhotoInput');
    var removeBtn = document.getElementById('removePhotoBtn');
    if (!photoInput) return;

    photoInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var base64Image = event.target.result;
                // Update localStorage
                var currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    var user = JSON.parse(currentUser);
                    user.avatar = base64Image;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    // Update UI immediately
                    updateAllProfilePhotos(base64Image);
                    showToast('Profile photo updated successfully', 'success');
                } else {
                    showToast('Please login to change profile photo', 'error');
                }
            };
            reader.readAsDataURL(file);
        }
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            var currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                var user = JSON.parse(currentUser);
                delete user.avatar;
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Revert to default
                updateAllProfilePhotos(null);
                photoInput.value = '';
                showToast('Profile photo removed', 'success');
            }
        });
    }
}

function updateAllProfilePhotos(customAvatar) {
    var defaultAvatar = 'https://via.placeholder.com/40';
    var defaultLargeAvatar = 'https://via.placeholder.com/80';
    
    // Update navbar avatar
    var navbarAvatars = document.querySelectorAll('.user-avatar');
    navbarAvatars.forEach(img => {
        img.src = customAvatar || defaultAvatar;
    });

    // Update settings preview avatar
    var previewAvatar = document.getElementById('profilePhotoPreview');
    if (previewAvatar) {
        previewAvatar.src = customAvatar || defaultLargeAvatar;
        
        var removeBtn = document.getElementById('removePhotoBtn');
        if (removeBtn) {
            removeBtn.style.display = customAvatar ? 'inline-flex' : 'none';
        }
    }
    
    // Update leaderboard 'You' row
    var leaderboardYouAvatars = document.querySelectorAll('.user-cell img');
    leaderboardYouAvatars.forEach(img => {
        if (img.nextElementSibling && img.nextElementSibling.textContent === 'You') {
            img.src = customAvatar || 'https://via.placeholder.com/32';
        }
    });
}
