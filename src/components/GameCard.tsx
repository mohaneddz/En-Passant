"use client";

import { useEffect, useState } from "react";

export default function GameCard({ gameNumber, whitePlayer, blackPlayer, status, presence
}: {
    gameNumber: number; whitePlayer: Promise<string>; blackPlayer: Promise<string>; status: string; presence: number;
}) {
    
    const [white, setWhite] = useState<string>("Loading...");
    const [black, setBlack] = useState<string>("Loading...");

    useEffect(() => {
        const resolvePlayers = async () => {
            setWhite(await whitePlayer);
            setBlack(await blackPlayer);
        };
        resolvePlayers();
    }, [whitePlayer, blackPlayer]);

    let displayStatus = status;
    let statusColor = getColor(status);

    if (presence === 1) {
        displayStatus = "BYE";
        statusColor = "bg-[#00e5ff] text-[#050d1e] shadow-[0_0_15px_rgba(0,229,255,0.4)]";
    } else if (presence === 0) {
        displayStatus = "NO SHOW";
        statusColor = "bg-red-500/80 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    }

    return (
        <div className="group bg-[#050d1e]/60 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-500 backdrop-blur-md relative overflow-hidden">
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 -z-10" />
            
            <div className="font-bold text-[10px] tracking-[0.2em] text-cyan-500/40 w-full md:w-24 text-center md:text-left mb-4 md:mb-0 uppercase">
                Match #{gameNumber.toString().padStart(2, '0')}
            </div>

            <div className="flex-1 flex items-center justify-center gap-6 md:gap-16 w-full md:w-auto">
                <div className="text-right flex-1 min-w-0">
                    <div className="font-black text-lg md:text-xl text-white truncate drop-shadow-sm">{white}</div>
                    <div className="text-cyan-500/50 text-[10px] font-bold tracking-widest uppercase mt-1">White</div>
                </div>

                <div className="text-[#00e5ff] font-black text-2xl italic tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">VS</div>

                <div className="text-left flex-1 min-w-0">
                    <div className="font-black text-lg md:text-xl text-white truncate drop-shadow-sm">{black}</div>
                    <div className="text-cyan-500/50 text-[10px] font-bold tracking-widest uppercase mt-1">Black</div>
                </div>
            </div>

            <div className="w-full md:w-32 flex justify-center md:justify-end mt-4 md:mt-0">
                <span className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${statusColor}`}>
                    {displayStatus.replace('_', ' ')}
                </span>
            </div>
        </div>
    );
}

function getColor(status: string) {
    const s = status;
    if (s === "WHITE_WINS") return "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]";
    if (s === "BLACK_WINS") return "bg-gray-400 text-black shadow-[0_0_15px_rgba(156,163,175,0.3)]";
    if (s === "DRAW") return "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30";
    if (s === "PENDING") return "bg-cyan-500/10 text-cyan-400/60 border border-cyan-500/20";
    if (s === "BYE") return "bg-[#00e5ff] text-[#050d1e]";
    return "bg-[#00e5ff] text-[#050d1e]";
}