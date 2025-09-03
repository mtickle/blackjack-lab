import Card from '@components/Card';

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


const GameHistory = ({ history }) => (
    <div className="mt-4 w-full max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-yellow-200 text-center mb-2">Game History</h3>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-2 max-h-48 overflow-y-auto">
            {history.length === 0 ? <p className="text-center text-gray-400">No games played yet.</p> :
                history.map((game, index) => {
                    let resultColor = 'text-blue-400';
                    if (game.winner === 'Player') resultColor = 'text-green-400';
                    if (game.winner === 'Dealer') resultColor = 'text-red-400';
                    return (
                        <div key={game.id} className={`flex justify-between items-start p-2 text-sm ${index > 0 ? 'border-t border-gray-700' : ''}`}>
                            <div className={`${resultColor} font-bold w-1/4`}>{game.winner}</div>
                            <div className="w-1/2">
                                {game.playerHands.map((hand, i) => (
                                    <p key={i}>Hand {i + 1} ({hand.length} cards): ({calculateScore(hand)}) {hand.map((c, j) => <Card key={j} {...c} small />)}</p>
                                ))}
                                <p>Dealer ({game.dealerHand.length} cards): ({game.dealerScore}) {game.dealerHand.map((c, i) => <Card key={i} {...c} small />)}</p>
                            </div>
                            <div className="w-1/4 text-right">
                                <div>Bet: ${game.bet}</div>
                                <div className="font-semibold text-yellow-300">Wallet: ${game.wallet}</div>
                            </div>
                        </div>
                    );
                })
            }
        </div>
    </div>
);

export default GameHistory;