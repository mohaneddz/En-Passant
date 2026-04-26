"use client";
import { CrownIcon } from "@/components/CrownIcon";
import { MedalIcon } from "@/components/MedalIcon";
import { getLeaderboard } from "@/server/leaderboard";
import { useEffect, useState } from "react";
import Image from "next/image";

import type { Player } from "@/types/player";

export default function LeaderboardPage() {

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getLeaderboard();
        // Sort by score descending, then Buchholz (tiebreaker), then rating
        const sorted = data.sort((a, b) => {
          if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
          if ((b.buchholz || 0) !== (a.buchholz || 0)) return (b.buchholz || 0) - (a.buchholz || 0);
          return (b.rating || 0) - (a.rating || 0);
        });
        // Assign rank
        const ranked = sorted.map((p, i) => ({ ...p, rank: i + 1 }));
        setPlayers(ranked);
      } catch (err) {
        console.error(err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen px-4 md:px-10 py-10 text-white flex flex-col items-center">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/backgrounds/background.svg"
            alt="Background"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#03081c]/60" />
        </div>

        <div className="mx-auto max-w-5xl w-full space-y-8 animate-pulse">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-cyan-900/30 border border-cyan-500/20" />
            <div className="mx-auto h-12 w-64 md:w-96 rounded-lg bg-cyan-900/30 border border-cyan-500/20" />
            <div className="mx-auto h-4 w-40 rounded-full bg-cyan-900/20" />
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-[#050d1e]/80 backdrop-blur-xl p-1 overflow-hidden">
            <div className="h-14 bg-cyan-900/40 border-b border-cyan-500/20 w-full" />
            <div className="divide-y divide-cyan-500/10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 w-full bg-transparent p-4 flex items-center justify-between">
                    <div className="h-8 w-12 rounded bg-cyan-900/20" />
                    <div className="h-8 w-48 rounded bg-cyan-900/20" />
                    <div className="h-8 w-24 rounded bg-cyan-900/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white px-4 md:p-10 font-sans flex flex-col items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/backgrounds/background.svg"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#03081c]/60" />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-16 animate-fade-in-up mt-10 md:mt-0">
        <div className="relative mb-4">
          <CrownIcon className="w-16 h-16 text-[#00e5ff] drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
          <div className="absolute -inset-4 bg-[#00e5ff]/20 blur-2xl rounded-full -z-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Leaderboard
        </h1>
        <p className="text-[#00e5ff] text-sm font-bold tracking-[0.2em] uppercase">Our Top Players</p>
        <div className="h-1 w-12 bg-[#00e5ff] mt-4 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
      </div>

      {/* Table Container */}
      <div className="w-full max-w-5xl bg-[#050d1e]/80 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-fade-in-up">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-cyan-500/20 text-[#00e5ff] font-bold text-sm tracking-[0.1em] uppercase bg-cyan-500/5">
          <div className="col-span-2 flex justify-center">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2 text-center">Points</div>
          <div className="col-span-1 text-center hidden md:block">Wins</div>
          <div className="col-span-2 text-center hidden md:block">Draws</div>
          <div className="col-span-1 text-center hidden md:block">Losses</div>
          <div className="col-span-4 md:hidden text-center">W / D / L</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-cyan-500/10">
          {players.map((player) => {
            const rank = player.rank ?? 0;
            return (
            <div
              key={player.id}
              className={`grid grid-cols-12 gap-4 p-5 items-center text-lg hover:bg-cyan-500/5 transition-all duration-300 ${rank <= 3 ? 'bg-cyan-500/5' : ''}`}
            >
              {/* Rank */}
              <div className="col-span-2 flex justify-center scale-90 md:scale-100">
                {rank <= 3 ? (
                  <MedalIcon rank={rank} />
                ) : (
                  <span className="font-bold text-gray-400 w-8 text-center">{rank}</span>
                )}
              </div>

              {/* Player Name */}
              <div className="col-span-4 text-white font-bold tracking-tight">
                {player.name}
              </div>

              {/* Stats */}
              <div className="col-span-2 text-center font-black text-white text-xl md:text-2xl italic tracking-tighter">
                {player.score}
              </div>
              
              {/* Desktop view */}
              <div className="col-span-1 text-center font-bold text-cyan-400 hidden md:block text-shadow-glow">
                {player.wins + player.byes}
              </div>
              <div className="col-span-2 text-center font-bold text-gray-400 hidden md:block">
                {player.draws}
              </div>
              <div className="col-span-1 text-center font-bold text-red-400 hidden md:block">
                {player.losses}
              </div>

              {/* Mobile view */}
              <div className="col-span-4 md:hidden text-center text-sm font-bold">
                 <span className="text-cyan-400">{player.wins + player.byes}</span>
                 <span className="text-gray-600 mx-1">/</span>
                 <span className="text-gray-400">{player.draws}</span>
                 <span className="text-gray-600 mx-1">/</span>
                 <span className="text-red-400">{player.losses}</span>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}
