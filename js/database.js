// Database module for GRE Mind
class Database {
    constructor() {
        this.dbName = 'greMindDB';
        this.version = 1;
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Words store
                if (!db.objectStoreNames.contains('words')) {
                    const wordsStore = db.createObjectStore('words', { keyPath: 'id' });
                    wordsStore.createIndex('status', 'status', { unique: false });
                    wordsStore.createIndex('nextReview', 'nextReview', { unique: false });
                }
                
                // Study sessions store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                    sessionsStore.createIndex('date', 'date', { unique: false });
                }
                
                // User stats store
                if (!db.objectStoreNames.contains('stats')) {
                    db.createObjectStore('stats', { keyPath: 'id' });
                }
            };
        });
    }

    async addWord(word) {
        const transaction = this.db.transaction(['words'], 'readwrite');
        const store = transaction.objectStore('words');
        
        const wordData = {
            id: word.id || Date.now().toString(),
            word: word.word,
            meaning: word.meaning,
            status: 'new',
            level: 0,
            nextReview: new Date(),
            correctCount: 0,
            incorrectCount: 0,
            lastStudied: new Date(),
            createdAt: new Date()
        };
        
        return store.add(wordData);
    }

    async getWords(filter = 'all') {
        const transaction = this.db.transaction(['words'], 'readonly');
        const store = transaction.objectStore('words');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                let words = request.result;
                if (filter !== 'all') {
                    words = words.filter(word => word.status === filter);
                }
                resolve(words);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateWord(wordId, updates) {
        const transaction = this.db.transaction(['words'], 'readwrite');
        const store = transaction.objectStore('words');
        
        return new Promise((resolve, reject) => {
            const getRequest = store.get(wordId);
            getRequest.onsuccess = () => {
                const word = getRequest.result;
                if (word) {
                    Object.assign(word, updates);
                    const updateRequest = store.put(word);
                    updateRequest.onsuccess = () => resolve(word);
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    reject(new Error('Word not found'));
                }
            };
        });
    }

    async getWordsForReview() {
        const now = new Date();
        const transaction = this.db.transaction(['words'], 'readonly');
        const store = transaction.objectStore('words');
        
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const words = request.result.filter(word => 
                    word.status !== 'new' && new Date(word.nextReview) <= now
                );
                resolve(words);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveStats(stats) {
        const transaction = this.db.transaction(['stats'], 'readwrite');
        const store = transaction.objectStore('stats');
        return store.put({ id: 'userStats', ...stats });
    }

    async getStats() {
        const transaction = this.db.transaction(['stats'], 'readonly');
        const store = transaction.objectStore('stats');
        
        return new Promise((resolve, reject) => {
            const request = store.get('userStats');
            request.onsuccess = () => {
                resolve(request.result || {
                    streak: 1,
                    totalStudied: 0,
                    masteredWords: 0,
                    accuracyRate: 0,
                    studyTime: 0
                });
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Global database instance
const db = new Database();