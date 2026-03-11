# 🎯 PokerNow GTO Wizard HUD v2.0

**GTO Wizard 기반 프리플랍 전용 HUD** - 100BB, 9-Max

## ✨ 새로운 접근법

### 문제 해결
- ✅ **카드 중복 인식 해결**: `.flipped` 클래스만 사용
- ✅ **PokerNow 전용 선택자**: 정확한 DOM 구조
- ✅ **프리플랍 집중**: 간단하고 정확하게
- ✅ **GTO Wizard 데이터**: 실제 100BB 9-Max 레인지

## 📦 설치

1. **파일 다운로드**
   ```
   /app/pokernow-gto-wizard.zip
   ```

2. **압축 해제**

3. **Chrome 로드**
   - `chrome://extensions/`
   - "개발자 모드" ON
   - "압축해제된 확장 프로그램을 로드합니다"
   - `chrome-extension-v2` 폴더 선택

## 🎮 사용법

1. pokernow.club 접속
2. 게임 시작
3. 우측 상단에 HUD 자동 표시

## 📊 표시 정보

- **내 카드**: 7♥ 7♣
- **포지션**: UTG, MP, CO, BTN, SB
- **FOLD %**: 폴드 퍼센트
- **CALL %**: 콜 퍼센트  
- **RAISE %**: 레이즈 퍼센트
- **상황**: 오픈 상황 / 3bet 상황

## 🎯 GTO 레인지

### RFI (Raise First In)
- **UTG**: 12% (타이트)
- **MP**: 20% (미디움)
- **CO**: 28% (와이드)
- **BTN**: 45% (매우 와이드)
- **SB**: 48% (vs BB)

### 3bet vs RFI
- 포지션별 디펜스 레인지
- 프리미엄 핸드 → Raise 100%
- 미디엄 핸드 → Mixed (Raise/Call)
- 약한 핸드 → Fold 100%

## 🔧 파일 구조

```
chrome-extension-v2/
├── manifest.json      # 익스텐션 설정
├── gto-data.js        # GTO Wizard 데이터
├── content.js         # 메인 로직 (간결함)
└── styles.css         # HUD 디자인
```

## 📝 코드 하이라이트

### 카드 스크래핑 (중복 방지)
```javascript
const flippedCards = document.querySelectorAll('.card-container.flipped');
const seen = new Set();
// 중복 방지 로직
if (!seen.has(card)) {
  seen.add(card);
  cards.push(card);
}
```

### 포지션 감지 (9-Max)
```javascript
const relativePos = (myIndex - dealerIndex + players.length) % players.length;
const posMap = {
  0: 'BTN', 1: 'SB', 2: 'BB',
  3: 'UTG', 4: 'MP', 5: 'MP',
  6: 'MP', 7: 'CO', 8: 'CO'
};
```

### GTO 액션
```javascript
const hand = GTOData.normalizeHand(card1, card2);
const action = GTOData.getAction(hand, position, facing3bet);
// { raise: 100, call: 0, fold: 0 }
```

## 🎨 UI 미리보기

```
┌──────────────────────────┐
│     GTO WIZARD          │ ← 그린 헤더
├──────────────────────────┤
│ 내 카드:  7♥ 7♣          │
│ 포지션:   CO             │
│                          │
│ ┌─────┬─────┬─────┐     │
│ │FOLD │CALL │RAISE│     │
│ │ 0%  │ 30% │ 70% │←하이라이트│
│ └─────┴─────┴─────┘     │
│                          │
│ [오픈 상황]              │
└──────────────────────────┘
```

## ⚡ 성능

- **업데이트 주기**: 1초
- **파일 크기**: ~20KB
- **의존성**: 0개
- **CPU 사용**: 최소

## 🐛 디버깅

F12 → Console:
```
[GTO] GTO Wizard HUD 초기화...
[GTO] HUD 활성화 완료
```

## 📈 v1 vs v2

| 항목 | v1 | v2 |
|------|----|----|
| 파일 수 | 8개 | 4개 |
| 코드 라인 | ~1500줄 | ~400줄 |
| 카드 인식 | ❌ 중복 | ✅ 정확 |
| 포지션 | ❌ 실패 | ✅ 작동 |
| 포스트플랍 | ⚠️ 복잡 | ⛔ 제거 |
| 승률 계산 | ⚠️ 느림 | ⛔ 제거 |

## 🎯 핵심 원칙

1. **간단함**: 프리플랍만 = 정확함
2. **전용**: PokerNow 전용 선택자
3. **실용**: GTO Wizard 실제 데이터
4. **깔끔함**: 400줄로 모든 기능

## 🔮 향후 개선

- [ ] 4bet 상황 감지
- [ ] 포지션별 색상 코드
- [ ] 핸드 히스토리 기록
- [ ] 설정 UI

---

**v2.0.0** - 완전히 새로 작성  
**목표**: 작동하는 최소 기능 제품  
**결과**: ✅ 성공
