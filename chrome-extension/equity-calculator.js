// 몬테카를로 시뮬레이션 기반 승률 계산기

const EquityCalculator = (() => {
  const SUITS = ['h', 'd', 'c', 's'];
  const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const SIMULATIONS = 5000; // 정확도 우선

  function createDeck() {
    const deck = [];
    RANKS.forEach(rank => {
      SUITS.forEach(suit => {
        deck.push(rank + suit);
      });
    });
    return deck;
  }

  function removeCards(deck, cards) {
    return deck.filter(card => !cards.includes(card));
  }

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function dealRemainingBoard(board, deck, count) {
    const shuffled = shuffle(deck);
    return [...board, ...shuffled.slice(0, count)];
  }

  function calculateEquity(myHand, board = [], opponents = 1) {
    if (!myHand || myHand.length !== 2) {
      return { equity: 0, wins: 0, ties: 0, losses: 0 };
    }

    let wins = 0;
    let ties = 0;
    let losses = 0;

    const knownCards = [...myHand, ...board];
    const remainingBoard = 5 - board.length;

    for (let i = 0; i < SIMULATIONS; i++) {
      let deck = createDeck();
      deck = removeCards(deck, knownCards);
      
      // 보드 완성
      const fullBoard = remainingBoard > 0 ? 
        dealRemainingBoard(board, deck, remainingBoard) : board;
      
      // 내 핸드 평가
      const myCards = [...myHand, ...fullBoard];
      const myBestHand = HandEvaluator.findBestHand(myCards);
      
      if (!myBestHand) continue;

      // 상대방 핸드 시뮬레이션
      deck = removeCards(deck, fullBoard);
      let iWon = true;
      let tied = false;

      for (let opp = 0; opp < opponents; opp++) {
        const shuffledDeck = shuffle(deck);
        const oppHand = shuffledDeck.slice(opp * 2, opp * 2 + 2);
        const oppCards = [...oppHand, ...fullBoard];
        const oppBestHand = HandEvaluator.findBestHand(oppCards);
        
        if (!oppBestHand) continue;

        const comparison = HandEvaluator.compareHands(myBestHand, oppBestHand);
        
        if (comparison < 0) {
          iWon = false;
          break;
        } else if (comparison === 0) {
          tied = true;
        }
      }

      if (iWon) {
        if (tied) {
          ties++;
        } else {
          wins++;
        }
      } else {
        losses++;
      }
    }

    const equity = ((wins + ties * 0.5) / SIMULATIONS) * 100;

    return {
      equity: equity.toFixed(1),
      wins,
      ties,
      losses,
      simulations: SIMULATIONS
    };
  }

  // 아웃츠 기반 빠른 근사치 (백업용)
  function calculateOutsEquity(outs, street) {
    if (street === 'flop') {
      // 2카드 남음: Rule of 4
      return Math.min(outs * 4, 100);
    } else if (street === 'turn') {
      // 1카드 남음: Rule of 2
      return Math.min(outs * 2, 100);
    }
    return 0;
  }

  return {
    calculateEquity,
    calculateOutsEquity
  };
})();