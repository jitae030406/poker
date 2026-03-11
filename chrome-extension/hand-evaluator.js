// 핸드 평가 엔진 - 7카드 조합에서 최고의 5카드 핸드 찾기

const HandEvaluator = (() => {
  const RANK_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };

  const HAND_RANKINGS = {
    STRAIGHT_FLUSH: 8,
    FOUR_OF_KIND: 7,
    FULL_HOUSE: 6,
    FLUSH: 5,
    STRAIGHT: 4,
    THREE_OF_KIND: 3,
    TWO_PAIR: 2,
    ONE_PAIR: 1,
    HIGH_CARD: 0
  };

  function parseCard(card) {
    return {
      rank: card[0],
      suit: card[1],
      value: RANK_VALUES[card[0]]
    };
  }

  function getCombinations(arr, k) {
    if (k === 0) return [[]];
    if (arr.length === 0) return [];
    const [first, ...rest] = arr;
    const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
    const withoutFirst = getCombinations(rest, k);
    return withFirst.concat(withoutFirst);
  }

  function evaluateHand(cards) {
    const parsed = cards.map(parseCard);
    const values = parsed.map(c => c.value).sort((a, b) => b - a);
    const suits = parsed.map(c => c.suit);
    
    // Count occurrences
    const valueCounts = {};
    values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const uniqueValues = Object.keys(valueCounts).map(Number).sort((a, b) => b - a);

    // Check flush
    const suitCounts = {};
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    const isFlush = Object.values(suitCounts).some(c => c >= 5);
    const flushSuit = isFlush ? Object.keys(suitCounts).find(s => suitCounts[s] >= 5) : null;

    // Check straight
    const checkStraight = (vals) => {
      const uniqueVals = [...new Set(vals)].sort((a, b) => b - a);
      for (let i = 0; i <= uniqueVals.length - 5; i++) {
        const slice = uniqueVals.slice(i, i + 5);
        if (slice[0] - slice[4] === 4) return slice[0];
      }
      // Check wheel (A-2-3-4-5)
      if (uniqueVals.includes(14) && uniqueVals.includes(5) && 
          uniqueVals.includes(4) && uniqueVals.includes(3) && uniqueVals.includes(2)) {
        return 5; // Wheel straight
      }
      return 0;
    };

    const straightHigh = checkStraight(values);
    const isStraight = straightHigh > 0;

    // Straight flush
    if (isFlush && isStraight) {
      const flushCards = parsed.filter(c => c.suit === flushSuit).map(c => c.value);
      const sfHigh = checkStraight(flushCards);
      if (sfHigh > 0) {
        return { rank: HAND_RANKINGS.STRAIGHT_FLUSH, value: sfHigh * 1e10 };
      }
    }

    // Four of a kind
    if (counts[0] === 4) {
      const quadValue = uniqueValues.find(v => valueCounts[v] === 4);
      const kicker = uniqueValues.find(v => v !== quadValue);
      return { rank: HAND_RANKINGS.FOUR_OF_KIND, value: quadValue * 1e8 + kicker };
    }

    // Full house
    if (counts[0] === 3 && counts[1] >= 2) {
      const tripValue = uniqueValues.find(v => valueCounts[v] === 3);
      const pairValue = uniqueValues.find(v => v !== tripValue && valueCounts[v] >= 2);
      return { rank: HAND_RANKINGS.FULL_HOUSE, value: tripValue * 1e6 + pairValue * 1e3 };
    }

    // Flush
    if (isFlush) {
      const flushCards = parsed.filter(c => c.suit === flushSuit)
        .map(c => c.value)
        .sort((a, b) => b - a)
        .slice(0, 5);
      const flushValue = flushCards.reduce((sum, v, i) => sum + v * Math.pow(15, 4 - i), 0);
      return { rank: HAND_RANKINGS.FLUSH, value: flushValue };
    }

    // Straight
    if (isStraight) {
      return { rank: HAND_RANKINGS.STRAIGHT, value: straightHigh * 1e6 };
    }

    // Three of a kind
    if (counts[0] === 3) {
      const tripValue = uniqueValues.find(v => valueCounts[v] === 3);
      const kickers = uniqueValues.filter(v => v !== tripValue).slice(0, 2);
      return { 
        rank: HAND_RANKINGS.THREE_OF_KIND, 
        value: tripValue * 1e6 + kickers[0] * 1e3 + (kickers[1] || 0)
      };
    }

    // Two pair
    if (counts[0] === 2 && counts[1] === 2) {
      const pairs = uniqueValues.filter(v => valueCounts[v] === 2).sort((a, b) => b - a);
      const kicker = uniqueValues.find(v => valueCounts[v] === 1);
      return { 
        rank: HAND_RANKINGS.TWO_PAIR, 
        value: pairs[0] * 1e6 + pairs[1] * 1e3 + (kicker || 0)
      };
    }

    // One pair
    if (counts[0] === 2) {
      const pairValue = uniqueValues.find(v => valueCounts[v] === 2);
      const kickers = uniqueValues.filter(v => v !== pairValue).slice(0, 3);
      return { 
        rank: HAND_RANKINGS.ONE_PAIR, 
        value: pairValue * 1e6 + kickers.reduce((sum, v, i) => sum + v * Math.pow(15, 2 - i), 0)
      };
    }

    // High card
    const highCards = uniqueValues.slice(0, 5);
    const highValue = highCards.reduce((sum, v, i) => sum + v * Math.pow(15, 4 - i), 0);
    return { rank: HAND_RANKINGS.HIGH_CARD, value: highValue };
  }

  function findBestHand(allCards) {
    if (allCards.length < 5) return null;
    if (allCards.length === 5) return evaluateHand(allCards);
    
    const combinations = getCombinations(allCards, 5);
    let bestHand = null;
    
    combinations.forEach(combo => {
      const hand = evaluateHand(combo);
      if (!bestHand || hand.rank > bestHand.rank || 
          (hand.rank === bestHand.rank && hand.value > bestHand.value)) {
        bestHand = hand;
      }
    });
    
    return bestHand;
  }

  function compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) return hand1.rank - hand2.rank;
    return hand1.value - hand2.value;
  }

  return {
    evaluateHand,
    findBestHand,
    compareHands,
    HAND_RANKINGS
  };
})();