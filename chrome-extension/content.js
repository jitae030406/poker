// PokerNow GTO HUD - 메인 컨텐츠 스크립트

(function() {
  'use strict';

  // HUD 상태
  let hudElement = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let updateInterval = null;

  // 게임 상태
  let gameState = {
    myCards: [],
    boardCards: [],
    position: null,
    potSize: 0,
    callAmount: 0,
    potOdds: 0,
    equity: 0,
    gtoAction: { raise: 0, call: 0, fold: 0 },
    lastUpdate: 0
  };

  // HUD 생성
  function createHUD() {
    if (hudElement) return;

    hudElement = document.createElement('div');
    hudElement.id = 'pokernow-gto-hud';
    hudElement.innerHTML = `
      <div class="hud-header">
        <div class="hud-title">
          <div class="hud-status"></div>
          GTO HUD
        </div>
      </div>
      <div class="hud-body">
        <div class="hud-section">
          <div class="hud-label">내 카드</div>
          <div class="hud-value">
            <div class="card-display" id="hud-my-cards">
              <span class="card">?</span>
              <span class="card">?</span>
            </div>
          </div>
        </div>
        
        <div class="hud-section">
          <div class="hud-label">포지션</div>
          <div class="hud-value">
            <span class="position-badge" id="hud-position">-</span>
          </div>
        </div>

        <div class="hud-section" id="board-section" style="display: none;">
          <div class="hud-label">보드</div>
          <div class="board-cards" id="hud-board-cards"></div>
        </div>
        
        <div class="hud-section">
          <div class="hud-label">GTO 액션 추천</div>
          <div class="action-grid" id="hud-actions">
            <div class="action-item">
              <div class="action-type">Fold</div>
              <div class="action-percent">0%</div>
            </div>
            <div class="action-item">
              <div class="action-type">Call</div>
              <div class="action-percent">0%</div>
            </div>
            <div class="action-item">
              <div class="action-type">Raise</div>
              <div class="action-percent">0%</div>
            </div>
          </div>
        </div>
        
        <div class="hud-section">
          <div class="hud-label">팟 정보</div>
          <div class="stat-row">
            <span class="stat-label">팟 오즈</span>
            <span class="stat-value" id="hud-pot-odds">-%</span>
          </div>
          <div class="stat-row" id="equity-row" style="display: none;">
            <span class="stat-label">내 승률 (Equity)</span>
            <span class="stat-value" id="hud-equity">-%</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(hudElement);
    setupDragging();
  }

  // 드래그 기능
  function setupDragging() {
    const header = hudElement.querySelector('.hud-header');
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      hudElement.classList.add('dragging');
      const rect = hudElement.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      
      hudElement.style.left = `${x}px`;
      hudElement.style.top = `${y}px`;
      hudElement.style.right = 'auto';
      hudElement.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        hudElement.classList.remove('dragging');
      }
    });
  }

  // 카드 스크래핑
  function scrapeMyCards() {
    try {
      console.log('[GTO HUD] 카드 스크래핑 시도...');
      
      // 다양한 선택자 시도
      const selectors = [
        '.your-cards-container', 
        '.player-cards',
        '.your-hand',
        '[class*="your"]',
        '[class*="hand"]',
        '[class*="player-card"]'
      ];
      
      let playerArea = null;
      for (const selector of selectors) {
        playerArea = document.querySelector(selector);
        if (playerArea) {
          console.log('[GTO HUD] 플레이어 영역 찾음:', selector);
          break;
        }
      }
      
      // 전체 문서에서 카드 찾기 (백업)
      if (!playerArea) {
        console.log('[GTO HUD] 전체 문서에서 카드 검색');
        playerArea = document.body;
      }

      // 카드 요소 찾기
      const cardSelectors = '.card, [class*="card"], [class*="playing"]';
      const allCards = playerArea.querySelectorAll(cardSelectors);
      console.log('[GTO HUD] 찾은 카드 요소 수:', allCards.length);
      
      const cards = [];

      allCards.forEach((el, index) => {
        const cardText = el.textContent.trim();
        const innerHTML = el.innerHTML;
        
        console.log(`[GTO HUD] 카드 ${index}:`, cardText, el.className);
        
        // 텍스트에서 랭크 찾기 (2-9, T, J, Q, K, A)
        const rankMatch = cardText.match(/[2-9TJQKA]/);
        if (!rankMatch) return;
        
        const rank = rankMatch[0];
        let suit = '';
        
        // 수트 심볼 직접 찾기
        if (cardText.includes('♠') || innerHTML.includes('♠') || innerHTML.includes('&spades;')) {
          suit = 's';
        } else if (cardText.includes('♥') || innerHTML.includes('♥') || innerHTML.includes('&hearts;')) {
          suit = 'h';
        } else if (cardText.includes('♦') || innerHTML.includes('♦') || innerHTML.includes('&diams;')) {
          suit = 'd';
        } else if (cardText.includes('♣') || innerHTML.includes('♣') || innerHTML.includes('&clubs;')) {
          suit = 'c';
        }
        
        // CSS 클래스에서 수트 감지
        const classNames = el.className.toLowerCase();
        if (!suit) {
          if (classNames.includes('spade')) suit = 's';
          else if (classNames.includes('heart')) suit = 'h';
          else if (classNames.includes('diamond')) suit = 'd';
          else if (classNames.includes('club')) suit = 'c';
        }
        
        // 색상에서 수트 감지
        if (!suit) {
          const computedStyle = window.getComputedStyle(el);
          const color = computedStyle.color;
          if (color.includes('255, 0, 0') || color.includes('rgb(255, 0, 0)')) {
            // 빨간색 = 하트 또는 다이아
            suit = cardText.includes('♥') ? 'h' : 'd';
          }
        }
        
        if (rank && suit && cards.length < 2) {
          cards.push(rank + suit);
          console.log('[GTO HUD] 카드 인식 성공:', rank + suit);
        }
      });

      console.log('[GTO HUD] 최종 카드:', cards);
      return cards;
    } catch (error) {
      console.error('[GTO HUD] 카드 스크래핑 오류:', error);
      return [];
    }
  }

  // 보드 카드 스크래핑
  function scrapeBoardCards() {
    try {
      console.log('[GTO HUD] 보드 카드 스크래핑 시도...');
      
      const boardSelectors = [
        '.table-cards',
        '.community-cards',
        '.board-cards',
        '[class*="board"]',
        '[class*="community"]',
        '[class*="table-card"]'
      ];
      
      let boardArea = null;
      for (const selector of boardSelectors) {
        boardArea = document.querySelector(selector);
        if (boardArea) {
          console.log('[GTO HUD] 보드 영역 찾음:', selector);
          break;
        }
      }

      if (!boardArea) {
        console.log('[GTO HUD] 보드 카드 없음 (프리플랍)');
        return [];
      }

      const cardElements = boardArea.querySelectorAll('.card, [class*="card"]');
      const cards = [];

      cardElements.forEach(el => {
        const cardText = el.textContent.trim();
        const innerHTML = el.innerHTML;
        
        const rankMatch = cardText.match(/[2-9TJQKA]/);
        if (!rankMatch) return;
        
        const rank = rankMatch[0];
        let suit = '';
        
        if (cardText.includes('♠') || innerHTML.includes('♠') || innerHTML.includes('&spades;')) {
          suit = 's';
        } else if (cardText.includes('♥') || innerHTML.includes('♥') || innerHTML.includes('&hearts;')) {
          suit = 'h';
        } else if (cardText.includes('♦') || innerHTML.includes('♦') || innerHTML.includes('&diams;')) {
          suit = 'd';
        } else if (cardText.includes('♣') || innerHTML.includes('♣') || innerHTML.includes('&clubs;')) {
          suit = 'c';
        }
        
        if (rank && suit) {
          cards.push(rank + suit);
        }
      });

      console.log('[GTO HUD] 보드 카드:', cards);
      return cards.slice(0, 5);
    } catch (error) {
      console.error('[GTO HUD] 보드 카드 스크래핑 오류:', error);
      return [];
    }
  }

  // 포지션 감지
  function detectMyPosition() {
    try {
      console.log('[GTO HUD] 포지션 감지 시도...');
      
      // 딜러 버튼 찾기
      const dealerSelectors = [
        '.dealer-button',
        '.dealer-button-node',
        '[class*="dealer"]',
        '[class*="button-icon"]'
      ];
      
      let dealerButton = null;
      for (const selector of dealerSelectors) {
        dealerButton = document.querySelector(selector);
        if (dealerButton) {
          console.log('[GTO HUD] 딜러 버튼 찾음:', selector);
          break;
        }
      }
      
      if (!dealerButton) {
        console.log('[GTO HUD] 딜러 버튼 없음');
        return null;
      }

      // 전체 플레이어 찾기
      const playerSelectors = [
        '.player-seat',
        '.table-player',
        '.player-area',
        '[class*="player-seat"]',
        '[class*="seat"]'
      ];
      
      let allPlayers = null;
      for (const selector of playerSelectors) {
        const players = document.querySelectorAll(selector);
        if (players.length >= 2) {
          allPlayers = players;
          console.log('[GTO HUD] 플레이어 찾음:', selector, players.length + '명');
          break;
        }
      }

      if (!allPlayers || allPlayers.length < 2) {
        console.log('[GTO HUD] 플레이어 부족');
        return null;
      }

      const totalPlayers = allPlayers.length;

      // 내 위치와 딜러 버튼 위치 찾기
      let myIndex = -1;
      let dealerIndex = -1;

      allPlayers.forEach((player, index) => {
        // 내 플레이어 확인
        const className = player.className.toLowerCase();
        const textContent = player.textContent.toLowerCase();
        
        if (className.includes('you') || 
            className.includes('me') || 
            className.includes('your') ||
            textContent.includes('your turn')) {
          myIndex = index;
          console.log('[GTO HUD] 내 포지션 인덱스:', index);
        }
        
        // 딜러 버튼 확인
        if (player.contains(dealerButton) || 
            player.querySelector('.dealer-button, .dealer-button-node, [class*="dealer"]')) {
          dealerIndex = index;
          console.log('[GTO HUD] 딜러 인덱스:', index);
        }
      });

      if (myIndex === -1 || dealerIndex === -1) {
        console.log('[GTO HUD] 인덱스 찾기 실패 - my:', myIndex, 'dealer:', dealerIndex);
        return null;
      }

      // 포지션 계산
      const position = PositionDetector.detectPosition(dealerIndex, myIndex, totalPlayers);
      console.log('[GTO HUD] 포지션:', position);
      return position;
    } catch (error) {
      console.error('[GTO HUD] 포지션 감지 오류:', error);
      return null;
    }
  }

  // 팟 사이즈 계산
  function calculatePotSize() {
    try {
      console.log('[GTO HUD] 팟 계산 시도...');
      let totalPot = 0;

      // 메인 팟 찾기
      const potSelectors = [
        '.pot-amount',
        '.pot-value',
        '.pot-size',
        '[class*="pot"]'
      ];
      
      potSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent.replace(/[^0-9.]/g, '');
          const value = parseFloat(text);
          if (!isNaN(value) && value > 0) {
            totalPot += value;
            console.log('[GTO HUD] 팟 금액 추가:', value);
          }
        });
      });

      // 전체 문서에서 "total" 포함 텍스트 검색
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const text = el.textContent.trim();
        if (text.toLowerCase().includes('total') && text.length < 30) {
          const match = text.match(/\d+/);
          if (match) {
            const value = parseInt(match[0]);
            if (!isNaN(value) && value > totalPot) {
              totalPot = value;
              console.log('[GTO HUD] Total 팟 발견:', value);
            }
          }
        }
      });

      console.log('[GTO HUD] 최종 팟:', totalPot);
      return totalPot;
    } catch (error) {
      console.error('[GTO HUD] 팟 계산 오류:', error);
      return 0;
    }
  }

  // 콜 금액 계산
  function calculateCallAmount() {
    try {
      console.log('[GTO HUD] 콜 금액 계산 시도...');
      
      // CALL 버튼 찾기
      const callSelectors = [
        'button:contains("CALL")',
        '.action-call',
        '.button-call',
        '[class*="call"]',
        'button'
      ];
      
      let callAmount = 0;
      
      const allButtons = document.querySelectorAll('button, .action-button, [class*="action"]');
      allButtons.forEach(btn => {
        const text = btn.textContent.trim().toUpperCase();
        if (text.includes('CALL')) {
          const match = text.match(/\d+/);
          if (match) {
            callAmount = parseInt(match[0]);
            console.log('[GTO HUD] 콜 금액:', callAmount);
          }
        }
      });

      return callAmount;
    } catch (error) {
      console.error('[GTO HUD] 콜 금액 계산 오류:', error);
      return 0;
    }
  }

  // 팟 오즈 계산
  function calculatePotOdds(potSize, callAmount) {
    if (callAmount === 0) return 0;
    const totalPot = potSize + callAmount;
    return ((callAmount / totalPot) * 100).toFixed(1);
  }

  // GTO 액션 결정
  function determineGTOAction() {
    const { myCards, boardCards, position, equity, potOdds } = gameState;

    if (myCards.length !== 2 || !position) {
      return { raise: 0, call: 0, fold: 100 };
    }

    // 핸드 정규화
    const normalizedHand = GTORanges.normalizeHand(myCards[0], myCards[1]);

    // 프리플랍
    if (boardCards.length === 0) {
      // 간단한 RFI 시나리오
      return GTORanges.getRFIAction(position, normalizedHand);
    }

    // 포스트플랍 - 승률 기반 결정
    if (equity > 0) {
      const equityNum = parseFloat(equity);
      const potOddsNum = parseFloat(potOdds);

      // Positive EV 체크
      if (equityNum > potOddsNum) {
        const edge = equityNum - potOddsNum;
        
        // 큰 우위: 공격적 플레이
        if (edge > 20) {
          return { raise: 70, call: 30, fold: 0 };
        } else if (edge > 10) {
          return { raise: 50, call: 50, fold: 0 };
        } else if (edge > 5) {
          return { raise: 30, call: 70, fold: 0 };
        } else {
          return { raise: 10, call: 90, fold: 0 };
        }
      } else if (equityNum > potOddsNum * 0.7) {
        // MDF 고려 - 상대방이 너무 자주 블러프하게 만들지 않기
        return { raise: 0, call: 60, fold: 40 };
      } else {
        // Negative EV
        return { raise: 0, call: 0, fold: 100 };
      }
    }

    return { raise: 0, call: 0, fold: 100 };
  }

  // HUD 업데이트
  function updateHUD() {
    if (!hudElement) return;

    // 데이터 수집
    const myCards = scrapeMyCards();
    const boardCards = scrapeBoardCards();
    const position = detectMyPosition();
    const potSize = calculatePotSize();
    const callAmount = calculateCallAmount();
    const potOdds = calculatePotOdds(potSize, callAmount);

    // 상태 업데이트
    gameState.myCards = myCards;
    gameState.boardCards = boardCards;
    gameState.position = position;
    gameState.potSize = potSize;
    gameState.callAmount = callAmount;
    gameState.potOdds = potOdds;

    // 승률 계산 (보드 카드가 있을 때만)
    if (myCards.length === 2 && boardCards.length > 0) {
      const equityResult = EquityCalculator.calculateEquity(myCards, boardCards, 1);
      gameState.equity = equityResult.equity;
    } else {
      gameState.equity = 0;
    }

    // GTO 액션 결정
    gameState.gtoAction = determineGTOAction();

    // UI 업데이트
    updateMyCardsDisplay();
    updatePositionDisplay();
    updateBoardDisplay();
    updateActionsDisplay();
    updatePotDisplay();
  }

  // 내 카드 표시 업데이트
  function updateMyCardsDisplay() {
    const container = document.getElementById('hud-my-cards');
    if (!container) return;

    if (gameState.myCards.length === 2) {
      container.innerHTML = gameState.myCards.map(card => {
        const suit = card[1];
        let suitClass = '';
        let suitSymbol = '';
        
        if (suit === 'h') {
          suitClass = 'heart';
          suitSymbol = '♥';
        } else if (suit === 'd') {
          suitClass = 'diamond';
          suitSymbol = '♦';
        } else if (suit === 'c') {
          suitClass = 'club';
          suitSymbol = '♣';
        } else if (suit === 's') {
          suitClass = 'spade';
          suitSymbol = '♠';
        }
        
        return `<span class="card ${suitClass}">${card[0]}${suitSymbol}</span>`;
      }).join('');
    } else {
      container.innerHTML = '<span class="card">?</span><span class="card">?</span>';
    }
  }

  // 포지션 표시 업데이트
  function updatePositionDisplay() {
    const element = document.getElementById('hud-position');
    if (!element) return;

    element.textContent = gameState.position || '-';
  }

  // 보드 카드 표시 업데이트
  function updateBoardDisplay() {
    const section = document.getElementById('board-section');
    const container = document.getElementById('hud-board-cards');
    if (!section || !container) return;

    if (gameState.boardCards.length > 0) {
      section.style.display = 'block';
      container.innerHTML = gameState.boardCards.map(card => {
        const suit = card[1];
        let suitClass = '';
        let suitSymbol = '';
        
        if (suit === 'h') {
          suitClass = 'heart';
          suitSymbol = '♥';
        } else if (suit === 'd') {
          suitClass = 'diamond';
          suitSymbol = '♦';
        } else if (suit === 'c') {
          suitClass = 'club';
          suitSymbol = '♣';
        } else if (suit === 's') {
          suitClass = 'spade';
          suitSymbol = '♠';
        }
        
        return `<span class="card ${suitClass}">${card[0]}${suitSymbol}</span>`;
      }).join('');
    } else {
      section.style.display = 'none';
    }
  }

  // 액션 추천 표시 업데이트
  function updateActionsDisplay() {
    const container = document.getElementById('hud-actions');
    if (!container) return;

    const { fold, call, raise } = gameState.gtoAction;
    
    // 가장 높은 퍼센트 찾기
    const maxPercent = Math.max(fold, call, raise);
    
    container.innerHTML = `
      <div class="action-item ${fold === maxPercent && fold > 0 ? 'primary' : ''}">
        <div class="action-type">Fold</div>
        <div class="action-percent">${fold}%</div>
      </div>
      <div class="action-item ${call === maxPercent && call > 0 ? 'primary' : ''}">
        <div class="action-type">Call</div>
        <div class="action-percent">${call}%</div>
      </div>
      <div class="action-item ${raise === maxPercent && raise > 0 ? 'primary' : ''}">
        <div class="action-type">Raise</div>
        <div class="action-percent">${raise}%</div>
      </div>
    `;
  }

  // 팟 정보 표시 업데이트
  function updatePotDisplay() {
    const potOddsElement = document.getElementById('hud-pot-odds');
    const equityElement = document.getElementById('hud-equity');
    const equityRow = document.getElementById('equity-row');

    if (potOddsElement) {
      if (gameState.potOdds > 0) {
        potOddsElement.textContent = `${gameState.potOdds}%`;
        potOddsElement.classList.add('positive');
      } else {
        potOddsElement.textContent = '-%';
        potOddsElement.classList.remove('positive');
      }
    }

    if (equityElement && equityRow) {
      if (gameState.equity > 0) {
        equityRow.style.display = 'flex';
        equityElement.textContent = `${gameState.equity}%`;
        
        const equityNum = parseFloat(gameState.equity);
        const potOddsNum = parseFloat(gameState.potOdds);
        
        if (equityNum > potOddsNum) {
          equityElement.classList.add('positive');
          equityElement.classList.remove('negative');
        } else {
          equityElement.classList.add('negative');
          equityElement.classList.remove('positive');
        }
      } else {
        equityRow.style.display = 'none';
      }
    }
  }

  // 초기화
  function init() {
    console.log('='.repeat(50));
    console.log('[GTO HUD] PokerNow GTO HUD 초기화 중...');
    console.log('[GTO HUD] URL:', window.location.href);
    console.log('[GTO HUD] Document ready state:', document.readyState);
    console.log('='.repeat(50));
    
    // HUD 생성
    createHUD();
    
    // 주기적 업데이트 (1초마다)
    updateInterval = setInterval(updateHUD, 1000);
    
    // 즉시 첫 업데이트
    setTimeout(() => {
      console.log('[GTO HUD] 첫 업데이트 시작...');
      updateHUD();
    }, 2000); // 2초 대기 후 첫 업데이트
    
    console.log('[GTO HUD] PokerNow GTO HUD 활성화됨');
  }

  // 페이지 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // 이미 로드된 경우 약간의 지연 후 초기화
    setTimeout(init, 2000);
  }

  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
  
  // 콘솔에 HUD 정보 출력
  console.log('[GTO HUD] Chrome Extension loaded successfully');
  console.log('[GTO HUD] Version: 1.0.0');
  console.log('[GTO HUD] 문제가 있으면 콘솔 로그를 확인하세요');
})();
