import { create } from "zustand";
import { Joystick, PlayerState } from "playroomkit";
import { Vector3 } from "three";

export type PlayerStateStore = {
    state: PlayerState | null;
    controls: Joystick | null;
    setPlayerState: (state: PlayerState, controls: Joystick) => void;
};

export type Player = {
    id: string;
    state: PlayerState;
    controls: Joystick;
    position: Vector3;
    rotation: Vector3;
};

export type PlayerStatesStore = {
    players: Player[];
    tempPlayers: Player[];
    addPlayer: (
        playerState: PlayerState,
        isMobile: boolean,
        id: string
    ) => void;
    updatePlayerPosition: (id: string, position: Vector3, rotation: Vector3) => void;
    getPlayers: () => Player[];
};

export const usePlayerStateStore = create<PlayerStateStore>((set) => ({
    state: null,
    controls: null,
    setPlayerState: (state: PlayerState, controls: Joystick) => {
        set(() => ({
            state: state,
            controls: controls,
        }));
    },
}));

export const usePlayerStatesStore = create<PlayerStatesStore>((set, get) => ({
    players: [],
    tempPlayers: [],
    addPlayer: (
        playerState: PlayerState,
        isMobile: boolean,
        id: string
    ) => {
        const joystick = new Joystick(playerState, {
            type: "angular",
            keyboard: !isMobile,
        });

        const newPlayer = {
            id: id,
            state: playerState,
            controls: joystick,
            position: new Vector3(0, 0, 0),
            rotation: new Vector3(0, 0, 0)
        };

        set((state) => ({
            players: [...state.players, newPlayer],
        }));

        playerState.onQuit(() => {
            set((state) => ({
                players: state.players.filter(
                    (player) => player.state.id !== playerState.id
                ),
            }));
        });
    },
    updatePlayerPosition: (id: string, position: Vector3, rotation: Vector3) => {
        set((state) => ({
            players: state.players.map((player) =>
                player.id === id ? { ...player, position, rotation } : player
            ),
        }));
    },
    getPlayers: () => {
        return get().players;
    },
}));