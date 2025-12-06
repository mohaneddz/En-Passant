import { useState, useEffect, useRef } from 'react';
import { getPlayers, addPlayer, deletePlayer, editPlayer, restorePlayer,resetAllPlayers, markAbsent, markPresent, getPlayerById } from '@/server/players';
import { getStats, StatsGridProps } from '@/server/stats';
import { generateScheduledRound, startScheduledRound, removeLastRound } from '@/server/games';
import { addGame } from '@/server/games';
import { GamesListRef } from '@/components/dashboard/GamesList';
import { supabase } from '@/lib/supabase/client';

import { Player } from '@/types/player';

export const useDashboard = () => {
	const [activeTab, setActiveTab] = useState('players');
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);
	const [showGenerateDialog, setShowGenerateDialog] = useState(false);
	const [showStartDialog, setShowStartDialog] = useState(false);
	const [showRemoveDialog, setShowRemoveDialog] = useState(false);
	const [hasPendingRound, setHasPendingRound] = useState(false);
	const gamesListRef = useRef<GamesListRef>(null);

	const handleRestorePlayer = async (id: number) => {
		try {
			await restorePlayer(id);
			await fetchPlayers();
		} catch (error) {
			console.error('Error restoring player:', error);
		}
	};

	const handleResetAllPlayers = async () => {
		try {
			await resetAllPlayers();
			await fetchPlayers();
		} catch (error) {
			console.error('Error resetting players:', error);
		}
	}

	const handleAbsentPlayer = async (id: number) => {
		// # if the user is present, mark them absent; if absent, mark present
		try {
			const player = await getPlayerById(id);
			if (player.is_present) {
				console.log('Marking player absent:', id);
				await markAbsent(id);
			} else {
				console.log('Marking player present:', id);
				await markPresent(id);
			}
			await fetchPlayers();
		}
		catch (error) {
			console.error('Error toggling player presence:', error);
		}
	};


	const [stats, setStats] = useState<StatsGridProps['stats']>({
		totalPlayers: null,
		totalRounds: null,
		gamesPlayed: null,
		totalGames: null,
	});

	const fetchStats = async () => {
		try {
			const data = await getStats();
			// @ts-ignore - ignoring potential null/undefined mismatches from direct DB return
			setStats(data);
		} catch (error) {
			console.error('Error fetching stats:', error);
		}
	};

	const fetchRounds = async () => {
		// Check if there's a pending round
		try {
			const { data: games } = await supabase
				.from('games')
				.select('status, round')
				.order('round', { ascending: false })
				.limit(10);
			
			if (games && games.length > 0) {
				const lastRoundGames = games.filter(g => g.round === games[0].round);
				const allPending = lastRoundGames.every(g => g.status === 'PENDING');
				setHasPendingRound(allPending && lastRoundGames.length > 0);
			} else {
				setHasPendingRound(false);
			}
		} catch (error) {
			console.error('Error fetching rounds:', error);
			setHasPendingRound(false);
		}
	};

	const fetchPlayers = async () => {
		try {
			const data = await getPlayers();
			setPlayers(data as unknown as Player[]);
		} catch (error) {
			console.error('Error fetching players:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPlayers();
		fetchStats();
		fetchRounds();
	}, []);

	const handleGenerateRound = async () => {
		try {
			setLoading(true);
			const result = await generateScheduledRound();
			if (result.success) {
				await fetchStats();
				await fetchRounds();
				await fetchPlayers();
				setShowGenerateDialog(false);
			} else {
				console.error('Error generating round:', result.error);
				alert(`Failed to generate round: ${result.error}`);
			}
		} catch (error) {
			console.error('Error generating round:', error);
			alert('Failed to generate round');
		} finally {
			setLoading(false);
		}
	};

	const handleStartRound = async () => {
		try {
			setLoading(true);
			const result = await startScheduledRound();
			if (result.success) {
				await fetchStats();
				await fetchRounds();
				await fetchPlayers();
				setShowStartDialog(false);
			} else {
				console.error('Error starting round:', result.error);
				alert(`Failed to start round: ${result.error}`);
			}
		} catch (error) {
			console.error('Error starting round:', error);
			alert('Failed to start round');
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveLastRound = async () => {
		try {
			setLoading(true);
			const result = await removeLastRound();
			if (result.success) {
				await fetchStats();
				await fetchRounds();
				await fetchPlayers();
				setShowRemoveDialog(false);
			} else {
				console.error('Error removing round:', result.error);
				alert(`Failed to remove round: ${result.error}`);
			}
		} catch (error) {
			console.error('Error removing round:', error);
			alert('Failed to remove round');
		} finally {
			setLoading(false);
		}
	};

	const isNextPhaseDisabled = false;

	const handleAddPlayer = async (newPlayer: { name: string, rating: number }) => {
		try {
			await addPlayer(newPlayer.name, newPlayer.rating);
			await fetchPlayers();
		} catch (error) {
			console.error('Error adding player:', error);
		}
	};

	const handleAddGame = async (game: { whiteId: number; blackId: number; result?: string }) => {
		try {
			await addGame(game.whiteId, game.blackId, game.result);
			await fetchPlayers();
			await fetchStats();
		} catch (error) {
			console.error('Error adding game:', error);
		}
	};

	const handleDeletePlayer = async (id: number) => {
		try {
			await deletePlayer(id);
			await fetchPlayers();
		} catch (error) {
			console.error('Error deleting player:', error);
		}
	};

	const handleNextPhase = async () => {
		try {
			setLoading(true);
			const result = await generateScheduledRound();
			if (result.success) {
				await fetchStats();
				await fetchRounds();
				await fetchPlayers();
				setShowGenerateDialog(false);
			} else {
				console.error('Error starting next phase:', result.error);
			}
		} catch (error) {
			console.error('Error starting next phase:', error);
		} finally {
			setLoading(false);
		}
	};

	// const handleUndoPhase = async () => {
	// 	try {
	// 		setLoading(true);
	// 		const result = await undoLastRound();
	// 		if (result.success) {
	// 			await fetchStats();
	// 			await fetchRounds();
	// 			await fetchPlayers();
	// 			setShowUndoDialog(false);
	// 		} else {
	// 			console.error('Error undoing phase:', result.error);
	// 		}
	// 	} catch (error) {
	// 		console.error('Error undoing phase:', error);
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

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
		hasPendingRound,
		gamesListRef,
		stats,
		handleAddPlayer,
		handleAddGame,
		handleDeletePlayer,
		handleGenerateRound,
		handleStartRound,
		handleRemoveLastRound,
		handleNextPhase,
		fetchPlayers,
		fetchStats,
		fetchRounds,
		handleRestorePlayer,
		handleResetAllPlayers,
		handleAbsentPlayer
	};
};
