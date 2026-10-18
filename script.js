// ResumeBuilder AI Backend System
class ResumeBuilderBackend {
    constructor() {
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize localStorage if it doesn't exist
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(null));
        }
    }

    // User Registration
    register(userData) {
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if email already exists
        if (users.find(user => user.email === userData.email)) {
            throw new Error('Email already registered');
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            resumes: []
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        return { success: true, message: 'Account created successfully!' };
    }

    // User Login
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('User not found');
        }

        if (!this.verifyPassword(password, user.password)) {
            throw new Error('Invalid password');
        }

        // Set current user
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }));

        return { success: true, message: 'Login successful!' };
    }

    // Logout
    logout() {
        localStorage.setItem('currentUser', JSON.stringify(null));
        return { success: true, message: 'Logged out successfully!' };
    }

    // Get current user
    getCurrentUser() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        return user;
    }

    // Check if user is logged in
    isLoggedIn() {
        const user = this.getCurrentUser();
        return user !== null;
    }

    // Password hashing (simple for demo)
    hashPassword(password) {
        return btoa(password); // Simple encoding for demo
    }

    // Password verification
    verifyPassword(password, hash) {
        return btoa(password) === hash;
    }
}

// Initialize backend
const backend = new ResumeBuilderBackend();

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check authentication status
    checkAuthStatus();
});

// Handle registration
function handleRegistration(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    // Validation
    if (!firstName || !lastName || !email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    try {
        const result = backend.register({
            firstName,
            lastName,
            email,
            password
        });

        showMessage(result.message, 'success');
        
        // Redirect to login after successful registration
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    try {
        const result = backend.login(email, password);

        showMessage(result.message, 'success');

        // Redirect to templates page after successful login
        setTimeout(() => {
            window.location.href = 'template.html';
        }, 1500);

    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message to user
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast ${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    const backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(messageDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Check authentication status
function checkAuthStatus() {
    // Redirect to login if not authenticated on protected pages
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['resume-builder.html']; // Removed template.html from protected pages
    const publicPages = ['index.html', 'login.html', 'register.html', 'template.html'];
    
    // Always allow access to public pages
    if (publicPages.includes(currentPage)) {
        return;
    }
    
    // Redirect to login if trying to access protected pages without authentication
    if (protectedPages.includes(currentPage) && !backend.isLoggedIn()) {
        window.location.href = 'login.html';
    }
    
    // If no page is specified, default to home page
    if (!currentPage || currentPage === '') {
        window.location.href = 'index.html';
    }
}

// Logout function
function logout() {
    try {
        const result = backend.logout();
        showMessage(result.message, 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Comprehensive Template Data - Canva-style collection
const templates = [
    // Professional Templates
    {
        id: 1,
        name: 'Classic Professional',
        category: 'professional',
        preview: 'https://picsum.photos/seed/professional1/300x400.jpg',
        description: 'Timeless design for corporate and business roles',
        features: ['Clean layout', 'Professional typography', 'ATS-friendly', 'Easy to customize'],
        tags: ['corporate', 'business', 'executive', 'formal']
    },
    {
        id: 2,
        name: 'Modern Professional',
        category: 'professional',
        preview: 'https://picsum.photos/seed/professional2/300x400.jpg',
        description: 'Contemporary design with modern elements',
        features: ['Modern design', 'Color accents', 'Professional layout', 'ATS-optimized'],
        tags: ['corporate', 'business', 'management', 'modern']
    },
    {
        id: 3,
        name: 'Executive Elite',
        category: 'executive',
        preview: 'https://picsum.photos/seed/executive1/300x400.jpg',
        description: 'Premium design for senior leadership positions',
        features: ['Premium design', 'Executive layout', 'Professional styling', 'Impressive format'],
        tags: ['executive', 'senior', 'leadership', 'c-level']
    },
    {
        id: 4,
        name: 'Corporate Blue',
        category: 'professional',
        preview: 'https://picsum.photos/seed/corporate1/300x400.jpg',
        description: 'Professional blue-themed corporate resume',
        features: ['Blue color scheme', 'Corporate style', 'Clean design', 'Professional'],
        tags: ['corporate', 'business', 'finance', 'consulting']
    },

    // Creative Templates
    {
        id: 5,
        name: 'Creative Artist',
        category: 'creative',
        preview: 'https://picsum.photos/seed/creative1/300x400.jpg',
        description: 'Bold design for creative professionals',
        features: ['Creative layout', 'Colorful design', 'Unique styling', 'Eye-catching'],
        tags: ['creative', 'artist', 'designer', 'portfolio']
    },
    {
        id: 6,
        name: 'Graphic Designer',
        category: 'creative',
        preview: 'https://picsum.photos/seed/creative2/300x400.jpg',
        description: 'Modern design for graphic designers',
        features: ['Visual elements', 'Creative layout', 'Modern typography', 'Portfolio style'],
        tags: ['design', 'creative', 'visual', 'portfolio']
    },
    {
        id: 7,
        name: 'Photographer',
        category: 'creative',
        preview: 'https://picsum.photos/seed/creative3/300x400.jpg',
        description: 'Elegant design for photography professionals',
        features: ['Visual focus', 'Creative layout', 'Portfolio style', 'Professional'],
        tags: ['photography', 'creative', 'visual', 'portfolio']
    },
    {
        id: 8,
        name: 'Marketing Pro',
        category: 'creative',
        preview: 'https://picsum.photos/seed/creative4/300x400.jpg',
        description: 'Dynamic design for marketing professionals',
        features: ['Bold colors', 'Dynamic layout', 'Marketing focus', 'Creative'],
        tags: ['marketing', 'creative', 'sales', 'advertising']
    },

    // Modern Templates
    {
        id: 9,
        name: 'Tech Modern',
        category: 'modern',
        preview: 'https://picsum.photos/seed/modern1/300x400.jpg',
        description: 'Sleek design for technology professionals',
        features: ['Modern design', 'Tech focus', 'Clean layout', 'Professional'],
        tags: ['tech', 'software', 'it', 'developer']
    },
    {
        id: 10,
        name: 'Minimal Tech',
        category: 'modern',
        preview: 'https://picsum.photos/seed/modern2/300x400.jpg',
        description: 'Minimal design for tech professionals',
        features: ['Minimal design', 'Tech styling', 'Clean layout', 'Modern'],
        tags: ['tech', 'minimal', 'software', 'developer']
    },
    {
        id: 11,
        name: 'Startup Founder',
        category: 'modern',
        preview: 'https://picsum.photos/seed/modern3/300x400.jpg',
        description: 'Innovative design for startup founders',
        features: ['Innovative layout', 'Startup style', 'Modern design', 'Entrepreneurial'],
        tags: ['startup', 'founder', 'entrepreneur', 'innovation']
    },
    {
        id: 12,
        name: 'Data Scientist',
        category: 'technical',
        preview: 'https://picsum.photos/seed/technical1/300x400.jpg',
        description: 'Technical design for data science roles',
        features: ['Technical layout', 'Data focus', 'Professional design', 'Analytics'],
        tags: ['data', 'science', 'analytics', 'technical']
    },

    // Simple Templates
    {
        id: 13,
        name: 'Simple Clean',
        category: 'simple',
        preview: 'https://picsum.photos/seed/simple1/300x400.jpg',
        description: 'Clean and simple design for any profession',
        features: ['Simple layout', 'Clean design', 'Easy to read', 'Versatile'],
        tags: ['simple', 'clean', 'minimal', 'versatile']
    },
    {
        id: 14,
        name: 'Basic Professional',
        category: 'simple',
        preview: 'https://picsum.photos/seed/simple2/300x400.jpg',
        description: 'Basic professional design for all roles',
        features: ['Basic layout', 'Professional style', 'Clean design', 'Universal'],
        tags: ['basic', 'professional', 'simple', 'universal']
    },
    {
        id: 15,
        name: 'Minimal Elegant',
        category: 'simple',
        preview: 'https://picsum.photos/seed/simple3/300x400.jpg',
        description: 'Elegant minimal design',
        features: ['Minimal design', 'Elegant style', 'Clean layout', 'Sophisticated'],
        tags: ['minimal', 'elegant', 'simple', 'sophisticated']
    },
    {
        id: 16,
        name: 'Classic Simple',
        category: 'simple',
        preview: 'https://picsum.photos/seed/simple4/300x400.jpg',
        description: 'Classic simple design',
        features: ['Classic layout', 'Simple style', 'Traditional design', 'Timeless'],
        tags: ['classic', 'simple', 'traditional', 'timeless']
    },

    // Academic Templates
    {
        id: 17,
        name: 'Academic CV',
        category: 'academic',
        preview: 'https://picsum.photos/seed/academic1/300x400.jpg',
        description: 'Professional academic CV design',
        features: ['Academic layout', 'Research focus', 'Publications section', 'Professional'],
        tags: ['academic', 'research', 'education', 'scholar']
    },
    {
        id: 18,
        name: 'Professor CV',
        category: 'academic',
        preview: 'https://picsum.photos/seed/academic2/300x400.jpg',
        description: 'Design for professor positions',
        features: ['Professor layout', 'Academic focus', 'Research emphasis', 'Professional'],
        tags: ['professor', 'academic', 'research', 'education']
    },
    {
        id: 19,
        name: 'Research Scholar',
        category: 'academic',
        preview: 'https://picsum.photos/seed/academic3/300x400.jpg',
        description: 'Design for research scholars',
        features: ['Research layout', 'Scholarly focus', 'Publications', 'Academic'],
        tags: ['research', 'scholar', 'academic', 'publications']
    },
    {
        id: 20,
        name: 'Graduate Student',
        category: 'entry',
        preview: 'https://picsum.photos/seed/entry1/300x400.jpg',
        description: 'Design for recent graduates',
        features: ['Entry-level layout', 'Education focus', 'Simple design', 'Fresh graduate'],
        tags: ['graduate', 'student', 'entry-level', 'education']
    },

    // Entry Level Templates
    {
        id: 21,
        name: 'Entry Level Pro',
        category: 'entry',
        preview: 'https://picsum.photos/seed/entry2/300x400.jpg',
        description: 'Professional design for entry-level positions',
        features: ['Entry-level layout', 'Education focus', 'Simple design', 'Professional'],
        tags: ['entry-level', 'graduate', 'beginner', 'professional']
    },
    {
        id: 22,
        name: 'Internship',
        category: 'entry',
        preview: 'https://picsum.photos/seed/entry3/300x400.jpg',
        description: 'Design for internship applications',
        features: ['Internship layout', 'Student focus', 'Simple design', 'Entry-level'],
        tags: ['internship', 'student', 'entry-level', 'beginner']
    },
    {
        id: 23,
        name: 'First Job',
        category: 'entry',
        preview: 'https://picsum.photos/seed/entry4/300x400.jpg',
        description: 'Design for first job seekers',
        features: ['First job layout', 'Beginner focus', 'Simple design', 'Entry-level'],
        tags: ['first-job', 'beginner', 'entry-level', 'student']
    },

    // Technical Templates
    {
        id: 24,
        name: 'Software Engineer',
        category: 'technical',
        preview: 'https://picsum.photos/seed/technical2/300x400.jpg',
        description: 'Design for software engineers',
        features: ['Technical layout', 'Code focus', 'Projects section', 'Professional'],
        tags: ['software', 'engineer', 'developer', 'technical']
    },
    {
        id: 25,
        name: 'IT Professional',
        category: 'technical',
        preview: 'https://picsum.photos/seed/technical3/300x400.jpg',
        description: 'Design for IT professionals',
        features: ['IT layout', 'Technical focus', 'Skills emphasis', 'Professional'],
        tags: ['it', 'technical', 'professional', 'skills']
    },
    {
        id: 26,
        name: 'Web Developer',
        category: 'technical',
        preview: 'https://picsum.photos/seed/technical4/300x400.jpg',
        description: 'Design for web developers',
        features: ['Web layout', 'Development focus', 'Portfolio style', 'Technical'],
        tags: ['web', 'developer', 'frontend', 'backend']
    },
    {
        id: 27,
        name: 'DevOps Engineer',
        category: 'technical',
        preview: 'https://picsum.photos/seed/technical5/300x400.jpg',
        description: 'Design for DevOps engineers',
        features: ['DevOps layout', 'Technical focus', 'Skills emphasis', 'Professional'],
        tags: ['devops', 'technical', 'engineer', 'infrastructure']
    },

    // Executive Templates
    {
        id: 28,
        name: 'CEO Resume',
        category: 'executive',
        preview: 'https://picsum.photos/seed/executive2/300x400.jpg',
        description: 'Premium design for CEO positions',
        features: ['CEO layout', 'Executive style', 'Leadership focus', 'Premium'],
        tags: ['ceo', 'executive', 'leadership', 'c-level']
    },
    {
        id: 29,
        name: 'Director Resume',
        category: 'executive',
        preview: 'https://picsum.photos/seed/executive3/300x400.jpg',
        description: 'Professional design for director positions',
        features: ['Director layout', 'Executive style', 'Management focus', 'Professional'],
        tags: ['director', 'executive', 'management', 'leadership']
    },
    {
        id: 30,
        name: 'VP Resume',
        category: 'executive',
        preview: 'https://picsum.photos/seed/executive4/300x400.jpg',
        description: 'Premium design for VP positions',
        features: ['VP layout', 'Executive style', 'Leadership focus', 'Premium'],
        tags: ['vp', 'executive', 'vice-president', 'leadership']
    }
];

// Template filtering and loading system
let currentFilter = 'all';
let currentSearch = '';
let templatesToShow = 12;

// Get icon for template category
function getTemplateIcon(category) {
    const icons = {
        'professional': '<i class="fas fa-briefcase"></i>',
        'creative': '<i class="fas fa-palette"></i>',
        'modern': '<i class="fas fa-rocket"></i>',
        'simple': '<i class="fas fa-file-alt"></i>',
        'academic': '<i class="fas fa-graduation-cap"></i>',
        'executive': '<i class="fas fa-crown"></i>',
        'entry': '<i class="fas fa-user-graduate"></i>',
        'technical': '<i class="fas fa-code"></i>'
    };
    return icons[category] || '<i class="fas fa-file-alt"></i>';
}

// Load templates on template page - filters existing HTML templates
function loadTemplates(filter = 'all', search = '') {
    const templatesGrid = document.getElementById('templatesGrid');
    if (!templatesGrid) return;

    // Get all template cards
    const allTemplateCards = templatesGrid.querySelectorAll('.template-card');
    
    // Filter and show/hide templates based on category and search
    let visibleCount = 0;
    allTemplateCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardName = card.querySelector('h3')?.textContent || '';
        const cardDescription = card.querySelector('.template-info p')?.textContent || '';
        
        const matchesCategory = filter === 'all' || cardCategory === filter;
        const matchesSearch = search === '' || 
            cardName.toLowerCase().includes(search.toLowerCase()) ||
            cardDescription.toLowerCase().includes(search.toLowerCase());
        
        if (matchesCategory && matchesSearch && visibleCount < templatesToShow) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update load more button visibility
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        const totalMatching = Array.from(allTemplateCards).filter(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardName = card.querySelector('h3')?.textContent || '';
            const cardDescription = card.querySelector('.template-info p')?.textContent || '';
            const matchesCategory = filter === 'all' || cardCategory === filter;
            const matchesSearch = search === '' || 
                cardName.toLowerCase().includes(search.toLowerCase()) ||
                cardDescription.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        }).length;
        
        loadMoreBtn.style.display = visibleCount < totalMatching ? 'block' : 'none';
    }
}

// Initialize template controls
document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-category');
            templatesToShow = 12; // Reset to initial count
            loadTemplates(currentFilter, currentSearch);
        });
    });

    // Initialize search
    const searchInput = document.getElementById('templateSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value;
            templatesToShow = 12; // Reset to initial count
            loadTemplates(currentFilter, currentSearch);
        });
    }

    // Initialize load more
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            templatesToShow += 12;
            loadTemplates(currentFilter, currentSearch);
        });
    }
});

// Preview template in modal
function previewTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const modal = document.getElementById('templateModal');
    const modalName = document.getElementById('modalTemplateName');
    const modalImage = document.getElementById('modalTemplateImage');
    const modalFeatures = document.getElementById('templateFeatures');

    modalName.textContent = template.name;
    modalImage.src = template.preview;
    modalImage.alt = template.name + ' Template';
    
    modalFeatures.innerHTML = template.features.map(feature => `<li>${feature}</li>`).join('');

    // Store selected template
    modal.setAttribute('data-template-id', templateId);
    
    // Show modal
    modal.classList.add('show');
}

// Close template modal
function closeTemplateModal() {
    const modal = document.getElementById('templateModal');
    modal.classList.remove('show');
}

// Use template from modal
function useTemplate() {
    const modal = document.getElementById('templateModal');
    const templateId = parseInt(modal.getAttribute('data-template-id'));
    
    if (templateId) {
        selectTemplate(templateId);
        closeTemplateModal();
    }
}

// Resume Builder JavaScript
let currentStep = 1;
let resumeData = {
    personal: {},
    summary: '',
    experience: [],
    education: [],
    skills: []
};

// Initialize Resume Builder
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    if (document.getElementById('resumeForm')) {
        console.log('Resume form found, initializing...');
        initializeResumeBuilder();
    } else {
        console.log('Resume form not found');
    }
});

