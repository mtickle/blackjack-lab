import Card from '@components/Card';

export default function Hand({ title, cards, score, isDealer, hideFirstCard, isActive = false }) {

    return (
        <div className={`my-2 rounded-lg ${isActive ? 'border-2 border-yellow-400 shadow-lg' : ''}`}>
            <h3 class="font-semibold text-gray-800 text-left mb-2">{title} ({cards.length} cards) - Score: {score > 0 ? score : ''}</h3>
            <div className="flex min-h-[120px] md:min-h-[150px]">
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