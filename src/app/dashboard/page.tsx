"use client";

import { useEffect, useState } from "react";

import { useDashboard } from "@/hooks/useDashboard";

import Header from "@/components/dashboard/Header";
import StatsGrid from "@/components/dashboard/StatsGrid";
import TabNavigation from "@/components/dashboard/TabNavigation";
import AddPlayerForm from "@/components/dashboard/AddPlayerForm";
import AddGameForm from "@/components/dashboard/AddGameForm";
import PlayersTable from "@/components/dashboard/PlayersTable";
import GamesList from "@/components/dashboard/GamesList";

import { getGames } from "@/server/games";

import SimpleDialog from "@/components/SimpleDialog";

export default function ChessDashboard() {
  const {
    activeTab,
    setActiveTab,
    players,
    loading,
    showGenerateDialog,
    setShowGenerateDialog,
    showStartDialog,
    setShowStartDialog,
    showRemoveDialog,
    setShowRemoveDialog,
    hasPendingRound,
    gamesListRef,
    stats,
    handleAddPlayer,
    handleImportPlayers,
    handleAddGame,
    handleDeletePlayer,
    handleGenerateRound,
    handleStartRound,
    handleRemoveLastRound,
    fetchPlayers,
    fetchStats,
    fetchRounds,
    handleRestorePlayer,
    handleResetAllPlayers,
    handleAbsentPlayer,
  } = useDashboard();

  const [games, setGames] = useState<
    Array<{
      id: number;
      white: number;
      black: number;
      status: "PENDING" | "DRAW" | "WHITE_WINS" | "BLACK_WINS";
      presence: number;
      round: number;
    }>
  >([]);

  const refreshGames = async () => {
    const data = await getGames();
    setGames(data);
  };

  useEffect(() => {
    refreshGames();
  }, []);

  return (
    <div className="min-h-screen bg-[#111]">
      <Header />

      <main className="max-w-7xl mx-auto px-8 py-10">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="h-24 animate-pulse rounded-lg bg-[#2a2a2a]" />
              <div className="h-24 animate-pulse rounded-lg bg-[#2a2a2a]" />
              <div className="h-24 animate-pulse rounded-lg bg-[#2a2a2a]" />
              <div className="h-24 animate-pulse rounded-lg bg-[#2a2a2a]" />
            </div>
            <div className="h-14 animate-pulse rounded-lg bg-[#2a2a2a]" />
            <div className="h-20 animate-pulse rounded-lg bg-[#2a2a2a]" />
            <div className="h-20 animate-pulse rounded-lg bg-[#2a2a2a]" />
            <div className="h-20 animate-pulse rounded-lg bg-[#2a2a2a]" />
          </div>
        ) : (
          <>
        <StatsGrid stats={stats} />

        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onGenerateRound={() => setShowGenerateDialog(true)}
          onStartRound={() => setShowStartDialog(true)}
          onRemoveLastRound={() => setShowRemoveDialog(true)}
          generateDisabled={hasPendingRound}
          startDisabled={!hasPendingRound}
        />

        <SimpleDialog
          isOpen={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          onConfirm={async () => {
            await handleGenerateRound();
            await refreshGames();
          }}
          title="Generate New Round?"
          description="This will create pairings for the next round. You can review them before starting the round."
          confirmText="Generate"
          confirmColor="bg-[#fbbf24] hover:bg-[#fbbf24]/90"
        />

        <SimpleDialog
          isOpen={showStartDialog}
          onClose={() => setShowStartDialog(false)}
          onConfirm={async () => {
            await handleStartRound();
            await refreshGames();
          }}
          title="Start Round?"
          description="This will officially start the round for result entry."
          confirmText="Start Round"
          confirmColor="bg-green-600 hover:bg-green-700"
        />

        <SimpleDialog
          isOpen={showRemoveDialog}
          onClose={() => setShowRemoveDialog(false)}
          onConfirm={async () => {
            await handleRemoveLastRound();
            await refreshGames();
          }}
          title="Remove Last Round?"
          description="This will delete the entire latest round. This action cannot be undone."
          confirmText="Remove"
          confirmColor="bg-red-600 hover:bg-red-700"
        />

        {activeTab === "players" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AddPlayerForm
              onAddPlayer={handleAddPlayer}
              onImportPlayers={handleImportPlayers}
            />
            <PlayersTable
              players={players}
              onDelete={handleDeletePlayer}
              onRefresh={fetchPlayers}
              onRestore={handleRestorePlayer}
              onReset={handleResetAllPlayers}
              onAbsent={handleAbsentPlayer}
            />
          </div>
        )}

        {activeTab === "games" && (
          <div className="space-y-4">
            <AddGameForm
              players={players}
              onAddGame={async (game) => {
                await handleAddGame(game);
                await refreshGames();
              }}
            />
            <GamesList
              ref={gamesListRef}
              games={games}
              onGameUpdate={async () => {
                await Promise.all([fetchStats(), fetchRounds(), refreshGames()]);
              }}
            />
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}
