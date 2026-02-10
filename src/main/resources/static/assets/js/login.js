// DOM Elements
const loginLink = document.getElementById('login-link');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const menuBar = document.getElementById('menu-bar');
const navbar = document.querySelector('.navbar');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const signupPassword = document.getElementById('signupPassword');
const passwordStrength = document.getElementById('passwordStrength');
const confirmPassword = document.getElementById('confirmPassword');

// API Configuration - UPDATED FOR RENDER
// Use dynamic URL that works for both local and production
const API_BASE_URL = window.location.origin; // This will be https://chicadish.onrender.com
const AUTH_ENDPOINTS = {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register/client`,
    me: `${API_BASE_URL}/api/auth/me`
};

// For debugging - log the API URL
console.log('API Base URL:', API_BASE_URL);
console.log('Login Endpoint:', AUTH_ENDPOINTS.login);
console.log('Current URL:', window.location.href);

// State management
let authToken = localStorage.getItem('authToken') || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, checking authentication...');
    if (authToken) {
        console.log('Found auth token, verifying...');
        verifyTokenAndRedirect();
    } else {
        console.log('No auth token found');
    }
});

// Verify token and redirect based on role
async function verifyTokenAndRedirect() {
    try {
        console.log('Verifying token with endpoint:', AUTH_ENDPOINTS.me);
        const response = await fetch(AUTH_ENDPOINTS.me, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Token verification response status:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('User data retrieved:', userData);
            currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Check role and redirect if needed
            if (currentUser.role === 'ADMIN' && !window.location.pathname.includes('/admin/page')) {
                console.log('Admin user detected, redirecting to admin page');
                window.location.href = '/admin/page';
                return;
            }
            
            updateUIForLoggedInUser();
            
        } else {
            console.log('Token invalid, clearing auth data');
            // Token invalid, clear storage
            clearAuthData();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        console.error('Error details:', error.message);
        clearAuthData();
    }
}

// Show login modal when login link is clicked
loginLink.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (currentUser) {
        // User is already logged in
        if (currentUser.role === 'ADMIN') {
            window.location.href = '/admin/page';
        } else {
            showAccountMenu();
        }
        return;
    }
    
    loginModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        document.getElementById('email').focus();
    }, 300);
});

// Account menu dropdown for clients
function showAccountMenu() {
    // Remove existing menu if any
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) existingMenu.remove();
    
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <div class="user-menu-content">
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-details">
                    <h4>${currentUser.firstName} ${currentUser.lastName}</h4>
                    <p>${currentUser.email}</p>
                </div>
            </div>
            <div class="menu-items">
                <a href="#" class="menu-item" id="profile-link">
                    <i class="fas fa-user"></i> My Profile
                </a>
                <a href="#" class="menu-item" id="orders-link">
                    <i class="fas fa-shopping-bag"></i> My Orders
                </a>
                <a href="#" class="menu-item" id="favorites-link">
                    <i class="fas fa-heart"></i> Favorites
                </a>
                <a href="#" class="menu-item" id="addresses-link">
                    <i class="fas fa-map-marker-alt"></i> Addresses
                </a>
                <div class="menu-divider"></div>
                <a href="#" class="menu-item logout" id="logout-link">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        </div>
    `;
    
    // Position near login link
    const rect = loginLink.getBoundingClientRect();
    userMenu.style.position = 'fixed';
    userMenu.style.top = `${rect.bottom + 5}px`;
    userMenu.style.right = `${window.innerWidth - rect.right}px`;
    userMenu.style.zIndex = '10000';
    userMenu.style.minWidth = '250px';
    
    document.body.appendChild(userMenu);
    
    // Handle menu item clicks
    document.getElementById('profile-link').addEventListener('click', function(e) {
        e.preventDefault();
        showModalMessage('Profile feature coming soon!', 'info');
        userMenu.remove();
    });
    
    document.getElementById('orders-link').addEventListener('click', function(e) {
        e.preventDefault();
        showModalMessage('Order history feature coming soon!', 'info');
        userMenu.remove();
    });
    
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
        userMenu.remove();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!loginLink.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            userMenu.remove();
        }
    });
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    if (currentUser) {
        if (currentUser.role === 'ADMIN') {
            loginLink.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
            loginLink.style.color = '#ff6b6b';
            loginLink.style.fontWeight = '600';
        } else {
            // Show user icon with first name
            loginLink.innerHTML = `
                <i class="fas fa-user-circle" style="margin-right: 5px;"></i>
                <span>${currentUser.firstName}</span>
            `;
            loginLink.style.color = '#ff6b6b';
            loginLink.style.fontWeight = '600';
            
            // Add user status indicator
            loginLink.classList.add('user-logged-in');
            
            // Show welcome notification if just logged in
            const justLoggedIn = sessionStorage.getItem('justLoggedIn');
            if (justLoggedIn) {
                showWelcomeNotification(currentUser.firstName);
                sessionStorage.removeItem('justLoggedIn');
            }
        }
    }
}

