import { create } from 'zustand';
import { Joystick, PlayerState } from 'playroomkit';

export type PlayerStateStore = {
    state: PlayerState | null,
    controls: Joystick | null,
    setPlayerState: (state: PlayerState, controls: Joystick) => void
};

export type Player = {
    state: PlayerState;
    controls: Joystick;
};

export type PlayerStatesStore = {
    players: Player[],
    addPlayer: (playerState: PlayerState, isMobile: boolean) => void,
    removePlayer: (playerId: string) => void
}

export const usePlayerStateStore = create<PlayerStateStore>((set) => ({
    state: null,
    controls: null,
    setPlayerState: (state: PlayerState, controls: Joystick) => {
        set(() => ({
            state: state,
            controls: controls
        }))
    }
}));

export const usePlayerStatesStore = create<PlayerStatesStore>((set) => ({
    players: [],
    addPlayer: (playerState: PlayerState, isMobile: boolean) => {
        const joystick = new Joystick(playerState, {
            type: "angular",
            keyboard: !isMobile
        });

        const newPlayer = { state: playerState, controls: joystick };

        set((state) => ({
            players: [...state.players, newPlayer]
        }));

        playerState.onQuit(() => {
            set((state) => ({
                players: state.players.filter((player) => player.state.id !== playerState.id)
            }));
        });
    },
    removePlayer: (playerId: string) => {
        set((state) => ({
            players: state.players.filter((player) => player.state.id !== playerId)
        }));
    }
}));
