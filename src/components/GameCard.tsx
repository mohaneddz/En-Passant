export default function GameCard({ gameNumber, whitePlayer, blackPlayer, status, statusColor = "yellow"
}: {
    gameNumber: number; whitePlayer: string; blackPlayer: string; status: string; statusColor?: "yellow" | "green" | "gray";
}) {
    return (
        <div className="bg-[#1A1A1A] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between border border-white/5 gap-4">
            <div className="font-bold text-lg w-24 text-center md:text-left">Game {gameNumber}</div>

            <div className="flex-1 flex items-center justify-center gap-8 md:gap-16 w-full md:w-auto">
                <div className="text-right flex-1">
                    <div className="font-bold text-lg md:text-xl">{whitePlayer}</div>
                    <div className="text-gray-500 text-sm">White</div>
                </div>

                <div className="text-[#FCD34D] font-bold text-2xl">VS</div>

                <div className="text-left flex-1">
                    <div className="font-bold text-lg md:text-xl">{blackPlayer}</div>
                    <div className="text-gray-500 text-sm">Black</div>
                </div>
            </div>

            <div className="w-24 flex justify-center md:justify-end">
                <span className={`px-4 py-1.5 rounded-full text-xs text-nowrap font-bold capitalize ${statusColor === "green"
                    ? "bg-green-600 text-white"
                    : statusColor === "gray"
                        ? "bg-gray-700 text-white"
                        : "bg-[#FCD34D] text-black"
                    }`}>
                    {status}
                </span>
            </div>
        </div>
    );
}
