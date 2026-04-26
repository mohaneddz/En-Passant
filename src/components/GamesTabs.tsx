"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords, ChevronLeft, ChevronRight } from "lucide-react";
import GameCard from "@/components/GameCard";
import type { Game } from "@/types/game";

import { getPlayerNameById } from "@/server/games";

interface Round {
    id: string;
    label: string;
    status: string;
    games: Game[];
}

export default function GamesTabs({ allRounds }: { allRounds: Round[] }) {
    const itemsPerPage = 3;

    // Initialize to show the last page
    const [startIndex, setStartIndex] = useState(() => {
        if (allRounds.length <= itemsPerPage) return 0;
        return Math.floor((allRounds.length - 1) / itemsPerPage) * itemsPerPage;
    });

    const visibleRounds = useMemo(() =>
        allRounds.slice(startIndex, startIndex + itemsPerPage),
        [allRounds, startIndex]
    );

    // Initialize active tab
    const [activeTab, setActiveTab] = useState(() => {
        if (visibleRounds.length === 0) return "";
        return visibleRounds.find(r => r.status === 'In progress')?.id || visibleRounds[0]?.id || "";
    });

    // Update active tab when page changes if current active tab is no longer visible
    useEffect(() => {
        if (visibleRounds.length === 0) return;

        const isCurrentActiveVisible = visibleRounds.some(r => r.id === activeTab);
        if (!isCurrentActiveVisible) {
            const newActive = visibleRounds.find(r => r.status === 'In progress')?.id || visibleRounds[0].id;
            setActiveTab(newActive);
        }
    }, [visibleRounds, activeTab]);

    const hasPrev = startIndex > 0;
    const hasNext = startIndex + itemsPerPage < allRounds.length;

    const handlePrev = () => {
        setStartIndex(prev => Math.max(0, prev - itemsPerPage));
    };

    const handleNext = () => {
        setStartIndex(prev => prev + itemsPerPage);
    };

    const getGridColsClass = (count: number) => {
        switch (count) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            default: return 'grid-cols-3';
        }
    };

    if (allRounds.length === 0) {
        return <div className="text-center text-cyan-500/50 font-bold py-20">No games scheduled yet.</div>;
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in-up">
            <div className="flex items-center gap-3 mb-10">
                <button
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 disabled:opacity-30 hover:bg-cyan-500/20 hover:text-white transition-all duration-300"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <TabsList className={`flex-1 bg-[#050d1e]/80 border border-cyan-500/20 p-1.5 h-auto rounded-xl grid ${getGridColsClass(visibleRounds.length)} backdrop-blur-md`}>
                    {visibleRounds.map((round) => (
                        <TabsTrigger
                            key={round.id}
                            value={round.id}
                            className="py-3.5 text-sm font-bold tracking-widest uppercase rounded-lg transition-all 
                                      data-[state=active]:text-[#050d1e] data-[state=active]:bg-[#00e5ff] 
                                      data-[state=active]:shadow-[0_0_20px_rgba(0,229,255,0.4)]
                                      text-cyan-500/60 hover:text-cyan-300"
                        >
                            {round.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 disabled:opacity-30 hover:bg-cyan-500/20 hover:text-white transition-all duration-300"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {visibleRounds.map((round) => (
                <TabsContent key={round.id} value={round.id} className="space-y-8 outline-none">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <Swords className="w-5 h-5 text-[#00e5ff]" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter uppercase text-white">{round.label}</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                        {round.games.map((game: Game, index: number) => (
                            <GameCard
                                key={index}
                                gameNumber={index + 1}
                                whitePlayer={getPlayerNameById(game.white)}
                                blackPlayer={getPlayerNameById(game.black)}
                                status={game.status}
                                presence={game.presence}
                            />
                        ))}
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
}
