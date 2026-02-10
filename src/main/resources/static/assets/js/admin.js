// API Configuration - UPDATED FOR RENDER
// Use dynamic URL that works for both local and production
const API_BASE_URL = window.location.origin; // This will be https://chicadish.onrender.com
const ADMIN_ENDPOINTS = {
    users: `${API_BASE_URL}/api/admin/users`,
    clients: `${API_BASE_URL}/api/admin/clients`,
    getUserById: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    me: `${API_BASE_URL}/api/auth/me`
};

// State management
let currentAdmin = null;
let allUsers = [];
let currentSection = 'dashboard';

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin page loading...');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Admin endpoints:', ADMIN_ENDPOINTS);
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        console.log('No auth token found, redirecting to home');
        window.location.href = '/';
        return;
    }
    
    try {
        // Verify token and check if user is admin
        console.log('Verifying admin token...');
        const response = await fetch(ADMIN_ENDPOINTS.me, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Admin verification response status:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('User data retrieved:', userData);
            
            if (userData.role !== 'ADMIN') {
                // Not an admin, redirect to home
                console.log('User is not an admin, redirecting...');
                showToast('Access denied. Admin privileges required.', 'error');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                return;
            }
            
            currentAdmin = userData;
            
            // Update admin info
            document.getElementById('admin-name').textContent = `${userData.firstName} ${userData.lastName}`;
            document.getElementById('admin-email').textContent = userData.email;
            
            // Update current date
            document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Start server time
            updateServerTime();
            
            // Initialize event listeners
            initializeEventListeners();
            
            // Load admin data
            await loadAdminData();
            
        } else {
            console.log('Token verification failed, clearing storage and redirecting');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        console.error('Error details:', error.message);
        window.location.href = '/';
    }
});

// Update server time
function updateServerTime() {
    const serverTimeElement = document.getElementById('server-time');
    if (serverTimeElement) {
        setInterval(() => {
            const now = new Date();
            serverTimeElement.textContent = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }, 1000);
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-link').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Mobile menu toggle
    const menuBar = document.getElementById('menu-bar');
    const navbar = document.querySelector('.navbar');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (menuBar && navbar) {
        menuBar.addEventListener('click', function() {
            navbar.classList.toggle('active');
        });
    }
    
    // Refresh dashboard button
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadAdminData();
            showToast('Dashboard refreshed', 'success');
        });
    }
    
    // Add user button
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            showToast('Add user feature coming soon!', 'info');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-link');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Search functionality
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', debounce(function() {
            searchUsers(this.value);
        }, 300));
    }
    
    // Filter functionality
    const userRoleFilter = document.getElementById('user-role-filter');
    const userStatusFilter = document.getElementById('user-status-filter');
    
    if (userRoleFilter) {
        userRoleFilter.addEventListener('change', function() {
            filterUsers();
        });
    }
    
    if (userStatusFilter) {
        userStatusFilter.addEventListener('change', function() {
            filterUsers();
        });
    }
    
    // Toast close buttons
    document.querySelectorAll('.toast-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.toast').style.display = 'none';
        });
    });
    
    // Initialize modals
    initializeModals();
}

// Switch between sections
function switchSection(section) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.nav-link[data-section="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sectionEl => {
        sectionEl.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = section;
        
        // Load section-specific data if needed
        if (section === 'users') {
            loadUsersSection();
        }
    }
}

// Debounce function for search
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

