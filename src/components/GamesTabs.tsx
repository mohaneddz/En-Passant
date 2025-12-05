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
        return visibleRounds.find(r => r.status === 'In progress')?.id || visibleRounds[0].id;
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
        return <div className="text-center text-gray-400">No games so far :D</div>;
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center gap-2 mb-8">
                <button
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    className="p-2 rounded-lg bg-[#1A1A1A] text-white disabled:opacity-30 hover:bg-[#2A2A2A] transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <TabsList className={`flex-1 bg-[#1A1A1A] p-1 h-auto rounded-lg grid ${getGridColsClass(visibleRounds.length)}`}>
                    {visibleRounds.map((round) => (
                        <TabsTrigger
                            key={round.id}
                            value={round.id}
                            className="py-3 text-base rounded-md transition-all data-[state=active]:text-black data-[state=active]:bg-[#FCD34D]"
                        >
                            {round.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className="p-2 rounded-lg bg-[#1A1A1A] text-white disabled:opacity-30 hover:bg-[#2A2A2A] transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {visibleRounds.map((round) => (
                <TabsContent key={round.id} value={round.id} className="space-y-6">
                    <div className="flex items-center gap-2 text-gray-400 mb-6">
                        <Swords className="w-5 h-5 text-[#FCD34D]" />
                        <span className="font-bold text-white">{round.label}</span>
                    </div>

                    <div className="space-y-4">
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