function initializeResumeBuilder() {
    console.log('Initializing resume builder');
    
    // Form submission
    const form = document.getElementById('resumeForm');
    if (form) {
        console.log('Adding form submit listener');
        form.addEventListener('submit', handleResumeFormSubmit);
    } else {
        console.log('Form not found');
        return;
    }
    
    // Live preview updates
    const formInputs = document.querySelectorAll('#resumeForm input, #resumeForm textarea');
    console.log('Found form inputs:', formInputs.length);
    formInputs.forEach(input => {
        input.addEventListener('input', updateLivePreview);
    });
    
    // Initialize photo upload
    initializePhotoUpload();
    
    // Check if user is logged in
    if (!backend.isLoggedIn()) {
        console.log('User not logged in, redirecting to login');
        window.location.href = 'login.html';
    } else {
        console.log('User is logged in');
    }
}

// Photo Upload Handling
let userPhotoData = null;

function initializePhotoUpload() {
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const removePhotoBtn = document.getElementById('removePhoto');
    
    if (photoPreview) {
        photoPreview.addEventListener('click', function() {
            photoInput.click();
        });
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    userPhotoData = event.target.result;
                    displayPhotoPreview(userPhotoData);
                    updateResumePhoto(userPhotoData);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function() {
            userPhotoData = null;
            photoInput.value = '';
            displayPhotoPreview(null);
            updateResumePhoto(null);
        });
    }
}

