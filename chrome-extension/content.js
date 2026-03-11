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
      // PokerNow의 플레이어 카드 선택자
      const playerArea = document.querySelector('.you-player, .table-player.is-me, [class*="player-area-you"]');
      if (!playerArea) return [];

      const cardElements = playerArea.querySelectorAll('.card-item, .playing-card, [class*="card"]');
      const cards = [];

      cardElements.forEach(el => {
        const cardText = el.textContent.trim();
        const classNames = el.className;
        
        // 텍스트에서 카드 파싱
        if (cardText.length >= 2) {
          const rank = cardText[0].toUpperCase();
          let suit = '';
          
          // 클래스나 텍스트에서 수트 감지
          if (classNames.includes('heart') || cardText.includes('♥') || el.style.color.includes('red')) {
            suit = 'h';
          } else if (classNames.includes('diamond') || cardText.includes('♦')) {
            suit = 'd';
          } else if (classNames.includes('club') || cardText.includes('♣')) {
            suit = 'c';
          } else if (classNames.includes('spade') || cardText.includes('♠')) {
            suit = 's';
          }
          
          if (rank && suit) {
            cards.push(rank + suit);
          }
        }
      });

      return cards.slice(0, 2);
    } catch (error) {
      console.error('카드 스크래핑 오류:', error);
      return [];
    }
  }

  // 보드 카드 스크래핑
  function scrapeBoardCards() {
    try {
      const boardArea = document.querySelector('.table-cards, .community-cards, [class*="board"]');
      if (!boardArea) return [];

      const cardElements = boardArea.querySelectorAll('.card-item, .playing-card, [class*="card"]');
      const cards = [];

      cardElements.forEach(el => {
        const cardText = el.textContent.trim();
        const classNames = el.className;
        
        if (cardText.length >= 2) {
          const rank = cardText[0].toUpperCase();
          let suit = '';
          
          if (classNames.includes('heart') || cardText.includes('♥')) {
            suit = 'h';
          } else if (classNames.includes('diamond') || cardText.includes('♦')) {
            suit = 'd';
          } else if (classNames.includes('club') || cardText.includes('♣')) {
            suit = 'c';
          } else if (classNames.includes('spade') || cardText.includes('♠')) {
            suit = 's';
          }
          
          if (rank && suit) {
            cards.push(rank + suit);
          }
        }
      });

      return cards.slice(0, 5);
    } catch (error) {
      console.error('보드 카드 스크래핑 오류:', error);
      return [];
    }
  }

  // 포지션 감지
  function detectMyPosition() {
    try {
      // 딜러 버튼 찾기
      const dealerButton = document.querySelector('.dealer-button-node, .dealer-button, [class*="dealer"]');
      if (!dealerButton) return null;

      // 전체 플레이어 찾기
      const allPlayers = document.querySelectorAll('.table-player, .player-area, [class*="player-seat"]');
      const totalPlayers = allPlayers.length;

      if (totalPlayers < 2) return null;

      // 내 위치와 딜러 버튼 위치 찾기
      let myIndex = -1;
      let dealerIndex = -1;

      allPlayers.forEach((player, index) => {
        if (player.classList.contains('you-player') || player.classList.contains('is-me')) {
          myIndex = index;
        }
        if (player.contains(dealerButton) || player.querySelector('.dealer-button-node, .dealer-button')) {
          dealerIndex = index;
        }
      });

      if (myIndex === -1 || dealerIndex === -1) return null;

      // 포지션 계산
      return PositionDetector.detectPosition(dealerIndex, myIndex, totalPlayers);
    } catch (error) {
      console.error('포지션 감지 오류:', error);
      return null;
    }
  }

  // 팟 사이즈 계산
  function calculatePotSize() {
    try {
      let totalPot = 0;

      // 메인 팟
      const potElements = document.querySelectorAll('.pot-amount, .pot-value, [class*="pot"]');
      potElements.forEach(el => {
        const text = el.textContent.replace(/[^0-9.]/g, '');
        const value = parseFloat(text);
        if (!isNaN(value)) {
          totalPot += value;
        }
      });

      // 플레이어 베팅액
      const betElements = document.querySelectorAll('.player-bet, .bet-amount, [class*="bet"]');
      betElements.forEach(el => {
        const text = el.textContent.replace(/[^0-9.]/g, '');
        const value = parseFloat(text);
        if (!isNaN(value)) {
          totalPot += value;
        }
      });

      return totalPot;
    } catch (error) {
      console.error('팟 계산 오류:', error);
      return 0;
    }
  }

  // 콜 금액 계산
  function calculateCallAmount() {
    try {
      const callButton = document.querySelector('button[class*="call"], .action-call, [data-action="call"]');
      if (!callButton) return 0;

      const text = callButton.textContent.replace(/[^0-9.]/g, '');
      const value = parseFloat(text);
      return isNaN(value) ? 0 : value;
    } catch (error) {
      console.error('콜 금액 계산 오류:', error);
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
    console.log('PokerNow GTO HUD 초기화 중...');
    
    // HUD 생성
    createHUD();
    
    // 주기적 업데이트 (1초마다)
    updateInterval = setInterval(updateHUD, 1000);
    
    // 즉시 첫 업데이트
    updateHUD();
    
    console.log('PokerNow GTO HUD 활성화됨');
  }

  // 페이지 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // 이미 로드된 경우 약간의 지연 후 초기화
    setTimeout(init, 1000);
  }

  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
})();
