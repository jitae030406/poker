// 9-Max 포지션 감지 로직

const PositionDetector = (() => {
  const POSITIONS_9MAX = ['UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
  const POSITIONS_6MAX = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

  function detectPosition(dealerButtonIndex, myIndex, totalPlayers) {
    if (totalPlayers === 9) {
      return detect9MaxPosition(dealerButtonIndex, myIndex);
    } else if (totalPlayers === 6) {
      return detect6MaxPosition(dealerButtonIndex, myIndex);
    }
    return 'Unknown';
  }

  function detect9MaxPosition(dealerButtonIndex, myIndex) {
    // 딴러 버튼을 기준으로 상대적 위치 계산
    const relativePosition = (myIndex - dealerButtonIndex + 9) % 9;
    
    // BTN = 0, SB = 1, BB = 2, UTG = 3, ...
    const positionMap = {
      0: 'BTN',
      1: 'SB',
      2: 'BB',
      3: 'UTG',
      4: 'UTG+1',
      5: 'UTG+2',
      6: 'LJ',
      7: 'HJ',
      8: 'CO'
    };
    
    return positionMap[relativePosition] || 'Unknown';
  }

  function detect6MaxPosition(dealerButtonIndex, myIndex) {
    const relativePosition = (myIndex - dealerButtonIndex + 6) % 6;
    
    const positionMap = {
      0: 'BTN',
      1: 'SB',
      2: 'BB',
      3: 'UTG',
      4: 'HJ',
      5: 'CO'
    };
    
    return positionMap[relativePosition] || 'Unknown';
  }

  function getPositionFromButton(buttonPosition, playerCount) {
    // HTML 요소에서 포지션 추출
    return buttonPosition;
  }

  return {
    detectPosition,
    detect9MaxPosition,
    detect6MaxPosition,
    getPositionFromButton,
    POSITIONS_9MAX,
    POSITIONS_6MAX
  };
})();