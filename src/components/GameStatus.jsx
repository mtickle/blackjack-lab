const GameStatus = ({ status }) => {
    let bgColor = 'bg-gray-700';
    if (status.includes('Win') || status.includes('Blackjack')) bgColor = 'bg-green-600';
    if (status.includes('Bust') || status.includes('Lose')) bgColor = 'bg-red-600';
    if (status.includes('Push')) bgColor = 'bg-blue-600';

    return (
        <div className="flex justify-center my-2">
            <div className={`text-center text-lg font-bold px-4 py-2 rounded-lg shadow-md transition-colors duration-500 ${bgColor}`}>
                {status}
            </div>
        </div>
    );
};
export default GameStatus;