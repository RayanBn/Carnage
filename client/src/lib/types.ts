import { Joystick, PlayerState } from "playroomkit";
import { Quaternion, Vector3 } from "three";

export interface CarControllerProps {
    id: string;
    state: PlayerState | null;
    controls: Joystick | null;
    idx: number;
    position: Vector3 | null;
    rotation: Quaternion | null;
}

export interface NetworkPosition {
    id: string;
    position: [number, number, number];
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    username: string;
}