// Initialize modal functionality
function initializeModals() {
    // Create modal containers if they don't exist
    if (!document.getElementById('viewUserModal')) {
        createViewUserModal();
    }
    
    if (!document.getElementById('editUserModal')) {
        createEditUserModal();
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Create view user modal
function createViewUserModal() {
    const modalHTML = `
    <div id="viewUserModal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
            <span class="close-modal" onclick="closeModal('viewUserModal')">&times;</span>
            <h2>User Details</h2>
            <div class="loading-spinner" id="userLoading" style="display: none;">
                <div class="spinner"></div>
                <p>Loading user details...</p>
            </div>
            <div id="userDetails" class="user-details-container">
                <!-- User details will be loaded here -->
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal('viewUserModal')">Close</button>
                <button class="btn-primary" onclick="editCurrentUser()" id="editUserBtn">Edit User</button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Create edit user modal
function createEditUserModal() {
    const modalHTML = `
    <div id="editUserModal" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
            <span class="close-modal" onclick="closeModal('editUserModal')">&times;</span>
            <h2>Edit User</h2>
            <div class="loading-spinner" id="editUserLoading" style="display: none;">
                <div class="spinner"></div>
                <p>Loading user data...</p>
            </div>
            <form id="editUserForm">
                <input type="hidden" id="editUserId">
                <div class="form-group">
                    <label for="editFirstName">First Name</label>
                    <input type="text" id="editFirstName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="editLastName">Last Name</label>
                    <input type="text" id="editLastName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="editEmail">Email</label>
                    <input type="email" id="editEmail" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="editRole">Role</label>
                    <select id="editRole" class="form-control">
                        <option value="CLIENT">Client</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editStatus">Status</label>
                    <select id="editStatus" class="form-control">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal('editUserModal')">Cancel</button>
                    <button type="submit" class="btn-primary" id="saveUserBtn">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle edit form submission
    document.getElementById('editUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveUserChanges();
    });
}

// Load admin dashboard data
async function loadAdminData() {
    try {
        const authToken = localStorage.getItem('authToken');
        
        // Show loading state
        showLoadingState(true);
        
        // Load users from API
        console.log('Loading users from:', ADMIN_ENDPOINTS.users);
        const usersResponse = await fetch(ADMIN_ENDPOINTS.users, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Users response status:', usersResponse.status);
        
        if (usersResponse.ok) {
            allUsers = await usersResponse.json();
            console.log('Loaded users from API:', allUsers);
            
            // Update dashboard stats
            updateDashboardStats(allUsers);
            
            // Populate recent users table
            populateRecentUsersTable(allUsers);
            
            // Update badge counts
            updateBadgeCounts(allUsers);
            
        } else if (usersResponse.status === 403) {
            showToast('You do not have permission to view users', 'error');
        } else {
            const errorText = await usersResponse.text();
            console.error('API Error:', errorText);
            
            // If API returns 404 or other errors, use mock data for demo
            console.log('Using mock data for demo');
            allUsers = generateMockUsers(10);
            updateDashboardStats(allUsers);
            populateRecentUsersTable(allUsers);
            updateBadgeCounts(allUsers);
            
            showToast('Using demo data (API endpoint not implemented)', 'info');
        }
        
        // Load clients data
        await loadClientsData(authToken);
        
    } catch (error) {
        console.error('Failed to load admin data:', error);
        console.error('Error details:', error.message);
        
        // Use mock data on error
        console.log('Using mock data due to error');
        allUsers = generateMockUsers(10);
        updateDashboardStats(allUsers);
        populateRecentUsersTable(allUsers);
        updateBadgeCounts(allUsers);
        
        showToast('Network error. Using demo data.', 'warning');
    } finally {
        showLoadingState(false);
    }
}

// Generate mock users for demo
function generateMockUsers(count) {
    const users = [];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Emma', 'David', 'Sarah', 'Michael', 'Lisa'];
    const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Wilson', 'Taylor', 'Clark', 'Lee', 'Walker', 'Hall'];
    
    for (let i = 1; i <= count; i++) {
        users.push({
            id: i,
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[i % lastNames.length],
            email: `user${i}@example.com`,
            role: i % 3 === 0 ? 'ADMIN' : 'CLIENT',
            status: i % 5 === 0 ? 'INACTIVE' : i % 7 === 0 ? 'SUSPENDED' : 'ACTIVE',
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            newsletterSubscribed: Math.random() > 0.5
        });
    }
    
    return users;
}

// Update dashboard statistics
function updateDashboardStats(users) {
    // Total users
    const totalUsers = users.length;
    const totalUsersElement = document.getElementById('total-users');
    if (totalUsersElement) totalUsersElement.textContent = totalUsers;
    
    // Count admins and clients
    const adminsCount = users.filter(user => user.role === 'ADMIN').length;
    const clientsCount = users.filter(user => user.role === 'CLIENT').length;
    const activeUsersCount = users.filter(user => user.status === 'ACTIVE').length;
    const inactiveUsersCount = users.filter(user => user.status !== 'ACTIVE').length;
    
    // Update quick stats
    const adminCountElement = document.getElementById('admin-count');
    if (adminCountElement) adminCountElement.textContent = adminsCount;
    
    const clientCountElement = document.getElementById('client-count');
    if (clientCountElement) clientCountElement.textContent = clientsCount;
    
    const activeUsersElement = document.getElementById('active-users');
    if (activeUsersElement) activeUsersElement.textContent = activeUsersCount;
    
    const inactiveUsersElement = document.getElementById('inactive-users');
    if (inactiveUsersElement) inactiveUsersElement.textContent = inactiveUsersCount;
    
    // Update badge counts
    const usersBadge = document.getElementById('users-count');
    if (usersBadge) {
        usersBadge.textContent = totalUsers;
    }
}

// Update badge counts
function updateBadgeCounts(users) {
    // Update users badge
    const usersBadge = document.getElementById('users-count');
    if (usersBadge) {
        usersBadge.textContent = users.length;
    }
    
    // Update other badges as needed
    // For now, we'll keep the hardcoded values
}

// Populate recent users table
function populateRecentUsersTable(users) {
    const recentUsersTable = document.getElementById('recent-users-table');
    if (!recentUsersTable) return;
    
    // Clear loading row
    recentUsersTable.innerHTML = '';
    
    // Sort users by creation date (newest first)
    const sortedUsers = [...users].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.createdDate || 0);
        const dateB = new Date(b.createdAt || b.createdDate || 0);
        return dateB - dateA;
    });
    
    // Show only first 5 users
    sortedUsers.slice(0, 5).forEach(user => {
        const row = document.createElement('tr');
        const status = user.status || 'ACTIVE';
        row.innerHTML = `
            <td>${user.id || 'N/A'}</td>
            <td>${user.firstName || ''} ${user.lastName || ''}</td>
            <td>${user.email || 'N/A'}</td>
            <td><span class="badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-client'}">${user.role || 'CLIENT'}</span></td>
            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" data-user-id="${user.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        recentUsersTable.appendChild(row);
    });
    
    // Add event listeners to view/edit buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            viewUser(userId);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            editUser(userId);
        });
    });
}

// Load users section data
async function loadUsersSection() {
    try {
        const authToken = localStorage.getItem('authToken');
        console.log('Loading users section from:', ADMIN_ENDPOINTS.users);
        
        const usersResponse = await fetch(ADMIN_ENDPOINTS.users, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            populateAllUsersTable(users);
        } else {
            // Use mock data if API fails
            console.log('Using mock data for users section');
            populateAllUsersTable(allUsers);
            showToast('Using demo data for users', 'info');
        }
    } catch (error) {
        console.error('Failed to load users section:', error);
        console.error('Error details:', error.message);
        // Use existing data on error
        populateAllUsersTable(allUsers);
        showToast('Failed to load users, showing cached data', 'error');
    }
}

// Populate all users table
function populateAllUsersTable(users) {
    const allUsersTable = document.getElementById('all-users-table');
    if (!allUsersTable) return;
    
    allUsersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const status = user.status || 'ACTIVE';
        row.innerHTML = `
            <td>${user.id || 'N/A'}</td>
            <td>${user.firstName || ''} ${user.lastName || ''}</td>
            <td>${user.email || 'N/A'}</td>
            <td><span class="badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-client'}">${user.role || 'CLIENT'}</span></td>
            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
            <td>${formatDate(user.createdAt || user.createdDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" data-user-id="${user.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" data-user-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        allUsersTable.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            viewUser(userId);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            editUser(userId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            deleteUser(userId);
        });
    });
}

