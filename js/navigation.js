// Navigation Module
class Navigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = ['dashboard', 'vocabulary', 'quiz', 'stats'];
    }

    init() {
        // Set up navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.showPage(page);
            });
        });

        // Show initial page
        this.showPage('dashboard');
    }

    showPage(pageName) {
        if (!this.pages.includes(pageName)) {
            console.error(`Page ${pageName} not found`);
            return;
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        document.getElementById(pageName).classList.add('active');

        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        this.currentPage = pageName;

        // Initialize page-specific functionality
        this.initializePage(pageName);
    }

    initializePage(pageName) {
        switch (pageName) {
            case 'dashboard':
                dashboard.refresh();
                break;
            case 'vocabulary':
                initVocabularyPage();
                break;
            case 'quiz':
                // Quiz initialization is handled by Quiz class
                break;
            case 'stats':
                dashboard.updateStatsPage();
                break;
        }
    }
}

// Global navigation instance
const navigation = new Navigation();

// Global function for page navigation
function showPage(pageName) {
    navigation.showPage(pageName);
}