import Image from "next/image";
import { Car } from "@/lib/data";
import { CarStatsOverlay } from "./car-stats-overlay";
import { DialogItem } from "./dialog-item";

interface CarDialogItemProps {
    car: Car;
    onSelect: (car: Car) => void;
}

export const CarDialogItem = ({ car, onSelect }: CarDialogItemProps) => (
    <DialogItem
        onClick={() => onSelect(car)}
        className="group relative overflow-hidden transition-transform hover:scale-105"
    >
        <Image
            src={car.image}
            alt={car.name}
            width={200}
            height={200}
            className="object-cover mx-auto w-full h-full"
        />
        <CarStatsOverlay car={car} />
    </DialogItem>
);
