const BettingInfo = ({ wallet, bet }) => (
    <div className="flex justify-around items-center text-center my-2 text-md md:text-lg font-semibold">
        <div className="bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
            <span className="text-yellow-300">Wallet:</span>
            <span className="ml-2 text-white">${wallet}</span>
        </div>
        <div className="bg-gray-900 bg-opacity-50 px-3 py-1 rounded-lg">
            <span className="text-yellow-300">Current Bet:</span>
            <span className="ml-2 text-white">${bet > 0 ? bet : '--'}</span>
        </div>
    </div>
);
export default BettingInfo;