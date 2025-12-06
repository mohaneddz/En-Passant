import { Swords } from "lucide-react";
import { getGames } from "@/server/games";
import GamesTabs from "@/components/GamesTabs";

export default async function Page() {
    const games = await getGames();

    const roundsMap = new Map();
    games.forEach((game) => {
        const roundId = String(game.round);
        if (!roundsMap.has(roundId)) {
            roundsMap.set(roundId, {
                id: roundId,
                label: `Round ${roundId}`,
                status: 'Finished',
                games: []
            });
        }
        const round = roundsMap.get(roundId);
        round.games.push(game);

    });

    const allRounds = Array.from(roundsMap.values()).sort((a: any, b: any) => Number(a.id) - Number(b.id));

    return (
        <div className="min-h-screen text-white p-10 font-sans">

            <div className="max-w-4xl mx-auto">
                {/* Header */}

                <div className="flex flex-col items-center gap-2 mb-20">
                    <Swords className="w-16 h-16 text-[#FCD34D] mb-2" />
                    <h1 className="text-5xl font-bold tracking-widest uppercase">Games & Matches</h1>
                    <p className="text-[#fbbf24] text-sm font-semibold tracking-widest uppercase">Plans & Results</p>
                </div>

                <GamesTabs allRounds={allRounds} />
            </div>
        </div>
    );
}