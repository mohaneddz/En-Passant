import { Swords } from "lucide-react";
import { getGames } from "@/server/games";
import GamesTabs from "@/components/GamesTabs";
import Image from "next/image";

export const dynamic = "force-dynamic";

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
        <div className="relative min-h-screen w-full flex flex-col items-center p-6 md:p-10 font-sans overflow-hidden">
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

            <div className="w-full max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center gap-2 mb-16 animate-fade-in-up">
                    <div className="relative mb-4">
                        <Swords className="w-16 h-16 text-[#00e5ff] drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
                        <div className="absolute -inset-4 bg-[#00e5ff]/20 blur-2xl rounded-full -z-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white" style={{ fontFamily: "var(--font-heading)" }}>
                        Games & Matches
                    </h1>
                    <p className="text-[#00e5ff] text-sm font-bold tracking-[0.2em] uppercase">
                        Plans & Results
                    </p>
                    <div className="h-1 w-12 bg-[#00e5ff] mt-4 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                </div>

                <GamesTabs allRounds={allRounds} />
            </div>
        </div>
    );
}
