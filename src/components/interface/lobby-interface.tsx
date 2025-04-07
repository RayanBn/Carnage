import { useState } from 'react';
import { usePlayersList, useIsHost, useMultiplayerState, myPlayer, setState } from 'playroomkit';
import RightPanel from './lobby/right-panel';
import Logo from '../../../assets/logo.png';
import Image from 'next/image';

const LobbyInterface = () => {
    const players = usePlayersList(true);
    const currentPlayer = myPlayer();
    const amHost = useIsHost();

    const handleToggleReady = () => {
        currentPlayer?.setState('ready', !currentPlayer.getState('ready'));
    };

    const areAllPlayersReady = () => {
        return players.filter(player => player.id !== currentPlayer?.id).every(player => player.getState('ready'));
    };

    const handleStartGame = () => {
        if (areAllPlayersReady()) {
            setState("inGame", true);
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none select-none">

            <div className="absolute left-1/2 top-4 -translate-x-1/2 w-2/5 h-1/5">
                <Image src={Logo} alt="Logo" className="w-full h-full object-contain" />
            </div>

            <RightPanel className="font-montserrat text-4xl uppercase tracking-wide absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-carnage-blue-medium rounded-lg p-4" />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
                {!amHost && (
                    <button
                        className="font-montserrat bg-carnage-red text-carnage-yellow text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-md shadow-[0_8px_0_#b2331f] leading-none"
                        onClick={handleToggleReady}
                    >
                        {currentPlayer?.getState('ready') ? 'Unready' : 'Ready'}
                    </button>
                )}
                {amHost && (
                    <button
                        className={`font-montserrat bg-carnage-red text-carnage-yellow text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-md shadow-[0_8px_0_#b2331f] leading-none ${
                            !areAllPlayersReady() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleStartGame}
                        disabled={!areAllPlayersReady()}
                    >
                        Start Game
                    </button>
                )}
            </div>

            {/* <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
                {cars.map((car) => (
                    <button
                        key={car}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
                        onClick={() => currentPlayer?.setState('car', car)}
                    >
                    </button>
                ))}
            </div> */}

        </div>
    );
};

export default LobbyInterface;
