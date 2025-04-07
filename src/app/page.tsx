"use client";

import { useEffect, useState } from "react";
import { getState, insertCoin, onPlayerJoin, waitForState } from "playroomkit";
import LobbyInterface from "@/components/interface/lobby-interface";
import GameInterface from "@/components/interface/game-interface";
import LobbyScene from "@/components/scenes/lobby";

const Home = () => {
    const [inGame, setInGame] = useState(getState("inGame"));

    useEffect(() => {
        insertCoin({
            skipLobby: true,
        });

        onPlayerJoin((player) => {
            console.log("Player joined", player);
        });

        waitForState("inGame", (value) => {
            setInGame(value);
        });
    }, []);

    return (
        <>
            <div className="absolute inset-0">
                <LobbyScene />
                <div className="absolute inset-0 pointer-events-none">
                    {inGame ? <GameInterface /> : <LobbyInterface />}
                </div>
            </div>
        </>
    );
}

export default Home;
