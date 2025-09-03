import Card from '@components/Card';

export default function Hand({ title, cards, score, isDealer, hideFirstCard, isActive = false }) {

    return (
        <div className={`my-2 p-2 rounded-lg ${isActive ? 'border-2 border-yellow-400 shadow-lg' : ''}`}>
            <h2 className="text-lg md:text-xl font-bold text-yellow-200 mb-1 text-center">{title} ({cards.length} cards) - Score: {score > 0 ? score : ''}</h2>
            <div className="flex justify-center items-center min-h-[120px] md:min-h-[150px]">
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
    );
}