"use client";

import { useEffect, useState } from "react";
import { getState, insertCoin, onPlayerJoin, setState, waitForState } from "playroomkit";
import LobbyInterface from "@/components/interface/lobby-interface";
import GameInterface from "@/components/interface/game-interface";
import LobbyScene from "@/components/scenes/lobby";
import GameScene from "@/components/scenes/game";
import { AssetsProvider } from "@/components/ui/assets-loader";
import { usePlayerStatesStore } from "@/lib/store";

const Home = () => {
    const [inGame, setInGame] = useState(getState("inGame"));
    const { addPlayer } = usePlayerStatesStore();

    useEffect(() => {
        insertCoin({
            skipLobby: true,
        });

        setState("map", "city");

        onPlayerJoin((player) => {
            console.log("Player joined", player);
            addPlayer(player);
        });

        waitForState("inGame", (value) => {
            setInGame(value);
        });
    }, []);

    useEffect(() => {
        console.log("inGame", inGame);
    }, [inGame]);

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
}

export default Home;
