import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { cars, Car } from "@/lib/data";
import { DialogItem } from "./dialog-item";
import { CarStatsOverlay } from "./car-stats-overlay";

interface CarDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCarSelect: (car: Car) => void;
}

export function CarDialog({ isOpen, onOpenChange, onCarSelect }: CarDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-carnage-blue-dark border-none text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">
            Select a Car
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-6 mt-8">
          {cars.map((car, index) => (
            <DialogItem
              key={index}
              onClick={() => onCarSelect(car)}
              className="group relative overflow-hidden"
            >
              <Image
                src={car.image}
                alt={car.name}
                width={100}
                height={100}
                className="object-cover mx-auto w-full h-full"
              />
              <CarStatsOverlay car={car} />
            </DialogItem>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