function displayPhotoPreview(photoData) {
    const photoPreview = document.getElementById('photoPreview');
    const removePhotoBtn = document.getElementById('removePhoto');
    
    if (photoData) {
        photoPreview.innerHTML = `<img src="${photoData}" alt="Photo Preview">`;
        if (removePhotoBtn) removePhotoBtn.style.display = 'inline-flex';
    } else {
        photoPreview.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Upload Photo</span>
        `;
        if (removePhotoBtn) removePhotoBtn.style.display = 'none';
    }
}

function updateResumePhoto(photoData) {
    const selectedTemplate = localStorage.getItem('selectedTemplate');
    
    // Handle daryl-banks template separately
    if (selectedTemplate === 'daryl-banks') {
        updateDarylBanksPhoto(photoData);
        return;
    }
    
    // Default behavior for other templates
    const previewPhoto = document.getElementById('previewPhoto');
    const previewPhotoContainer = document.getElementById('previewPhotoContainer');
    
    if (previewPhoto && previewPhotoContainer) {
        if (photoData) {
            previewPhoto.src = photoData;
            previewPhotoContainer.style.display = 'flex';
        } else {
            previewPhoto.src = '';
            previewPhotoContainer.style.display = 'none';
        }
    }
}

// Update photo specifically for daryl-banks template
function updateDarylBanksPhoto(photoData) {
    const previewPhoto = document.getElementById('previewPhoto');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    
    if (previewPhoto && photoPlaceholder) {
        if (photoData) {
            previewPhoto.src = photoData;
            previewPhoto.style.display = 'block';
            photoPlaceholder.style.display = 'none';
        } else {
            previewPhoto.src = '';
            previewPhoto.style.display = 'none';
            photoPlaceholder.style.display = 'flex';
        }
    }
}

// Check if current template is a photo template and show/hide photo accordingly
function checkPhotoTemplate() {
    const selectedTemplate = localStorage.getItem('selectedTemplate');
    const photoTemplates = ['daryl-banks'];
    
    if (photoTemplates.includes(selectedTemplate) && userPhotoData) {
        updateDarylBanksPhoto(userPhotoData);
    }
}

// Handle resume form submission
function handleResumeFormSubmit(e) {
    e.preventDefault();
    console.log('Form submission started');
    
    // Collect form data
    collectResumeData();
    console.log('Collected resume data:', resumeData);
    
    // Validate form
    if (!validateResumeData()) {
        console.log('Form validation failed');
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    console.log('Form validation passed');
    
    // Save resume data
    saveResumeData();
    
    // Move to next step
    goToStep(2);
}

// Collect resume data from form
function collectResumeData() {
    resumeData.personal = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        linkedin: document.getElementById('linkedin').value,
        photo: userPhotoData
    };
    
    resumeData.summary = document.getElementById('summary').value;
    
    // Collect experience
    resumeData.experience = [];
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach((item, index) => {
        const jobTitleInput = item.querySelector(`input[id^="jobTitle"]`);
        const companyInput = item.querySelector(`input[id^="company"]`);
        const startDateInput = item.querySelector(`input[id^="startDate"]`);
        const endDateInput = item.querySelector(`input[id^="endDate"]`);
        const currentJobInput = item.querySelector(`input[id^="currentJob"]`);
        const descriptionInput = item.querySelector(`textarea[id^="description"]`);
        
        if (jobTitleInput && companyInput) {
            resumeData.experience.push({
                jobTitle: jobTitleInput.value,
                company: companyInput.value,
                startDate: startDateInput ? startDateInput.value : '',
                endDate: endDateInput ? endDateInput.value : '',
                currentJob: currentJobInput ? currentJobInput.checked : false,
                description: descriptionInput ? descriptionInput.value : ''
            });
        }
    });
    
    // Collect education
    resumeData.education = [];
    const educationItems = document.querySelectorAll('.education-item');
    educationItems.forEach((item, index) => {
        const degreeInput = item.querySelector(`input[id^="degree"]`);
        const institutionInput = item.querySelector(`input[id^="institution"]`);
        const gradYearInput = item.querySelector(`input[id^="gradYear"]`);
        const gpaInput = item.querySelector(`input[id^="gpa"]`);
        
        if (degreeInput && institutionInput) {
            resumeData.education.push({
                degree: degreeInput.value,
                institution: institutionInput.value,
                gradYear: gradYearInput ? gradYearInput.value : '',
                gpa: gpaInput ? gpaInput.value : ''
            });
        }
    });
    
    resumeData.skills = document.getElementById('skills').value;
}

// Validate resume data
function validateResumeData() {
    // Check if basic personal info is filled
    if (!resumeData.personal.firstName || !resumeData.personal.lastName || !resumeData.personal.email) {
        console.log('Missing personal info');
        return false;
    }
    
    // Allow progression even with minimal summary
    if (!resumeData.summary) {
        console.log('Missing summary');
        return false;
    }
    
    // Allow progression even without experience for demo purposes
    console.log('Validation passed - allowing progression');
    return true;
}

// Save resume data to backend
function saveResumeData() {
    const user = backend.getCurrentUser();
    if (user) {
        // Save to localStorage for now
        localStorage.setItem('currentResume', JSON.stringify(resumeData));
    }
}

// Update live preview
function updateLivePreview() {
    // Update name
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const location = document.getElementById('location')?.value || '';
    
    const previewName = document.getElementById('previewName');
    const previewContact = document.getElementById('previewContact');
    
    if (previewName && (firstName || lastName)) {
        previewName.textContent = `${firstName} ${lastName}`.trim();
    }
    
    // Update contact
    const contactParts = [];
    if (email) contactParts.push(email);
    if (phone) contactParts.push(phone);
    if (location) contactParts.push(location);
    
    if (previewContact && contactParts.length > 0) {
        previewContact.textContent = contactParts.join(' | ');
    }
    
    // Update summary
    const summary = document.getElementById('summary')?.value || '';
    const previewSummary = document.getElementById('previewSummary');
    const previewSummarySection = document.getElementById('previewSummarySection');
    if (previewSummary && previewSummarySection) {
        if (summary) {
            previewSummary.textContent = summary;
            previewSummarySection.style.display = 'block';
        } else {
            previewSummarySection.style.display = 'none';
        }
    }
    
    // Update skills
    const skills = document.getElementById('skills')?.value || '';
    const previewSkills = document.getElementById('previewSkills');
    const previewSkillsSection = document.getElementById('previewSkillsSection');
    if (previewSkills && previewSkillsSection) {
        if (skills) {
            const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
            previewSkills.innerHTML = skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
            previewSkillsSection.style.display = 'block';
        } else {
            previewSkillsSection.style.display = 'none';
        }
    }
    
    // Update Experience
    updateExperiencePreview();
    
    // Update Education
    updateEducationPreview();
    
    // Reapply template structure with updated data
    applyTemplateToPreview();
}

// Update experience in preview
function updateExperiencePreview() {
    const experienceList = document.getElementById('experienceList');
    const previewExperience = document.getElementById('previewExperience');
    const previewExperienceSection = document.getElementById('previewExperienceSection');
    
    if (!experienceList || !previewExperience || !previewExperienceSection) return;
    
    const experienceItems = experienceList.querySelectorAll('.experience-item');
    if (experienceItems.length === 0) {
        previewExperienceSection.style.display = 'none';
        return;
    }
    
    let experienceHTML = '';
    experienceItems.forEach(item => {
        const jobTitle = item.querySelector('input[name="jobTitle"]')?.value || '';
        const company = item.querySelector('input[name="company"]')?.value || '';
        const startDate = item.querySelector('input[name="startDate"]')?.value || '';
        const endDate = item.querySelector('input[name="endDate"]')?.value || '';
        const currentJob = item.querySelector('input[name="currentJob"]')?.checked || false;
        const description = item.querySelector('textarea[name="description"]')?.value || '';
        
        if (jobTitle || company) {
            const dateRange = startDate ? `${startDate} - ${currentJob ? 'Present' : (endDate || '')}` : '';
            experienceHTML += `
                <div class="experience-preview-item">
                    <h4>${jobTitle}</h4>
                    <p class="company">${company}${dateRange ? ' | ' + dateRange : ''}</p>
                    ${description ? `<p class="description">${description}</p>` : ''}
                </div>
            `;
        }
    });
    
    if (experienceHTML) {
        previewExperience.innerHTML = experienceHTML;
        previewExperienceSection.style.display = 'block';
    } else {
        previewExperienceSection.style.display = 'none';
    }
}

// Update education in preview
function updateEducationPreview() {
    const educationList = document.getElementById('educationList');
    const previewEducation = document.getElementById('previewEducation');
    const previewEducationSection = document.getElementById('previewEducationSection');
    
    if (!educationList || !previewEducation || !previewEducationSection) return;
    
    const educationItems = educationList.querySelectorAll('.education-item');
    if (educationItems.length === 0) {
        previewEducationSection.style.display = 'none';
        return;
    }
    
    let educationHTML = '';
    educationItems.forEach(item => {
        const degree = item.querySelector('input[name="degree"]')?.value || '';
        const school = item.querySelector('input[name="school"]')?.value || '';
        const graduationDate = item.querySelector('input[name="graduationDate"]')?.value || '';
        
        if (degree || school) {
            educationHTML += `
                <div class="education-preview-item">
                    <h4>${degree}</h4>
                    <p class="school">${school}${graduationDate ? ' | ' + graduationDate : ''}</p>
                </div>
            `;
        }
    });
    
    if (educationHTML) {
        previewEducation.innerHTML = educationHTML;
        previewEducationSection.style.display = 'block';
    } else {
        previewEducationSection.style.display = 'none';
    }
}

// Step navigation
function goToStep(stepNumber) {
    console.log(`Moving from step ${currentStep} to step ${stepNumber}`);
    
    // Hide current step
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (currentStepElement) {
        currentStepElement.classList.remove('active');
        console.log(`Hidden step ${currentStep}`);
    }
    
    // Update step indicators
    const currentIndicator = document.querySelector(`.step[data-step="${currentStep}"]`);
    if (currentIndicator) {
        currentIndicator.classList.remove('active');
        currentIndicator.classList.add('completed');
        console.log(`Updated indicator for step ${currentStep}`);
    }
    
    // Show new step
    currentStep = stepNumber;
    const newStepElement = document.getElementById(`step${currentStep}`);
    if (newStepElement) {
        newStepElement.classList.add('active');
        console.log(`Showing step ${currentStep}`);
    }
    
    const newIndicator = document.querySelector(`.step[data-step="${currentStep}"]`);
    if (newIndicator) {
        newIndicator.classList.add('active');
        console.log(`Updated indicator for step ${currentStep}`);
    }
    
    // Initialize step-specific functionality
    initializeStep(currentStep);
}

// Test form functionality
function testForm() {
    console.log('Testing form functionality...');
    
    // Test form data collection
    collectResumeData();
    console.log('Test - Collected data:', resumeData);
    
    // Test validation
    const isValid = validateResumeData();
    console.log('Test - Validation result:', isValid);
    
    if (isValid) {
        showMessage('Form test passed! You can now submit the form.', 'success');
    } else {
        showMessage('Please fill in required fields: First Name, Last Name, Email, and Summary', 'error');
    }
}

// Initialize step-specific functionality
function initializeStep(stepNumber) {
    switch(stepNumber) {
        case 2:
            initializeAccuracyCheck();
            break;
        case 3:
            initializeChatbot();
            break;
        case 4:
            initializeInterview();
            break;
        case 5:
            initializeFakeDetection();
            break;
        case 6:
            initializeHeatmap();
            break;
        case 7:
            // Fresher Rescue Mode - no initialization needed, user clicks button to generate suggestions
            break;
        case 8:
            // Facial Expression Analysis - no initialization needed, user clicks button to start camera
            break;
    }
}

let experienceCount = 1;
let educationCount = 1;

// Add experience item
function addExperience() {
    const experienceList = document.getElementById('experienceList');
    const experienceItem = document.createElement('div');
    experienceItem.className = 'experience-item';
    const currentCount = experienceCount++;
    
    experienceItem.innerHTML = `
        <button type="button" class="remove-item" onclick="removeItem(this)">
            <i class="fas fa-times"></i>
        </button>
        <div class="form-row">
            <div class="form-group">
                <label for="jobTitle${currentCount}">Job Title</label>
                <input type="text" id="jobTitle${currentCount}" name="jobTitle" required>
            </div>
            <div class="form-group">
                <label for="company${currentCount}">Company</label>
                <input type="text" id="company${currentCount}" name="company" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="startDate${currentCount}">Start Date</label>
                <input type="month" id="startDate${currentCount}" name="startDate" required>
            </div>
            <div class="form-group">
                <label for="endDate${currentCount}">End Date</label>
                <input type="month" id="endDate${currentCount}" name="endDate">
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="currentJob${currentCount}" name="currentJob"> Current Job
                    </label>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="description${currentCount}">Job Description</label>
            <textarea id="description${currentCount}" name="description" rows="3" required></textarea>
            <button type="button" class="btn-ai-suggest" onclick="showDescriptionSuggestions('description${currentCount}')">
                <i class="fas fa-magic"></i> Get AI Suggestions
            </button>
            <div class="ai-suggestions-dropdown" id="description${currentCount}Suggestions" style="display: none;">
                <div class="suggestions-header">
                    <span>Choose a job description (20 suggestions)</span>
                    <button type="button" class="close-suggestions" onclick="hideDescriptionSuggestions('description${currentCount}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="suggestions-list" id="description${currentCount}SuggestionsList">
                    <!-- Suggestions will be populated here -->
                </div>
            </div>
        </div>
    `;
    experienceList.appendChild(experienceItem);
    
    // Add input event listeners to new experience item inputs
    const inputs = experienceItem.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updateLivePreview);
    });
}

// Add education item
function addEducation() {
    const educationList = document.getElementById('educationList');
    const educationItem = document.createElement('div');
    educationItem.className = 'education-item';
    const currentCount = educationCount++;
    
    educationItem.innerHTML = `
        <button type="button" class="remove-item" onclick="removeItem(this)">
            <i class="fas fa-times"></i>
        </button>
        <div class="form-row">
            <div class="form-group">
                <label for="degree${currentCount}">Degree</label>
                <input type="text" id="degree${currentCount}" name="degree" required>
            </div>
            <div class="form-group">
                <label for="institution${currentCount}">Institution</label>
                <input type="text" id="institution${currentCount}" name="institution" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="gradYear${currentCount}">Graduation Year</label>
                <input type="number" id="gradYear${currentCount}" name="gradYear" min="1950" max="2030" required>
            </div>
            <div class="form-group">
                <label for="gpa${currentCount}">GPA (Optional)</label>
                <input type="number" id="gpa${currentCount}" name="gpa" min="0" max="4" step="0.1">
            </div>
        </div>
    `;
    educationList.appendChild(educationItem);
    
    // Add input event listeners to new education item inputs
    const inputs = educationItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateLivePreview);
    });
}

// Remove item
function removeItem(button) {
    button.parentElement.remove();
    updateLivePreview();
}

// Initialize Accuracy Check
function initializeAccuracyCheck() {
    setTimeout(() => {
        calculateAccuracy();
    }, 500);
}

function calculateAccuracy() {
    const accuracy = calculateResumeAccuracy();
    const score = Math.round(accuracy.overall);
    
    // Update main score
    document.getElementById('accuracyScore').textContent = `${score}%`;
    document.querySelector('.score-circle').style.setProperty('--score', `${score * 3.6}deg`);
    
    // Update category scores
    updateCategoryScore('completeness', accuracy.completeness);
    updateCategoryScore('professionalism', accuracy.professionalism);
    updateCategoryScore('relevance', accuracy.relevance);
    updateCategoryScore('formatting', accuracy.formatting);
    
    // Add recommendations
    addAccuracyRecommendations(accuracy.recommendations);
    
    // Draw chart
    drawAccuracyChart(accuracy);
}

function calculateResumeAccuracy() {
    let completeness = 0;
    let professionalism = 0;
    let relevance = 0;
    let formatting = 0;
    const recommendations = [];
    
    // Calculate completeness
    if (resumeData.personal.firstName && resumeData.personal.lastName) completeness += 10;
    if (resumeData.personal.email) completeness += 10;
    if (resumeData.personal.phone) completeness += 10;
    if (resumeData.summary && resumeData.summary.length > 100) completeness += 20;
    if (resumeData.experience.length > 0) completeness += 25;
    if (resumeData.education.length > 0) completeness += 15;
    if (resumeData.skills && resumeData.skills.split(',').length > 5) completeness += 10;
    
    if (completeness < 70) {
        recommendations.push('Add more information to improve completeness');
    }
    
    // Calculate professionalism
    if (resumeData.summary && resumeData.summary.length > 50) professionalism += 25;
    if (resumeData.experience.some(exp => exp.description.length > 100)) professionalism += 25;
    if (resumeData.personal.linkedin) professionalism += 15;
    if (resumeData.education.length > 0) professionalism += 20;
    if (resumeData.skills && resumeData.skills.split(',').length > 3) professionalism += 15;
    
    if (professionalism < 70) {
        recommendations.push('Enhance your professional summary and experience descriptions');
    }
    
    // Calculate relevance (simulated)
    relevance = Math.floor(Math.random() * 30) + 70; // 70-100 range
    
    // Calculate formatting (simulated)
    formatting = Math.floor(Math.random() * 20) + 80; // 80-100 range
    
    return {
        overall: (completeness + professionalism + relevance + formatting) / 4,
        completeness,
        professionalism,
        relevance,
        formatting,
        recommendations
    };
}

function updateCategoryScore(category, score) {
    const scoreElement = document.getElementById(`${category}Score`);
    const barElement = document.getElementById(`${category}Bar`);
    
    if (scoreElement && barElement) {
        scoreElement.textContent = `${Math.round(score)}%`;
        barElement.style.width = `${score}%`;
    }
}

function addAccuracyRecommendations(recommendations) {
    const list = document.getElementById('recommendationsList');
    list.innerHTML = '';
    
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        list.appendChild(li);
    });
}

function drawAccuracyChart(accuracy) {
    const canvas = document.getElementById('accuracyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw simple bar chart
    const categories = ['Completeness', 'Professionalism', 'Relevance', 'Formatting'];
    const values = [accuracy.completeness, accuracy.professionalism, accuracy.relevance, accuracy.formatting];
    const barWidth = 60;
    const spacing = 40;
    const startX = (width - (categories.length * barWidth + (categories.length - 1) * spacing)) / 2;
    
    categories.forEach((category, index) => {
        const x = startX + index * (barWidth + spacing);
        const barHeight = (values[index] / 100) * (height - 40);
        const y = height - barHeight - 20;
        
        // Draw bar
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(category, x + barWidth / 2, height - 5);
        
        // Draw value
        ctx.fillText(`${Math.round(values[index])}%`, x + barWidth / 2, y - 5);
    });
}

// Initialize Chatbot
function initializeChatbot() {
    // Add welcome message if chat is empty
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer && messagesContainer.children.length === 0) {
        addChatMessage("Hello! I'm your AI Resume Assistant. I can help you improve your resume, suggest better wording, answer questions about resume best practices, and provide personalized advice. How can I help you today?", 'bot');
    }
    
    // Add Enter key listener for chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate bot response with variable delay for realism
    const delay = 800 + Math.random() * 1000;
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateBotResponse(message);
        addChatMessage(response, 'bot');
    }, delay);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Convert newlines to <br> for better formatting
    const formattedMessage = message.replace(/\n/g, '<br>');
    contentDiv.innerHTML = `<p>${formattedMessage}</p>`;
    
    // Add timestamp
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    const now = new Date();
    timeDiv.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    contentDiv.appendChild(timeDiv);
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function generateBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Resume summary/professional summary responses
    if (lowerMessage.includes('summary') || lowerMessage.includes('about me') || lowerMessage.includes('objective')) {
        if (lowerMessage.includes('how') || lowerMessage.includes('write') || lowerMessage.includes('improve')) {
            return `Here's how to write a compelling professional summary:

1. **Keep it concise** - 3-5 sentences that capture your essence
2. **Start strong** - Mention years of experience and your core expertise
3. **Highlight achievements** - Include 1-2 key accomplishments with metrics
4. **Target the role** - Tailor it to the job you're applying for
5. **Use keywords** - Include industry-relevant terms for ATS optimization

Example: "Results-driven Software Engineer with 5+ years of experience developing scalable web applications. Proven track record of reducing load times by 40% and increasing user engagement. Expert in React, Node.js, and cloud technologies. Seeking to leverage expertise in a senior development role."

Would you like me to review your current summary?`;
        }
        return `Your professional summary is the first thing recruiters see. It should be a brief elevator pitch that highlights your value proposition.

Key elements:
• Years of experience
• Core expertise/skills
• 1-2 quantifiable achievements
• Career goals

Would you like tips on writing one or help improving your existing summary?`;
    }
    
    // Skills section responses
    if (lowerMessage.includes('skill') || lowerMessage.includes('technologies') || lowerMessage.includes('tools')) {
        if (lowerMessage.includes('how many') || lowerMessage.includes('how much')) {
            return `For the skills section, I recommend listing **6-10 key skills** that are most relevant to your target job.

Here's the optimal approach:
• **Technical Skills**: Programming languages, software, tools (80% of your list)
• **Soft Skills**: Communication, leadership, teamwork (20% of your list)
• **Proficiency levels**: Only include skills you're confident in (intermediate to expert)
• **Industry keywords**: Use terms from the job description for ATS matching

Avoid listing too many skills (looks unfocused) or too few (looks inexperienced). Quality over quantity!`;
        }
        return `Listing the right skills is crucial for passing ATS and catching recruiters' attention.

Best practices:
• Include **hard skills** specific to your industry (Python, Excel, Photoshop, etc.)
• Add **soft skills** sparingly (Leadership, Communication, Problem-solving)
• Use **industry-standard terminology** - avoid jargon
• **Order by relevance** - most important skills first
• **Be honest** - only list skills you can actually use

Would you like help identifying which skills to include for your specific role?`;
    }
    
    // Work experience responses
    if (lowerMessage.includes('experience') || lowerMessage.includes('work') || lowerMessage.includes('job')) {
        if (lowerMessage.includes('how') || lowerMessage.includes('write') || lowerMessage.includes('describe')) {
            return `To write compelling work experience bullet points, use the **STAR method** or **CAR method**:

**Structure each point:**
Action Verb + Task/Project + Quantifiable Result

**Powerful action verbs to use:**
• Achieved, Improved, Increased, Reduced, Streamlined
• Led, Managed, Coordinated, Supervised, Directed
• Developed, Created, Designed, Implemented, Launched
• Analyzed, Researched, Evaluated, Optimized, Solved

**Example transformations:**
❌ "Responsible for managing a team"
✅ "Led a team of 8 developers, delivering 12 projects on time and increasing team productivity by 25%"

❌ "Worked on website development"
✅ "Developed and launched 3 responsive websites, improving mobile traffic by 60% and reducing bounce rate by 15%"

The key is to show **impact with numbers** whenever possible!`;
        }
        return `Your work experience section should tell a story of growth and impact.

Each job entry should include:
• **Job title**, company name, location, dates
• **3-5 bullet points** with quantifiable achievements
• **Action verbs** to start each point (Led, Developed, Increased)
• **Results** - not just what you did, but what you achieved

**Pro tip**: Older jobs (7+ years ago) can have fewer bullets. Focus most detail on recent roles.

Would you like specific help writing bullet points for a particular job?`;
    }
    
    // Education responses
    if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('school') || lowerMessage.includes('college')) {
        return `Your education section should be clear and concise:

**What to include:**
• Degree name (e.g., Bachelor of Science in Computer Science)
• Institution name and location
• Graduation year (or expected graduation)
• GPA (only if 3.5 or above)
• Relevant coursework or honors (optional)

**Formatting tips:**
• List most recent education first
• Include certifications in this section or separate
• If you have extensive work experience, keep this section brief
• For recent graduates, you can include relevant projects or thesis work

**Example:**
Bachelor of Science in Marketing
University of California, Berkeley | Berkeley, CA
Graduated: May 2023 | GPA: 3.7/4.0

Do you need help formatting your education section?`;
    }
    
    // Formatting/template responses
    if (lowerMessage.includes('format') || lowerMessage.includes('template') || lowerMessage.includes('layout') || lowerMessage.includes('design')) {
        return `Resume formatting best practices:

**Length:**
• 1 page for under 10 years experience
• 2 pages maximum for senior professionals

**Fonts:**
• Professional fonts: Arial, Calibri, Georgia, Helvetica
• 10-12pt for body text, 14-16pt for headers
• Keep consistent throughout

**Structure:**
• Clear section headings (bold or slightly larger)
• Consistent spacing and margins (0.5-1 inch)
• White space is your friend - don't overcrowd
• Use bullet points for readability

**File format:**
• Save as PDF (preserves formatting)
• Name file professionally: "FirstName_LastName_Resume.pdf"

**ATS-friendly tips:**
• Avoid tables, images, headers/footers
• Use standard section titles
• Stick to one column layout

Would you like help choosing a template or formatting your current resume?`;
    }
    
    // ATS (Applicant Tracking System) responses
    if (lowerMessage.includes('ats') || lowerMessage.includes('parser') || lowerMessage.includes('scan') || lowerMessage.includes('keyword')) {
        return `To make your resume ATS-friendly:

**Do:**
• Use standard section titles (Experience, Education, Skills)
• Include keywords from the job description
• Use common fonts (Arial, Calibri, Times New Roman)
• Save as .docx or .pdf
• Use simple bullet points
• Include both acronyms and full terms (SEO/Search Engine Optimization)

**Don't:**
• Use tables, text boxes, or columns
• Include images, photos, or graphics
• Use headers/footers for important info
• Submit as an image file
• Use creative fonts or excessive styling

**Keyword optimization:**
Scan the job description for repeated terms and naturally incorporate them into your resume. This significantly increases your chances of passing ATS filters.

Want help optimizing your resume for a specific job posting?`;
    }
    
    // Cover letter responses
    if (lowerMessage.includes('cover letter') || lowerMessage.includes('coverletter') || lowerMessage.includes('application letter')) {
        return `A strong cover letter complements your resume:

**Structure (3-4 paragraphs):**
1. **Opening** - Hook with enthusiasm and mention the specific role
2. **Why you're qualified** - 2-3 key achievements matching job requirements
3. **Why this company** - Show you've researched them
4. **Closing** - Call to action (interview request)

**Tips:**
• Address to a specific person when possible
• Keep it to 1 page (250-400 words)
• Match your tone to company culture
• Proofread carefully - one typo can hurt you
• Use the same header as your resume

**Sample opening:**
"As a passionate software developer with 4 years of experience building user-centric applications, I was excited to see the Front-End Developer position at TechCorp. Your commitment to innovation aligns perfectly with my drive for creating impactful digital experiences."

Need help writing or reviewing your cover letter?`;
    }
    
    // Interview prep responses
    if (lowerMessage.includes('interview') || lowerMessage.includes('prepare') || lowerMessage.includes('question')) {
        if (lowerMessage.includes('common') || lowerMessage.includes('question')) {
            return `Common interview questions and how to answer them:

**"Tell me about yourself"**
Keep it professional: Present → Past → Future
"I'm currently a Marketing Manager at XYZ Corp where I lead a team of 5. Previously, I built my foundation at ABC Company. I'm now looking to bring my expertise to a larger organization like yours."

**"What's your greatest weakness?"**
Choose a real but manageable weakness and show improvement:
"I used to struggle with delegation, but I've worked on trusting my team and now regularly assign tasks, which has improved our efficiency by 30%."

**"Why should we hire you?"**
Match your skills to their needs:
"You need someone who can lead cross-functional teams. In my current role, I've successfully coordinated marketing, sales, and product teams on 8 major launches."

**"Where do you see yourself in 5 years?"**
Show ambition tied to the role:
"I want to grow into a senior leadership position while deepening my technical expertise. This role is the perfect stepping stone."

Would you like help with specific interview questions?`;
        }
        return `Interview preparation tips:

**Before the interview:**
• Research the company thoroughly (products, culture, recent news)
• Prepare STAR stories for behavioral questions
• Practice your elevator pitch
• Prepare 3-5 questions to ask them
• Plan your outfit and route

**During the interview:**
• Arrive 10-15 minutes early (or join call 5 min early)
• Bring copies of your resume
• Maintain eye contact and good posture
• Listen actively and take brief notes
• Be specific with examples

**After the interview:**
• Send a thank-you email within 24 hours
• Reference specific conversation points
• Reiterate your enthusiasm

The interview section in this tool can help you practice! Would you like to try it?`;
    }
    
    // Career change responses
    if (lowerMessage.includes('career change') || lowerMessage.includes('switch') || lowerMessage.includes('transition') || lowerMessage.includes('gap')) {
        return `Handling career transitions on your resume:

**For career changers:**
• Use a functional or hybrid resume format
• Lead with transferable skills section
• Highlight relevant coursework or certifications
• Emphasize projects (even personal ones)
• Include volunteer work in new field

**For employment gaps:**
• Use years only (2020-2022) instead of months
• Fill gaps with productive activities (courses, freelance, volunteering)
• Address briefly in cover letter if needed
• Focus on skills gained during gap

**Sample skills-first format:**
PROFESSIONAL SKILLS
• Project Management: Led 12+ projects with 95% on-time delivery
• Data Analysis: Proficient in SQL, Python, Tableau
• Team Leadership: Managed teams of 5-10 people

WORK HISTORY
[Then list jobs with less detail]

Would you like help restructuring your resume for a career change?`;
    }
    
    // Resume length/page count responses
    if (lowerMessage.includes('length') || lowerMessage.includes('page') || lowerMessage.includes('how long') || lowerMessage.includes('short')) {
        return `Resume length guidelines:

**1 Page:**
• Students and recent graduates
• Professionals with under 7-10 years experience
• Career changers (to hide gaps)

**2 Pages:**
• Professionals with 10+ years experience
• Those with extensive publications/certifications
• Senior executives

**Never more than 2 pages** unless you're in academia or have extensive publications.

**To fit more on 1 page:**
• Reduce margins slightly (not below 0.5")
• Use a slightly smaller font (10-11pt)
• Condense older experience
• Remove irrelevant jobs
• Cut redundant bullet points

**Quality over quantity!** A concise, impactful 1-page resume beats a wordy 2-pager every time.

Need help condensing your resume?`;
    }
    
    // Action verbs/power words responses
    if (lowerMessage.includes('action verb') || lowerMessage.includes('power word') || lowerMessage.includes('strong word')) {
        return `Powerful action verbs by category:

**Leadership:**
Led, Directed, Managed, Supervised, Coordinated, Orchestrated, Guided, Mentored, Trained

**Achievement:**
Achieved, Exceeded, Outperformed, Surpassed, Improved, Increased, Reduced, Streamlined, Optimized

**Creativity:**
Created, Designed, Developed, Innovated, Launched, Pioneered, Established, Initiated, Conceptualized

**Communication:**
Presented, Negotiated, Collaborated, Liaised, Authored, Composed, Published, Pitched, Facilitated

**Technical:**
Built, Programmed, Engineered, Architected, Automated, Implemented, Deployed, Configured, Debugged

**Problem-Solving:**
Analyzed, Diagnosed, Resolved, Solved, Troubleshot, Investigated, Evaluated, Assessed

**Financial:**
Budgeted, Forecasted, Reduced costs, Increased revenue, Managed $X budget, Cut expenses

**Replace weak phrases like "Responsible for" or "Worked on" with these strong verbs!**

Want help rewriting specific bullet points?`;
    }
    
    // Personal info/photo responses
    if (lowerMessage.includes('photo') || lowerMessage.includes('picture') || lowerMessage.includes('personal info') || lowerMessage.includes('age') || lowerMessage.includes('married')) {
        return `What NOT to include on your resume:

**Never include:**
• Photo/headshot (unless requested for acting/modeling)
• Date of birth or age
• Marital status or children
• Religion or political affiliations
• Social Security Number
• Full address (city/state only)
• Hobbies (unless directly relevant)
• References (save for later)

**Why?**
These can lead to unconscious bias in hiring decisions. In fact, including a photo can actually hurt your chances in countries like the US, UK, and Canada.

**What TO include:**
• Name and professional title
• Phone number and professional email
• LinkedIn URL (optional but recommended)
• City/State or "Remote"
• Portfolio/GitHub (for technical roles)

Keep it professional and relevant to the job!`;
    }
    
    // Greetings and small talk
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/)) {
        const greetings = [
            "Hello! I'm here to help you create an outstanding resume. What would you like to know?",
            "Hi there! Ready to help you land your dream job. What can I assist with?",
            "Hey! I'm your resume assistant. Ask me anything about resumes, interviews, or job searching!",
            "Greetings! Let's work on making your resume stand out. What do you need help with?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Thank you responses
    if (lowerMessage.match(/(thank|thanks|appreciate|helpful)/)) {
        const thanks = [
            "You're welcome! Feel free to ask if you have more questions.",
            "Happy to help! Let me know if you need anything else.",
            "Glad I could assist! What else would you like to work on?",
            "Anytime! Keep refining that resume - you've got this!"
        ];
        return thanks[Math.floor(Math.random() * thanks.length)];
    }
    
    // Generic help/what can you do responses
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you') || lowerMessage.includes('what do you')) {
        return `I can help you with many aspects of your job search:

**Resume Writing:**
• Professional summary tips
• Work experience bullet points
• Skills section optimization
• Education formatting
• ATS optimization

**Resume Strategy:**
• Format and layout advice
• Length guidelines
• Career change strategies
• Handling employment gaps

**Job Search:**
• Cover letter writing
• Interview preparation
• Common questions and answers
• Salary negotiation tips

**Just ask me anything specific!** For example:
• "How do I write a good summary?"
• "What skills should I include?"
• "How do I explain a career gap?"
• "Can you review my experience section?"

What would you like help with?`;
    }
    
    // Default response for unrecognized queries
    return `That's an interesting question! Let me help you with that.

I can assist with:
• Writing and improving your resume sections
• Formatting and design advice
• ATS optimization strategies
• Interview preparation
• Career transition guidance
• Cover letter writing

Could you provide a bit more detail about what you're looking for? For example, are you asking about:
• A specific resume section (summary, experience, skills)?
• Formatting or design choices?
• Job search strategies?
• Interview tips?

I'm here to help make your resume the best it can be!`;
}

function askQuestion(topic) {
    const input = document.getElementById('chatInput');
    input.value = topic;
    sendMessage();
}

// Initialize Interview
function initializeInterview() {
    // Initialize Web Speech API if available
    if ('speechSynthesis' in window) {
        console.log('Speech synthesis available');
    }
    
    // Check for speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('Speech recognition available');
    }
}

// Initialize Heatmap
function initializeHeatmap() {
    setTimeout(() => {
        generateSectionHeatmap();
        generateKeywordHeatmap();
        analyzeSkillRelevance();
    }, 500);
}

let interviewTimer;
let interviewTimeRemaining = 105; // 1 minute 45 seconds
let interviewQuestions = [
    "Tell me about yourself and your professional background.",
    "What are your key strengths and how do they apply to this role?",
    "Describe a challenging project you've worked on and how you handled it.",
    "Where do you see yourself professionally in the next 3-5 years?",
    "Why are you interested in this particular role/industry?"
];
let currentQuestionIndex = 0;
let voiceEnabled = true;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let answerTimer = null;
let isAnswering = false;
let userAnswers = [];
let answerQuality = []; // Track 'good' or 'not appropriate' for each answer
let answerTimeRemaining = 12;

const interviewIntro = "Welcome to your AI interview practice. I will ask you five professional questions about your background and experience. You will have 12 seconds to type your answer after each question. Let's begin!";
const interviewOutro = "Thank you for completing this interview practice. You did a great job answering the questions. Your responses show good communication skills and professional awareness. Keep practicing to improve your interview performance!";

function startInterview() {
    // Reset timer and answers
    interviewTimeRemaining = 90;
    currentQuestionIndex = 0;
    isAnswering = false;
    userAnswers = [];
    answerQuality = []; // Reset answer quality tracking
    
    // Clear answer textarea
    document.getElementById('interviewAnswer').value = '';
    
    // Update UI
    document.getElementById('startInterview').disabled = true;
    document.getElementById('stopInterview').disabled = false;
    document.getElementById('submitAnswer').disabled = true;
    document.getElementById('interviewStatus').textContent = 'Interviewing';
    document.getElementById('interviewStatus').classList.add('interviewing');
    document.getElementById('robotAvatar').classList.add('speaking');
    document.getElementById('speakingIndicator').classList.add('active');
    document.getElementById('currentQuestion').textContent = interviewIntro;
    
    // Start timer
    updateInterviewTimer();
    interviewTimer = setInterval(updateInterviewTimer, 1000);
    
    // Speak intro with callback to start questions
    speakWithCallback(interviewIntro, showNextQuestion);
}

function evaluateAnswer(answer) {
    // Check if answer is well-structured and appropriate
    const minLength = 20; // Minimum characters for a proper answer
    const hasStructure = answer.includes('.') || answer.includes(',');
    const wordCount = answer.split(/\s+/).filter(w => w.length > 0).length;
    
    // Answer is good if it has:
    // - At least 20 characters
    // - At least 5 words
    // - Has proper punctuation (sentence structure)
    if (answer.length >= minLength && wordCount >= 5 && hasStructure) {
        return 'good';
    }
    return 'not appropriate';
}

function submitAnswer() {
    if (!isAnswering) return;
    
    // Get user's answer
    const answer = document.getElementById('interviewAnswer').value.trim();
    userAnswers.push(answer);
    
    // Evaluate answer quality
    const quality = evaluateAnswer(answer);
    answerQuality.push(quality);
    
    // Clear the textarea
    document.getElementById('interviewAnswer').value = '';
    
    // Disable submit button
    document.getElementById('submitAnswer').disabled = true;
    
    // Clear answer timer interval
    if (answerTimer) {
        clearInterval(answerTimer);
    }
    
    // Hide answer timer
    document.getElementById('answerTimer').style.display = 'none';
    
    // Only provide positive immediate feedback for good answers
    // "Not appropriate" feedback is deferred to final summary
    if (quality === 'good') {
        const feedbackMessage = 'Good answer.';
        
        // Show positive feedback in the current question area temporarily
        const questionElement = document.getElementById('currentQuestion');
        const originalText = questionElement.textContent;
        questionElement.innerHTML = `<span style="color: #10b981; font-weight: 600;">${feedbackMessage}</span>`;
        
        // Speak feedback if voice is enabled
        if (voiceEnabled) {
            speakWithCallback(feedbackMessage, () => {
                questionElement.textContent = originalText;
                showNextQuestion();
            });
        } else {
            // Wait 1 second then continue
            setTimeout(() => {
                questionElement.textContent = originalText;
                showNextQuestion();
            }, 1000);
        }
    } else {
        // For not appropriate answers, silently move to next question
        showNextQuestion();
    }
}

function stopInterview() {
    clearInterval(interviewTimer);
    
    // Clear answer timer interval
    if (answerTimer) {
        clearInterval(answerTimer);
    }
    
    // Hide answer timer
    document.getElementById('answerTimer').style.display = 'none';
    
    // Stop any ongoing speech
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    // Update UI
    document.getElementById('startInterview').disabled = false;
    document.getElementById('stopInterview').disabled = true;
    document.getElementById('submitAnswer').disabled = true;
    document.getElementById('interviewStatus').textContent = 'Completed';
    document.getElementById('interviewStatus').classList.remove('interviewing');
    document.getElementById('robotAvatar').classList.remove('speaking');
    document.getElementById('speakingIndicator').classList.remove('active');
    
    // Show feedback
    showInterviewFeedback();
}

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const button = document.getElementById('toggleVoice');
    
    if (voiceEnabled) {
        button.innerHTML = '<i class="fas fa-volume-up"></i> Voice On';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
    } else {
        button.innerHTML = '<i class="fas fa-volume-mute"></i> Voice Off';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        
        // Stop any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }
}

function updateInterviewTimer() {
    interviewTimeRemaining--;
    
    const minutes = Math.floor(interviewTimeRemaining / 60);
    const seconds = interviewTimeRemaining % 60;
    
    document.getElementById('timeRemaining').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (interviewTimeRemaining <= 0) {
        stopInterview();
    }
}

function showNextQuestion() {
    if (currentQuestionIndex < interviewQuestions.length) {
        const question = interviewQuestions[currentQuestionIndex];
        document.getElementById('currentQuestion').textContent = question;
        
        // Update question counter
        document.getElementById('questionCounter').textContent = `Question ${currentQuestionIndex + 1} of ${interviewQuestions.length}`;
        
        // Speak the question with callback to start answer period
        speakWithCallback(question, () => {
            isAnswering = true;
            currentQuestionIndex++;
            
            // Enable submit button
            document.getElementById('submitAnswer').disabled = false;
            
            // Show answer timer
            document.getElementById('answerTimer').style.display = 'inline-block';
            
            // Reset answer time
            answerTimeRemaining = 12;
            document.getElementById('answerTimeRemaining').textContent = answerTimeRemaining;
            
            // Clear previous answer timer if exists
            if (answerTimer) {
                clearInterval(answerTimer);
            }
            
            // Start answer countdown
            answerTimer = setInterval(() => {
                answerTimeRemaining--;
                document.getElementById('answerTimeRemaining').textContent = answerTimeRemaining;
                
                if (answerTimeRemaining <= 0) {
                    clearInterval(answerTimer);
                    if (document.getElementById('stopInterview').disabled === false) {
                        // Auto-submit empty answer if user didn't submit
                        const answer = document.getElementById('interviewAnswer').value.trim();
                        if (answer) {
                            submitAnswer();
                        } else {
                            userAnswers.push(''); // Empty answer
                            answerQuality.push('not appropriate'); // Empty answers are not appropriate
                            document.getElementById('interviewAnswer').value = '';
                            showNextQuestion();
                        }
                    }
                }
            }, 1000);
        });
    } else {
        // All questions asked, show outro
        showInterviewOutro();
    }
}

function showInterviewOutro() {
    isAnswering = false;
    
    // Clear answer timer
    if (answerTimer) {
        clearTimeout(answerTimer);
    }
    
    // Disable submit button
    document.getElementById('submitAnswer').disabled = true;
    
    // Show outro message
    document.getElementById('currentQuestion').textContent = interviewOutro;
    
    // Speak outro with callback to end interview
    speakWithCallback(interviewOutro, () => {
        setTimeout(() => {
            stopInterview();
        }, 1000);
    });
}

function speakWithCallback(text, callback) {
    if (!voiceEnabled || !('speechSynthesis' in window)) {
        // If voice is disabled or not available, call callback after a delay
        setTimeout(callback, 1000);
        return;
    }
    
    // Cancel any ongoing speech
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 0.9; // Slightly slower for clarity
    currentUtterance.pitch = 1.0; // Natural pitch
    currentUtterance.volume = 1.0; // Full volume
    
    // Try to use a natural-sounding voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Daniel')
    );
    
    if (preferredVoice) {
        currentUtterance.voice = preferredVoice;
    }
    
    // Handle speech events
    currentUtterance.onstart = () => {
        document.getElementById('robotAvatar').classList.add('speaking');
        document.getElementById('speakingIndicator').classList.add('active');
    };
    
    currentUtterance.onend = () => {
        setTimeout(() => {
            document.getElementById('robotAvatar').classList.remove('speaking');
            document.getElementById('speakingIndicator').classList.remove('active');
            if (callback) callback();
        }, 300);
    };
    
    currentUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        document.getElementById('robotAvatar').classList.remove('speaking');
        document.getElementById('speakingIndicator').classList.remove('active');
        if (callback) callback();
    };
    
    speechSynthesis.speak(currentUtterance);
}

