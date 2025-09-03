export default function Card({ suit, rank, isHidden, small = false }) {
  const isRed = suit === '♥' || suit === '♦';

  if (small) {
    return <span className={`font-bold ${isRed ? 'text-red-500' : 'text-gray-200'}`}>{rank}{suit}</span>;
  }

  if (isHidden) {
    return <div className="w-20 h-28 md:w-24 md:h-36 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-white shadow-lg mx-1"></div>;
  }
  return (
    <div className={`w-20 h-28 md:w-24 md:h-36 rounded-lg bg-white flex flex-col justify-between p-1 shadow-lg mx-1 transition-transform duration-300 transform hover:scale-105 ${isRed ? 'text-red-600' : 'text-black'}`}>
      <div className="text-left text-xl font-bold">
        <div>{rank}</div>
        <div>{suit}</div>
      </div>
      <div className="text-right text-xl font-bold transform rotate-180">
        <div>{rank}</div>
        <div>{suit}</div>
      </div>
    </div>
  );
};