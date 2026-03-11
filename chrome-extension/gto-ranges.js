// 9-Max GTO 레인지 데이터 (100BB, RFI + 3bet + 4bet)

const GTORanges = (() => {
  // 프리플랍 RFI (Raise First In) 레인지
  const RFI_RANGES = {
    'UTG': [
      // 프리미엄 페어
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99',
      // 프리미엄 브로드웨이
      'AKs', 'AQs', 'AJs', 'ATs',
      'AKo', 'AQo',
      'KQs', 'KJs',
      // 미들 페어
      '88', '77',
      // 수트 커넥터
      'A9s', 'A8s', 'A5s', 'A4s', 'A3s', 'A2s',
      'KTs', 'K9s',
      'QJs', 'QTs',
      'JTs', 'J9s',
      'T9s', 'T8s',
      '98s', '87s', '76s', '65s'
    ],
    'UTG+1': [
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66',
      'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
      'AKo', 'AQo', 'AJo',
      'KQs', 'KJs', 'KTs', 'K9s',
      'QJs', 'QTs', 'Q9s',
      'JTs', 'J9s', 'J8s',
      'T9s', 'T8s',
      '98s', '97s', '87s', '86s', '76s', '75s', '65s', '54s'
    ],
    'UTG+2': [
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55',
      'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
      'AKo', 'AQo', 'AJo', 'ATo',
      'KQs', 'KJs', 'KTs', 'K9s', 'K8s',
      'QJs', 'QTs', 'Q9s', 'Q8s',
      'JTs', 'J9s', 'J8s',
      'T9s', 'T8s', 'T7s',
      '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s'
    ],
    'LJ': [
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44',
      'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
      'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
      'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s',
      'KQo', 'KJo',
      'QJs', 'QTs', 'Q9s', 'Q8s',
      'JTs', 'J9s', 'J8s', 'J7s',
      'T9s', 'T8s', 'T7s',
      '98s', '97s', '96s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s'
    ],
    'HJ': [
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
      'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
      'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o',
      'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s',
      'KQo', 'KJo', 'KTo',
      'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s',
      'QJo',
      'JTs', 'J9s', 'J8s', 'J7s',
      'T9s', 'T8s', 'T7s', 'T6s',
      '98s', '97s', '96s', '87s', '86s', '85s', '76s', '75s', '65s', '64s', '54s', '53s', '43s'
    ],
    'CO': [
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
      'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
      'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o',
      'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s',
      'KQo', 'KJo', 'KTo', 'K9o',
      'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s',
      'QJo', 'QTo', 'Q9o',
      'JTs', 'J9s', 'J8s', 'J7s', 'J6s',
      'JTo',
      'T9s', 'T8s', 'T7s', 'T6s',
      'T9o',
      '98s', '97s', '96s', '95s', '87s', '86s', '85s', '76s', '75s', '74s', '65s', '64s', '54s', '53s', '43s'
    ],
    'BTN': [
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
      'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
      'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
      'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
      'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o',
      'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
      'QJo', 'QTo', 'Q9o', 'Q8o',
      'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s',
      'JTo', 'J9o', 'J8o',
      'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s',
      'T9o', 'T8o',
      '98s', '97s', '96s', '95s', '94s', '87s', '86s', '85s', '84s', '76s', '75s', '74s', '65s', '64s', '63s', '54s', '53s', '43s'
    ],
    'SB': [
      'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
      'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
      'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o',
      'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s',
      'KQo', 'KJo', 'KTo', 'K9o', 'K8o',
      'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s',
      'QJo', 'QTo', 'Q9o', 'Q8o',
      'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s',
      'JTo', 'J9o',
      'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s',
      'T9o', 'T8o',
      '98s', '97s', '96s', '95s', '87s', '86s', '85s', '84s', '76s', '75s', '74s', '65s', '64s', '54s', '53s', '43s'
    ],
    'BB': [] // BB는 RFI가 아닌 콜/3bet 상황
  };

  // 3bet 레인지 (vs EP, MP, CO, BTN, SB)
  const THREEBET_RANGES = {
    'UTG': {
      'vs_EP': ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'],
      'vs_MP': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AKo'],
      'vs_CO': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'AKo', 'AQo'],
      'vs_BTN': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'AKo', 'AQo', 'AJo', 'KQs'],
      'vs_SB': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs']
    },
    'UTG+1': {
      'vs_EP': ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'],
      'vs_MP': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AKo', 'AQo'],
      'vs_CO': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'AKo', 'AQo', 'KQs'],
      'vs_BTN': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs'],
      'vs_SB': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s', 'A3s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'QJs']
    },
    'CO': {
      'vs_EP': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AKo'],
      'vs_MP': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'AKo', 'AQo'],
      'vs_BTN': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KTs', 'QJs'],
      'vs_SB': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'QJs', 'JTs']
    },
    'BTN': {
      'vs_EP': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AKo', 'AQo'],
      'vs_MP': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'AKo', 'AQo', 'KQs'],
      'vs_CO': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'QJs'],
      'vs_SB': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'JTs']
    },
    'SB': {
      'vs_EP': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AKo'],
      'vs_MP': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'AKo', 'AQo', 'KQs'],
      'vs_CO': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'KTs', 'QJs', 'JTs'],
      'vs_BTN': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s']
    },
    'BB': {
      'vs_EP': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AKo'],
      'vs_MP': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'AKo', 'AQo', 'KQs'],
      'vs_CO': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s', 'A3s', 'AKo', 'AQo', 'AJo', 'KQs', 'KJs', 'QJs'],
      'vs_BTN': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s'],
      'vs_SB': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '87s']
    }
  };

  // 4bet 레인지
  const FOURBET_RANGES = {
    'UTG': ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    'UTG+1': ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'],
    'UTG+2': ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'],
    'LJ': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo'],
    'HJ': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AKo'],
    'CO': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AKo'],
    'BTN': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'A5s', 'AKo', 'AQo'],
    'SB': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'A5s', 'AKo', 'AQo'],
    'BB': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AKo']
  };

  // 핸드를 표준 형식으로 변환 (AKs, 77 등)
  function normalizeHand(card1, card2) {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const getValue = (r) => ranks.indexOf(r);
    
    let r1 = card1[0];
    let s1 = card1[1];
    let r2 = card2[0];
    let s2 = card2[1];
    
    // 페어
    if (r1 === r2) {
      return r1 + r2;
    }
    
    // 높은 랭크를 앞으로
    if (getValue(r1) < getValue(r2)) {
      [r1, r2] = [r2, r1];
      [s1, s2] = [s2, s1];
    }
    
    // 수트/오프수트 구분
    const suited = s1 === s2;
    return r1 + r2 + (suited ? 's' : 'o');
  }

  function isInRange(hand, range) {
    return range.includes(hand);
  }

  function getRFIAction(position, hand) {
    const range = RFI_RANGES[position] || [];
    if (isInRange(hand, range)) {
      return { raise: 100, call: 0, fold: 0 };
    }
    return { raise: 0, call: 0, fold: 100 };
  }

  function get3BetAction(position, hand, vsPosition) {
    const positionRanges = THREEBET_RANGES[position];
    if (!positionRanges) return null;
    
    const range = positionRanges[vsPosition] || [];
    if (isInRange(hand, range)) {
      return { raise: 100, call: 0, fold: 0 }; // 3bet = raise
    }
    
    // 3bet 레인지에 없지만 RFI 레인지에는 있으면 콜
    const rfiRange = RFI_RANGES[position] || [];
    if (isInRange(hand, rfiRange)) {
      return { raise: 0, call: 100, fold: 0 };
    }
    
    return { raise: 0, call: 0, fold: 100 };
  }

  function get4BetAction(position, hand) {
    const range = FOURBET_RANGES[position] || [];
    if (isInRange(hand, range)) {
      return { raise: 100, call: 0, fold: 0 }; // 4bet
    }
    return { raise: 0, call: 0, fold: 100 };
  }

  return {
    normalizeHand,
    isInRange,
    getRFIAction,
    get3BetAction,
    get4BetAction,
    RFI_RANGES,
    THREEBET_RANGES,
    FOURBET_RANGES
  };
})();