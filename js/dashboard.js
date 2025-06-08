// Dashboard Module
class Dashboard {
    constructor() {
        this.stats = {};
    }

    async init() {
        await this.loadStats();
        this.updateDisplay();
    }

    async loadStats() {
        this.stats = await db.getStats();
        
        // Calculate real-time stats
        const allWords = await db.getWords();
        const reviewWords = await db.getWordsForReview();
        const newWords = await db.getWords('new');
        const masteredWords = await db.getWords('mastered');
        const weakWords = allWords.filter(word => 
            word.incorrectCount > word.correctCount && word.incorrectCount > 0
        );

        // Debug information
        console.log('Dashboard Stats Debug:');
        console.log('Total words:', allWords.length);
        console.log('New words:', newWords.length);
        console.log('Review words:', reviewWords.length);
        console.log('Mastered words:', masteredWords.length);
        console.log('Weak words:', weakWords.length);

        this.stats.newWordsCount = newWords.length > 0 ? Math.min(newWords.length, 20) : 0;
        this.stats.reviewCount = reviewWords.length;
        this.stats.weakCount = weakWords.length;
        this.stats.totalWords = allWords.length;
        this.stats.masteredCount = masteredWords.length;
        this.stats.progressPercentage = this.stats.totalWords > 0 ? 
            Math.round((this.stats.masteredCount / this.stats.totalWords) * 100) : 0;
    }

    updateDisplay() {
        // Update counts
        document.getElementById('new-words-count').textContent = this.stats.newWordsCount || 0;
        document.getElementById('review-count').textContent = this.stats.reviewCount || 0;
        document.getElementById('weak-count').textContent = this.stats.weakCount || 0;
        
        // Update progress
        document.getElementById('overall-progress').style.width = `${this.stats.progressPercentage}%`;
        document.getElementById('progress-percentage').textContent = `${this.stats.progressPercentage}%`;
        document.getElementById('mastered-count').textContent = this.stats.masteredCount || 0;
        document.getElementById('total-words').textContent = this.stats.totalWords || 0;
        
        // Update streak
        document.getElementById('streak-count').textContent = this.stats.streak || 1;
        
        // Update stats page
        this.updateStatsPage();
    }

    updateStatsPage() {
        document.getElementById('accuracy-rate').textContent = `${this.stats.accuracyRate || 0}%`;
        document.getElementById('total-studied').textContent = this.stats.totalStudied || 0;
        document.getElementById('mastered-words').textContent = this.stats.masteredCount || 0;
        document.getElementById('study-time').textContent = `${this.stats.studyTime || 0}시간`;
        
        this.drawForgettingCurve();
    }

    drawForgettingCurve() {
        const container = document.getElementById('forgetting-curve');
        container.innerHTML = `
            <svg width="100%" height="280" viewBox="0 0 400 200">
                <defs>
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#3498db;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#e74c3c;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <!-- Axes -->
                <line x1="40" y1="20" x2="40" y2="180" stroke="#bdc3c7" stroke-width="2"/>
                <line x1="40" y1="180" x2="380" y2="180" stroke="#bdc3c7" stroke-width="2"/>
                
                <!-- Forgetting curve -->
                <path d="M 40,40 Q 120,60 200,100 T 380,160" 
                      stroke="url(#curveGradient)" 
                      stroke-width="3" 
                      fill="none"/>
                
                <!-- Points for review intervals -->
                <circle cx="60" cy="45" r="4" fill="#3498db"/>
                <circle cx="100" cy="55" r="4" fill="#3498db"/>
                <circle cx="150" cy="75" r="4" fill="#f39c12"/>
                <circle cx="220" cy="105" r="4" fill="#e74c3c"/>
                <circle cx="300" cy="135" r="4" fill="#e74c3c"/>
                
                <!-- Labels -->
                <text x="50" y="15" fill="#7f8c8d" font-size="12">기억률</text>
                <text x="340" y="195" fill="#7f8c8d" font-size="12">시간</text>
                
                <!-- Time labels -->
                <text x="55" y="195" fill="#7f8c8d" font-size="10">10분</text>
                <text x="95" y="195" fill="#7f8c8d" font-size="10">1시간</text>
                <text x="140" y="195" fill="#7f8c8d" font-size="10">1일</text>
                <text x="210" y="195" fill="#7f8c8d" font-size="10">3일</text>
                <text x="290" y="195" fill="#7f8c8d" font-size="10">7일</text>
            </svg>
            
            <div style="margin-top: 1rem; text-align: center; color: #7f8c8d;">
                <p>에빙하우스 망각곡선에 따른 최적 복습 주기</p>
            </div>
        `;
    }

    async refresh() {
        await this.loadStats();
        this.updateDisplay();
    }
}

// Global dashboard instance
const dashboard = new Dashboard();

// Dashboard control functions
function startNewWords() {
    quiz.startQuiz('new', 5);
}

function startReview() {
    quiz.startQuiz('review', 10);
}

function startWeakPoints() {
    quiz.startQuiz('weak', 5);
}

function updateDashboard() {
    dashboard.refresh();
}