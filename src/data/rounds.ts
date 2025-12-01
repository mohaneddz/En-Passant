import { Round } from "@/types/game";

export const roundsData: Round[] = [
    {
        id: "round1",
        label: "Round 1",
        status: "Completed",
        games: [
            { gameNumber: 1, whitePlayer: "Hikaru Nakamura", blackPlayer: "Fabiano Caruana", status: "Draw", statusColor: "gray" },
            { gameNumber: 2, whitePlayer: "Ian Nepomniachtchi", blackPlayer: "Magnus Carlsen", status: "White Wins", statusColor: "green" },
            { gameNumber: 3, whitePlayer: "Alireza Firouzja", blackPlayer: "Wesley So", status: "Black Wins", statusColor: "green" },
            { gameNumber: 4, whitePlayer: "Anish Giri", blackPlayer: "Ding Liren", status: "Draw", statusColor: "gray" },
        ]
    },
    {
        id: "round2",
        label: "Round 2",
        status: "In progress",
        games: [
            { gameNumber: 1, whitePlayer: "Magnus Carlsen", blackPlayer: "Hikaru Nakamura", status: "Live" },
            { gameNumber: 2, whitePlayer: "Fabiano Caruana", blackPlayer: "Ian Nepomniachtchi", status: "Live" },
            { gameNumber: 3, whitePlayer: "Ding Liren", blackPlayer: "Alireza Firouzja", status: "black wins", statusColor: "green" },
            { gameNumber: 4, whitePlayer: "Wesley So", blackPlayer: "Anish Giri", status: "Live" },
        ]
    },
    {
        id: "round3",
        label: "Round 3",
        status: "Upcoming",
        games: [
            { gameNumber: 1, whitePlayer: "Magnus Carlsen", blackPlayer: "Ding Liren", status: "Scheduled", statusColor: "gray" },
            { gameNumber: 2, whitePlayer: "Hikaru Nakamura", blackPlayer: "Ian Nepomniachtchi", status: "Scheduled", statusColor: "gray" },
            { gameNumber: 3, whitePlayer: "Fabiano Caruana", blackPlayer: "Wesley So", status: "Scheduled", statusColor: "gray" },
            { gameNumber: 4, whitePlayer: "Alireza Firouzja", blackPlayer: "Anish Giri", status: "Scheduled", statusColor: "gray" },
        ]
    }
];