// Search users
function searchUsers(query) {
    if (!query.trim()) {
        // If search is empty, show all users
        populateAllUsersTable(allUsers);
        return;
    }
    
    const filteredUsers = allUsers.filter(user => {
        const searchText = query.toLowerCase();
        return (
            (user.firstName && user.firstName.toLowerCase().includes(searchText)) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchText)) ||
            (user.email && user.email.toLowerCase().includes(searchText)) ||
            (user.role && user.role.toLowerCase().includes(searchText))
        );
    });
    
    populateAllUsersTable(filteredUsers);
}

// Filter users
function filterUsers() {
    const roleFilter = document.getElementById('user-role-filter').value;
    const statusFilter = document.getElementById('user-status-filter').value;
    
    let filteredUsers = allUsers;
    
    if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => (user.status || 'ACTIVE') === statusFilter);
    }
    
    populateAllUsersTable(filteredUsers);
}

// Load clients data
async function loadClientsData(authToken) {
    try {
        console.log('Loading clients from:', ADMIN_ENDPOINTS.clients);
        const clientsResponse = await fetch(ADMIN_ENDPOINTS.clients, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (clientsResponse.ok) {
            const clients = await clientsResponse.json();
            console.log('Loaded clients:', clients.length);
        } else {
            console.log('Clients endpoint not available');
        }
    } catch (error) {
        console.error('Failed to load clients:', error);
        // Silently fail for clients data
    }
}

// View user details
async function viewUser(userId) {
    try {
        const authToken = localStorage.getItem('authToken');
        
        // Show loading spinner
        document.getElementById('userLoading').style.display = 'block';
        document.getElementById('userDetails').style.display = 'none';
        const editUserBtn = document.getElementById('editUserBtn');
        if (editUserBtn) editUserBtn.disabled = true;
        
        // First, try to find user in our cached list
        let user = allUsers.find(u => u.id == userId);
        
        // If not found, fetch from API
        if (!user) {
            console.log('Fetching user from API:', ADMIN_ENDPOINTS.getUserById(userId));
            const response = await fetch(ADMIN_ENDPOINTS.getUserById(userId), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                user = await response.json();
            } else {
                // If API endpoint not implemented, create mock data
                user = createMockUserData(userId);
            }
        }
        
        // Hide loading spinner
        document.getElementById('userLoading').style.display = 'none';
        document.getElementById('userDetails').style.display = 'block';
        if (editUserBtn) editUserBtn.disabled = false;
        
        // Populate user details
        const status = user.status || 'ACTIVE';
        document.getElementById('userDetails').innerHTML = `
            <div class="user-detail-row">
                <strong>User ID:</strong> <span>${user.id || 'N/A'}</span>
            </div>
            <div class="user-detail-row">
                <strong>Name:</strong> <span>${user.firstName || ''} ${user.lastName || ''}</span>
            </div>
            <div class="user-detail-row">
                <strong>Email:</strong> <span>${user.email || 'N/A'}</span>
            </div>
            <div class="user-detail-row">
                <strong>Role:</strong> <span class="badge ${(user.role || 'CLIENT') === 'ADMIN' ? 'badge-admin' : 'badge-client'}">${user.role || 'CLIENT'}</span>
            </div>
            <div class="user-detail-row">
                <strong>Status:</strong> <span class="status-badge status-${status.toLowerCase()}">${status}</span>
            </div>
            <div class="user-detail-row">
                <strong>Member Since:</strong> <span>${formatDate(user.createdAt || user.createdDate)}</span>
            </div>
            <div class="user-detail-row">
                <strong>Last Login:</strong> <span>${formatDate(user.lastLogin || user.updatedAt)}</span>
            </div>
            <div class="user-detail-row">
                <strong>Newsletter:</strong> <span>${user.newsletterSubscribed ? 'Subscribed' : 'Not Subscribed'}</span>
            </div>
        `;
        
        // Store current user ID for edit functionality
        document.getElementById('viewUserModal').setAttribute('data-user-id', userId);
        
        // Show modal
        openModal('viewUserModal');
        
    } catch (error) {
        console.error('Error viewing user:', error);
        console.error('Error details:', error.message);
        document.getElementById('userLoading').style.display = 'none';
        document.getElementById('userDetails').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load user details. Please try again.</p>
            </div>
        `;
        document.getElementById('userDetails').style.display = 'block';
        showToast('Failed to load user details', 'error');
    }
}

// Edit user
async function editUser(userId) {
    try {
        const authToken = localStorage.getItem('authToken');
        
        // Show loading spinner
        document.getElementById('editUserLoading').style.display = 'block';
        document.getElementById('editUserForm').style.display = 'none';
        const saveUserBtn = document.getElementById('saveUserBtn');
        if (saveUserBtn) saveUserBtn.disabled = true;
        
        // First, try to find user in our cached list
        let user = allUsers.find(u => u.id == userId);
        
        // If not found, fetch from API
        if (!user) {
            console.log('Fetching user for edit:', ADMIN_ENDPOINTS.getUserById(userId));
            const response = await fetch(ADMIN_ENDPOINTS.getUserById(userId), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                user = await response.json();
            } else {
                // If API endpoint not implemented, create mock data
                user = createMockUserData(userId);
            }
        }
        
        // Hide loading spinner
        document.getElementById('editUserLoading').style.display = 'none';
        document.getElementById('editUserForm').style.display = 'block';
        if (saveUserBtn) saveUserBtn.disabled = false;
        
        // Populate form
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editFirstName').value = user.firstName || '';
        document.getElementById('editLastName').value = user.lastName || '';
        document.getElementById('editEmail').value = user.email || '';
        document.getElementById('editRole').value = user.role || 'CLIENT';
        document.getElementById('editStatus').value = user.status || 'ACTIVE';
        
        // Store user ID
        document.getElementById('editUserModal').setAttribute('data-user-id', userId);
        
        // Show modal
        openModal('editUserModal');
        
    } catch (error) {
        console.error('Error editing user:', error);
        console.error('Error details:', error.message);
        document.getElementById('editUserLoading').style.display = 'none';
        showToast('Failed to load user data for editing', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Note: You'll need to implement DELETE endpoint in your backend
        console.log('Attempting to delete user:', userId);
        
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(ADMIN_ENDPOINTS.getUserById(userId), {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Remove from local array
            allUsers = allUsers.filter(user => user.id != userId);
            
            // Update UI
            if (currentSection === 'dashboard') {
                populateRecentUsersTable(allUsers);
                updateDashboardStats(allUsers);
            } else if (currentSection === 'users') {
                populateAllUsersTable(allUsers);
            }
            
            showToast('User deleted successfully', 'success');
        } else {
            // Simulate deletion for demo
            console.log('DELETE endpoint not implemented, simulating deletion');
            allUsers = allUsers.filter(user => user.id != userId);
            
            // Update UI
            if (currentSection === 'dashboard') {
                populateRecentUsersTable(allUsers);
                updateDashboardStats(allUsers);
            } else if (currentSection === 'users') {
                populateAllUsersTable(allUsers);
            }
            
            showToast('User deleted (demo mode)', 'success');
        }
        
    } catch (error) {
        console.error('Error deleting user:', error);
        
        // Simulate deletion on error for demo
        allUsers = allUsers.filter(user => user.id != userId);
        
        // Update UI
        if (currentSection === 'dashboard') {
            populateRecentUsersTable(allUsers);
            updateDashboardStats(allUsers);
        } else if (currentSection === 'users') {
            populateAllUsersTable(allUsers);
        }
        
        showToast('User deleted (demo mode)', 'success');
    }
}

// Create mock user data for testing
function createMockUserData(userId) {
    const roles = ['ADMIN', 'CLIENT'];
    const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Emma', 'David', 'Sarah'];
    const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Wilson', 'Taylor', 'Clark', 'Lee'];
    
    return {
        id: userId,
        firstName: firstNames[userId % firstNames.length],
        lastName: lastNames[userId % lastNames.length],
        email: `user${userId}@example.com`,
        role: roles[userId % roles.length],
        status: statuses[userId % statuses.length],
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        newsletterSubscribed: Math.random() > 0.5
    };
}

// Edit current user from view modal
function editCurrentUser() {
    const userId = document.getElementById('viewUserModal').getAttribute('data-user-id');
    closeModal('viewUserModal');
    setTimeout(() => {
        editUser(userId);
    }, 300);
}

// Save user changes
async function saveUserChanges() {
    try {
        const userId = document.getElementById('editUserId').value;
        const authToken = localStorage.getItem('authToken');
        
        const formData = {
            id: userId,
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            email: document.getElementById('editEmail').value,
            role: document.getElementById('editRole').value,
            status: document.getElementById('editStatus').value
        };
        
        // Show loading state
        const saveUserBtn = document.getElementById('saveUserBtn');
        if (saveUserBtn) {
            saveUserBtn.disabled = true;
            saveUserBtn.textContent = 'Saving...';
        }
        
        console.log('Saving user changes:', formData);
        
        // Note: You'll need to implement PATCH/PUT endpoint in your backend
        // For now, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local user data
        const userIndex = allUsers.findIndex(u => u.id == userId);
        if (userIndex !== -1) {
            allUsers[userIndex] = { ...allUsers[userIndex], ...formData };
            
            // Update UI
            if (currentSection === 'dashboard') {
                populateRecentUsersTable(allUsers);
                updateDashboardStats(allUsers);
            } else if (currentSection === 'users') {
                populateAllUsersTable(allUsers);
            }
        }
        
        showToast('User updated successfully!', 'success');
        closeModal('editUserModal');
        
    } catch (error) {
        console.error('Error saving user changes:', error);
        showToast('Failed to save changes', 'error');
    } finally {
        const saveUserBtn = document.getElementById('saveUserBtn');
        if (saveUserBtn) {
            saveUserBtn.disabled = false;
            saveUserBtn.textContent = 'Save Changes';
        }
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

// Show/hide loading state
function showLoadingState(show) {
    const loadingElement = document.getElementById('loading-overlay');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastElement = document.getElementById(`${type}-toast`);
    if (toastElement) {
        const messageElement = toastElement.querySelector(`#${type}-message`);
        if (messageElement) {
            messageElement.textContent = message;
        }
        toastElement.style.display = 'flex';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            toastElement.style.display = 'none';
        }, 5000);
    } else {
        // Fallback to alert if toast doesn't exist
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Debug function to test API endpoints
window.testAdminEndpoints = async function() {
    console.log('Testing Admin API endpoints...');
    console.log('API Base URL:', API_BASE_URL);
    
    const endpoints = [
        ADMIN_ENDPOINTS.users,
        ADMIN_ENDPOINTS.clients,
        ADMIN_ENDPOINTS.me
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`${endpoint}: ${response.status}`);
        } catch (error) {
            console.error(`${endpoint}: ERROR - ${error.message}`);
        }
    }
};

// Test connection on load (for debugging)
// Uncomment for debugging:
// document.addEventListener('DOMContentLoaded', function() {
//     setTimeout(() => {
//         testAdminEndpoints();
//     }, 2000);
// });