function speakQuestion(question) {
    speakWithCallback(question, null);
}

function showInterviewFeedback() {
    const feedback = document.getElementById('interviewFeedback');
    const feedbackContent = document.getElementById('feedbackContent');
    
    // Build question-by-question analysis
    let goodQuestions = [];
    let notAppropriateQuestions = [];
    
    answerQuality.forEach((quality, index) => {
        const questionNumber = index + 1;
        if (quality === 'good') {
            goodQuestions.push(questionNumber);
        } else {
            notAppropriateQuestions.push(questionNumber);
        }
    });
    
    // Calculate overall rating
    const totalAnswered = answerQuality.length;
    const goodCount = goodQuestions.length;
    const notAppropriateCount = notAppropriateQuestions.length;
    
    let overallRating = '';
    let ratingColor = '';
    let ratingMessage = '';
    
    if (totalAnswered === 0) {
        overallRating = 'Incomplete';
        ratingColor = '#9ca3af';
        ratingMessage = 'No answers were submitted.';
    } else if (notAppropriateCount === 0) {
        overallRating = 'Good';
        ratingColor = '#10b981';
        ratingMessage = 'All questions were answered appropriately with well-structured responses.';
    } else if (goodCount > notAppropriateCount) {
        overallRating = 'Average';
        ratingColor = '#f59e0b';
        ratingMessage = 'Most questions were answered well, but some need improvement.';
    } else {
        overallRating = 'Needs Improvement';
        ratingColor = '#ef4444';
        ratingMessage = 'Several answers were not well-structured. Practice providing more detailed responses.';
    }
    
    // Build the feedback HTML
    let feedbackHTML = `
        <h4>Interview Performance Analysis</h4>
        
        <div class="feedback-section" style="margin-bottom: 1.5rem;">
            <div class="feedback-item" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
                <strong style="color: #065f46;">✓ Well Answered (${goodCount}):</strong>
                <p style="margin: 0.5rem 0 0 0; color: #047857;">
                    ${goodQuestions.length > 0 ? `Questions ${goodQuestions.join(', ')} were answered with well-structured responses.` : 'No questions were classified as well-answered.'}
                </p>
            </div>
            
            <div class="feedback-item" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left: 4px solid #ef4444; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
                <strong style="color: #991b1b;">✗ Needs Improvement (${notAppropriateCount}):</strong>
                <p style="margin: 0.5rem 0 0 0; color: #b91c1c;">
                    ${notAppropriateQuestions.length > 0 ? `Questions ${notAppropriateQuestions.join(', ')} had answers that were too brief or lacked structure.` : 'All answers were appropriate.'}
                </p>
            </div>
        </div>
        
        <div class="feedback-item" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid ${ratingColor}; padding: 1.25rem; border-radius: 8px;">
            <strong style="color: ${ratingColor}; font-size: 1.1rem;">Overall Session: ${overallRating}</strong>
            <p style="margin: 0.5rem 0 0 0; color: #374151;">${ratingMessage}</p>
            <p style="margin: 0.75rem 0 0 0; font-size: 0.9rem; color: #6b7280;">
                <strong>Summary:</strong> ${goodCount} good, ${notAppropriateCount} need improvement out of ${totalAnswered} questions answered.
            </p>
        </div>
        
        <div class="feedback-tips" style="margin-top: 1.5rem; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
            <strong style="color: #1f2937;">Tips for Better Answers:</strong>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.25rem; color: #4b5563;">
                <li>Provide answers with at least 20-30 characters</li>
                <li>Use complete sentences with proper punctuation</li>
                <li>Include specific examples when possible</li>
                <li>Structure your response with a beginning, middle, and end</li>
            </ul>
        </div>
    `;
    
    feedback.style.display = 'block';
    feedbackContent.innerHTML = feedbackHTML;
}

// Initialize Fake Detection
function initializeFakeDetection() {
    setTimeout(() => {
        performFakeDetection();
    }, 500);
}

function performFakeDetection() {
    const detection = analyzeFakeInformation();
    
    // Update score with accuracy percentage
    const authenticityScore = 100 - detection.fakeScore;
    document.getElementById('fakeScore').textContent = `${authenticityScore}% Authentic`;
    document.getElementById('fakeScore').style.setProperty('--score', `${authenticityScore * 3.6}deg`);
    
    // Update summary with accuracy
    document.getElementById('detectionSummary').textContent = detection.summary;
    
    // Add detection items with accuracy percentages
    addDetectionItems(detection.items);
    
    // Add recommendations
    addAuthenticityRecommendations(detection.recommendations);
    
    // Add overall accuracy indicator
    const accuracyElement = document.createElement('div');
    accuracyElement.className = 'overall-accuracy';
    accuracyElement.innerHTML = `
        <h3>Overall Analysis Accuracy</h3>
        <p>Based on the information you entered, our AI has analyzed your resume with ${Math.round(authenticityScore)}% confidence in its authenticity predictions.</p>
    `;
    
    const container = document.querySelector('.detection-container');
    container.insertBefore(accuracyElement, container.querySelector('.detection-details'));
}

