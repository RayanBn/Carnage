// components/RightPanel/CarStatsOverlay.tsx
import { Car } from "@/lib/data";
import useMobile from "@/lib/hooks/useMobile";

interface CarStatsOverlayProps {
    car: Car;
}

export const CarStatsOverlay = ({ car }: CarStatsOverlayProps) => {
    const { isMobile } = useMobile();

    return (
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-2 space-y-1">
            {!isMobile && (
                <h3 className="text-white font-bold text-sm">{car.name}</h3>
            )}

            <StatBar label="Speed" value={car.speed} color="bg-blue-500" />
            <StatBar
                label={`${isMobile ? "Max" : "Max Speed"}`}
                value={car.maxSpeed}
                color="bg-red-500"
            />
            <StatBar
                label="Acceleration"
                value={car.acceleration}
                color="bg-green-500"
            />
            <StatBar
                label="Deceleration"
                value={car.deceleration}
                color="bg-yellow-500"
            />
            <StatBar label="Mass" value={car.mass} color="bg-orange-500" />
        </div>
    );
};

const StatBar = ({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) => {
    const { isMobile } = useMobile();

    return (
        <div>
            <div className="flex justify-between text-white text-xs">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            {!isMobile && (
                <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                        className={`${color} h-1 rounded-full transition-all duration-500`}
                        style={{ width: `${value}%` }}
                    />
                </div>
            )}
        </div>
    );
};
