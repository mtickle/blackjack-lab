import React from 'react';
import GameHistory from './components/GameHistory.jsx';

// --- Helper Functions & Data ---
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const VALUES = { 'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10 };

const createDeck = (numDecks = 6) => {
  let multiDeck = [];
  for (let i = 0; i < numDecks; i++) {
    const singleDeck = SUITS.flatMap(suit =>
      RANKS.map(rank => ({ suit, rank, value: VALUES[rank] }))
    );
    multiDeck.push(...singleDeck);
  }
  return multiDeck;
};

const shuffleDeck = (deck) => {
  let shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
};

const calculateScore = (hand) => {
  if (!hand || hand.length === 0) return 0;
  let score = hand.reduce((sum, card) => sum + card.value, 0);
  let aceCount = hand.filter(card => card.rank === 'A').length;
  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }
  return score;
};

// --- Utility Functions (Placeholder) ---
const saveThingsToDatabase = (endpoint, data) => {
  console.log(`Simulating API call to endpoint: ${endpoint}`);
  console.log('Batch data:', data);
  return Promise.resolve({ message: `Successfully saved batch of ${data.length} games.` });
};


// --- UI Components (Consolidated) ---

const Card = ({ suit, rank, isHidden }) => {
  const isRed = suit === '♥' || suit === '♦';
  if (isHidden) {
    return <div className="w-20 h-28 md:w-24 md:h-36 rounded-lg bg-blue-800 border-2 border-white shadow-lg mx-1"></div>;
  }
  return (
    <div className={`w-20 h-28 md:w-24 md:h-36 rounded-lg bg-white flex flex-col justify-between p-1 shadow-lg mx-1 ${isRed ? 'text-red-600' : 'text-black'}`}>
      <div className="text-left text-xl font-bold"><div>{rank}</div><div>{suit}</div></div>
      <div className="text-right text-xl font-bold transform rotate-180"><div>{rank}</div><div>{suit}</div></div>
    </div>
  );
};