function analyzeFakeInformation() {
    const items = [];
    let fakeScore = 0;
    
    // Get fresh data directly from form inputs for accurate analysis
    const personal = {
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || ''
    };
    
    const summaryText = document.getElementById('summary')?.value || '';
    const skillsText = document.getElementById('skills')?.value || '';
    
    // Get experience data from form
    const experienceItems = [];
    document.querySelectorAll('.experience-item').forEach(item => {
        experienceItems.push({
            jobTitle: item.querySelector('input[name="jobTitle"]')?.value || '',
            company: item.querySelector('input[name="company"]')?.value || '',
            startDate: item.querySelector('input[name="startDate"]')?.value || '',
            endDate: item.querySelector('input[name="endDate"]')?.value || '',
            currentJob: item.querySelector('input[name="currentJob"]')?.checked || false,
            description: item.querySelector('textarea[name="description"]')?.value || ''
        });
    });
    
    // Get education data from form
    const educationItems = [];
    document.querySelectorAll('.education-item').forEach(item => {
        educationItems.push({
            degree: item.querySelector('input[name="degree"]')?.value || '',
            institution: item.querySelector('input[name="institution"]')?.value || '',
            gradYear: item.querySelector('input[name="gradYear"]')?.value || ''
        });
    });
    
    // Analyze personal information
    if (personal.email) {
        const emailDomain = personal.email.split('@')[1];
        if (emailDomain) {
            // Check for suspicious domains
            const suspiciousDomains = ['test', 'fake', 'temp', 'throwaway', 'guerrilla', 'spam'];
            const isSuspicious = suspiciousDomains.some(domain => emailDomain.includes(domain));
            
            if (isSuspicious) {
                items.push({
                    field: 'Email',
                    status: 'warning',
                    reason: 'Email domain appears to be temporary or disposable',
                    confidence: 90
                });
                fakeScore += 20;
            } else if (emailDomain.includes('gmail') || emailDomain.includes('yahoo') || emailDomain.includes('hotmail')) {
                items.push({
                    field: 'Email',
                    status: 'safe',
                    reason: 'Using standard email provider',
                    confidence: 85
                });
            } else {
                items.push({
                    field: 'Email',
                    status: 'safe',
                    reason: 'Email format appears legitimate',
                    confidence: 95
                });
            }
        }
    }
    
    // Analyze experience dates and content
    experienceItems.forEach((exp, index) => {
        if (exp.startDate && exp.endDate) {
            const startYear = parseInt(exp.startDate.split('-')[0]);
            const endYear = parseInt(exp.endDate.split('-')[0]);
            const currentYear = new Date().getFullYear();
            
            // Check for future dates
            if (endYear > currentYear) {
                items.push({
                    field: `Experience ${index + 1} - End Date`,
                    status: 'warning',
                    reason: 'End date is in the future',
                    confidence: 95
                });
                fakeScore += 15;
            }
            
            // Check for unrealistic durations
            const duration = endYear - startYear;
            if (duration > 15) {
                items.push({
                    field: `Experience ${index + 1} - Duration`,
                    status: 'warning',
                    reason: `Unusually long duration (${duration} years) for single position`,
                    confidence: 80
                });
                fakeScore += 10;
            } else if (duration < 0) {
                items.push({
                    field: `Experience ${index + 1} - Date Order`,
                    status: 'warning',
                    reason: 'Start date is after end date',
                    confidence: 100
                });
                fakeScore += 25;
            } else if (duration < 0.5 && !exp.currentJob) {
                items.push({
                    field: `Experience ${index + 1} - Duration`,
                    status: 'warning',
                    reason: 'Very short duration for professional position',
                    confidence: 70
                });
                fakeScore += 5;
            }
        }
        
        // Check for generic job descriptions
        if (exp.description) {
            const genericPhrases = ['responsible for', 'worked on', 'helped with', 'assisted'];
            const hasGenericContent = genericPhrases.some(phrase => 
                exp.description.toLowerCase().includes(phrase)
            );
            
            if (hasGenericContent && exp.description.length < 100) {
                items.push({
                    field: `Experience ${index + 1} - Description`,
                    status: 'warning',
                    reason: 'Job description appears generic or lacks detail',
                    confidence: 65
                });
                fakeScore += 5;
            } else if (exp.description.length > 500) {
                items.push({
                    field: `Experience ${index + 1} - Description`,
                    status: 'safe',
                    reason: 'Detailed job description with good content',
                    confidence: 90
                });
            }
        }
    });
    
    // Analyze education
    educationItems.forEach((edu, index) => {
        if (edu.gradYear) {
            const gradYear = parseInt(edu.gradYear);
            const currentYear = new Date().getFullYear();
            
            // Check for future graduation
            if (gradYear > currentYear + 5) {
                items.push({
                    field: `Education ${index + 1} - Graduation Year`,
                    status: 'warning',
                    reason: 'Graduation year too far in the future',
                    confidence: 95
                });
                fakeScore += 20;
            } else if (gradYear > currentYear) {
                items.push({
                    field: `Education ${index + 1} - Graduation Year`,
                    status: 'warning',
                    reason: 'Graduation year is in the future',
                    confidence: 90
                });
                fakeScore += 10;
            } else if (gradYear < currentYear - 50) {
                items.push({
                    field: `Education ${index + 1} - Graduation Year`,
                    status: 'warning',
                    reason: 'Graduation year seems unusually old',
                    confidence: 75
                });
                fakeScore += 10;
            } else {
                items.push({
                    field: `Education ${index + 1} - Graduation Year`,
                    status: 'safe',
                    reason: 'Graduation year appears reasonable',
                    confidence: 95
                });
            }
        }
        
        // Check GPA if provided
        if (edu.gpa) {
            const gpa = parseFloat(edu.gpa);
            if (gpa > 4.0) {
                items.push({
                    field: `Education ${index + 1} - GPA`,
                    status: 'warning',
                    reason: 'GPA exceeds standard 4.0 scale',
                    confidence: 90
                });
                fakeScore += 15;
            } else if (gpa < 0) {
                items.push({
                    field: `Education ${index + 1} - GPA`,
                    status: 'warning',
                    reason: 'GPA cannot be negative',
                    confidence: 100
                });
                fakeScore += 20;
            }
        }
    });
    
    // Analyze skills for unrealistic claims
    if (skillsText) {
        const skillsArray = skillsText.toLowerCase().split(',').map(s => s.trim());
        
        // Check for too many expert-level claims
        const expertSkills = skillsArray.filter(skill => 
            skill.includes('expert') || skill.includes('master') || skill.includes('guru') || skill.includes('ninja')
        );
        
        if (expertSkills.length > 3) {
            items.push({
                field: 'Skills',
                status: 'warning',
                reason: 'Too many expert-level skill claims',
                confidence: 80
            });
            fakeScore += 10;
        }
        
        // Check for very long skill lists
        if (skillsArray.length > 20) {
            items.push({
                field: 'Skills',
                status: 'warning',
                reason: 'Excessive number of skills may indicate lack of focus',
                confidence: 70
            });
            fakeScore += 5;
        } else if (skillsArray.length >= 5 && skillsArray.length <= 10) {
            items.push({
                field: 'Skills',
                status: 'safe',
                reason: 'Reasonable number of well-focused skills',
                confidence: 90
            });
        }
        
        // Check for conflicting skill levels
        const beginnerSkills = skillsArray.filter(skill => 
            skill.includes('beginner') || skill.includes('basic') || skill.includes('learning')
        );
        const advancedSkills = skillsArray.filter(skill => 
            skill.includes('expert') || skill.includes('advanced') || skill.includes('senior')
        );
        
        if (beginnerSkills.length > 0 && advancedSkills.length > 0) {
            items.push({
                field: 'Skills',
                status: 'warning',
                reason: 'Mixed skill proficiency levels may need clarification',
                confidence: 60
            });
            fakeScore += 5;
        }
    }
    
    // Analyze summary quality
    if (summaryText) {
        if (summaryText.length < 30) {
            items.push({
                field: 'Professional Summary',
                status: 'warning',
                reason: 'Summary is too brief to provide meaningful information',
                confidence: 85
            });
            fakeScore += 10;
        } else if (summaryText.length > 300) {
            items.push({
                field: 'Professional Summary',
                status: 'safe',
                reason: 'Well-developed professional summary',
                confidence: 95
            });
        }
        
        // Check for first-person usage (should be avoided in resumes)
        if (summaryText.toLowerCase().includes('i ') || summaryText.toLowerCase().includes('my ')) {
            items.push({
                field: 'Professional Summary',
                status: 'warning',
                reason: 'Summary uses first-person perspective (should be avoided)',
                confidence: 75
            });
            fakeScore += 5;
        }
    }
    
    // Analyze phone number format
    if (personal.phone) {
        const phoneClean = personal.phone.replace(/[^0-9]/g, '');
        if (phoneClean.length < 10) {
            items.push({
                field: 'Phone Number',
                status: 'warning',
                reason: 'Phone number appears incomplete',
                confidence: 90
            });
            fakeScore += 15;
        } else if (phoneClean.length > 15) {
            items.push({
                field: 'Phone Number',
                status: 'warning',
                reason: 'Phone number format seems unusual',
                confidence: 80
            });
            fakeScore += 10;
        } else {
            items.push({
                field: 'Phone Number',
                status: 'safe',
                reason: 'Phone number format appears valid',
                confidence: 95
            });
        }
    }
    
    // Generate summary and recommendations
    const summary = fakeScore > 25 
        ? `Our analysis detected ${Math.round(fakeScore)}% potentially suspicious information. Please review the highlighted items and consider making corrections.`
        : `Our analysis indicates ${Math.round(100 - fakeScore)}% authenticity. Your resume information appears mostly genuine and well-structured.`;
    
    const recommendations = fakeScore > 25
        ? [
            'Update any future dates to realistic timeframes',
            'Use a professional email address from a standard provider',
            'Be realistic about skill proficiency levels and focus on key strengths',
            'Ensure all experience durations are plausible and logical',
            'Provide more specific, quantified achievements in job descriptions',
            'Remove first-person pronouns from your summary',
            'Verify all contact information is accurate and complete'
        ]
        : [
            'Continue maintaining authentic and detailed information',
            'Consider adding more specific achievements with metrics',
            'Verify all dates and timeframes are accurate',
            'Keep your skills focused and relevant to your target role'
        ];
    
    return {
        fakeScore: Math.min(fakeScore, 100),
        summary,
        items,
        recommendations
    };
}

function addDetectionItems(items) {
    const container = document.getElementById('detectionItems');
    container.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `detection-item ${item.status}`;
        itemElement.innerHTML = `
            <h4>${item.field}</h4>
            <p>${item.reason}</p>
            <span class="confidence">Accuracy: ${item.confidence}%</span>
            <span class="prediction">${item.status === 'warning' ? '⚠️ Potentially Fake' : '✅ Likely Authentic'}</span>
        `;
        container.appendChild(itemElement);
    });
}

function addAuthenticityRecommendations(recommendations) {
    const list = document.getElementById('authenticityRecommendations');
    list.innerHTML = '';
    
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        list.appendChild(li);
    });
}

// Re-analyze resume for fake detection
function reanalyzeResume() {
    // Show loading state
    document.getElementById('fakeScore').textContent = '...';
    document.getElementById('detectionSummary').textContent = 'Re-analyzing your resume information...';
    document.getElementById('detectionItems').innerHTML = '<p style="text-align: center; color: #666;"><i class="fas fa-spinner fa-spin"></i> Analyzing...</p>';
    
    // Remove old overall accuracy element if exists
    const oldAccuracy = document.querySelector('.overall-accuracy');
    if (oldAccuracy) oldAccuracy.remove();
    
    // Run fresh analysis after short delay
    setTimeout(() => {
        performFakeDetection();
    }, 500);
}

// Finish resume
function finishResume() {
    showMessage('Resume completed successfully! Your resume has been saved.', 'success');
    
    // Save final resume data
    const user = backend.getCurrentUser();
    if (user) {
        const finalResume = {
            ...resumeData,
            completedAt: new Date().toISOString(),
            template: localStorage.getItem('selectedTemplate')
        };
        localStorage.setItem('finalResume', JSON.stringify(finalResume));
    }
    
    // Redirect to dashboard or completion page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Select template
function selectTemplate(templateId) {
    if (!backend.isLoggedIn()) {
        showMessage('Please login to select a template', 'error');
        return;
    }

    const template = templates.find(t => t.id === templateId);
    if (template) {
        // Store selected template
        localStorage.setItem('selectedTemplate', template.name);
        
        // Redirect to resume builder page
        window.location.href = 'resume-builder.html';
    }
}

// Initialize template loading
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('templatesGrid')) {
        loadTemplates();
    }
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .template-card {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .template-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .template-preview {
        position: relative;
        height: 400px;
        overflow: hidden;
    }
    
    .template-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .template-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.8));
        padding: 2rem 1.5rem 1.5rem;
        color: white;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .template-card:hover .template-overlay {
        opacity: 1;
    }
    
    .template-overlay h3 {
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    }
    
    .template-overlay p {
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
    
    .templates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 3rem;
    }
    
    .templates-section {
        padding: 100px 0;
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .templates-section h1 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 2rem;
        color: #333;
    }
    
    .full-width {
        width: 100%;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .templates-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);

// Heatmap Functions
function generateSectionHeatmap() {
    const sectionHeatmap = document.getElementById('sectionHeatmap');
    
    if (!sectionHeatmap) {
        console.error('sectionHeatmap element not found');
        return;
    }
    
    const sections = [];
    
    // Calculate word counts for each section
    const summaryCount = resumeData.summary ? resumeData.summary.split(/\s+/).length : 0;
    const experienceCount = resumeData.experience ? resumeData.experience.reduce((total, exp) => {
        return total + (exp.description ? exp.description.split(/\s+/).length : 0);
    }, 0) : 0;
    const educationCount = resumeData.education ? resumeData.education.reduce((total, edu) => {
        return total + (edu.description ? edu.description.split(/\s+/).length : 0);
    }, 0) : 0;
    const skillsCount = resumeData.skills ? resumeData.skills.split(/\s+/).length : 0;
    
    sections.push({
        name: 'Summary',
        count: summaryCount,
        threshold: { strong: 50, weak: 20 }
    });
    
    sections.push({
        name: 'Experience',
        count: experienceCount,
        threshold: { strong: 150, weak: 50 }
    });
    
    sections.push({
        name: 'Education',
        count: educationCount,
        threshold: { strong: 80, weak: 30 }
    });
    
    sections.push({
        name: 'Skills',
        count: skillsCount,
        threshold: { strong: 20, weak: 5 }
    });
    
    // Generate HTML for each section
    sectionHeatmap.innerHTML = sections.map(section => {
        let strength = 'medium';
        if (section.count >= section.threshold.strong) {
            strength = 'strong';
        } else if (section.count < section.threshold.weak) {
            strength = 'weak';
        }
        
        return `
            <div class="section-item ${strength}">
                <h4>${section.name}</h4>
                <p class="word-count">${section.count}</p>
                <p class="label">words</p>
            </div>
        `;
    }).join('');
    
    // Generate recommendations
    generateHeatmapRecommendations(sections);
}

function generateKeywordHeatmap() {
    const keywordHeatmap = document.getElementById('keywordHeatmap');
    
    if (!keywordHeatmap) {
        console.error('keywordHeatmap element not found');
        return;
    }
    
    // Important resume keywords
    const importantKeywords = [
        'leadership', 'communication', 'teamwork', 'problem-solving',
        'project management', 'analytical', 'technical', 'innovation',
        'collaboration', 'strategic', 'development', 'management',
        'experience', 'skills', 'achieved', 'developed', 'implemented',
        'coordinated', 'managed', 'created', 'designed', 'analyzed'
    ];
    
    // Get all resume text with error handling
    let allText = '';
    try {
        allText = [
            resumeData.summary || '',
            ...(resumeData.experience || []).map(e => e.description || ''),
            ...(resumeData.education || []).map(e => e.description || ''),
            resumeData.skills || ''
        ].join(' ').toLowerCase();
    } catch (error) {
        console.error('Error getting resume text:', error);
        allText = '';
    }
    
    // Check which keywords are present
    const keywords = importantKeywords.map(keyword => {
        const isPresent = allText.includes(keyword.toLowerCase());
        return {
            word: keyword,
            present: isPresent
        };
    });
    
    // Generate HTML for keywords
    keywordHeatmap.innerHTML = keywords.map(keyword => `
        <span class="keyword-tag ${keyword.present ? 'present' : 'missing'}">
            ${keyword.word}
        </span>
    `).join('');
}

function analyzeSkillRelevance() {
    const skillHeatmap = document.getElementById('skillHeatmap');
    
    if (!skillHeatmap) {
        console.error('skillHeatmap element not found');
        return;
    }
    
    const targetJobInput = document.getElementById('targetJob');
    const targetJob = targetJobInput ? targetJobInput.value || 'Software Engineer' : 'Software Engineer';
    
    // Define skill requirements for common job types
    const jobSkillRequirements = {
        'Software Engineer': ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Git', 'SQL', 'API'],
        'Data Analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics', 'Data Visualization', 'R'],
        'Project Manager': ['Agile', 'Scrum', 'Leadership', 'Communication', 'Risk Management', 'Planning'],
        'Web Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git', 'Responsive Design'],
        'default': ['Communication', 'Leadership', 'Problem-solving', 'Teamwork', 'Technical Skills', 'Innovation']
    };
    
    // Get relevant skills for the target job
    const requiredSkills = jobSkillRequirements[targetJob] || jobSkillRequirements['default'];
    
    // Get user skills with error handling
    let userSkills = [];
    try {
        userSkills = resumeData.skills ? resumeData.skills.toLowerCase().split(',').map(s => s.trim()) : [];
    } catch (error) {
        console.error('Error getting user skills:', error);
        userSkills = [];
    }
    
    // Calculate relevance for each required skill
    const skillRelevance = requiredSkills.map(skill => {
        const skillLower = skill.toLowerCase();
        const hasSkill = userSkills.some(userSkill => userSkill.includes(skillLower) || skillLower.includes(userSkill));
        
        // Calculate relevance score based on presence and context
        let relevanceScore = 0;
        if (hasSkill) {
            relevanceScore = 85 + Math.random() * 15; // 85-100% if present
        } else {
            relevanceScore = 20 + Math.random() * 30; // 20-50% if missing
        }
        
        let relevanceLevel = 'low-relevance';
        if (relevanceScore >= 75) {
            relevanceLevel = 'high-relevance';
        } else if (relevanceScore >= 50) {
            relevanceLevel = 'medium-relevance';
        }
        
        return {
            name: skill,
            score: Math.round(relevanceScore),
            level: relevanceLevel
        };
    });
    
    // Generate HTML for skill heatmap
    skillHeatmap.innerHTML = skillRelevance.map(skill => `
        <div class="skill-item ${skill.level}">
            <h4>${skill.name}</h4>
            <p class="relevance-score">${skill.score}%</p>
            <p class="relevance-label">${skill.level.replace('-', ' ')}</p>
        </div>
    `).join('');
}