// Show welcome notification
function showWelcomeNotification(firstName) {
    const notification = document.createElement('div');
    notification.className = 'welcome-notification';
    notification.innerHTML = `
        <div class="welcome-content">
            <i class="fas fa-check-circle"></i>
            <div>
                <h4>Welcome back, ${firstName}!</h4>
                <p>You've successfully logged in to Tasty Bites</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Show signup modal
showSignupLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginModal.style.display = 'none';
    signupModal.style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('firstName').focus();
    }, 300);
});

// Show login modal
showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    signupModal.style.display = 'none';
    loginModal.style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('email').focus();
    }, 300);
});

// Close modal when X is clicked
closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal');
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});

// Close modal when clicking outside
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Password strength indicator
signupPassword.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-zA-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    passwordStrength.className = 'strength-bar';
    if (password.length === 0) {
        passwordStrength.style.width = '0%';
    } else if (strength <= 1) {
        passwordStrength.classList.add('strength-weak');
        passwordStrength.style.width = '33%';
    } else if (strength <= 3) {
        passwordStrength.classList.add('strength-medium');
        passwordStrength.style.width = '66%';
    } else {
        passwordStrength.classList.add('strength-strong');
        passwordStrength.style.width = '100%';
    }
});

// Handle login form submission with API call
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
        showModalMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showModalMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        console.log('Attempting login to:', AUTH_ENDPOINTS.login);
        console.log('Login payload:', { email: email, password: '[HIDDEN]' });
        
        const response = await fetch(AUTH_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        console.log('Login response status:', response.status);
        
        const data = await response.json();
        console.log('Login response data:', data);
        
        if (response.ok) {
            // Save token and user data
            authToken = data.token;
            currentUser = {
                id: data.id,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role
            };
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Mark as just logged in for welcome notification
            sessionStorage.setItem('justLoggedIn', 'true');
            
            // Show success message
            showModalMessage(`Welcome back, ${data.firstName}!`, 'success');
            
            // Reset form and close modal after delay
            setTimeout(() => {
                loginForm.reset();
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Update UI
                updateUIForLoggedInUser();
                
                // Redirect based on role
                if (data.role === 'ADMIN') {
                    window.location.href = '/admin/page';
                } else {
                    // Stay on home page for clients
                    // Show welcome message in home section
                    showWelcomeMessage(data.firstName);
                }
            }, 1500);
            
        } else {
            // Handle error
            const errorMessage = data.message || 'Login failed. Please check your credentials.';
            console.error('Login failed:', errorMessage);
            showModalMessage(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', error.message);
        showModalMessage('Network error. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Handle signup form submission
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const newsletter = document.getElementById('newsletter').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPass) {
        showModalMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (!terms) {
        showModalMessage('You must agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showModalMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Password validation
    if (password.length < 8) {
        showModalMessage('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        showModalMessage('Password must contain both letters and numbers', 'error');
        return;
    }
    
    // Password confirmation
    if (password !== confirmPass) {
        showModalMessage('Passwords do not match', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
        console.log('Attempting registration to:', AUTH_ENDPOINTS.register);
        console.log('Registration payload:', { 
            firstName: firstName, 
            lastName: lastName, 
            email: email, 
            password: '[HIDDEN]',
            newsletterSubscribed: newsletter 
        });
        
        const response = await fetch(AUTH_ENDPOINTS.register, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                newsletterSubscribed: newsletter
            })
        });
        
        console.log('Registration response status:', response.status);
        
        const data = await response.json();
        console.log('Registration response data:', data);
        
        if (response.ok) {
            // Save token and user data
            authToken = data.token;
            currentUser = {
                id: data.id,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role
            };
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Mark as just logged in for welcome notification
            sessionStorage.setItem('justLoggedIn', 'true');
            
            // Show success message
            showModalMessage(`Account created successfully! Welcome to Tasty Bites, ${firstName}!`, 'success');
            
            // Reset form and close modal after delay
            setTimeout(() => {
                signupForm.reset();
                passwordStrength.style.width = '0%';
                signupModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Update UI
                updateUIForLoggedInUser();
                
                // Show welcome message for client
                showWelcomeMessage(firstName);
            }, 1500);
            
        } else {
            // Handle error
            const errorMessage = data.message || 'Registration failed. Please try again.';
            console.error('Registration failed:', errorMessage);
            showModalMessage(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error details:', error.message);
        showModalMessage('Network error. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Show welcome message for clients in home section
function showWelcomeMessage(firstName) {
    const contentDiv = document.querySelector('.home .content');
    if (contentDiv) {
        const originalContent = contentDiv.innerHTML;
        
        // Create a temporary welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <div class="welcome-card">
                <i class="fas fa-check-circle"></i>
                <h3>Welcome to CHICA QUICKDISH, ${firstName}!</h3>
                <p>Your account has been created successfully. Start exploring delicious food options and place your first order!</p>
                <div class="welcome-actions">
                    <a href="#speciality" class="btn">Explore Menu</a>
                    <a href="#order" class="btn" style="background: #ff6b6b; margin-left: 10px;">Order Now</a>
                </div>
            </div>
        `;
        
        // Insert after the original content
        contentDiv.parentNode.insertBefore(welcomeMessage, contentDiv.nextSibling);
        
        // Scroll to welcome message
        welcomeMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove welcome message after 10 seconds
        setTimeout(() => {
            welcomeMessage.style.opacity = '0';
            welcomeMessage.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (welcomeMessage.parentNode) {
                    welcomeMessage.parentNode.removeChild(welcomeMessage);
                }
            }, 300);
        }, 10000);
    }
}

