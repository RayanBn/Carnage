import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { cities, City } from "@/lib/data";
import { DialogItem } from "./dialog-item";

interface CityDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onCitySelect: (city: City) => void;
    isHost: boolean;
}

export function CityDialog({
    isOpen,
    onOpenChange,
    onCitySelect,
    isHost,
}: CityDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-carnage-blue-dark border-none text-white">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center">
                        Select City
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 mt-8">
                    {cities.map((city, index) => (
                        <DialogItem
                            key={index}
                            onClick={() => onCitySelect(city)}
                            enabled={isHost}
                        >
                            <Image
                                src={city.image}
                                alt={city.name}
                                width={100}
                                height={100}
                                className="w-full h-full object-cover mx-auto"
                            />
                        </DialogItem>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
