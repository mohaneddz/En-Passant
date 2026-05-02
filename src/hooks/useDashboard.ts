import { useEffect, useRef, useState } from "react";
import {
  addPlayer,
  deleteTournamentData,
  deletePlayer,
  getPlayerById,
  getPlayers,
  markAbsent,
  markPresent,
  resetAllPlayers,
  restorePlayer,
} from "@/server/players";
import { getStats, StatsGridProps } from "@/server/stats";
import {
  addGame,
  generateScheduledRound,
  getGames,
  removeLastRound,
  startScheduledRound,
} from "@/server/games";
import { GamesListRef } from "@/components/dashboard/GamesList";
import { Player } from "@/types/player";

export const useDashboard = () => {
  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "string" && error.trim()) return error;
    if (error instanceof Error && error.message) return error.message;
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
    return fallback;
  };
  const [activeTab, setActiveTab] = useState("players");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [hasPendingRound, setHasPendingRound] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const gamesListRef = useRef<GamesListRef>(null);

  const [stats, setStats] = useState<StatsGridProps["stats"]>({
    totalPlayers: null,
    totalRounds: null,
    gamesPlayed: null,
    totalGames: null,
  });

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRounds = async () => {
    try {
      const games = await getGames();
      if (games.length === 0) {
        setHasPendingRound(false);
        return;
      }

      const lastRound = Math.max(...games.map((game) => game.round));
      const lastRoundGames = games.filter((game) => game.round === lastRound);
      const nonByeGames = lastRoundGames.filter((game) => game.presence === 2);

      const allPending =
        nonByeGames.length > 0 &&
        nonByeGames.every((game) => game.status === "PENDING");

      setHasPendingRound(allPending);
    } catch (error) {
      console.error("Error fetching rounds:", error);
      setHasPendingRound(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const data = await getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchStats();
    fetchRounds();
  }, []);

  const handleRestorePlayer = async (id: number) => {
    await restorePlayer(id);
    await fetchPlayers();
  };

  const handleResetAllPlayers = async () => {
    setLoading(true);
    setActionError(null);
    try {
      await resetAllPlayers();
      await Promise.all([fetchPlayers(), fetchStats(), fetchRounds()]);
      return true;
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to reset scores"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournamentData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      await deleteTournamentData();
      await Promise.all([fetchPlayers(), fetchStats(), fetchRounds()]);
      return true;
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to delete tournament data"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAbsentPlayer = async (id: number) => {
    const player = await getPlayerById(id);
    if (player.is_present) {
      await markAbsent(id);
    } else {
      await markPresent(id);
    }
    await fetchPlayers();
  };

  const handleGenerateRound = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const result = await generateScheduledRound();
      if (!result.success) {
        setActionError(
          getErrorMessage(result.error, "Failed to generate round")
        );
        return false;
      }
      setShowGenerateDialog(false);
      await Promise.all([fetchPlayers(), fetchStats(), fetchRounds()]);
      return true;
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to generate round"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleStartRound = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const result = await startScheduledRound();
      if (!result.success) {
        setActionError(getErrorMessage(result.error, "Failed to start round"));
        return false;
      }
      setShowStartDialog(false);
      await Promise.all([fetchPlayers(), fetchStats(), fetchRounds()]);
      return true;
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to start round"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLastRound = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const result = await removeLastRound();
      if (!result.success) {
        setActionError(getErrorMessage(result.error, "Failed to remove round"));
        return false;
      }
      setShowRemoveDialog(false);
      await Promise.all([fetchPlayers(), fetchStats(), fetchRounds()]);
      return true;
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to remove round"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (newPlayer: { name: string; rating: number }) => {
    await addPlayer(newPlayer.name, newPlayer.rating);
    await Promise.all([fetchPlayers(), fetchStats()]);
  };

  const handleImportPlayers = async (file: File) => {
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("/api/users/import", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => ({}))) as {
      inserted?: number;
      skipped_duplicate?: number;
      invalid_rows?: number;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error || "Failed to import users.");
    }

    await Promise.all([fetchPlayers(), fetchStats()]);

    return {
      inserted: payload.inserted ?? 0,
      skipped_duplicate: payload.skipped_duplicate ?? 0,
      invalid_rows: payload.invalid_rows ?? 0,
    };
  };

  const handleAddGame = async (game: {
    whiteId: number;
    blackId: number;
    result?: string;
  }) => {
    await addGame(game.whiteId, game.blackId, game.result);
    await Promise.all([fetchPlayers(), fetchStats(), fetchRounds()]);
  };

  const handleDeletePlayer = async (id: number) => {
    await deletePlayer(id);
    await fetchPlayers();
  };

  return {
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
  };
};
