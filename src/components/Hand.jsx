import Card from '@components/Card';

export default function Hand({ title, cards, score, result, resultScore, isDealer, hideFirstCard, isActive = false }) {

    let panelTitle, panelScore, panelStyles;

    // If a final result is passed, the hand is over.
    console.log('Hand result:', result);
    if (result) {
        panelTitle = result.toUpperCase();
        panelScore = resultScore;

        // Use your existing helper to get styles for Win, Lose, etc.
        const getResultStyles = () => {
            switch (result) {
                case 'WIN':
                case 'Blackjack!':
                    return { container: 'bg-green-100 border-green-300', text: 'text-green-800' };
                case 'LOSE':
                case 'Bust':
                    return { container: 'bg-red-100 border-red-300', text: 'text-red-800' };
                case 'PUSH':
                    return { container: 'bg-gray-100 border-gray-300', text: 'text-gray-800' };
                default:
                    return { container: 'bg-gray-100 border-gray-300', text: 'text-gray-800' };
            }
        };
        panelStyles = getResultStyles();
    } else {
        // If there's no result, the hand is in progress.
        panelTitle = 'SCORE';
        panelScore = score;
        // Apply the neutral "in-progress" style.
        panelStyles = { container: 'bg-blue-100 border-blue-300', text: 'text-blue-800' };
    }

    return (
        <div className={`flex items-center gap-4 my-2 ${isActive ? 'outline outline-2 outline-yellow-400 rounded-lg' : ''}`}>

            {/* RESULT PANEL */}
            {/* This will now always show, displaying either the current score or the final result. */}
            <div className="flex-shrink-0 w-24 text-center">
                <div className={`p-2 rounded-lg border ${panelStyles.container}`}>
                    <h4 className={`font-bold text-lg ${panelStyles.text}`}>{panelTitle}</h4>
                    {/* Only render the score if it's greater than 0 */}
                    {panelScore > 0 && (
                        <p className={`text-3xl font-bold ${panelStyles.text}`}>{panelScore}</p>
                    )}
                </div>
            </div>

            {/* HAND DETAILS (Title and Cards) */}
            <div className="flex-grow">
                {/* Note: I removed the score from the title as it's now in the panel */}
                <h3 className="font-semibold text-gray-800 text-left mb-2">{title} ({cards.length} cards)</h3>
                <div className="flex flex-wrap min-h-[120px] md:min-h-[150px]">
                    {cards.map((card, index) => (
                        <Card
                            key={index}
                            suit={card.suit}
                            rank={card.rank}
                            isHidden={isDealer && index === 0 && hideFirstCard}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
