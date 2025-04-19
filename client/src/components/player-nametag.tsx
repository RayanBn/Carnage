import { Html } from "@react-three/drei";
import { PlayerState } from "playroomkit";

interface PlayerNameTagProps {
    state: PlayerState | null;
}

export function PlayerNameTag({ state }: PlayerNameTagProps) {
    return (
        <Html>
            <p>{state?.getProfile().name}</p>
        </Html>
    );
}
