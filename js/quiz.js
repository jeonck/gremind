// Quiz Module
class Quiz {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.timeLeft = 30;
        this.timer = null;
        this.isAnswered = false;
    }

    async startQuiz(type = 'review', count = 10) {
        let words = [];
        
        if (type === 'review') {
            words = await db.getWordsForReview();
            words = forgettingCurve.getPriorityWords(words, count);
        } else if (type === 'new') {
            words = await db.getWords('new');
            words = words.slice(0, count);
        } else if (type === 'weak') {
            const allWords = await db.getWords();
            words = allWords
                .filter(word => word.incorrectCount > word.correctCount)
                .slice(0, count);
        }

        if (words.length === 0) {
            this.showNoWordsMessage(type);
            return;
        }

        const questions = await this.generateQuestions(words);
        
        this.currentQuiz = {
            words: words,
            type: type,
            questions: questions
        };
        
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.showQuizPage();
        this.displayQuestion();
    }

    async generateQuestions(words) {
        const questions = [];
        
        for (const word of words) {
            const correctAnswer = word.meaning;
            const wrongAnswers = await this.getRandomMeanings(word.id, 3);
            
            const options = [correctAnswer, ...wrongAnswers]
                .sort(() => Math.random() - 0.5);
            
            questions.push({
                word: word,
                question: word.word,
                options: options,
                correctAnswer: correctAnswer
            });
        }
        
        return questions;
    }

    async getRandomMeanings(excludeId, count) {
        try {
            // 다른 단어들의 의미를 가져와서 오답 선택지로 사용
            const allWords = await db.getWords();
            const otherWords = allWords.filter(word => word.id !== excludeId);
            
            if (otherWords.length >= count) {
                return otherWords
                    .sort(() => Math.random() - 0.5)
                    .slice(0, count)
                    .map(word => word.meaning);
            }
        } catch (error) {
            console.log('Error getting random meanings from database:', error);
        }
        
        // 폴백: 기본 의미들
        const fallbackMeanings = [
            "기쁘다, 즐겁다", "슬프다, 우울하다", "화나다, 분노하다",
            "놀라다, 깜짝하다", "무서워하다, 두려워하다", "사랑하다, 좋아하다",
            "싫어하다, 혐오하다", "존경하다, 경외하다", "경멸하다, 멸시하다",
            "동정하다, 연민하다", "질투하다, 시기하다", "부러워하다, 선망하다",
            "높다, 우수하다", "낮다, 열등하다", "밝다, 반짝이다",
            "어둡다, 침울하다", "빠르다, 신속하다", "느리다, 느긋하다"
        ];
        
        return fallbackMeanings
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.currentQuiz.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        document.getElementById('quiz-current').textContent = this.currentQuestionIndex + 1;
        document.getElementById('quiz-total').textContent = this.currentQuiz.questions.length;
        document.getElementById('quiz-word').textContent = question.question;
        
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.onclick = () => this.selectOption(index, option);
            optionsContainer.appendChild(optionElement);
        });
        
        this.selectedAnswer = null;
        this.isAnswered = false;
        this.timeLeft = 30;
        this.startTimer();
        
        document.getElementById('quiz-submit').style.display = 'block';
        document.getElementById('quiz-next').style.display = 'none';
    }

    selectOption(index, answer) {
        if (this.isAnswered) return;
        
        const options = document.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected'));
        options[index].classList.add('selected');
        
        this.selectedAnswer = answer;
    }

    submitAnswer() {
        if (!this.selectedAnswer || this.isAnswered) return;
        
        this.isAnswered = true;
        this.stopTimer();
        
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correctAnswer;
        
        if (isCorrect) {
            this.score++;
        }
        
        // Update forgetting curve
        const updates = forgettingCurve.calculateNextReview(question.word, isCorrect);
        db.updateWord(question.word.id, updates);
        
        // Show correct/incorrect feedback
        const options = document.querySelectorAll('.option');
        options.forEach(opt => {
            if (opt.textContent === question.correctAnswer) {
                opt.classList.add('correct');
            } else if (opt.classList.contains('selected') && !isCorrect) {
                opt.classList.add('wrong');
            }
        });
        
        document.getElementById('quiz-submit').style.display = 'none';
        document.getElementById('quiz-next').style.display = 'block';
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.displayQuestion();
    }

    startTimer() {
        this.stopTimer();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('quiz-timer').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.submitAnswer();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    endQuiz() {
        this.stopTimer();
        
        const accuracy = Math.round((this.score / this.currentQuiz.questions.length) * 100);
        
        alert(`퀴즈 완료!\n점수: ${this.score}/${this.currentQuiz.questions.length}\n정답률: ${accuracy}%`);
        
        // Update stats
        this.updateStats(accuracy);
        
        // Return to dashboard
        showPage('dashboard');
        updateDashboard();
    }

    async updateStats(accuracy) {
        const stats = await db.getStats();
        stats.totalStudied = (stats.totalStudied || 0) + this.currentQuiz.questions.length;
        stats.accuracyRate = accuracy;
        
        await db.saveStats(stats);
    }

    showQuizPage() {
        showPage('quiz');
    }

    showNoWordsMessage(type) {
        let message = '';
        if (type === 'review') {
            message = '복습할 단어가 없습니다!';
        } else if (type === 'new') {
            message = '새로 학습할 단어가 없습니다!';
        } else if (type === 'weak') {
            message = '취약점으로 분류된 단어가 없습니다!';
        }
        
        alert(message);
    }
}

// Global quiz instance
const quiz = new Quiz();

// Quiz control functions
function submitAnswer() {
    quiz.submitAnswer();
}

function nextQuestion() {
    quiz.nextQuestion();
}