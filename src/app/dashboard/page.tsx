"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { useDashboard } from "@/hooks/useDashboard";

import StatsGrid from "@/components/dashboard/StatsGrid";
import TabNavigation from "@/components/dashboard/TabNavigation";
import AddPlayerForm from "@/components/dashboard/AddPlayerForm";
import AddGameForm from "@/components/dashboard/AddGameForm";
import PlayersTable from "@/components/dashboard/PlayersTable";
import GamesList from "@/components/dashboard/GamesList";

import { getGames } from "@/server/games";

import SimpleDialog from "@/components/SimpleDialog";

function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-xl bg-cyan-900/10 border border-cyan-500/10 ${className}`} />;
}

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
    actionError,
    setActionError,
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
    handleDeleteTournamentData,
    handleAbsentPlayer,
  } = useDashboard();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteTournamentDialog, setShowDeleteTournamentDialog] = useState(false);

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

  const latestRound = games.length > 0 ? Math.max(...games.map((game) => game.round)) : null;
  const removeRoundLabel = latestRound ? `Remove Round ${latestRound}` : "Remove Last Round";
  const removeDisabled = latestRound === null;

  return (
    <div className="relative min-h-screen font-sans">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
            <Image
                src="/images/backgrounds/background.svg"
                alt="Background"
                fill
                priority
                className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#03081c]/60" />
        </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10">
        {loading ? (
          <div className="space-y-8 animate-fade-in-up mt-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
        <StatsGrid stats={stats} />

        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onGenerateRound={() => setShowGenerateDialog(true)}
          onStartRound={() => setShowStartDialog(true)}
          onRemoveLastRound={() => {
            if (!removeDisabled) {
              setShowRemoveDialog(true);
            }
          }}
          removeRoundLabel={removeRoundLabel}
          generateDisabled={hasPendingRound}
          startDisabled={!hasPendingRound}
          removeDisabled={removeDisabled}
        />

        {actionError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <div className="flex items-start justify-between gap-3">
              <p>{actionError}</p>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="shrink-0 rounded-md border border-red-400/40 px-2 py-1 text-xs font-semibold text-red-100 hover:bg-red-500/20"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <SimpleDialog
          isOpen={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          onConfirm={async () => {
            const success = await handleGenerateRound();
            if (success) {
              await refreshGames();
            }
            return success;
          }}
          title="Generate New Round?"
          description="This will create pairings for the next round. You can review them before starting the round."
          confirmText="Generate"
          confirmColor="bg-cyan-500 hover:bg-cyan-400 text-[#050d1e]"
        />

        <SimpleDialog
          isOpen={showStartDialog}
          onClose={() => setShowStartDialog(false)}
          onConfirm={async () => {
            const success = await handleStartRound();
            if (success) {
              await refreshGames();
            }
            return success;
          }}
          title="Start Round?"
          description="This will officially start the round for result entry."
          confirmText="Start Round"
          confirmColor="bg-cyan-500 hover:bg-cyan-400 text-[#050d1e]"
        />

        <SimpleDialog
          isOpen={showRemoveDialog && !removeDisabled}
          onClose={() => setShowRemoveDialog(false)}
          onConfirm={async () => {
            const success = await handleRemoveLastRound();
            if (success) {
              await refreshGames();
            }
            return success;
          }}
          title={latestRound ? `Remove Round ${latestRound}?` : "Remove Last Round?"}
          description={
            latestRound
              ? `This will delete all games from round ${latestRound}. This action cannot be undone.`
              : "This will delete the entire latest round. This action cannot be undone."
          }
          confirmText="Remove"
          confirmColor="bg-red-500 hover:bg-red-400 text-white"
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
              onResetScores={() => setShowResetDialog(true)}
              onDeleteTournament={() => setShowDeleteTournamentDialog(true)}
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

        <SimpleDialog
          isOpen={showResetDialog}
          onClose={() => setShowResetDialog(false)}
          onConfirm={async () => {
            const success = await handleResetAllPlayers();
            if (success) {
              await refreshGames();
            }
            return success;
          }}
          title="Reset Scores?"
          description="This will clear all rounds and scores, but keep players in the roster."
          confirmText="Reset Scores"
          confirmColor="bg-amber-500 hover:bg-amber-400 text-black"
        />

        <SimpleDialog
          isOpen={showDeleteTournamentDialog}
          onClose={() => setShowDeleteTournamentDialog(false)}
          onConfirm={async () => {
            const success = await handleDeleteTournamentData();
            if (success) {
              await refreshGames();
            }
            return success;
          }}
          title="Delete Tournament Data?"
          description="This will permanently delete all players, rounds, and scores. This action cannot be undone."
          confirmText="Delete Everything"
          confirmColor="bg-red-500 hover:bg-red-400 text-white"
        />
          </div>
        )}
      </main>
    </div>
  );
}
