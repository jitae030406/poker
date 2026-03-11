// PokerNow GTO Wizard HUD - 프리플랍 전용

(function() {
  'use strict';

  let hudElement = null;
  let updateInterval = null;

  // HUD 생성
  function createHUD() {
    if (hudElement) return;

    hudElement = document.createElement('div');
    hudElement.id = 'gto-wizard-hud';
    hudElement.innerHTML = `
      <div class="hud-header">GTO WIZARD</div>
      <div class="hud-body">
        <div class="hud-row">
          <span class="label">내 카드:</span>
          <span id="my-cards" class="value">-</span>
        </div>
        <div class="hud-row">
          <span class="label">포지션:</span>
          <span id="position" class="value">-</span>
        </div>
        <div class="hud-actions">
          <div class="action-box fold">
            <div class="action-label">FOLD</div>
            <div id="fold-pct" class="action-value">0%</div>
          </div>
          <div class="action-box call">
            <div class="action-label">CALL</div>
            <div id="call-pct" class="action-value">0%</div>
          </div>
          <div class="action-box raise">
            <div class="action-label">RAISE</div>
            <div id="raise-pct" class="action-value">0%</div>
          </div>
        </div>
        <div id="status" class="status">대기 중...</div>
      </div>
    `;

    document.body.appendChild(hudElement);
  }

  // 카드 스크래핑 - 중복 방지
  function scrapeMyCards() {
    try {
      // flipped 클래스가 있는 카드만 (실제 뒤집어진 카드)
      const flippedCards = document.querySelectorAll('.card-container.flipped');
      const cards = [];
      const seen = new Set();

      for (const container of flippedCards) {
        const cardText = container.textContent.trim();
        
        // PokerNow 형식: "10cc", "7dd", "Ass" 등
        const match = cardText.match(/^(10|[2-9TJQKA])([hdcs])\2$/i);
        if (!match) continue;
        
        let rank = match[1].toUpperCase();
        const suit = match[2].toLowerCase();
        
        // 10 → T 변환
        if (rank === '10') rank = 'T';
        
        const card = rank + suit;
        
        // 중복 방지
        if (!seen.has(card)) {
          seen.add(card);
          cards.push(card);
          if (cards.length === 2) break;
        }
      }

      return cards.length === 2 ? cards : [];
    } catch (e) {
      console.error('[GTO] 카드 스크래핑 오류:', e);
      return [];
    }
  }

  // 포지션 감지
  function detectPosition() {
    try {
      // 전체 플레이어 (테이블의 앉은 자리)
      const players = document.querySelectorAll('.table-player');
      if (players.length < 2) return null;

      let myIndex = -1;
      let dealerIndex = -1;

      players.forEach((player, idx) => {
        // 내 자리 찾기
        const isMe = player.textContent.toLowerCase().includes('you') ||
                     player.querySelector('[class*="your"]') !== null;
        if (isMe) myIndex = idx;

        // 딜러 버튼 찾기
        if (player.querySelector('[class*="dealer"]')) {
          dealerIndex = idx;
        }
      });

      if (myIndex === -1 || dealerIndex === -1) return null;

      // 9-Max 포지션 계산
      const relativePos = (myIndex - dealerIndex + players.length) % players.length;
      const posMap = {
        0: 'BTN', 1: 'SB', 2: 'BB',
        3: 'UTG', 4: 'MP', 5: 'MP',
        6: 'MP', 7: 'CO', 8: 'CO'
      };

      return posMap[relativePos] || null;
    } catch (e) {
      console.error('[GTO] 포지션 감지 오류:', e);
      return null;
    }
  }

  // 3bet 상황 감지
  function isFacing3Bet() {
    // 간단한 로직: 팟이 크거나, 상대가 raise한 상황
    // 더 정교한 로직은 베팅 히스토리 필요
    try {
      const actions = document.querySelectorAll('[class*="action"], [class*="bet"]');
      let raiseCount = 0;
      
      actions.forEach(el => {
        const text = el.textContent.toLowerCase();
        if (text.includes('raise') || text.includes('bet')) {
          raiseCount++;
        }
      });
      
      return raiseCount >= 2; // 2번 이상 raise = 3bet
    } catch (e) {
      return false;
    }
  }

  // UI 업데이트
  function updateHUD() {
    const myCards = scrapeMyCards();
    const position = detectPosition();
    const facing3bet = isFacing3Bet();

    // 카드 표시
    const cardsEl = document.getElementById('my-cards');
    if (myCards.length === 2) {
      const displayCards = myCards.map(c => {
        const rank = c[0];
        const suit = c[1];
        const suitSymbol = {h: '♥', d: '♦', c: '♣', s: '♠'}[suit] || suit;
        return `${rank}${suitSymbol}`;
      }).join(' ');
      cardsEl.textContent = displayCards;
      cardsEl.classList.add('active');
    } else {
      cardsEl.textContent = '-';
      cardsEl.classList.remove('active');
    }

    // 포지션 표시
    const posEl = document.getElementById('position');
    posEl.textContent = position || '-';
    if (position) posEl.classList.add('active');
    else posEl.classList.remove('active');

    // GTO 액션 계산
    if (myCards.length === 2 && position) {
      const hand = GTOData.normalizeHand(myCards[0], myCards[1]);
      const action = GTOData.getAction(hand, position, facing3bet);

      document.getElementById('fold-pct').textContent = action.fold + '%';
      document.getElementById('call-pct').textContent = action.call + '%';
      document.getElementById('raise-pct').textContent = action.raise + '%';

      // 하이라이트
      document.querySelectorAll('.action-box').forEach(box => box.classList.remove('highlight'));
      if (action.raise > 50) {
        document.querySelector('.action-box.raise').classList.add('highlight');
      } else if (action.call > 50) {
        document.querySelector('.action-box.call').classList.add('highlight');
      } else if (action.fold > 50) {
        document.querySelector('.action-box.fold').classList.add('highlight');
      }

      const statusEl = document.getElementById('status');
      statusEl.textContent = facing3bet ? '3bet 상황' : '오픈 상황';
      statusEl.style.color = facing3bet ? '#fbbf24' : '#10b981';
    } else {
      // 초기화
      document.getElementById('fold-pct').textContent = '0%';
      document.getElementById('call-pct').textContent = '0%';
      document.getElementById('raise-pct').textContent = '0%';
      document.querySelectorAll('.action-box').forEach(box => box.classList.remove('highlight'));
      document.getElementById('status').textContent = '대기 중...';
    }
  }

  // 초기화
  function init() {
    console.log('[GTO] GTO Wizard HUD 초기화...');
    createHUD();
    updateInterval = setInterval(updateHUD, 1000);
    setTimeout(updateHUD, 500);
    console.log('[GTO] HUD 활성화 완료');
  }

  // 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 1000);
  }

  window.addEventListener('beforeunload', () => {
    if (updateInterval) clearInterval(updateInterval);
  });
})();
