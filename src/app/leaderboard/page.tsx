import { CrownIcon } from "@/components/CrownIcon";
import { MedalIcon } from "@/components/MedalIcon";
import { players } from "@/data/players";

export default function page() {
  return (
    <div className="min-h-screen text-white p-10 font-sans flex flex-col items-center">
      
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-20">
        <CrownIcon className="w-16 h-16 text-[#fbbf24] mb-2" />
        <h1 className="text-5xl font-bold tracking-widest uppercase">Leaderboard</h1>
        <p className="text-[#fbbf24] text-sm font-semibold tracking-widest uppercase">Leaderboard</p>
      </div>

      {/* Table Container */}
      <div className="w-full max-w-5xl bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden shadow-2xl">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-[#333] text-[#fbbf24] font-semibold text-lg">
          <div className="col-span-2 flex justify-center">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2 text-center">Points</div>
          <div className="col-span-1 text-center">Wins</div>
          <div className="col-span-2 text-center">Draws</div>
          <div className="col-span-1 text-center">Losses</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#2a2a2a]">
          {players.map((player) => (
            <div 
              key={player.rank} 
              className={`grid grid-cols-12 gap-4 p-5 items-center text-lg hover:bg-[#252525] transition-colors ${player.rank <= 3 ? 'bg-[#1e1e1e]' : ''}`}
            >
              {/* Rank */}
              <div className="col-span-2 flex justify-center">
                {player.rank <= 3 ? (
                  <MedalIcon rank={player.rank} />
                ) : (
                  <span className="font-bold text-white w-8 text-center">{player.rank}</span>
                )}
              </div>

              {/* Player Name */}
              <div className="col-span-4 text-gray-200 font-medium">
                {player.name}
              </div>

              {/* Stats */}
              <div className="col-span-2 text-center font-bold text-[#fbbf24]">
                {player.points}
              </div>
              <div className="col-span-1 text-center font-bold text-green-500">
                {player.wins}
              </div>
              <div className="col-span-2 text-center font-bold text-orange-300">
                {player.draws}
              </div>
              <div className="col-span-1 text-center font-bold text-red-500">
                {player.losses}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
