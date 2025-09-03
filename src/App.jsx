import Hand from '@components/Hand';
import React from 'react';
import BettingInfo from './components/BettingInfo';
import GameHistory from './components/GameHistory';
import GameStatus from './components/GameStatus';
import Scoreboard from './components/Scoreboard';
// --- Helper Functions & Data ---

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const VALUES = { 'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10 };

// --- Database Utility Functions ---
async function saveThingsToDatabase(endpoint, data) {
  let apiUrl = 'https://game-api-zjod.onrender.com/api/' + endpoint;
  //let apiUrl = 'http://localhost:3001/api/' + endpoint;
  try {
    console.log(`Sending batch of ${data.length} games to ${endpoint}...`);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), // Send the array directly
    });
    if (!response.ok) throw new Error('Failed to save game batch');
    const result = await response.json();
    console.log("API Response:", result);
    return result;
  } catch (err) {
    console.error('Error saving game batch:', err.message || err);
  }
}

async function loadThingsFromDatabase(endpoint, ...params) {
  try {
    const apiUrl = `https://game-api-zjod.onrender.com/api/${endpoint}/${params.join('/')}`;
    //const apiUrl = `http://localhost:3001/api/${endpoint}/${params.join('/')}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading data from database:', error);
    return null;
  }
}


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

  // --- BATCHING LOGIC START ---
  // State to hold game data before sending to the API
  const [gameDataBuffer, setGameDataBuffer] = React.useState([]);
  // --- BATCHING LOGIC END ---

  const playerScores = React.useMemo(() => playerHands.map(calculateScore), [playerHands]);
  const dealerScore = React.useMemo(() => calculateScore(dealerHand), [dealerHand]);
  const dealerVisibleScore = React.useMemo(() => calculateScore(dealerHand.slice(1)), [dealerHand]);

  const startNewGame = () => {
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

    // Split logic takes priority
    if (newPlayerInitialHand[0].rank === newPlayerInitialHand[1].rank && wallet >= betAmount) {
      setPlayerHands([[newPlayerInitialHand[0]], [newPlayerInitialHand[1]]]);
      setCurrentBet(betAmount * 2);
      setWallet(prev => prev - betAmount); // Deduct for the second hand's bet
      setGameState('dealing_split');
      setStatus(`Splitting ${newPlayerInitialHand[0].rank}s!`);

      setDealerHand(newDealerHand);
      setDeck(newDeck);
    } else {
      // Double down logic
      const initialScore = calculateScore(newPlayerInitialHand);
      if ((initialScore === 10 || initialScore === 11) && wallet >= betAmount) {
        setWallet(prev => prev - betAmount); // Double the bet
        setCurrentBet(betAmount * 2);

        const finalPlayerHand = [...newPlayerInitialHand, newDeck.pop()];

        setPlayerHands([finalPlayerHand]);
        setGameState('dealer'); // Player's turn is over after one card
        setStatus(`Doubling down on ${initialScore}!`);

        setDeck(newDeck);
        setDealerHand(newDealerHand);
      } else {
        // Normal Play
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
    // --- BATCHING LOGIC ---
    setGameDataBuffer([]); // Clear the buffer on reset
  };

  const toggleAutoPlay = () => {
    const nextIsPlaying = !isPlaying;
    setIsPlaying(nextIsPlaying);
    if (nextIsPlaying && (gameState === 'initial' || gameState === 'end')) {
      startNewGame();
    }
  };

  // Deal to split hands
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

  // Player's Turn Logic
  React.useEffect(() => {
    if (!isPlaying || gameState !== 'player') return;

    const activeHand = playerHands[activeHandIndex];
    if (!activeHand || activeHand.length === 0) return;
    const activeScore = playerScores[activeHandIndex];

    const playNextHandOrEndTurn = () => {
      if (activeHandIndex < playerHands.length - 1) {
        setActiveHandIndex(prev => prev + 1);
      } else {
        setGameState('dealer');
      }
    };

    const timer = setTimeout(() => {
      if (activeHand[0].rank === 'A' && playerHands.length > 1 && activeHand.length === 2) {
        // Split aces only get one card
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

  // Dealer's Turn Logic
  React.useEffect(() => {
    if (!isPlaying || gameState !== 'dealer') return;
    const timer = setTimeout(() => {
      if (dealerScore >= 17) setGameState('end');
      else setDealerHand(prev => [...prev, deck.pop()]);
    }, 500);
    return () => clearTimeout(timer);
  }, [gameState, dealerHand, dealerScore, isPlaying, deck]);

  // Determine Winner and set status
  React.useEffect(() => {
    if (gameState !== 'end' || isGameResolved) return;

    let totalWinnings = 0;
    const singleBetAmount = currentBet / playerHands.length;
    let newWins = 0;
    let newLosses = 0;
    let roundResults = [];

    playerHands.forEach((hand, index) => {
      const playerScore = playerScores[index];
      const playerBlackjack = playerScore === 21 && hand.length === 2;

      if (playerBlackjack && dealerScore !== 21) {
        totalWinnings += singleBetAmount * 2.5;
        newWins++;
        roundResults.push(`Hand ${index + 1}: Blackjack!`);
      } else if (playerScore > 21) {
        newLosses++;
        roundResults.push(`Hand ${index + 1}: Bust`);
      } else if (dealerScore > 21) {
        totalWinnings += singleBetAmount * 2;
        newWins++;
        roundResults.push(`Hand ${index + 1}: Wins`);
      } else if (playerScore === dealerScore) {
        totalWinnings += singleBetAmount;
        roundResults.push(`Hand ${index + 1}: Push`);
      } else if (playerScore > dealerScore) {
        totalWinnings += singleBetAmount * 2;
        newWins++;
        roundResults.push(`Hand ${index + 1}: Wins`);
      } else {
        newLosses++;
        roundResults.push(`Hand ${index + 1}: Loses`);
      }
    });

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

    const historyEntry = {
      id: gameId,
      winner: finalResult,
      playerHands: playerHands,
      dealerScore,
      dealerHand,
      bet: currentBet,
      wallet: finalWallet
    };
    setGameHistory(prev => [historyEntry, ...prev].slice(0, 10));

    const gameApiPayload = {
      gameId: gameId,
      timestamp: new Date().toISOString(),
      result: finalResult,
      betAmount: currentBet,
      netWinnings: netWinLoss,
      playerWallet_start: wallet,
      playerWallet_end: finalWallet,
      playerHands: playerHands.map((hand, index) => ({
        hand: hand,
        score: playerScores[index],
        cardCount: hand.length
      })),
      dealerHand: {
        hand: dealerHand,
        score: dealerScore,
        cardCount: dealerHand.length
      }
    };

    // --- BATCHING LOGIC ---
    // Add the new game data to the buffer instead of sending it immediately
    setGameDataBuffer(prev => [...prev, gameApiPayload]);

    setIsGameResolved(true);
  }, [gameState, isGameResolved, playerScores, dealerScore, playerHands, currentBet, wallet, totalMoneyLost, totalMoneyWon]);

  // --- BATCHING LOGIC START ---
  // Effect to send data when the buffer is full
  React.useEffect(() => {
    if (gameDataBuffer.length >= 10) {
      saveThingsToDatabase('postBlackjackGames', gameDataBuffer);
      setGameDataBuffer([]); // Clear the buffer after sending
    }
  }, [gameDataBuffer]);
  // --- BATCHING LOGIC END ---

  // Continuous Play Controller
  React.useEffect(() => {
    if (gameState === 'end' && isPlaying) {
      const timer = setTimeout(startNewGame, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isPlaying, wallet]);

  return (






    <div className="bg-gray-800 flex flex-col items-center justify-center p-2 text-white font-sans min-h-screen">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-yellow-300 drop-shadow-lg mb-2">AI Blackjack</h1>
        <Scoreboard wins={wins} losses={losses} totalLost={totalMoneyLost} totalWon={totalMoneyWon} wallet={wallet} currentBet={currentBet} />

        <div className="bg-green-800 border-4 border-yellow-700 rounded-full p-2 md:p-4 shadow-xl">
          <Hand
            title="Dealer's Hand"
            cards={dealerHand}
            score={gameState === 'dealer' || gameState === 'end' ? dealerScore : dealerVisibleScore}
            isDealer={true}
            hideFirstCard={gameState !== 'dealer' && gameState !== 'end'}
          />

          <BettingInfo wallet={wallet} bet={currentBet} />
          <GameStatus status={status} />

          <div className="flex justify-center items-start">
            {playerHands.map((hand, index) => (
              <Hand
                key={index}
                title={`Player Hand ${index + 1}`}
                cards={hand}
                score={playerScores[index]}
                isActive={gameState === 'player' && index === activeHandIndex}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={toggleAutoPlay}
            className={`px-6 py-3 font-bold text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${isPlaying ? 'bg-red-600 text-white' : 'bg-green-500 text-gray-900'}`}
          >
            {isPlaying ? 'Stop Auto-Play' : 'Start Auto-Play'}
          </button>

          <button
            onClick={resetGame}
            className="px-6 py-3 bg-yellow-500 text-gray-900 font-bold text-lg rounded-lg shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
          >
            Reset Game
          </button>
        </div>
        <GameHistory history={gameHistory} />
      </div>
    </div>
  );
}