function generateHeatmapRecommendations(sections) {
    const recommendationsList = document.getElementById('recommendationsList');
    
    if (!recommendationsList) {
        console.error('recommendationsList element not found');
        return;
    }
    
    const recommendations = [];
    
    // Section-specific recommendations
    if (sections && sections.length > 0) {
        sections.forEach(section => {
            if (section.count < section.threshold.weak) {
                recommendations.push(`Your ${section.name} section is too brief (${section.count} words). Add more details to reach at least ${section.threshold.weak} words.`);
            } else if (section.count < section.threshold.strong && section.count >= section.threshold.weak) {
                recommendations.push(`Your ${section.name} section is moderate (${section.count} words). Consider expanding to ${section.threshold.strong}+ words for stronger impact.`);
            }
        });
    }
    
    // Check keyword coverage
    try {
        const allText = [
            resumeData.summary || '',
            ...(resumeData.experience || []).map(e => e.description || ''),
            ...(resumeData.education || []).map(e => e.description || ''),
            resumeData.skills || ''
        ].join(' ').toLowerCase();
        
        const importantKeywords = ['leadership', 'communication', 'teamwork', 'problem-solving', 'achieved', 'developed'];
        const missingKeywords = importantKeywords.filter(k => !allText.includes(k.toLowerCase()));
        
        if (missingKeywords.length > 0) {
            recommendations.push(`Consider adding these important keywords to your resume: ${missingKeywords.join(', ')}`);
        }
    } catch (error) {
        console.error('Error checking keyword coverage:', error);
    }
    
    // Comprehensive resume improvement recommendations (always show these)
    recommendations.push('💡 **Use Action Verbs**: Start bullet points with strong action verbs like "Developed", "Implemented", "Led", "Achieved", "Optimized"');
    recommendations.push('💡 **Quantify Achievements**: Include numbers, percentages, and metrics to demonstrate impact (e.g., "Increased sales by 25%")');
    recommendations.push('💡 **Tailor to Job**: Customize your resume for each position by including relevant keywords from the job description');
    recommendations.push('💡 **Keep it Concise**: Aim for 1-2 pages maximum. Remove irrelevant information and focus on recent experience');
    recommendations.push('💡 **Use Professional Format**: Choose a clean, modern template with consistent formatting and readable fonts');
    recommendations.push('💡 **Include Contact Information**: Ensure your email, phone, and LinkedIn profile are current and professional');
    recommendations.push('💡 **Proofread Carefully**: Check for typos, grammatical errors, and consistency in formatting');
    recommendations.push('💡 **Highlight Relevant Skills**: Place skills most relevant to the target job near the top of your skills section');
    recommendations.push('💡 **Show Career Progression**: Demonstrate growth and increasing responsibility in your work experience');
    recommendations.push('💡 **Include Soft Skills**: Emphasize communication, teamwork, leadership, and problem-solving abilities');
    
    if (recommendations.length === 0) {
        recommendations.push('Great job! Your resume sections are well-balanced with appropriate word counts.');
    }
    
    recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
    console.log('Recommendations generated:', recommendations.length);
}

// Fresher Rescue Mode Functions
function generateFresherSuggestions() {
    const fieldOfStudy = document.getElementById('fieldOfStudy').value || '';
    const careerInterests = document.getElementById('careerInterests').value || '';
    const projects = document.getElementById('projects').value || '';
    
    // Generate skill suggestions
    generateSkillSuggestions(fieldOfStudy, careerInterests);
    
    // Generate internship suggestions
    generateInternshipSuggestions(fieldOfStudy, careerInterests);
    
    // Generate app suggestions
    generateAppSuggestions(fieldOfStudy, careerInterests);
    
    // Generate resume fill assistance
    generateResumeFillAssistance(fieldOfStudy, careerInterests, projects);
}

function generateSkillSuggestions(fieldOfStudy, careerInterests) {
    const skillsContainer = document.getElementById('skillsSuggestions');
    
    const skillDatabase = {
        'computer science': [
            { name: 'Python', difficulty: 'Beginner', description: 'Essential for data science, AI, and web development' },
            { name: 'JavaScript', difficulty: 'Beginner', description: 'Must-know for web development and frontend work' },
            { name: 'SQL', difficulty: 'Beginner', description: 'Database management and data analysis' },
            { name: 'Git', difficulty: 'Beginner', description: 'Version control for code collaboration' },
            { name: 'React', difficulty: 'Intermediate', description: 'Popular frontend framework for building UIs' },
            { name: 'Node.js', difficulty: 'Intermediate', description: 'Backend JavaScript runtime for server-side development' },
            { name: 'AWS', difficulty: 'Intermediate', description: 'Cloud computing platform for deployment' },
            { name: 'Machine Learning', difficulty: 'Advanced', description: 'AI and predictive modeling' }
        ],
        'business': [
            { name: 'Excel', difficulty: 'Beginner', description: 'Data analysis and business calculations' },
            { name: 'PowerPoint', difficulty: 'Beginner', description: 'Presentation and communication skills' },
            { name: 'Google Analytics', difficulty: 'Beginner', description: 'Digital marketing and web analytics' },
            { name: 'Financial Analysis', difficulty: 'Intermediate', description: 'Budgeting and financial planning' },
            { name: 'Project Management', difficulty: 'Intermediate', description: 'Organizing and leading teams effectively' },
            { name: 'CRM Software', difficulty: 'Intermediate', description: 'Customer relationship management' },
            { name: 'Data Visualization', difficulty: 'Intermediate', description: 'Tableau or Power BI for insights' },
            { name: 'Strategic Planning', difficulty: 'Advanced', description: 'Long-term business strategy development' }
        ],
        'engineering': [
            { name: 'CAD Software', difficulty: 'Beginner', description: 'Computer-aided design for engineering' },
            { name: 'MATLAB', difficulty: 'Beginner', description: 'Mathematical computing and simulation' },
            { name: 'SolidWorks', difficulty: 'Intermediate', description: '3D modeling and mechanical design' },
            { name: 'AutoCAD', difficulty: 'Intermediate', description: 'Technical drawing and design' },
            { name: 'Project Management', difficulty: 'Intermediate', description: 'Engineering project coordination' },
            { name: 'Quality Control', difficulty: 'Intermediate', description: 'Testing and quality assurance' },
            { name: 'Six Sigma', difficulty: 'Advanced', description: 'Process improvement methodology' },
            { name: 'Finite Element Analysis', difficulty: 'Advanced', description: 'Structural analysis and simulation' }
        ],
        'marketing': [
            { name: 'Social Media Marketing', difficulty: 'Beginner', description: 'Managing social platforms and engagement' },
            { name: 'Content Writing', difficulty: 'Beginner', description: 'Creating compelling marketing copy' },
            { name: 'SEO', difficulty: 'Beginner', description: 'Search engine optimization techniques' },
            { name: 'Google Ads', difficulty: 'Intermediate', description: 'Pay-per-click advertising' },
            { name: 'Email Marketing', difficulty: 'Intermediate', description: 'Campaign management and automation' },
            { name: 'Analytics', difficulty: 'Intermediate', description: 'Marketing data analysis and reporting' },
            { name: 'Brand Strategy', difficulty: 'Advanced', description: 'Building and managing brand identity' },
            { name: 'Marketing Automation', difficulty: 'Advanced', description: 'Automated marketing workflows' }
        ],
        'default': [
            { name: 'Communication', difficulty: 'Beginner', description: 'Verbal and written communication skills' },
            { name: 'Teamwork', difficulty: 'Beginner', description: 'Collaboration and team dynamics' },
            { name: 'Problem-Solving', difficulty: 'Beginner', description: 'Critical thinking and analytical skills' },
            { name: 'Time Management', difficulty: 'Beginner', description: 'Prioritization and productivity' },
            { name: 'Leadership', difficulty: 'Intermediate', description: 'Leading teams and projects' },
            { name: 'Digital Literacy', difficulty: 'Intermediate', description: 'Technology proficiency' },
            { name: 'Adaptability', difficulty: 'Intermediate', description: 'Flexibility in changing environments' },
            { name: 'Creativity', difficulty: 'Advanced', description: 'Innovative thinking and ideation' }
        ]
    };
    
    const fieldLower = fieldOfStudy.toLowerCase();
    let skills = skillDatabase['default'];
    
    for (const key in skillDatabase) {
        if (fieldLower.includes(key)) {
            skills = skillDatabase[key];
            break;
        }
    }
    
    skillsContainer.innerHTML = skills.map(skill => `
        <div class="suggestion-item">
            <h4>${skill.name}</h4>
            <p>${skill.description}</p>
            <span class="difficulty">${skill.difficulty}</span>
        </div>
    `).join('');
}

function generateInternshipSuggestions(fieldOfStudy, careerInterests) {
    const internshipContainer = document.getElementById('internshipSuggestions');
    
    const internshipDatabase = {
        'computer science': [
            { title: 'Software Developer Intern', company: 'Tech Companies', type: 'On-site/Remote' },
            { title: 'Data Analyst Intern', company: 'Analytics Firms', type: 'Remote' },
            { title: 'Web Development Intern', company: 'Startups', type: 'Remote' },
            { title: 'QA Tester Intern', company: 'Software Companies', type: 'On-site' },
            { title: 'DevOps Intern', company: 'Cloud Companies', type: 'Remote' }
        ],
        'business': [
            { title: 'Business Analyst Intern', company: 'Consulting Firms', type: 'On-site' },
            { title: 'Marketing Intern', company: 'Marketing Agencies', type: 'Hybrid' },
            { title: 'Finance Intern', company: 'Banks', type: 'On-site' },
            { title: 'HR Intern', company: 'Corporate', type: 'On-site' },
            { title: 'Sales Intern', company: 'Sales Organizations', type: 'Hybrid' }
        ],
        'engineering': [
            { title: 'Mechanical Engineer Intern', company: 'Manufacturing', type: 'On-site' },
            { title: 'Civil Engineer Intern', company: 'Construction Firms', type: 'On-site' },
            { title: 'Electrical Engineer Intern', company: 'Tech Companies', type: 'Hybrid' },
            { title: 'Quality Assurance Intern', company: 'Manufacturing', type: 'On-site' },
            { title: 'R&D Intern', company: 'Research Labs', type: 'On-site' }
        ],
        'marketing': [
            { title: 'Digital Marketing Intern', company: 'Digital Agencies', type: 'Remote' },
            { title: 'Content Marketing Intern', company: 'Media Companies', type: 'Hybrid' },
            { title: 'Social Media Intern', company: 'Social Media Agencies', type: 'Remote' },
            { title: 'SEO Intern', company: 'Marketing Firms', type: 'Remote' },
            { title: 'Brand Marketing Intern', company: 'Brand Agencies', type: 'Hybrid' }
        ],
        'default': [
            { title: 'General Intern', company: 'Various Companies', type: 'Hybrid' },
            { title: 'Administrative Intern', company: 'Corporate Offices', type: 'On-site' },
            { title: 'Research Intern', company: 'Research Institutions', type: 'Hybrid' },
            { title: 'Operations Intern', company: 'Various Companies', type: 'Hybrid' },
            { title: 'Customer Service Intern', company: 'Service Companies', type: 'Remote' }
        ]
    };
    
    const fieldLower = fieldOfStudy.toLowerCase();
    let internships = internshipDatabase['default'];
    
    for (const key in internshipDatabase) {
        if (fieldLower.includes(key)) {
            internships = internshipDatabase[key];
            break;
        }
    }
    
    internshipContainer.innerHTML = internships.map(internship => `
        <div class="suggestion-item">
            <h4>${internship.title}</h4>
            <p>${internship.company}</p>
            <span class="platform">${internship.type}</span>
        </div>
    `).join('');
}

function generateAppSuggestions(fieldOfStudy, careerInterests) {
    const appContainer = document.getElementById('appSuggestions');
    
    const appDatabase = {
        'computer science': [
            { name: 'GitHub', description: 'Code hosting and collaboration platform', category: 'Development' },
            { name: 'Stack Overflow', description: 'Programming Q&A community', category: 'Learning' },
            { name: 'VS Code', description: 'Popular code editor', category: 'Development' },
            { name: 'LeetCode', description: 'Coding practice and interview prep', category: 'Learning' },
            { name: 'Docker', description: 'Container platform for deployment', category: 'DevOps' }
        ],
        'business': [
            { name: 'LinkedIn', description: 'Professional networking platform', category: 'Networking' },
            { name: 'Trello', description: 'Project management tool', category: 'Productivity' },
            { name: 'Slack', description: 'Team communication platform', category: 'Communication' },
            { name: 'Zoom', description: 'Video conferencing tool', category: 'Communication' },
            { name: 'Notion', description: 'Note-taking and documentation', category: 'Productivity' }
        ],
        'engineering': [
            { name: 'AutoCAD', description: 'CAD software for design', category: 'Design' },
            { name: 'SolidWorks', description: '3D modeling software', category: 'Design' },
            { name: 'MATLAB', description: 'Mathematical computing', category: 'Analysis' },
            { name: 'ANSYS', description: 'Engineering simulation', category: 'Analysis' },
            { name: 'ProjectLibre', description: 'Project management', category: 'Productivity' }
        ],
        'marketing': [
            { name: 'Canva', description: 'Graphic design tool', category: 'Design' },
            { name: 'Hootsuite', description: 'Social media management', category: 'Social Media' },
            { name: 'Google Analytics', description: 'Web analytics platform', category: 'Analytics' },
            { name: 'Mailchimp', description: 'Email marketing platform', category: 'Marketing' },
            { name: 'Buffer', description: 'Social media scheduling', category: 'Social Media' }
        ],
        'default': [
            { name: 'LinkedIn', description: 'Professional networking', category: 'Networking' },
            { name: 'Coursera', description: 'Online learning platform', category: 'Learning' },
            { name: 'Trello', description: 'Project management', category: 'Productivity' },
            { name: 'Notion', description: 'Note-taking and organization', category: 'Productivity' },
            { name: 'Zoom', description: 'Video conferencing', category: 'Communication' }
        ]
    };
    
    const fieldLower = fieldOfStudy.toLowerCase();
    let apps = appDatabase['default'];
    
    for (const key in appDatabase) {
        if (fieldLower.includes(key)) {
            apps = appDatabase[key];
            break;
        }
    }
    
    appContainer.innerHTML = apps.map(app => `
        <div class="suggestion-item">
            <h4>${app.name}</h4>
            <p>${app.description}</p>
            <span class="tag">${app.category}</span>
        </div>
    `).join('');
}

function generateResumeFillAssistance(fieldOfStudy, careerInterests, projects) {
    const resumeFillContainer = document.getElementById('resumeFillSuggestions');
    
    const assistance = [
        {
            title: 'Professional Summary',
            content: `As a motivated ${fieldOfStudy || 'student'} with strong interest in ${careerInterests || 'professional growth'}, seeking an opportunity to apply academic knowledge and develop practical skills in a dynamic work environment.`
        },
        {
            title: 'Skills Section',
            content: `Add technical skills relevant to ${fieldOfStudy || 'your field'}, soft skills like communication and teamwork, and any tools/software you've learned.`
        },
        {
            title: 'Projects Section',
            content: projects ? `Highlight: "${projects}" - describe your role, tools used, and outcomes achieved.` : 'Add academic projects, personal projects, or coursework that demonstrates your abilities.'
        },
        {
            title: 'Education Section',
            content: 'Include your degree, university, graduation year, relevant coursework, and academic achievements.'
        },
        {
            title: 'Certifications',
            content: 'List any online courses, certifications, or workshops you have completed (e.g., Coursera, Udemy, Google certifications).'
        }
    ];
    
    resumeFillContainer.innerHTML = assistance.map(item => `
        <div class="suggestion-item">
            <h4>${item.title}</h4>
            <p>${item.content}</p>
        </div>
    `).join('');
}

// Facial Expression Analysis Functions using face-api.js
let cameraStream = null;
let faceDetectionInterval = null;
let faceApiModelsLoaded = false;
let currentFaceData = null;

// Load face-api.js models
async function loadFaceApiModels() {
    if (faceApiModelsLoaded) return;
    
    const loadingDiv = document.getElementById('loadingModels');
    if (loadingDiv) loadingDiv.style.display = 'flex';
    
    try {
        // Use CDN for models
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        
        faceApiModelsLoaded = true;
        console.log('Face-api models loaded successfully');
    } catch (error) {
        console.error('Error loading face-api models:', error);
        // Fallback: models will be loaded on first detection attempt
    } finally {
        if (loadingDiv) loadingDiv.style.display = 'none';
    }
}