const Hand = ({ title, cards, score, result, resultScore, isDealer, hideFirstCard, isActive = false }) => {
  // --- DEBUG LOG 5: INSIDE THE HAND COMPONENT ---
  // This shows the exact props this component receives on every render.
  console.log(`%cHAND RENDER: ${title}`, 'color: green;', { result, resultScore, score, isActive });

  let panelTitle, panelScore, panelStyles;

  if (result) {
    panelTitle = result.toUpperCase();
    panelScore = resultScore;
    const getResultStyles = () => {
      switch (result) {
        case 'WIN': case 'Blackjack!': return { container: 'bg-green-100 border-green-300', text: 'text-green-800' };
        case 'LOSE': case 'Bust': return { container: 'bg-red-100 border-red-300', text: 'text-red-800' };
        case 'PUSH': default: return { container: 'bg-gray-100 border-gray-300', text: 'text-gray-800' };
      }
    };
    panelStyles = getResultStyles();
  } else {
    panelTitle = 'SCORE';
    panelScore = score;
    panelStyles = { container: 'bg-blue-100 border-blue-300', text: 'text-blue-800' };
  }

  return (
    <div className={`flex items-center gap-4 my-2 p-2 ${isActive ? 'outline outline-2 outline-yellow-400 rounded-lg' : ''}`}>
      <div className="flex-shrink-0 w-24 text-center">
        <div className={`p-2 rounded-lg border ${panelStyles.container}`}>
          <h4 className={`font-bold text-lg ${panelStyles.text}`}>{panelTitle}</h4>
          {panelScore > 0 && <p className={`text-3xl font-bold ${panelStyles.text}`}>{panelScore}</p>}
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-800 text-left mb-2">{title} ({cards.length} cards)</h3>
        <div className="flex flex-wrap min-h-[120px] md:min-h-[150px]">
          {cards.map((card, index) => (
            <Card key={index} suit={card.suit} rank={card.rank} isHidden={isDealer && index === 0 && hideFirstCard} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <div className="bg-gray-800 text-white p-4 rounded-t-3xl shadow-md">
    <h1 className="text-2xl font-bold text-center text-yellow-300">AI Blackjack</h1>
  </div>
);

const Scoreboard = ({ wins, losses, totalLost, totalWon, wallet, currentBet }) => (
  <div className="flex flex-col gap-2 text-sm">
    <div className="flex justify-between"><span className="font-semibold text-green-700">Wins:</span><span>{wins}</span></div>
    <div className="flex justify-between"><span className="font-semibold text-red-700">Losses:</span><span>{losses}</span></div>
    <div className="flex justify-between"><span className="font-semibold text-orange-700">Total Lost:</span><span>${totalLost}</span></div>
    <div className="flex justify-between"><span className="font-semibold text-teal-700">Total Won:</span><span>${totalWon}</span></div>
    <hr className="my-1" />
    <div className="flex justify-between"><span className="font-semibold">Wallet:</span><span>${wallet}</span></div>
    <div className="flex justify-between"><span className="font-semibold">Current Bet:</span><span>${currentBet}</span></div>
  </div>
);

const GameStatus = ({ status }) => (
  <div className="text-center font-semibold my-2 p-2 bg-gray-200 rounded-lg">{status}</div>
);



// --- Main App Component ---
export default function App() {
  const [deck, setDeck] = React.useState([]);
  const [playerHands, setPlayerHands] = React.useState([[]]);
  const [dealerHand, setDealerHand] = React.useState([]);
  const [gameState, setGameState] = React.useState('initial');
  const [status, setStatus] = React.useState('Click "Start Auto-Play"');
  const [wallet, setWallet] = React.useState(1000);
  const [currentBet, setCurrentBet] = React.useState(0);
  const [wins, setWins] = React.useState(0);
  const [losses, setLosses] = React.useState(0);
  const [totalMoneyLost, setTotalMoneyLost] = React.useState(0);
  const [totalMoneyWon, setTotalMoneyWon] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [gameHistory, setGameHistory] = React.useState([]);
  const [isGameResolved, setIsGameResolved] = React.useState(false);
  const [activeHandIndex, setActiveHandIndex] = React.useState(0);
  const [handResults, setHandResults] = React.useState({ player: [], dealer: null });
  const [gameDataBuffer, setGameDataBuffer] = React.useState([]);

  const playerScores = React.useMemo(() => playerHands.map(calculateScore), [playerHands]);
  const dealerScore = React.useMemo(() => calculateScore(dealerHand), [dealerHand]);
  const dealerVisibleScore = React.useMemo(() => calculateScore(dealerHand.slice(1)), [dealerHand]);

  const startNewGame = () => {
    // --- DEBUG LOG 1: RESETTING STATE ---
    console.log(`%cSTARTING NEW GAME: Resetting handResults.`, 'color: gray; font-style: italic;');
    setHandResults({ player: [], dealer: null });

    const betAmount = (Math.floor(Math.random() * 5) + 1) * 5;
    if (wallet < betAmount) {
      setStatus("Not enough money to bet! Reset game.");
      setIsPlaying(false);
      return;
    }

    setWallet(prev => prev - betAmount);
    setCurrentBet(betAmount);

    const newDeck = shuffleDeck(createDeck());
    const newPlayerInitialHand = [newDeck.pop(), newDeck.pop()];
    const newDealerHand = [newDeck.pop(), newDeck.pop()];

    if (newPlayerInitialHand[0].rank === newPlayerInitialHand[1].rank && wallet >= betAmount) {
      setPlayerHands([[newPlayerInitialHand[0]], [newPlayerInitialHand[1]]]);
      setCurrentBet(betAmount * 2);
      setWallet(prev => prev - betAmount);
      setGameState('dealing_split');
      setStatus(`Splitting ${newPlayerInitialHand[0].rank}s!`);
      setDealerHand(newDealerHand);
      setDeck(newDeck);
    } else {
      const initialScore = calculateScore(newPlayerInitialHand);
      if ((initialScore === 10 || initialScore === 11) && wallet >= betAmount) {
        setWallet(prev => prev - betAmount);
        setCurrentBet(betAmount * 2);
        const finalPlayerHand = [...newPlayerInitialHand, newDeck.pop()];
        setPlayerHands([finalPlayerHand]);
        setGameState('dealer');
        setStatus(`Doubling down on ${initialScore}!`);
        setDeck(newDeck);
        setDealerHand(newDealerHand);
      } else {
        setPlayerHands([newPlayerInitialHand]);
        setGameState('player');
        setStatus(`Player's Turn (Bet: $${betAmount})`);
        setDeck(newDeck);
        setDealerHand(newDealerHand);
      }
    }
    setActiveHandIndex(0);
    setIsGameResolved(false);
  };

  const resetGame = () => {
    setWallet(1000);
    setCurrentBet(0);
    setPlayerHands([[]]);
    setDealerHand([]);
    setGameState('initial');
    setStatus('Click "Start Auto-Play"');
    setWins(0);
    setLosses(0);
    setTotalMoneyLost(0);
    setTotalMoneyWon(0);
    setIsPlaying(false);
    setGameHistory([]);
    setIsGameResolved(false);
    setActiveHandIndex(0);
    setGameDataBuffer([]);
  };

  const toggleAutoPlay = () => {
    const nextIsPlaying = !isPlaying;
    setIsPlaying(nextIsPlaying);
    if (nextIsPlaying && (gameState === 'initial' || gameState === 'end')) {
      startNewGame();
    }
  };

  React.useEffect(() => {
    if (gameState !== 'dealing_split') return;
    const timer = setTimeout(() => {
      setPlayerHands(prevHands => {
        const newHands = [...prevHands];
        let tempDeck = [...deck];
        newHands[0].push(tempDeck.pop());
        newHands[1].push(tempDeck.pop());
        setDeck(tempDeck);
        return newHands;
      });
      setGameState('player');
    }, 500);
    return () => clearTimeout(timer);
  }, [gameState, deck]);

  React.useEffect(() => {
    if (!isPlaying || gameState !== 'player') return;

    const activeHand = playerHands[activeHandIndex];
    if (!activeHand || activeHand.length === 0) return;
    const activeScore = playerScores[activeHandIndex];

    const playNextHandOrEndTurn = () => {
      if (activeHandIndex < playerHands.length - 1) {
        setActiveHandIndex(prev => prev + 1);
      } else {
        // --- DEBUG LOG 2: PLAYER'S TURN ENDS ---
        console.log(`%cPLAYER ENDS TURN. Transitioning to 'dealer'.`, 'color: orange; font-weight: bold;', { activeScore });
        setGameState('dealer');
      }
    };

    const timer = setTimeout(() => {
      if (activeHand[0].rank === 'A' && playerHands.length > 1 && activeHand.length === 2) {
        playNextHandOrEndTurn();
      } else if (activeScore >= 17) {
        playNextHandOrEndTurn();
      } else {
        setPlayerHands(prev => {
          const newHands = [...prev];
          const tempDeck = [...deck];
          newHands[activeHandIndex].push(tempDeck.pop());
          setDeck(tempDeck);
          return newHands;
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [gameState, playerHands, deck, isPlaying, activeHandIndex, playerScores]);

  React.useEffect(() => {
    if (!isPlaying || gameState !== 'dealer') return;
    const timer = setTimeout(() => {
      if (dealerScore >= 17) {
        // --- DEBUG LOG 3: DEALER'S TURN ENDS ---
        console.log(`%cDEALER ENDS TURN. Transitioning to 'end'.`, 'color: red; font-weight: bold;', { dealerScore });
        setGameState('end');
      } else {
        setDealerHand(prev => [...prev, deck.pop()]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [gameState, dealerHand, dealerScore, isPlaying, deck]);


  React.useEffect(() => {
    if (gameState !== 'end' || isGameResolved) return;

    // --- DEBUG LOG 4: RESULT CALCULATION ---
    console.log(`%cRESULTS HOOK TRIGGERED. Calculating final results...`, 'color: blue; font-weight: bold;', { playerScores, dealerScore });

    let totalWinnings = 0;
    const singleBetAmount = currentBet / playerHands.length;
    let newWins = 0;
    let newLosses = 0;
    let roundResults = [];
    const finalResults = { player: [], dealer: null };

    playerHands.forEach((hand, index) => {
      const playerScore = playerScores[index];
      const playerBlackjack = playerScore === 21 && hand.length === 2;
      let resultText = '';

      if (playerBlackjack && dealerScore !== 21) {
        totalWinnings += singleBetAmount * 2.5; newWins++; resultText = 'Blackjack!';
      } else if (playerScore > 21) {
        newLosses++; resultText = 'Bust';
      } else if (dealerScore > 21) {
        totalWinnings += singleBetAmount * 2; newWins++; resultText = 'WIN';
      } else if (playerScore === dealerScore) {
        totalWinnings += singleBetAmount; resultText = 'PUSH';
      } else if (playerScore > dealerScore) {
        totalWinnings += singleBetAmount * 2; newWins++; resultText = 'WIN';
      } else {
        newLosses++; resultText = 'LOSE';
      }
      finalResults.player[index] = { result: resultText, score: playerScore };
      roundResults.push(`Hand ${index + 1}: ${resultText}`);
    });

    if (dealerScore > 21) {
      finalResults.dealer = { result: 'Bust', score: dealerScore };
    } else {
      const playerWonAny = finalResults.player.some(r => r.result === 'WIN' || r.result === 'Blackjack!');
      const playerPushedAny = finalResults.player.some(r => r.result === 'PUSH');

      if (playerWonAny) {
        finalResults.dealer = { result: 'LOSE', score: dealerScore };
      } else if (!playerPushedAny && newLosses > 0) {
        finalResults.dealer = { result: 'WIN', score: dealerScore };
      } else {
        finalResults.dealer = { result: 'PUSH', score: dealerScore };
      }
    }

    console.log(`%cFINAL RESULTS CALCULATED & SETTING STATE:`, 'color: blue; font-weight: bold;', finalResults);
    setHandResults(finalResults);

    const netWinLoss = totalWinnings - currentBet;
    const finalWallet = wallet + totalWinnings;

    setWallet(finalWallet);
    setWins(prev => prev + newWins);
    setLosses(prev => prev + newLosses);

    if (netWinLoss > 0) setTotalMoneyWon(prev => prev + netWinLoss);
    else if (netWinLoss < 0) setTotalMoneyLost(prev => prev - netWinLoss);

    setStatus(roundResults.join(' | '));
    const gameId = new Date().getTime();
    const finalResult = newWins > newLosses ? 'Player' : (newLosses > newWins ? 'Dealer' : 'Push');
    const historyEntry = { id: gameId, winner: finalResult, playerHands, dealerScore, dealerHand, bet: currentBet, wallet: finalWallet };
    setGameHistory(prev => [historyEntry, ...prev].slice(0, 10));
    const gameApiPayload = {
      gameId, timestamp: new Date().toISOString(), result: finalResult, betAmount: currentBet, netWinnings: netWinLoss, playerWallet_start: wallet, playerWallet_end: finalWallet,
      playerHands: playerHands.map((hand, index) => ({ hand, score: playerScores[index], cardCount: hand.length })),
      dealerHand: { hand: dealerHand, score: dealerScore, cardCount: dealerHand.length }
    };
    setGameDataBuffer(prev => [...prev, gameApiPayload]);
    setIsGameResolved(true);
  }, [gameState, isGameResolved, playerScores, dealerScore, playerHands, currentBet, wallet]);

  React.useEffect(() => {
    if (gameDataBuffer.length >= 10) {
      saveThingsToDatabase('postBlackjackGames', gameDataBuffer);
      setGameDataBuffer([]);
    }
  }, [gameDataBuffer]);

  React.useEffect(() => {
    if (gameState === 'end' && isPlaying) {
      const timer = setTimeout(startNewGame, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isPlaying, wallet]);

  return (
    <div>
      <div className="container mx-auto p-4">
        <Header />
        <div className="grid grid-cols-[1fr_auto] gap-4 p-6 bg-white rounded-b-3xl shadow-sm mb-4">
          <div className="flex flex-col gap-4">
            <div className="bg-[#fffdf7] p-4 rounded-2xl shadow-md border-2 border-[#e2dccc]">
              <Hand
                title="Dealer's Hand"
                cards={dealerHand}
                score={gameState === 'dealer' || gameState === 'end' ? dealerScore : dealerVisibleScore}
                isDealer={true}
                hideFirstCard={gameState !== 'dealer' && gameState !== 'end'}
                result={handResults.dealer?.result}
                resultScore={handResults.dealer?.score}
              />
            </div>
            <div className="bg-[#fffdf7] p-4 rounded-2xl shadow-md border-2 border-[#e2dccc]">
              <div className="flex items-start">
                {playerHands.map((hand, index) => (
                  <Hand
                    key={index}
                    title={`Player Hand ${index + 1}`}
                    cards={hand}
                    score={playerScores[index]}
                    isActive={gameState === 'player' && index === activeHandIndex}
                    result={handResults.player[index]?.result}
                    resultScore={handResults.player[index]?.score}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-[#fffdf7] p-4 rounded-2xl shadow-md border-2 border-[#e2dccc]">
              <h3 className="font-semibold text-gray-800 text-left mb-2">Control Panel</h3>
              <GameStatus status={status} />
              <button
                onClick={toggleAutoPlay}
                className={`px-3 py-1 rounded-lg border border-gray-700 text-sm shadow-lg transition-all duration-300 transform hover:scale-105 ${isPlaying ? 'bg-red-600 text-white' : 'bg-green-500 text-gray-900'}`}
              >
                {isPlaying ? 'Stop Auto-Play' : 'Start Auto-Play'}
              </button>
              &nbsp;
              <button
                onClick={resetGame}
                className="px-3 py-1 rounded-lg border border-gray-700  bg-yellow-500 text-gray-900 text-sm shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
              >
                Reset Game
              </button>
            </div>
            <div className="bg-[#fffdf7] p-4 rounded-2xl shadow-md border-2 border-[#e2dccc]">
              <h3 className="font-semibold text-gray-800 text-left mb-2">Scoreboard</h3>
              <Scoreboard wins={wins} losses={losses} totalLost={totalMoneyLost} totalWon={totalMoneyWon} wallet={wallet} currentBet={currentBet} />
            </div>
          </div>
          <div className="bg-[#fffdf7] p-4 rounded-2xl shadow-md border-2 border-[#e2dccc] col-span-2">
            <h3 className="font-semibold text-gray-800 text-left mb-2">Game History</h3>
            <GameHistory history={gameHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

