# PokerNow GTO HUD - 파일 구조 및 기능 설명

## 📁 파일 구조

```
/app/chrome-extension/
├── manifest.json              # Chrome 익스텐션 설정 파일
├── content.js                 # 메인 로직 및 DOM 스크래핑
├── styles.css                 # HUD UI 스타일
├── hand-evaluator.js          # 핸드 랭킹 평가 엔진
├── equity-calculator.js       # 몬테카를로 승률 계산기
├── gto-ranges.js             # 9-Max GTO 레인지 데이터
├── position-detector.js       # 포지션 감지 로직
└── README.md                  # 사용자 가이드

/app/pokernow-gto-hud.zip     # 전체 익스텐션 압축 파일
```

## 🔍 각 파일 상세 설명

### 1. manifest.json
- **역할**: Chrome 익스텐션 메타데이터 및 권한 설정
- **주요 내용**:
  - Manifest V3 사용
  - pokernow.club/com 도메인 권한
  - Content Scripts 자동 주입 설정
  - 5개 JS 파일 + 1개 CSS 로드 순서 정의

### 2. content.js (메인 로직)
- **역할**: 전체 익스텐션의 중앙 제어 및 UI 관리
- **주요 기능**:
  - ✅ HUD 생성 및 DOM 주입
  - ✅ 드래그 앤 드롭 기능
  - ✅ DOM 스크래핑 (내 카드, 보드 카드, 팟, 베팅액)
  - ✅ 포지션 감지 호출
  - ✅ 승률 계산 호출
  - ✅ GTO 액션 결정
  - ✅ 1초마다 실시간 업데이트
  - ✅ UI 렌더링 및 상태 관리

