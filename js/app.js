// Main Application Entry Point
class GREMindApp {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('Initializing GRE Mind App...');
            
            // Wait for database initialization
            await this.waitForDatabase();
            
            // Initialize navigation
            navigation.init();
            
            // Initialize dashboard
            await dashboard.init();
            
            // Add sample words if database is empty
            await this.checkAndAddSampleData();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            this.isInitialized = true;
            console.log('GRE Mind App initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorMessage('앱 초기화 중 오류가 발생했습니다.');
        }
    }

    async waitForDatabase() {
        let retries = 0;
        const maxRetries = 10;
        
        while (!db.db && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!db.db) {
            throw new Error('Database initialization failed');
        }
    }

    async checkAndAddSampleData() {
        const existingWords = await db.getWords();
        
        console.log(`Found ${existingWords.length} existing words in database`);
        
        if (existingWords.length === 0) {
            console.log('Adding sample words...');
            await vocabularyManager.addSampleWords();
            
            // Initialize user stats
            const initialStats = {
                streak: 1,
                totalStudied: 0,
                masteredWords: 0,
                accuracyRate: 0,
                studyTime: 0
            };
            await db.saveStats(initialStats);
            
            // Refresh dashboard after adding words
            console.log('Refreshing dashboard after adding words...');
            setTimeout(() => {
                dashboard.refresh();
            }, 1000);
        } else {
            console.log('Words already exist, refreshing dashboard...');
            setTimeout(() => {
                dashboard.refresh();
            }, 500);
        }
    }

    setupGlobalEvents() {
        // Handle app visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isInitialized) {
                dashboard.refresh();
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        showPage('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        showPage('vocabulary');
                        break;
                    case '3':
                        e.preventDefault();
                        showPage('quiz');
                        break;
                    case '4':
                        e.preventDefault();
                        showPage('stats');
                        break;
                }
            }
        });

        // Handle quiz keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (navigation.currentPage === 'quiz') {
                switch (e.key) {
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                        e.preventDefault();
                        const optionIndex = parseInt(e.key) - 1;
                        const options = document.querySelectorAll('.option');
                        if (options[optionIndex]) {
                            options[optionIndex].click();
                        }
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (document.getElementById('quiz-submit').style.display !== 'none') {
                            submitAnswer();
                        } else if (document.getElementById('quiz-next').style.display !== 'none') {
                            nextQuestion();
                        }
                        break;
                }
            }
        });
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #e74c3c;
            color: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>오류 발생</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 1rem;">새로고침</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new GREMindApp();
    app.init();
});

// Global app instance
window.greMindApp = new GREMindApp();