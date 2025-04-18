"use client";

import { useEffect, useState } from "react";
import {
    getRoomCode,
    getState,
    insertCoin,
    onPlayerJoin,
    setState,
    usePlayersList,
    waitForState,
} from "playroomkit";
import LobbyInterface from "@/components/interface/lobby-interface";
import GameInterface from "@/components/interface/game-interface";
import LobbyScene from "@/components/scenes/lobby";
import GameScene from "@/components/scenes/game";
import { AssetsProvider } from "@/components/ui/assets-loader";
import { syncRoomWithServer } from "@/lib/room-manager";
import { usePlayerStatesStore } from "@/lib/store";
import { useSocket } from "@/lib/hooks/useSocket";

const Home = () => {
    const [inGame, setInGame] = useState(getState("inGame"));
    const [roomCode, setRoomCode] = useState<string>(getRoomCode() || "");
    const { addPlayer } = usePlayerStatesStore();
    const { socket } = useSocket();
    const players = usePlayersList();

    useEffect(() => {
        insertCoin({
            skipLobby: true,
        }).then(() => {
            const code = getRoomCode();
            setRoomCode(code || "");
        });

        setState("map", "city");

        waitForState("inGame", (value) => {
            setInGame(value);
        });
    }, []);

    useEffect(() => {
        if (!socket || players.length === 0) return;
        const cleanup = syncRoomWithServer();

        socket.on("gameStarted", (data: any) => {
            const { clients } = data;
            console.log("gameStarted", clients);

            const currentPlayers = [...usePlayerStatesStore.getState().players];
            currentPlayers.forEach(player => {
                usePlayerStatesStore.setState(state => ({
                    players: state.players.filter(p => p.state.id !== player.state.id)
                }));
            });
            Object.values(clients).forEach((client: any) => {
                const { playroomId, id } = client;
                const player = players.find((p) => p.id === playroomId);
                const isMobile = window.innerWidth < 768;

                if (player) {
                    addPlayer(player, isMobile, id);
                } else {
                    onPlayerJoin((newPlayer) => {
                        if (newPlayer.id === playroomId) {
                            addPlayer(newPlayer, isMobile, id);
                        }
                    });
                }
            });
        });

        return cleanup;
    }, [roomCode, socket]);

    return (
        <AssetsProvider minimumLoadingTime={800} maxLoadingTime={4000}>
            <div className="absolute inset-0">
                {inGame === true ? <GameScene /> : <LobbyScene />}
                <div className="absolute inset-0 pointer-events-none">
                    {inGame === true ? <GameInterface /> : <LobbyInterface />}
                </div>
            </div>
        </AssetsProvider>
    );
};

export default Home;
