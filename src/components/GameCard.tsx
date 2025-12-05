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

    // console.log('Rendering GameCard with status:', status);
    
    let displayStatus = status;
    let statusColor = getColor(status);

    if (presence === 1) {
        displayStatus = "BYE";
        statusColor = "bg-[#FCD34D] text-black";
    } else if (presence === 0) {
        displayStatus = "NO SHOW";
        statusColor = "bg-red-900 text-white";
    }

    return (
        <div className="bg-[#1A1A1A] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between border border-white/5 gap-4">
            <div className="font-bold text-xs text-gray-500 w-24 text-center md:text-left">Game {gameNumber}</div>

            <div className="flex-1 flex items-center justify-center gap-8 md:gap-16 w-full md:w-auto">
                <div className="text-right flex-1">
                    <div className="font-bold text-sm md:text-md truncate">{white}</div>
                    <div className="text-gray-500 text-sm">White</div>
                </div>

                <div className="text-[#FCD34D] font-bold text-2xl">VS</div>

                <div className="text-left flex-1">
                    <div className="font-bold text-sm md:text-md truncate">{black}</div>
                    <div className="text-gray-500 text-sm">Black</div>
                </div>
            </div>

            <div className="w-24 flex justify-center md:justify-end">
                <span className={`px-4 py-1.5 rounded-full text-xs text-nowrap font-bold capitalize ${statusColor}`}>
                    {displayStatus.replace('_', ' ')}
                </span>
            </div>
        </div>
    );
}


function getColor(status: string) {
    const s = status;
    if (s === "WHITE_WINS") return "bg-white text-black";
    if (s === "BLACK_WINS") return "bg-black text-white";
    if (s === "DRAW" || s === "PENDING") return "bg-gray-700 text-white";
    if (s === "BYE") return "bg-blue-600 text-white";
    return "bg-[#FCD34D] text-black";
}