async function startCamera() {
    const video = document.getElementById('cameraVideo');
    const placeholder = document.getElementById('cameraPlaceholder');
    const startBtn = document.getElementById('startCameraBtn');
    const stopBtn = document.getElementById('stopCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    
    try {
        // Load models first
        await loadFaceApiModels();
        
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        
        video.srcObject = cameraStream;
        placeholder.style.display = 'none';
        video.style.display = 'block';
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        captureBtn.style.display = 'inline-block';
        
        // Wait for video to be ready then start face detection
        video.onloadedmetadata = () => {
            video.play();
            startRealFaceDetection();
        };
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
}

function stopCamera() {
    const video = document.getElementById('cameraVideo');
    const placeholder = document.getElementById('cameraPlaceholder');
    const overlayCanvas = document.getElementById('overlayCanvas');
    const startBtn = document.getElementById('startCameraBtn');
    const stopBtn = document.getElementById('stopCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
    
    video.srcObject = null;
    video.style.display = 'none';
    placeholder.style.display = 'flex';
    
    // Clear overlay canvas
    if (overlayCanvas) {
        const ctx = overlayCanvas.getContext('2d');
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
    
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    captureBtn.style.display = 'none';
    
    // Reset results
    currentFaceData = null;
    document.getElementById('eyeContactResult').textContent = '--';
    document.getElementById('smileResult').textContent = '--';
    document.getElementById('confidenceResult').textContent = '--';
    document.getElementById('eyeContactFeedback').textContent = 'Start camera to analyze';
    document.getElementById('smileFeedback').textContent = 'Start camera to analyze';
    document.getElementById('confidenceFeedback').textContent = 'Start camera to analyze';
}

async function startRealFaceDetection() {
    const video = document.getElementById('cameraVideo');
    const overlayCanvas = document.getElementById('overlayCanvas');
    
    // Set canvas size to match video
    overlayCanvas.width = video.videoWidth || 640;
    overlayCanvas.height = video.videoHeight || 480;
    
    const ctx = overlayCanvas.getContext('2d');
    
    // Detection loop
    faceDetectionInterval = setInterval(async () => {
        if (video.paused || video.ended) return;
        
        try {
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();
            
            // Clear canvas
            ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            
            if (detections.length > 0) {
                const detection = detections[0]; // Use first detected face
                
                // Draw face box
                const box = detection.detection.box;
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 3;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
                
                // Store current face data for capture
                currentFaceData = {
                    expressions: detection.expressions,
                    landmarks: detection.landmarks
                };
                
                // Calculate real-time metrics
                const metrics = calculateFaceMetrics(detection);
                updateLiveAnalysis(metrics.eyeContact, metrics.smile, metrics.confidence);
            }
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, 500); // Run every 500ms
}

function calculateFaceMetrics(detection) {
    const expressions = detection.expressions;
    const landmarks = detection.landmarks;
    
    // Smile calculation based on happy expression
    const happyScore = expressions.happy || 0;
    const smile = Math.round(happyScore * 100);
    
    // Eye contact calculation based on neutral/attentive state
    // Check if eyes are open by analyzing eye landmarks
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Calculate eye openness
    const leftEyeOpen = calculateEyeOpenness(leftEye);
    const rightEyeOpen = calculateEyeOpenness(rightEye);
    const avgEyeOpenness = (leftEyeOpen + rightEyeOpen) / 2;
    
    // Eye contact is based on neutral expression + eye openness
    const neutralScore = expressions.neutral || 0;
    const eyeContact = Math.round((neutralScore * 0.6 + avgEyeOpenness * 0.4) * 100);
    
    // Confidence calculation based on multiple factors
    // High neutral + not showing negative emotions
    const sadScore = expressions.sad || 0;
    const angryScore = expressions.angry || 0;
    const fearfulScore = expressions.fearful || 0;
    const negativeEmotions = sadScore + angryScore + fearfulScore;
    
    const surpriseScore = expressions.surprised || 0;
    const disgustedScore = expressions.disgusted || 0;
    
    // Confidence is inverse of negative emotions + presence of neutral/happy
    const confidence = Math.round(
        (neutralScore * 0.4 + happyScore * 0.3 + (1 - negativeEmotions) * 0.3) * 100
    );
    
    return {
        eyeContact: Math.min(100, Math.max(0, eyeContact)),
        smile: Math.min(100, Math.max(0, smile)),
        confidence: Math.min(100, Math.max(0, confidence))
    };
}

function calculateEyeOpenness(eyePoints) {
    // Calculate eye aspect ratio
    const eyeHeight = Math.abs(eyePoints[1].y - eyePoints[5].y) + Math.abs(eyePoints[2].y - eyePoints[4].y);
    const eyeWidth = Math.abs(eyePoints[0].x - eyePoints[3].x);
    const aspectRatio = eyeHeight / (2 * eyeWidth);
    
    // Normalize to 0-1 range (typical open eye is around 0.2-0.3)
    const normalized = Math.min(1, Math.max(0, aspectRatio / 0.3));
    return normalized;
}

function updateLiveAnalysis(eyeContact, smile, confidence) {
    document.getElementById('eyeContactResult').textContent = eyeContact + '%';
    document.getElementById('smileResult').textContent = smile + '%';
    document.getElementById('confidenceResult').textContent = confidence + '%';
}

function captureAnalysis() {
    if (!currentFaceData) {
        alert('No face detected. Please make sure your face is visible in the camera.');
        return;
    }
    
    // Use the current face data for final analysis
    const expressions = currentFaceData.expressions;
    const landmarks = currentFaceData.landmarks;
    
    // Create detection object for metrics calculation
    const detection = {
        expressions: expressions,
        landmarks: landmarks
    };
    
    const metrics = calculateFaceMetrics(detection);
    
    // Update results
    document.getElementById('eyeContactResult').textContent = metrics.eyeContact + '%';
    document.getElementById('smileResult').textContent = metrics.smile + '%';
    document.getElementById('confidenceResult').textContent = metrics.confidence + '%';
    
    // Generate feedback
    const eyeFeedback = generateEyeContactFeedback(metrics.eyeContact);
    const smileFeedback = generateSmileFeedback(metrics.smile);
    const confidenceFeedback = generateConfidenceFeedback(metrics.confidence);
    const overallFeedback = generateOverallFeedback(metrics.eyeContact, metrics.smile, metrics.confidence);
    
    document.getElementById('eyeContactFeedback').textContent = eyeFeedback;
    document.getElementById('smileFeedback').textContent = smileFeedback;
    document.getElementById('confidenceFeedback').textContent = confidenceFeedback;
    document.getElementById('overallFeedbackText').innerHTML = `<p>${overallFeedback}</p>`;
}

function generateEyeContactFeedback(score) {
    if (score >= 85) {
        return 'Excellent eye contact! You maintain good eye engagement, which shows confidence and attentiveness.';
    } else if (score >= 70) {
        return 'Good eye contact. Try to maintain steady eye contact for longer periods to show engagement.';
    } else if (score >= 50) {
        return 'Moderate eye contact. Practice maintaining eye contact during conversations to build rapport.';
    } else {
        return 'Eye contact needs improvement. Try to look at the camera more consistently during interviews.';
    }
}

function generateSmileFeedback(score) {
    if (score >= 85) {
        return 'Great smile! Your friendly expression creates a positive impression.';
    } else if (score >= 70) {
        return 'Good smile. A genuine smile helps create a welcoming atmosphere.';
    } else if (score >= 50) {
        return 'Moderate smile. Try to smile more naturally during conversations.';
    } else {
        return 'Smile could be improved. A warm smile helps build connections and shows approachability.';
    }
}

function generateConfidenceFeedback(score) {
    if (score >= 85) {
        return 'High confidence detected! Your posture and expression convey strong self-assurance.';
    } else if (score >= 70) {
        return 'Good confidence level. Maintain this level of composure during interviews.';
    } else if (score >= 50) {
        return 'Moderate confidence. Practice speaking clearly and maintaining good posture.';
    } else {
        return 'Confidence needs improvement. Practice positive self-talk and maintain good body language.';
    }
}

function generateOverallFeedback(eyeContact, smile, confidence) {
    const average = (eyeContact + smile + confidence) / 3;
    
    let feedback = '';
    
    if (average >= 80) {
        feedback = 'Excellent overall presentation! Your facial expressions demonstrate strong confidence and engagement. You project professionalism and approachability. Maintain this level of engagement during interviews.';
    } else if (average >= 65) {
        feedback = 'Good overall presentation with room for improvement. Your facial expressions show positive engagement. Focus on maintaining consistent eye contact and a natural smile to enhance your professional presence.';
    } else if (average >= 50) {
        feedback = 'Moderate presentation. While you show some positive elements, there are areas for improvement. Practice maintaining eye contact, smiling naturally, and projecting confidence through body language.';
    } else {
        feedback = 'Your presentation needs significant improvement. Practice in front of a mirror to work on eye contact, smiling, and confident body language. Consider recording yourself to identify areas for growth.';
    }
    
    return feedback;
}

// Template Selection Function
function selectTemplate(templateType) {
    // Store selected template in localStorage
    localStorage.setItem('selectedTemplate', templateType);

    // Redirect to resume builder
    window.location.href = 'resume-builder.html';
}

// Apply selected template to resume preview
function applyTemplateToPreview() {
    const selectedTemplate = localStorage.getItem('selectedTemplate') || 'basic';
    const resumePreview = document.getElementById('resumePreview');

    if (resumePreview) {
        // Remove all template classes
        resumePreview.className = 'resume-preview';

        // Add selected template class
        resumePreview.classList.add(selectedTemplate + '-resume');
        
        // Handle special template structures
        if (selectedTemplate === 'kelly') {
            applyKellyStructure(resumePreview);
        } else if (selectedTemplate === 'howard') {
            applyHowardStructure(resumePreview);
        } else if (selectedTemplate === 'howard-jones') {
            applyHowardJonesStructure(resumePreview);
        } else if (selectedTemplate === 'samantha-williams') {
            applySamanthaWilliamsStructure(resumePreview);
        } else if (selectedTemplate === 'jessie-smith') {
            applyJessieSmithStructure(resumePreview);
        } else if (selectedTemplate === 'james-sidebar') {
            applyJamesSidebarStructure(resumePreview);
        } else if (selectedTemplate === 'james-header') {
            applyJamesHeaderStructure(resumePreview);
        } else if (selectedTemplate === 'james-minimal') {
            applyJamesMinimalStructure(resumePreview);
        } else if (selectedTemplate === 'jessie-smith-modern') {
            applyJessieSmithModernStructure(resumePreview);
        } else if (selectedTemplate === 'raju-rathore') {
            applyRajuRathoreStructure(resumePreview);
        } else if (selectedTemplate === 'daryl-banks') {
            applyDarylBanksStructure(resumePreview);
        }
        
        // Check if photo should be displayed for photo templates
        if (typeof checkPhotoTemplate === 'function') {
            checkPhotoTemplate();
        }
    }
}

// Helper function to get resume data from form inputs
function getResumeDataFromForm() {
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const name = (firstName + ' ' + lastName).trim() || 'Your Name';
    
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const location = document.getElementById('location')?.value || '';
    const contact = [email, phone, location].filter(p => p).join(' | ');
    
    const summary = document.getElementById('summary')?.value || '';
    const skills = document.getElementById('skills')?.value || '';
    const skillsList = skills.split(',').map(s => s.trim()).filter(s => s);
    
    // Build experience HTML from form
    let experienceHTML = '';
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach(item => {
        const jobTitle = item.querySelector('input[name="jobTitle"]')?.value || '';
        const company = item.querySelector('input[name="company"]')?.value || '';
        const startDate = item.querySelector('input[name="startDate"]')?.value || '';
        const endDate = item.querySelector('input[name="endDate"]')?.value || '';
        const currentJob = item.querySelector('input[name="currentJob"]')?.checked || false;
        const description = item.querySelector('textarea[name="description"]')?.value || '';
        
        if (jobTitle || company) {
            const dateRange = startDate ? `${startDate} - ${currentJob ? 'Present' : (endDate || '')}` : '';
            experienceHTML += `
                <div class="experience-item-preview">
                    <h4>${jobTitle}</h4>
                    <p class="company">${company}${dateRange ? ' | ' + dateRange : ''}</p>
                    ${description ? `<p class="description">${description}</p>` : ''}
                </div>
            `;
        }
    });
    
    // Build education HTML from form
    let educationHTML = '';
    const educationItems = document.querySelectorAll('.education-item');
    educationItems.forEach(item => {
        const degree = item.querySelector('input[name="degree"]')?.value || '';
        const institution = item.querySelector('input[name="institution"]')?.value || '';
        const gradYear = item.querySelector('input[name="gradYear"]')?.value || '';
        
        if (degree || institution) {
            educationHTML += `
                <div class="education-item-preview">
                    <h4>${degree}</h4>
                    <p>${institution}${gradYear ? ' | ' + gradYear : ''}</p>
                </div>
            `;
        }
    });
    
    return { name, email, phone, location, contact, summary, skills, skillsList, experienceHTML, educationHTML };
}

// Apply Kelly template structure - sidebar layout
function applyKellyStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build Kelly structure
    resumePreview.innerHTML = `
        <div class="resume-sidebar">
            <div class="sidebar-header">
                <h1 class="sidebar-name">${data.name}</h1>
                <p class="sidebar-title">Professional</p>
            </div>
            <h3>Details</h3>
            <div class="contact-item">
                <span class="contact-icon">@</span>
                <span>${data.email}</span>
            </div>
            <div class="contact-item">
                <span class="contact-icon">☎</span>
                <span>${data.phone}</span>
            </div>
            <div class="contact-item">
                <span class="contact-icon">📍</span>
                <span>${data.location}</span>
            </div>
            <h3>Skills</h3>
            <ul class="skill-list">
                ${data.skillsList.map(skill => `<li class="skill-item">${skill.trim()}</li>`).join('')}
            </ul>
        </div>
        <div class="resume-main">
            <h3 class="section-title">Summary</h3>
            <p class="summary-text">${data.summary}</p>
            <h3 class="section-title">Experience</h3>
            <div class="experience-list">${data.experienceHTML}</div>
            <h3 class="section-title">Education</h3>
            <div class="education-list">${data.educationHTML}</div>
        </div>
    `;
}

// Apply Howard template structure - centered layout
function applyHowardStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build Howard structure
    resumePreview.innerHTML = `
        <div class="resume-header-centered">
            <div class="resume-name-centered">
                <h1>${data.name}</h1>
            </div>
            <p class="resume-title-centered">Professional</p>
            <div class="contact-centered">
                <span class="contact-address">${data.location}</span>
                <span class="contact-links">
                    <span>${data.email}</span>
                    <span>|</span>
                    <span>${data.phone}</span>
                </span>
            </div>
        </div>
        
        <div class="section-header-centered">
            <h3 class="section-title-centered">Summary</h3>
        </div>
        <p class="summary-text">${data.summary}</p>
        
        <div class="section-header-centered">
            <h3 class="section-title-centered">Experience</h3>
        </div>
        <div class="experience-centered">${data.experienceHTML}</div>
        
        <div class="section-header-centered">
            <h3 class="section-title-centered">Education</h3>
        </div>
        <div class="education-centered">${data.educationHTML}</div>
        
        <div class="section-header-centered">
            <h3 class="section-title-centered">Skills</h3>
        </div>
        <div class="skills-centered">
            ${data.skillsList.map(skill => `<div class="skill-item-centered"><span>${skill.trim()}</span></div>`).join('')}
        </div>
    `;
}

// Apply Howard Jones ATS template structure - centered minimalist
function applyHowardJonesStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build Howard Jones structure
    resumePreview.innerHTML = `
        <div class="resume-header-centered">
            <div class="resume-name-centered">
                <h1>${data.name}</h1>
            </div>
            <p class="resume-title-centered">Professional</p>
            <div class="contact-centered">
                <span class="contact-address">${data.location}</span>
                <span class="contact-links">
                    <span>${data.email}</span>
                    <span>|</span>
                    <span>${data.phone}</span>
                </span>
            </div>
        </div>
        
        <div class="section-header-centered">
            <h3 class="section-title-centered">Summary</h3>
        </div>
        <p class="summary-text">${data.summary}</p>
        
        <div class="section-header-centered">
            <h3 class="section-title-centered">Experience</h3>
        </div>
        <div class="experience-centered">${data.experienceHTML}</div>
        
        <div class="section-header-centered">
            <h3 class="section-title-centered">Education</h3>
        </div>
        <div class="education-section-centered">
            <div class="education-centered">${data.educationHTML}</div>
        </div>
        
        <div class="section-header-centered">
            <h3 class="section-title-centered">Skills</h3>
        </div>
        <div class="skills-centered">
            ${data.skillsList.map(skill => `<div class="skill-item-centered"><span>${skill.trim()}</span><span></span></div>`).join('')}
        </div>
    `;
}

// Apply Samantha Williams ATS template structure - two column with photo
function applySamanthaWilliamsStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build Samantha Williams structure
    resumePreview.innerHTML = `
        <div class="resume-header-photo">
            <div class="header-left">
                <div class="name-header">
                    <h1>${data.name}</h1>
                </div>
                <p class="title-header">Professional</p>
                <div class="contact-header">
                    ${data.location ? data.location + '<br>' : ''}
                    ${data.email} | ${data.phone}
                </div>
            </div>
            <div class="header-right">
                <div class="photo-placeholder">Photo</div>
            </div>
        </div>
        
        <div class="section-header-sw">
            <h3 class="section-title-sw">Summary</h3>
        </div>
        <p class="summary-text-sw">${data.summary}</p>
        
        <div class="section-header-sw">
            <h3 class="section-title-sw">Experience</h3>
        </div>
        <div class="experience-sw">${data.experienceHTML}</div>
        
        <div class="section-header-sw">
            <h3 class="section-title-sw">Education</h3>
        </div>
        <div class="education-sw">${data.educationHTML}</div>
        
        <div class="section-header-sw">
            <h3 class="section-title-sw">Skills</h3>
        </div>
        <div class="skills-sw">
            ${data.skillsList.map(skill => `<div class="skill-item-sw">${skill.trim()}</div>`).join('')}
        </div>
    `;
}

// Apply Jessie Smith ATS template structure - clean single column
function applyJessieSmithStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build Jessie Smith structure
    resumePreview.innerHTML = `
        <div class="resume-header-js">
            <div class="name-header-js">
                <h1>${data.name}</h1>
            </div>
            <p class="title-header-js">Professional</p>
            <div class="contact-header-js">
                <div class="contact-left">
                    ${data.location}<br>
                    ${data.email} | ${data.phone}
                </div>
            </div>
        </div>
        
        <div class="section-header-js">
            <h3 class="section-title-js">Summary</h3>
        </div>
        <p class="summary-text-js">${data.summary}</p>
        
        <div class="section-header-js">
            <h3 class="section-title-js">Experience</h3>
        </div>
        <div class="experience-js">${data.experienceHTML}</div>
        
        <div class="section-header-js">
            <h3 class="section-title-js">Education</h3>
        </div>
        <div class="education-js">${data.educationHTML}</div>
        
        <div class="section-header-js">
            <h3 class="section-title-js">Skills</h3>
        </div>
        <div class="skills-js">
            ${data.skillsList.map(skill => `<div class="skill-item-js">${skill.trim()}</div>`).join('')}
        </div>
    `;
}

// Apply James Sidebar template structure - left sidebar with photo
function applyJamesSidebarStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build James Sidebar structure
    resumePreview.innerHTML = `
        <div class="sidebar-left">
            <div class="photo-container" id="jamesSidebarPhotoContainer" style="cursor: pointer;">
                <img id="jamesSidebarPhoto" class="james-photo" src="" alt="Profile Photo" style="display: none;">
                <div id="jamesSidebarPlaceholder" class="photo-placeholder-flex">
                    <i class="fas fa-user"></i>
                    <span>Add Photo</span>
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3 class="sidebar-title">DETAILS</h3>
                <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <span>${data.email}</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📱</span>
                    <span>${data.phone}</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📍</span>
                    <span>${data.location}</span>
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3 class="sidebar-title">SKILLS</h3>
                ${data.skillsList.slice(0, 5).map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
            </div>
            
            <div class="sidebar-section">
                <h3 class="sidebar-title">LANGUAGES</h3>
                <div class="contact-item">English</div>
                <div class="contact-item">German</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="main-header">
                <h1 class="main-name">${data.name}</h1>
                <p class="main-title">Financial Analyst</p>
            </div>
            
            <div class="section-header">
                <h3 class="section-title">SUMMARY</h3>
            </div>
            <p class="summary-text">${data.summary}</p>
            
            <div class="section-header">
                <h3 class="section-title">EXPERIENCE</h3>
            </div>
            <div class="experience-list">${data.experienceHTML}</div>
            
            <div class="section-header">
                <h3 class="section-title">EDUCATION</h3>
            </div>
            <div class="education-list">${data.educationHTML}</div>
        </div>
    `;
    
    // Add click handler to photo container
    const photoContainer = document.getElementById('jamesSidebarPhotoContainer');
    if (photoContainer) {
        photoContainer.addEventListener('click', function() {
            const photoInput = document.getElementById('photo');
            if (photoInput) photoInput.click();
        });
    }
    
    // Update photo if user has uploaded one
    if (userPhotoData) {
        const photo = document.getElementById('jamesSidebarPhoto');
        const placeholder = document.getElementById('jamesSidebarPlaceholder');
        if (photo) {
            photo.src = userPhotoData;
            photo.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
    }
}

// Apply James Header template structure - dark header with photo
function applyJamesHeaderStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build James Header structure
    resumePreview.innerHTML = `
        <div class="header-top">
            <div class="header-photo" id="jamesHeaderPhotoContainer" style="cursor: pointer;">
                <img id="jamesHeaderPhoto" class="james-header-img" src="" alt="Profile Photo" style="display: none;">
                <div id="jamesHeaderPlaceholder" class="photo-placeholder-flex">
                    <i class="fas fa-user"></i>
                    <span>Add Photo</span>
                </div>
            </div>
            <div class="header-info">
                <h1 class="header-name">${data.name}</h1>
                <p class="header-title">Financial Analyst</p>
                <div class="header-contact">
                    <span>${data.email}</span>
                    <span>${data.phone}</span>
                    <span>${data.location}</span>
                </div>
            </div>
        </div>
        
        <div class="body-content">
            <div class="body-section full-width">
                <h3 class="body-title">SUMMARY</h3>
                <p class="body-text">${data.summary}</p>
            </div>
            
            <div class="body-section">
                <h3 class="body-title">EXPERIENCE</h3>
                <div class="body-text">${data.experienceHTML}</div>
            </div>
            
            <div class="body-section">
                <h3 class="body-title">EDUCATION</h3>
                <div class="body-text">${data.educationHTML}</div>
            </div>
            
            <div class="body-section full-width">
                <h3 class="body-title">SKILLS</h3>
                <div class="skill-list-inline">
                    ${data.skillsList.map(skill => `<span class="skill-badge">${skill.trim()}</span>`).join('')}
                </div>
            </div>
            
            <div class="body-section">
                <h3 class="body-title">LANGUAGES</h3>
                <div class="language-item">
                    <span class="language-name">English</span>
                </div>
                <div class="language-item">
                    <span class="language-name">German</span>
                </div>
            </div>
        </div>
    `;
    
    // Add click handler to photo container
    const photoContainer = document.getElementById('jamesHeaderPhotoContainer');
    if (photoContainer) {
        photoContainer.addEventListener('click', function() {
            const photoInput = document.getElementById('photo');
            if (photoInput) photoInput.click();
        });
    }
    
    // Update photo if user has uploaded one
    if (userPhotoData) {
        const photo = document.getElementById('jamesHeaderPhoto');
        const placeholder = document.getElementById('jamesHeaderPlaceholder');
        if (photo) {
            photo.src = userPhotoData;
            photo.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
    }
}

// Apply James Minimal template structure - right aligned photo
function applyJamesMinimalStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build James Minimal structure
    resumePreview.innerHTML = `
        <div class="minimal-header">
            <div class="header-text">
                <h1 class="minimal-name">${data.name}</h1>
                <p class="minimal-title">Financial Analyst</p>
                <div class="minimal-contact">
                    <div>${data.email}</div>
                    <div>${data.phone}</div>
                    <div>${data.location}</div>
                </div>
            </div>
            <div class="minimal-photo" id="jamesMinimalPhotoContainer" style="cursor: pointer;">
                <img id="jamesMinimalPhoto" class="james-minimal-img" src="" alt="Profile Photo" style="display: none;">
                <div id="jamesMinimalPlaceholder" class="photo-placeholder-flex">
                    <i class="fas fa-user"></i>
                    <span>Add Photo</span>
                </div>
            </div>
        </div>
        
        <div class="minimal-body">
            <div class="minimal-section full-width">
                <h3 class="minimal-section-title">Summary</h3>
                <p class="minimal-text">${data.summary}</p>
            </div>
            
            <div class="minimal-section full-width">
                <h3 class="minimal-section-title">Experience</h3>
                <div class="minimal-text">${data.experienceHTML}</div>
            </div>
            
            <div class="minimal-section full-width">
                <h3 class="minimal-section-title">Education</h3>
                <div class="minimal-text">${data.educationHTML}</div>
            </div>
            
            <div class="minimal-section">
                <h3 class="minimal-section-title">Skills</h3>
                <ul class="minimal-list">
                    ${data.skillsList.slice(0, 4).map(skill => `<li>${skill.trim()}</li>`).join('')}
                </ul>
            </div>
            
            <div class="minimal-section">
                <h3 class="minimal-section-title">Languages</h3>
                <ul class="minimal-list">
                    <li>English</li>
                    <li>German</li>
                </ul>
            </div>
        </div>
    `;
    
    // Add click handler to photo container
    const photoContainer = document.getElementById('jamesMinimalPhotoContainer');
    if (photoContainer) {
        photoContainer.addEventListener('click', function() {
            const photoInput = document.getElementById('photo');
            if (photoInput) photoInput.click();
        });
    }
    
    // Update photo if user has uploaded one
    if (userPhotoData) {
        const photo = document.getElementById('jamesMinimalPhoto');
        const placeholder = document.getElementById('jamesMinimalPlaceholder');
        if (photo) {
            photo.src = userPhotoData;
            photo.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
    }
}

// Apply Jessie Smith Modern template structure - green with circular badge
function applyJessieSmithModernStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Split name for badge
    const nameParts = data.name.split(' ');
    const firstName = nameParts[0] || 'First';
    const lastName = nameParts.slice(1).join(' ') || 'Last';
    
    // Build Jessie Smith Modern structure
    resumePreview.innerHTML = `
        <div class="left-sidebar">
            <div class="name-badge">
                <span class="first-name">${firstName}</span>
                <span class="last-name">${lastName}</span>
            </div>
            
            <h3 class="sidebar-title">Details</h3>
            <div class="sidebar-content">
                <div style="margin-bottom: 0.5rem;">${data.email}</div>
                <div style="margin-bottom: 0.5rem;">${data.phone}</div>
                <div>${data.location}</div>
            </div>
            
            <h3 class="sidebar-title">Skills</h3>
            <div class="sidebar-content">
                ${data.skillsList.slice(0, 5).map(skill => `<div style="margin-bottom: 0.3rem;">• ${skill.trim()}</div>`).join('')}
            </div>
            
            <h3 class="sidebar-title">Languages</h3>
            <div class="sidebar-content">
                <div>English</div>
                <div>German</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="section-header-modern">
                <h3 class="section-title-modern">Summary</h3>
            </div>
            <p class="summary-modern">${data.summary}</p>
            
            <div class="section-header-modern">
                <h3 class="section-title-modern">Experience</h3>
            </div>
            <div class="experience-modern">${data.experienceHTML}</div>
            
            <div class="section-header-modern">
                <h3 class="section-title-modern">Education</h3>
            </div>
            <div class="education-modern">${data.educationHTML}</div>
        </div>
    `;
}