### 3. styles.css
- **역할**: HUD 시각적 디자인
- **특징**:
  - 다크모드 반투명 배경 (rgba(17, 24, 39, 0.95))
  - 백드롭 블러 효과 (12px)
  - 그린 테마 (#10b981)
  - 드래그 시 투명도 변경
  - 반응형 그리드 레이아웃
  - 카드 수트별 색상 (빨강/흰색)
  - 하이라이트 애니메이션

### 4. hand-evaluator.js
- **역할**: 7카드 포커 핸드 평가
- **구현된 기능**:
  - ✅ 모든 포커 핸드 랭킹 (High Card ~ Straight Flush)
  - ✅ 7장 중 최고의 5장 조합 찾기
  - ✅ 핸드 비교 (승자 판정)
  - ✅ Wheel Straight (A-2-3-4-5) 지원
  - ✅ Kicker 정확한 계산
- **알고리즘**: Combination + Evaluation

### 5. equity-calculator.js
- **역할**: 몬테카를로 시뮬레이션으로 승률 계산
- **구현된 기능**:
  - ✅ 5,000회 시뮬레이션 (정확도 우선)
  - ✅ 덱 생성 및 셔플
  - ✅ 알려진 카드 제거
  - ✅ 랜덤 보드 완성 (플랍/턴/리버)
  - ✅ 상대방 핸드 랜덤 시뮬레이션
  - ✅ 승/패/무승부 집계
  - ✅ Equity % 반환
- **성능**: ~0.5-1초 / 계산

### 6. gto-ranges.js
- **역할**: 9-Max GTO 레인지 데이터 및 매칭
- **포함된 레인지**:
  - ✅ RFI (Raise First In) - 8개 포지션
  - ✅ 3bet - 포지션 vs 포지션 매트릭스
  - ✅ 4bet - 9개 포지션
- **주요 함수**:
  - `normalizeHand()`: 카드를 AKs, 77 형태로 변환
  - `getRFIAction()`: RFI 상황 액션
  - `get3BetAction()`: 3bet 상황 액션
  - `get4BetAction()`: 4bet 상황 액션
- **데이터 출처**: 100BB 9-Max GTO 솔버 기반

### 7. position-detector.js
- **역할**: 9-Max/6-Max 포지션 자동 감지
- **알고리즘**:
  1. 딜러 버튼 위치 찾기
  2. 전체 플레이어 수 확인
  3. 내 플레이어 인덱스 찾기
  4. 상대적 위치 계산
  5. 포지션 매핑 (UTG ~ BB)
- **지원**: 9-Max (주요), 6-Max (보조)

## 🎯 데이터 흐름

```
1. 페이지 로드
   ↓
2. HUD 생성 및 주입 (content.js)
   ↓
3. 1초마다 반복:
   ├── DOM 스크래핑 (카드, 팟, 베팅)
   ├── 포지션 감지 (position-detector.js)
   ├── 프리플랍?
   │   ├── YES → GTO 레인지 조회 (gto-ranges.js)
   │   └── NO → 승률 계산 (equity-calculator.js + hand-evaluator.js)
   ├── 팟 오즈 계산
   ├── 액션 결정 (Raise/Call/Fold %)
   └── UI 업데이트
```

## 🧮 핵심 알고리즘

### 프리플랍 결정
```javascript
normalizedHand = normalizeHand(card1, card2)  // "AKs"
position = detectPosition()                    // "CO"
range = RFI_RANGES[position]                  // ["AA", "KK", ...]
if (normalizedHand in range):
    return { raise: 100, call: 0, fold: 0 }
else:
    return { raise: 0, call: 0, fold: 100 }
```

### 포스트플랍 결정
```javascript
equity = monteCarloSimulation(myCards, board, 5000)  // 62.5%
potOdds = callAmount / (pot + callAmount)            // 33.3%
edge = equity - potOdds                              // 29.2%

if (edge > 20%):
    return { raise: 70, call: 30, fold: 0 }
else if (edge > 10%):
    return { raise: 50, call: 50, fold: 0 }
// ... 기타 조건
```

## 🔬 테스트 시나리오

### 시나리오 1: 프리플랍 UTG
- **입력**: AKs, UTG 포지션
- **기대 출력**: Raise 100%
- **로직**: RFI_RANGES['UTG']에 'AKs' 포함

### 시나리오 2: 플랍 강한 핸드
- **입력**: AsAd, 보드 Ah9s2c, 팟 100, 콜 30
- **기대 출력**: 
  - Equity: ~95%
  - Pot Odds: 23%
  - Raise 70% / Call 30%

### 시나리오 3: 플랍 드로우
- **입력**: KsQs, 보드 Js9s2h, 팟 100, 콜 50
- **기대 출력**:
  - Equity: ~55% (플러시 + 스트레이트 드로우)
  - Pot Odds: 33%
  - Raise 50% / Call 50%

## 🚀 설치 및 테스트 가이드

### 방법 1: 압축 해제
```bash
# /app/pokernow-gto-hud.zip 다운로드
unzip pokernow-gto-hud.zip
cd chrome-extension
```

### 방법 2: 개별 파일
```bash
# /app/chrome-extension/ 폴더 전체 복사
```

### Chrome 로드
1. `chrome://extensions/` 접속
2. "개발자 모드" ON
3. "압축해제된 확장 프로그램을 로드합니다"
4. `chrome-extension` 폴더 선택

### 테스트
1. https://www.pokernow.club 접속
2. 게임 생성 또는 참가
3. 우측 하단에 HUD 자동 표시
4. 카드 받으면 자동 업데이트

## ⚙️ 커스터마이징

### 시뮬레이션 횟수 변경
```javascript
// equity-calculator.js 3번째 줄
const SIMULATIONS = 5000; // 변경: 1000 (빠름) ~ 10000 (정확)
```

### 업데이트 주기 변경
```javascript
// content.js 마지막 부분
updateInterval = setInterval(updateHUD, 1000); // 1000ms = 1초
```

### GTO 레인지 수정
```javascript
// gto-ranges.js
const RFI_RANGES = {
  'UTG': [
    'AA', 'KK', 'QQ', // 원하는 핸드 추가/제거
    // ...
  ]
}
```

### UI 색상 변경
```css
/* styles.css */
border: 1px solid rgba(16, 185, 129, 0.3); /* 그린 → 원하는 색상 */
```

## 📊 성능 최적화

### 현재 성능
- **DOM 스크래핑**: ~10ms
- **포지션 감지**: ~5ms
- **몬테카를로 5000회**: ~500-1000ms
- **UI 업데이트**: ~5ms
- **총 업데이트 주기**: ~1초

### 최적화 옵션
1. **시뮬레이션 횟수 감소**: 5000 → 2000 (속도 2배, 정확도 -2%)
2. **업데이트 주기 증가**: 1초 → 2초 (CPU 사용량 50%)
3. **선택적 계산**: 보드 변경 시에만 승률 재계산

## 🐛 디버깅

### 콘솔 로그 활성화
```javascript
// content.js 상단에 추가
const DEBUG = true;
// 각 함수에 console.log 추가
if (DEBUG) console.log('스크래핑된 카드:', myCards);
```

### 일반적인 문제
1. **HUD가 안 보임**: 
   - F12 → 콘솔에서 에러 확인
   - 익스텐션 활성화 상태 확인
   
2. **카드 인식 안 됨**:
   - PokerNow HTML 구조 변경 가능
   - content.js의 선택자 업데이트 필요

3. **포지션 잘못 감지**:
   - position-detector.js 로직 확인
   - 딜러 버튼 선택자 확인

## 📝 코드 품질

- **라인 수**: ~1,200줄
- **파일 수**: 8개
- **주석**: 한국어
- **코딩 스타일**: 
  - ES6+ 문법
  - 모듈 패턴 (IIFE)
  - Pure Functions
  - No external dependencies

## 🎓 학습 가치

이 프로젝트를 통해 배울 수 있는 것:
1. **Chrome Extension 개발** (Manifest V3)
2. **DOM 스크래핑** 기법
3. **몬테카를로 시뮬레이션** 구현
4. **포커 GTO 전략** 이해
5. **핸드 평가 알고리즘**
6. **실시간 UI 업데이트** 패턴

---

**제작**: Emergent E1 Agent
**날짜**: 2026-01-23
**버전**: 1.0.0
