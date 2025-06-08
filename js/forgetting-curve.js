// Forgetting Curve Algorithm
class ForgettingCurve {
    constructor() {
        // Ebbinghaus forgetting curve intervals (in hours)
        this.intervals = [
            0.17, // 10 minutes
            1,    // 1 hour
            24,   // 1 day
            72,   // 3 days
            168,  // 7 days
            360,  // 15 days
            720   // 30 days
        ];
    }

    calculateNextReview(wordData, isCorrect) {
        let level = wordData.level || 0;
        
        if (isCorrect) {
            // Move to next level if correct
            level = Math.min(level + 1, this.intervals.length - 1);
            
            // Update word status
            if (level >= 3) {
                wordData.status = 'mastered';
            } else if (level >= 1) {
                wordData.status = 'learning';
            }
            
            wordData.correctCount = (wordData.correctCount || 0) + 1;
        } else {
            // Reset to earlier level if incorrect
            level = Math.max(0, level - 1);
            wordData.status = level === 0 ? 'new' : 'learning';
            wordData.incorrectCount = (wordData.incorrectCount || 0) + 1;
        }
        
        // Calculate next review time
        const hoursToAdd = this.intervals[level];
        const nextReview = new Date();
        nextReview.setHours(nextReview.getHours() + hoursToAdd);
        
        return {
            level: level,
            nextReview: nextReview,
            status: wordData.status,
            correctCount: wordData.correctCount,
            incorrectCount: wordData.incorrectCount,
            lastStudied: new Date()
        };
    }

    getMemoryRetention(wordData) {
        const now = new Date();
        const lastStudied = new Date(wordData.lastStudied);
        const hoursSinceStudy = (now - lastStudied) / (1000 * 60 * 60);
        
        // Simplified retention calculation
        const level = wordData.level || 0;
        const baseRetention = 100 - (hoursSinceStudy / this.intervals[level]) * 50;
        
        return Math.max(0, Math.min(100, baseRetention));
    }

    getPriorityWords(words, limit = 10) {
        const now = new Date();
        
        return words
            .filter(word => word.status !== 'new')
            .map(word => ({
                ...word,
                priority: this.calculatePriority(word, now)
            }))
            .sort((a, b) => b.priority - a.priority)
            .slice(0, limit);
    }

    calculatePriority(word, now) {
        const nextReview = new Date(word.nextReview);
        const overdue = Math.max(0, (now - nextReview) / (1000 * 60 * 60)); // hours overdue
        const retention = this.getMemoryRetention(word);
        const errorRate = word.incorrectCount / Math.max(1, word.correctCount + word.incorrectCount);
        
        // Higher priority for overdue, low retention, high error rate
        return overdue * 2 + (100 - retention) + errorRate * 50;
    }
}

// Global forgetting curve instance
const forgettingCurve = new ForgettingCurve();