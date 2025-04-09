import { create } from 'zustand';
import { Joystick, PlayerState } from 'playroomkit';

export type Car = {
    id: number;
    name: string;
    image: string;
}

export type City = {
    id: number;
    name: string;
    image: string;
}

export const cars: Car[] = [
    {
        id: 1,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
    {
        id: 2,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
    {
        id: 3,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
    {
        id: 4,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
    {
        id: 5,
        name: 'Car',
        image: '/icons/cars/car.png'
    },
]

export const cities: City[] = [
    {
        id: 1,
        name: 'Japan',
        image: '/icons/cities/japan.png'
    },
]

export type PlayerStateStore = {
    player: PlayerState | null,
    joystick: Joystick | null,
    setPlayerState: (playerState: PlayerState, joystick: Joystick) => void
};

export type PlayerStatesStore = {
    playerStates: PlayerStateStore[],
    addPlayer: (playerState: PlayerState) => void
}

export const usePlayerStateStore = create<PlayerStateStore>((set) => ({
    player: null,
    joystick: null,
    setPlayerState: (playerState: PlayerState, joystick: Joystick) => {
        set(() => ({
            player: playerState,
            joystick: joystick
        }))
    }
}));

export const usePlayerStatesStore = create<PlayerStatesStore>((set) => ({
    playerStates: [],
    addPlayer: (playerState: PlayerState) => {
        const joystick = new Joystick(playerState, {
            type: "angular",
            keyboard: false
        });

        const newPlayer = usePlayerStateStore.getState();
        newPlayer.setPlayerState(playerState, joystick);

        set((state) => ({
            playerStates: [...state.playerStates, newPlayer]
        }))
    }
}));
