"use client";

import { useEffect, useState } from "react";
import {
    getRoomCode,
    getState,
    insertCoin,
    setState,
    waitForState,
} from "playroomkit";
import LobbyInterface from "@/components/interface/lobby-interface";
import GameInterface from "@/components/interface/game-interface";
import LobbyScene from "@/components/scenes/lobby";
import GameScene from "@/components/scenes/game";
import { AssetsProvider } from "@/components/ui/assets-loader";
import { syncRoomWithServer } from "@/lib/room-manager";

const Home = () => {
    const [inGame, setInGame] = useState(getState("inGame"));
    const [roomCode, setRoomCode] = useState<string>(getRoomCode() || "");

    useEffect(() => {
        insertCoin({
            skipLobby: true,
        }).then(() => {
            const code = getRoomCode();
            setRoomCode(code || "");
            console.log("roomCode ->", code);
        });

        setState("map", "city");

        waitForState("inGame", (value) => {
            setInGame(value);
        });
    }, []);

    useEffect(() => {
        const cleanup = syncRoomWithServer();

        return cleanup;
    }, [roomCode]);

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
