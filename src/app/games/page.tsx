import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords } from "lucide-react";
import GameCard from "@/components/GameCard";
import { roundsData } from "@/data/rounds";

export default function Page() {
    return (
        <div className="min-h-screen text-white p-10 font-sans">

            <div className="max-w-4xl mx-auto">
                {/* Header */}

                <div className="flex flex-col items-center gap-2 mb-20">
                    <Swords className="w-16 h-16 text-[#FCD34D] mb-2" />
                    <h1 className="text-5xl font-bold tracking-widest uppercase">Games & Matches</h1>
                    <p className="text-[#fbbf24] text-sm font-semibold tracking-widest uppercase">Plans & Results</p>
                </div>

                <Tabs defaultValue="round2" className="w-full">
                    <TabsList className="w-full bg-[#1A1A1A] p-1 h-auto rounded-lg grid grid-cols-3 mb-8">
                        {roundsData.map((round) => (
                            <TabsTrigger
                                key={round.id}
                                value={round.id}
                                className="py-3 text-base rounded-md transition-all data-[state=active]:text-black"
                                activeClassName="bg-[#FCD34D]"
                            >
                                {round.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {roundsData.map((round) => (
                        <TabsContent key={round.id} value={round.id} className="space-y-6">
                            <div className="flex items-center gap-2 text-gray-400 mb-6">
                                <Swords className="w-5 h-5 text-[#FCD34D]" />
                                <span className="font-bold text-white">{round.label}</span>
                                <span className="text-gray-600">•</span>
                                <span>{round.status}</span>
                            </div>

                            <div className="space-y-4">
                                {round.games.map((game, index) => (
                                    <GameCard
                                        key={index}
                                        gameNumber={game.gameNumber}
                                        whitePlayer={game.whitePlayer}
                                        blackPlayer={game.blackPlayer}
                                        status={game.status}
                                        statusColor={game.statusColor}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}