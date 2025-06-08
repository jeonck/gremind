# GRE Mind - 스마트 망각곡선 학습 앱

에빙하우스의 망각곡선 이론을 적용한 GRE 단어 학습 웹 애플리케이션입니다.

## 🚀 주요 기능

### 📊 스마트 대시보드
- 오늘의 학습 현황 한눈에 확인
- 새로운 단어, 복습할 단어, 취약점 단어 카운트
- 학습 진행률 및 연속 학습일 표시

### 🧠 망각곡선 기반 복습 시스템
- 에빙하우스 망각곡선에 따른 최적 복습 주기 자동 계산
- 10분 → 1시간 → 1일 → 3일 → 7일 → 15일 → 30일 간격
- 정답률에 따른 동적 주기 조정

### 📚 단어 학습 관리
- 단어 상태별 필터링 (새로운/학습중/마스터)
- 개별 단어의 기억률 및 다음 복습일 표시
- 20개의 핵심 GRE 단어 샘플 제공

### 🎯 인터랙티브 퀴즈
- 복습 퀴즈, 새 단어 퀴즈, 취약점 퀴즈
- 30초 타이머 및 실시간 피드백
- 정답률 기반 통계 업데이트

### 📈 학습 통계 및 분석
- 전체 정답률, 학습한 단어 수, 마스터한 단어 수
- 망각곡선 시각화 차트
- 학습 시간 추적

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: IndexedDB (브라우저 내장)
- **Storage**: JSON 데이터 파일
- **Architecture**: 모듈화된 JavaScript 클래스

## 📁 프로젝트 구조

```
gre-mind/
├── index.html              # 메인 HTML 파일
├── css/
│   ├── main.css            # 기본 스타일
│   ├── dashboard.css       # 대시보드 스타일
│   └── study.css          # 학습/퀴즈 스타일
├── js/
│   ├── app.js             # 메인 애플리케이션
│   ├── database.js        # IndexedDB 관리
│   ├── forgetting-curve.js # 망각곡선 알고리즘
│   ├── quiz.js            # 퀴즈 기능
│   ├── vocabulary.js      # 단어 관리
│   ├── dashboard.js       # 대시보드 관리
│   └── navigation.js      # 페이지 네비게이션
├── data/
│   └── sample-data.json   # 샘플 데이터
└── README.md
```

## 🚀 설치 및 실행

1. 프로젝트 클론 또는 다운로드
```bash
git clone [repository-url]
cd gre-mind
```

2. 웹 서버 실행 (Live Server 권장)
```bash
# VS Code Live Server 익스텐션 사용 또는
python -m http.server 8000
# 또는
npx serve .
```

3. 브라우저에서 접속
```
http://localhost:8000
```

## 💡 사용법

### 첫 실행
1. 앱이 자동으로 20개의 샘플 GRE 단어를 로드합니다
2. 대시보드에서 학습 상태를 확인할 수 있습니다

### 학습 시작
1. **새로운 단어**: 아직 학습하지 않은 단어들을 학습
2. **스마트 복습**: 망각곡선에 따라 복습이 필요한 단어들
3. **취약점 극복**: 자주 틀리는 단어들을 집중 연습

### 퀴즈 진행
1. 각 문제는 30초 제한시간이 있습니다
2. 정답/오답에 따라 다음 복습 주기가 자동 조정됩니다
3. 키보드 단축키 지원 (1,2,3,4로 선택, Enter로 제출)

## 📱 반응형 디자인

- 모바일, 태블릿, 데스크톱 모든 기기에서 최적화
- 터치 인터페이스 지원
- 직관적인 UI/UX

## 🔧 커스터마이징

### 새로운 단어 추가
`js/vocabulary.js`의 `sampleWords` 배열에 단어를 추가하거나, 앱 내에서 동적으로 추가 가능

### 망각곡선 주기 조정
`js/forgetting-curve.js`의 `intervals` 배열을 수정하여 복습 주기 변경 가능

### 디자인 변경
CSS 파일들을 수정하여 테마나 색상 변경 가능

## 🧩 핵심 알고리즘

### 망각곡선 계산
```javascript
// 정답 시: 다음 레벨로 이동
level = Math.min(level + 1, maxLevel);

// 오답 시: 이전 레벨로 이동
level = Math.max(0, level - 1);

// 다음 복습 시간 계산
nextReview = now + intervals[level];
```

### 우선순위 계산
```javascript
priority = overdue * 2 + (100 - retention) + errorRate * 50;
```

## 🔮 향후 개발 계획

- [ ] AI 기반 개인 맞춤 학습 경로
- [ ] 클라우드 동기화 기능
- [ ] 소셜 학습 기능 (친구와 경쟁)
- [ ] 더 많은 GRE 섹션 지원 (Reading, Math)
- [ ] 오프라인 모드 지원
- [ ] 음성 인식 발음 연습

## 📄 라이선스

MIT License

## 🤝 기여하기

1. 이 리포지토리를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 이슈를 생성해 주세요.

---

**GRE Mind**로 효과적이고 과학적인 단어 학습을 시작해보세요! 🎓# gremind
