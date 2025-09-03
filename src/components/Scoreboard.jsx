const Scoreboard = ({ wins, losses, totalLost, totalWon, wallet, currentBet }) => (
    <div className="flex flex-wrap justify-center gap-4 items-center text-center mt-2 text-md md:text-lg font-semibold">
        <div className="bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
            <span className="text-green-400">Wins:</span>
            <span className="ml-2 text-white">{wins}</span>
        </div>
        <div className="bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
            <span className="text-red-400">Losses:</span>
            <span className="ml-2 text-white">{losses}</span>
        </div>
        <div className="bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
            <span className="text-orange-400">Total Lost:</span>
            <span className="ml-2 text-white">${totalLost}</span>
        </div>
        <div className="bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
            <span className="text-teal-400">Total Won:</span>
            <span className="ml-2 text-white">${totalWon}</span>
        </div>
        <div className="bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
            <span className="text-teal-400">Wallet:</span>
            <span className="ml-2 text-white">${wallet}</span>
        </div>
        <div className="bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
            <span className="text-teal-400">Current Bet:</span>
            <span className="ml-2 text-white">${currentBet}</span>
        </div>
    </div>
);


export default Scoreboard;