// Show modal message
function showModalMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.modal-message');
    if (existingMessage) existingMessage.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `modal-message modal-message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to current modal
    const currentModal = document.querySelector('.modal-overlay[style*="flex"]');
    if (currentModal) {
        const modalContent = currentModal.querySelector('.modal-content');
        modalContent.insertBefore(messageDiv, modalContent.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 5000);
    }
}

// Logout function
function logout() {
    clearAuthData();
    loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    loginLink.style.color = '';
    loginLink.style.fontWeight = '';
    loginLink.classList.remove('user-logged-in');
    currentUser = null;
    
    // Show logout message
    showModalMessage('You have been logged out successfully.', 'info');
    
    // Clear any welcome message
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
}

// Clear authentication data
function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
}

// Toggle mobile menu
menuBar.addEventListener('click', function() {
    navbar.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navbar.classList.remove('active');
    });
});

// Forgot password functionality
const forgotPassword = document.querySelector('.forgot-password');
forgotPassword.addEventListener('click', function(e) {
    e.preventDefault();
    const email = prompt('Please enter your email to reset your password:');
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            showModalMessage(`Password reset link sent to ${email}`, 'info');
        } else {
            showModalMessage('Please enter a valid email address', 'error');
        }
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Also close user menu
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.remove();
        }
    }
});

// Real-time password confirmation check
confirmPassword.addEventListener('input', function() {
    const password = signupPassword.value;
    const confirm = this.value;
    
    if (confirm && password !== confirm) {
        this.style.borderColor = '#ff4757';
        this.style.boxShadow = '0 0 0 2px rgba(255, 71, 87, 0.1)';
    } else if (confirm && password === confirm) {
        this.style.borderColor = '#2ed573';
        this.style.boxShadow = '0 0 0 2px rgba(46, 213, 115, 0.1)';
    } else {
        this.style.borderColor = '#ddd';
        this.style.boxShadow = 'none';
    }
});

signupPassword.addEventListener('input', function() {
    const password = this.value;
    const confirm = confirmPassword.value;
    
    if (confirm && password !== confirm) {
        confirmPassword.style.borderColor = '#ff4757';
        confirmPassword.style.boxShadow = '0 0 0 2px rgba(255, 71, 87, 0.1)';
    } else if (confirm && password === confirm) {
        confirmPassword.style.borderColor = '#2ed573';
        confirmPassword.style.boxShadow = '0 0 0 2px rgba(46, 213, 115, 0.1)';
    } else {
        confirmPassword.style.borderColor = '#ddd';
        confirmPassword.style.boxShadow = 'none';
    }
});

// Debug function to test API connection
window.testAPIConnection = async function() {
    console.log('Testing API connection...');
    console.log('Current API_BASE_URL:', API_BASE_URL);
    console.log('Login endpoint:', AUTH_ENDPOINTS.login);
    
    try {
        const response = await fetch(`${API_BASE_URL}/actuator/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Health check response:', await response.text());
    } catch (error) {
        console.error('Health check failed:', error);
    }
};

// Run test on load for debugging
// Uncomment for debugging:
// document.addEventListener('DOMContentLoaded', function() {
//     setTimeout(() => {
//         testAPIConnection();
//     }, 1000);
// });