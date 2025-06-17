import { create } from "zustand";
import { Joystick, PlayerState } from "playroomkit";
import { Quaternion, Vector3, Mesh } from "three";
import React from "react";

export type PlayerStateStore = {
  state: PlayerState | null;
  controls: Joystick | null;
  setPlayerState: (state: PlayerState, controls: Joystick) => void;
};

export type WheelRefs = {
  FrontLeftWheel?: React.RefObject<Mesh>;
  FrontRightWheel?: React.RefObject<Mesh>;
  RearLeftWheel?: React.RefObject<Mesh>;
  RearRightWheel?: React.RefObject<Mesh>;
};

export type Player = {
  id: string;
  state: PlayerState;
  controls: Joystick;
  position: Vector3;
  rotation: Quaternion;
  wheelRefs?: WheelRefs;
};

export type PlayerStatesStore = {
  players: Player[];
  tempPlayers: Player[];
  addPlayer: (
    playerState: PlayerState,
    isMobile: boolean,
    id: string,
    position: Vector3
  ) => void;
  updatePlayerPosition: (
    id: string,
    position: Vector3,
    rotation: Quaternion
  ) => void;
  getPlayers: () => Player[];
  registerPlayerWheels: (playerId: string, wheelRefs: WheelRefs) => void;
  getPlayerWheelRefs: (playerId: string) => WheelRefs | undefined;
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
    id: string,
    position: Vector3
  ) => {
    const joystick = new Joystick(playerState, {
      type: "angular",
      buttons: [
        {id: "drift", label: "Drift"}
      ],
      keyboard: !isMobile,
    });

    const newPlayer = {
      id: id,
      state: playerState,
      controls: joystick,
      position: position,
      rotation: new Quaternion(0, 0, 0, 1),
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
  updatePlayerPosition: (
    id: string,
    position: Vector3,
    rotation: Quaternion
  ) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, position, rotation } : player
      ),
    }));
  },
  getPlayers: () => {
    return get().players;
  },
  registerPlayerWheels: (playerId, wheelRefs) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, wheelRefs } : player
      ),
    }));
  },
  getPlayerWheelRefs: (playerId) => {
    const player = get().players.find((p) => p.id === playerId);
    return player?.wheelRefs;
  },
}));
