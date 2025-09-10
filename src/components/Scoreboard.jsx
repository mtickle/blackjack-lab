const Scoreboard = ({ wins, losses, totalLost, totalWon, wallet, currentBet }) => (


    <div className="flex flex-col gap-3 text-md font-semibold">
        <div className=" px-3 py-1 rounded-lg border border-gray-700 bg-slate-200">
            <span className="">Wallet:</span>
            <span className="ml-2">${wallet}</span>
        </div>
        <div className="px-3 py-1 rounded-lg border border-gray-700 bg-slate-200">
            <span className="">Current Bet:</span>
            <span className="ml-2">${currentBet}</span>
        </div>
        <hr></hr>
        <div className=" px-3 py-1 rounded-lg border border-gray-700">
            <span className="">Wins:</span>
            <span className="ml-2">{wins}</span>
        </div>
        <div className=" px-3 py-1 rounded-lg border border-gray-700">
            <span className="">Losses:</span>
            <span className="ml-2 ">{losses}</span>
        </div>
        <hr></hr>
        <div className=" px-3 py-1 rounded-lg border border-gray-700">
            <span className="">Total Lost:</span>
            <span className="ml-2">${totalLost}</span>
        </div>
        <div className=" px-3 py-1 rounded-lg border border-gray-700">
            <span className="">Total Won:</span>
            <span className="ml-2 ">${totalWon}</span>
        </div>

    </div>
);


export default Scoreboard;