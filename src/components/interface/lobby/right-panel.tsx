import Image from "next/image";
import car from "../../../../assets/icons/car.png";
import profile from "../../../../assets/icons/profile.png";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getState, me, myPlayer, setState, useIsHost } from "playroomkit";
import { cars, Car, cities, City } from "@/lib/store";

interface PanelItemProps {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

const PanelItem = ({ onClick, children, className }: PanelItemProps) => {
    return (
        <div onClick={onClick} className={`${className} w-56 h-24 bg-carnage-blue-dark rounded-lg p-2 pointer-events-auto`}>
            <div className="w-full h-full relative">
                {children}
            </div>
        </div>
    );
};

interface RightPanelProps {
    className: string;
}

interface DialogItemProps {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    enabled?: boolean;
}

const DialogItem = ({ onClick, children, className, enabled = true }: DialogItemProps) => {
    const ClickHandler = () => {
        if (enabled) {
            onClick?.();
        }
    }

    return (
        <div
            onClick={ClickHandler}
            className={`${className} bg-carnage-blue-medium rounded-lg pointer-events-auto hover:bg-carnage-blue-light transition-colors ${enabled ? 'opacity-100' : 'opacity-50'} ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        >
            {children}
        </div>
    );
};

const RightPanel = ({ className }: RightPanelProps) => {
    const [isCarDialogOpen, setIsCarDialogOpen] = useState(false);
    const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const player = myPlayer();
    const amHost = useIsHost();
    const [playerName, setPlayerName] = useState<string>();
    const [map, setMap] = useState<string>(getState('map'));

    useEffect(() => {
        if (player) {
            setPlayerName(player.getProfile().name);
            setMap(getState('map'));
        }
    }, [player]);

    const updatePlayerName = (name: string) => {
        player?.setState('name', name);
    }

    const updateMap = (map: City) => {
        setState('map', map);
    }

    const updateCar = (car: Car) => {
        player?.setState('car', car);
        setIsCarDialogOpen(false);
    }

    return (
        <>
            {/* Burger Menu Button - Only visible on mobile */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-carnage-blue-dark rounded-lg pointer-events-auto"
            >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                    <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
            </button>

            {/* Mobile Menu Overlay */}
            <div className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`absolute right-0 top-0 h-full w-64 bg-carnage-blue-medium p-4 transition-transform overflow-y-auto pointer-events-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col gap-4 items-center justify-center mt-16">
                        <PanelItem 
                            className="flex items-center justify-center cursor-pointer"
                            onClick={() => {
                                setIsCarDialogOpen(true);
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            <Image src={car} alt="Car" className="w-11/12 h-full object-cover mx-auto" />
                        </PanelItem>
                        <PanelItem 
                            className="flex items-center justify-center cursor-pointer"
                            onClick={() => {
                                setIsCityDialogOpen(true);
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            <Image src={"/icons/cities/japan.png"} alt="Car" width={100} height={100} className="w-11/12 h-full object-cover mx-auto" />
                        </PanelItem>
                        <PanelItem className="flex items-center justify-center gap-2">
                            <div className="flex items-center justify-center gap-2 w-11/12 h-full p-2">
                                <Image src={profile} alt="Profile" className="w-1/4 h-full object-cover" />
                                <input 
                                    type="text" 
                                    placeholder="NAME"
                                    defaultValue={playerName}
                                    maxLength={10}
                                    onChange={(e) => updatePlayerName(e.target.value)}
                                    className="w-3/4 h-full px-0.5 py-0 bg-carnage-blue-dark text-white font-montserrat text-[clamp(0.6rem,1.2vw,1rem)] uppercase outline-none"
                                />
                            </div>
                        </PanelItem>
                    </div>
                </div>
            </div>

            {/* Desktop Panel - Hidden on mobile */}
            <div className={`${className} hidden lg:block`}>
                <div className="flex flex-col gap-4 items-center justify-center">
                    <PanelItem 
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => setIsCarDialogOpen(true)}
                    >
                        <Image src={car} alt="Car" className="w-11/12 h-full object-cover mx-auto" />
                    </PanelItem>
                    <PanelItem 
                        className="flex items-center justify-center cursor-pointer"
                        onClick={() => setIsCityDialogOpen(true)}
                    >
                        <Image src={"/icons/cities/japan.png"} alt="Car" width={100} height={100} className="w-11/12 h-full object-cover mx-auto" />
                    </PanelItem>
                    <PanelItem className="flex items-center justify-center gap-2">
                        <div className="flex items-center justify-center gap-2 w-11/12 h-full p-2">
                            <Image src={profile} alt="Profile" className="w-1/4 h-full object-cover" />
                            <input 
                                type="text" 
                                placeholder="NAME"
                                defaultValue={playerName}
                                maxLength={10}
                                onChange={(e) => updatePlayerName(e.target.value)}
                                className="w-3/4 h-full px-0.5 py-0 bg-carnage-blue-dark text-white font-montserrat text-[clamp(0.6rem,1.2vw,1rem)] uppercase outline-none"
                            />
                        </div>
                    </PanelItem>
                </div>
            </div>

            <Dialog open={isCarDialogOpen} onOpenChange={setIsCarDialogOpen}>
                <DialogContent className="bg-carnage-blue-dark border-none text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-center">Select a Car</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-6 mt-8">
                        {
                            cars.map((car, index) => (
                                <DialogItem key={index} onClick={() => updateCar(car)}>
                                    <Image src={car.image} alt="Car" width={100} height={100} className="object-cover mx-auto w-full h-full" />
                                </DialogItem>
                            ))
                        }
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                <DialogContent className="bg-carnage-blue-dark border-none text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-center">Select City</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 mt-8">
                        {
                            cities.map((city, index) => (
                                <DialogItem key={index} onClick={() => updateMap(city)} enabled={amHost}>
                                    <Image src={city.image} alt="City" width={100} height={100} className="w-full h-full object-cover mx-auto" />
                                </DialogItem>
                            ))
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RightPanel;