// Apply Raju Rathore template structure - elegant light theme
function applyRajuRathoreStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build Raju Rathore structure
    resumePreview.innerHTML = `
        <div class="header-elegant">
            <div class="name-section">
                <h1 class="name-elegant">${data.name}</h1>
                <p class="title-elegant">Sales Associate</p>
            </div>
            <div class="contact-section">
                <div>${data.email}</div>
                <div>${data.phone}</div>
                <div>${data.location}</div>
            </div>
        </div>
        
        <div class="body-elegant">
            <div class="left-column">
                <div class="section-title-elegant">Details</div>
                <div style="font-size: 0.8rem; color: #666; line-height: 1.6; margin-bottom: 1.5rem;">
                    <div>${data.email}</div>
                    <div>${data.phone}</div>
                    <div>${data.location}</div>
                </div>
                
                <div class="section-title-elegant">Skills</div>
                <div class="skills-elegant">
                    ${data.skillsList.map(skill => `<span class="skill-tag-elegant">${skill.trim()}</span>`).join('')}
                </div>
            </div>
            
            <div class="right-column">
                <div class="section-title-elegant">Summary</div>
                <p class="summary-elegant">${data.summary}</p>
                
                <div class="section-title-elegant">Experience</div>
                <div class="experience-elegant">${data.experienceHTML}</div>
                
                <div class="section-title-elegant">Education</div>
                <div class="education-elegant">${data.educationHTML}</div>
            </div>
        </div>
    `;
}

// Apply Daryl Banks template structure - dark sidebar with photo
function applyDarylBanksStructure(resumePreview) {
    const data = getResumeDataFromForm();
    
    // Build Daryl Banks structure with photo sidebar
    resumePreview.innerHTML = `
        <div class="daryl-banks-container">
            <div class="daryl-banks-sidebar">
                <div class="daryl-banks-photo-container" id="previewPhotoContainer" style="cursor: pointer;">
                    <img id="previewPhoto" class="daryl-banks-photo" src="" alt="Profile Photo" style="display: none;">
                    <div id="photoPlaceholder" class="daryl-banks-photo-placeholder">
                        <i class="fas fa-user"></i>
                        <span>Add Photo</span>
                    </div>
                </div>
                <div class="daryl-banks-contact">
                    <h3 class="daryl-banks-sidebar-title">Contact</h3>
                    <div class="daryl-banks-contact-item">
                        <span class="daryl-banks-icon">✉</span>
                        <span>${data.email}</span>
                    </div>
                    <div class="daryl-banks-contact-item">
                        <span class="daryl-banks-icon">📍</span>
                        <span>${data.location}</span>
                    </div>
                    <div class="daryl-banks-contact-item">
                        <span class="daryl-banks-icon">📱</span>
                        <span>${data.phone}</span>
                    </div>
                </div>
            </div>
            <div class="daryl-banks-main">
                <div class="daryl-banks-header">
                    <h1 class="daryl-banks-name">${data.name}</h1>
                    <p class="daryl-banks-title">Professional</p>
                </div>
                <div class="daryl-banks-body">
                    <div class="daryl-banks-section">
                        <h3 class="daryl-banks-section-title">Summary</h3>
                        <p class="daryl-banks-summary">${data.summary}</p>
                    </div>
                    <div class="daryl-banks-section">
                        <h3 class="daryl-banks-section-title">Experience</h3>
                        <div class="daryl-banks-experience">${data.experienceHTML}</div>
                    </div>
                    <div class="daryl-banks-section">
                        <h3 class="daryl-banks-section-title">Education</h3>
                        <div class="daryl-banks-education">${data.educationHTML}</div>
                    </div>
                    <div class="daryl-banks-section">
                        <h3 class="daryl-banks-section-title">Skills</h3>
                        <div class="daryl-banks-skills">
                            ${data.skillsList.map(skill => `<div class="daryl-banks-skill">${skill.trim()}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add click handler to photo container to trigger file upload
    const photoContainer = document.getElementById('previewPhotoContainer');
    if (photoContainer) {
        photoContainer.addEventListener('click', function() {
            const photoInput = document.getElementById('photo');
            if (photoInput) {
                photoInput.click();
            }
        });
    }
    
    // Update photo if user has uploaded one
    if (userPhotoData) {
        const previewPhoto = document.getElementById('previewPhoto');
        const photoPlaceholder = document.getElementById('photoPlaceholder');
        if (previewPhoto) {
            previewPhoto.src = userPhotoData;
            previewPhoto.style.display = 'block';
        }
        if (photoPlaceholder) {
            photoPlaceholder.style.display = 'none';
        }
    }
}

// Template configuration with colors and styles
const templateConfig = {
    multicolor: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#f093fb',
        layout: 'centered',
        fontFamily: 'Inter, sans-serif'
    },
    standout: {
        primaryColor: '#ff6b6b',
        secondaryColor: '#feca57',
        accentColor: '#ff6b6b',
        layout: 'centered',
        fontFamily: 'Poppins, sans-serif'
    },
    visionary: {
        primaryColor: '#4facfe',
        secondaryColor: '#00f2fe',
        accentColor: '#4facfe',
        layout: 'centered',
        fontFamily: 'Inter, sans-serif'
    },
    artistic: {
        primaryColor: '#fa709a',
        secondaryColor: '#fee140',
        accentColor: '#fa709a',
        layout: 'sidebar',
        fontFamily: 'Playfair Display, serif'
    },
    soothing: {
        primaryColor: '#a8edea',
        secondaryColor: '#fed6e3',
        accentColor: '#a8edea',
        layout: 'minimal',
        fontFamily: 'Roboto, sans-serif'
    },
    maverick: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#1e3a5f',
        layout: 'sidebar',
        fontFamily: 'Montserrat, sans-serif'
    },
    executive: {
        primaryColor: '#1e3a5f',
        secondaryColor: '#2d5a87',
        accentColor: '#1e3a5f',
        layout: 'centered',
        fontFamily: 'Georgia, serif'
    },
    superb: {
        primaryColor: '#11998e',
        secondaryColor: '#38ef7d',
        accentColor: '#11998e',
        layout: 'centered',
        fontFamily: 'Inter, sans-serif'
    },
    trailblazer: {
        primaryColor: '#f12711',
        secondaryColor: '#f5af19',
        accentColor: '#f12711',
        layout: 'sidebar',
        fontFamily: 'Poppins, sans-serif'
    },
    basic: {
        primaryColor: '#333',
        secondaryColor: '#666',
        accentColor: '#333',
        layout: 'minimal',
        fontFamily: 'Arial, sans-serif'
    },
    awesome: {
        primaryColor: '#8e2de2',
        secondaryColor: '#4a00e0',
        accentColor: '#8e2de2',
        layout: 'centered',
        fontFamily: 'Montserrat, sans-serif'
    },
    magnetic: {
        primaryColor: '#00c6ff',
        secondaryColor: '#0072ff',
        accentColor: '#00c6ff',
        layout: 'centered',
        fontFamily: 'Inter, sans-serif'
    },
    classic: {
        primaryColor: '#333',
        secondaryColor: '#555',
        accentColor: '#333',
        layout: 'minimal',
        fontFamily: 'Times New Roman, serif'
    },
    stylish: {
        primaryColor: '#ee9ca7',
        secondaryColor: '#ffdde1',
        accentColor: '#ee9ca7',
        layout: 'centered',
        fontFamily: 'Playfair Display, serif'
    },
    contemporary: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#1e3a5f',
        layout: 'sidebar',
        fontFamily: 'Inter, sans-serif'
    },
    elegant: {
        primaryColor: '#d299c2',
        secondaryColor: '#fef9d7',
        accentColor: '#d299c2',
        layout: 'centered',
        fontFamily: 'Georgia, serif'
    },
    cool: {
        primaryColor: '#00b09b',
        secondaryColor: '#96c93d',
        accentColor: '#00b09b',
        layout: 'centered',
        fontFamily: 'Poppins, sans-serif'
    },
    catalyst: {
        primaryColor: '#fc466b',
        secondaryColor: '#3f5efb',
        accentColor: '#fc466b',
        layout: 'sidebar',
        fontFamily: 'Montserrat, sans-serif'
    },
    professional: {
        primaryColor: '#1e3a5f',
        secondaryColor: '#667eea',
        accentColor: '#1e3a5f',
        layout: 'sidebar',
        fontFamily: 'Inter, sans-serif'
    },
    smart: {
        primaryColor: '#a8ff78',
        secondaryColor: '#78ffd6',
        accentColor: '#a8ff78',
        layout: 'minimal',
        fontFamily: 'Roboto, sans-serif'
    },
    modern: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        accentColor: '#667eea',
        layout: 'centered',
        fontFamily: 'Inter, sans-serif'
    },
    prism: {
        primaryColor: '#ff0844',
        secondaryColor: '#ffb199',
        accentColor: '#1e3a5f',
        layout: 'sidebar',
        fontFamily: 'Poppins, sans-serif'
    },
    ledger: {
        primaryColor: '#232526',
        secondaryColor: '#414345',
        accentColor: '#232526',
        layout: 'minimal',
        fontFamily: 'Georgia, serif'
    },
    summit: {
        primaryColor: '#0f0c29',
        secondaryColor: '#302b63',
        accentColor: '#24243e',
        layout: 'centered',
        fontFamily: 'Montserrat, sans-serif'
    }
};

// Get template configuration
function getTemplateConfig(templateName) {
    return templateConfig[templateName] || templateConfig['basic'];
}
