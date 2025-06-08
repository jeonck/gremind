// Vocabulary Module
class VocabularyManager {
    constructor() {
        this.currentFilter = 'all';
        this.words = [];
    }

    async loadWords() {
        this.words = await db.getWords(this.currentFilter);
        this.renderWordList();
    }

    renderWordList() {
        const container = document.getElementById('word-list');
        container.innerHTML = '';

        if (this.words.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #7f8c8d; padding: 2rem;">
                    <h3>단어가 없습니다</h3>
                    <p>새로운 단어를 추가해보세요!</p>
                </div>
            `;
            return;
        }

        this.words.forEach(word => {
            const wordElement = this.createWordElement(word);
            container.appendChild(wordElement);
        });
    }

    createWordElement(word) {
        const div = document.createElement('div');
        div.className = `word-item ${word.status}`;
        
        const retention = forgettingCurve.getMemoryRetention(word);
        const nextReview = new Date(word.nextReview).toLocaleDateString();
        
        // 추가 정보가 있는 경우 표시
        const pronunciation = word.pronunciation ? `<div class="word-pronunciation">${word.pronunciation}</div>` : '';
        const partOfSpeech = word.partOfSpeech ? `<span class="word-pos">${word.partOfSpeech}</span>` : '';
        const example = word.example ? `<div class="word-example">"${word.example}"</div>` : '';
        const synonyms = word.synonyms && word.synonyms.length > 0 ? 
            `<div class="word-synonyms"><strong>유의어:</strong> ${word.synonyms.slice(0, 3).join(', ')}</div>` : '';
        
        div.innerHTML = `
            <div class="word-header">
                <div class="word-title-section">
                    <div class="word-title">${word.word} ${partOfSpeech}</div>
                    ${pronunciation}
                </div>
                <div class="word-status ${word.status}">${this.getStatusText(word.status)}</div>
            </div>
            <div class="word-meaning">${word.meaning}</div>
            ${example}
            ${synonyms}
            <div class="word-progress">
                <span>기억률: ${Math.round(retention)}%</span>
                <span>다음 복습: ${nextReview}</span>
                <span>정답률: ${this.getAccuracyRate(word)}%</span>
            </div>
        `;
        
        return div;
    }

    getAccuracyRate(word) {
        const total = (word.correctCount || 0) + (word.incorrectCount || 0);
        if (total === 0) return 0;
        return Math.round(((word.correctCount || 0) / total) * 100);
    }

    getStatusText(status) {
        const statusMap = {
            'new': '새로운',
            'learning': '학습중',
            'mastered': '마스터'
        };
        return statusMap[status] || status;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.loadWords();
    }

    async addSampleWords() {
        try {
            // JSON 파일에서 데이터 로드
            const response = await fetch('data/sample-data.json');
            const data = await response.json();
            const sampleWords = data.greWords;

            console.log(`Loading ${sampleWords.length} words from JSON file...`);

            for (const wordData of sampleWords) {
                try {
                    // JSON 데이터 구조에 맞게 변환
                    const formattedWord = {
                        id: wordData.id,
                        word: wordData.word,
                        meaning: wordData.meaning,
                        pronunciation: wordData.pronunciation,
                        partOfSpeech: wordData.partOfSpeech,
                        etymology: wordData.etymology,
                        synonyms: wordData.synonyms,
                        antonyms: wordData.antonyms,
                        example: wordData.example
                    };
                    
                    await db.addWord(formattedWord);
                } catch (error) {
                    // 이미 존재하는 단어는 무시
                    console.log(`Word ${wordData.word} already exists`);
                }
            }
            
            console.log('All words loaded successfully!');
            this.loadWords();
            
            // Refresh dashboard to show updated counts
            if (typeof dashboard !== 'undefined') {
                setTimeout(() => {
                    dashboard.refresh();
                }, 500);
            }
            
        } catch (error) {
            console.error('Error loading words from JSON:', error);
            // JSON 로딩 실패 시 기본 단어들 사용
            await this.addFallbackWords();
        }
    }

    async addFallbackWords() {
        console.log('Using fallback words...');
        const fallbackWords = [
            { word: "abate", meaning: "줄어들다, 완화되다" },
            { word: "aberrant", meaning: "일탈한, 정상에서 벗어난" },
            { word: "abeyance", meaning: "정지, 중단" },
            { word: "abscond", meaning: "도망치다, 잠적하다" },
            { word: "abstemious", meaning: "절제하는, 금욕적인" }
        ];

        for (const wordData of fallbackWords) {
            try {
                await db.addWord(wordData);
            } catch (error) {
                console.log(`Word ${wordData.word} already exists`);
            }
        }
        
        this.loadWords();
    }
}

// Global vocabulary manager
const vocabularyManager = new VocabularyManager();

// Initialize vocabulary page
function initVocabularyPage() {
    // Set up filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            vocabularyManager.setFilter(filter);
        });
    });
    
    vocabularyManager.loadWords();
}