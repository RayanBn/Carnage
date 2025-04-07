import Image from "next/image";
import car from "../../../../assets/icons/car.png";
import city from "../../../../assets/icons/city.png";
import profile from "../../../../assets/icons/profile.png";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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

const RightPanel = ({ className }: RightPanelProps) => {
    const [isCarDialogOpen, setIsCarDialogOpen] = useState(false);
    const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Burger Menu Button - Only visible on mobile */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-carnage-blue-dark rounded-lg pointer-events-auto"
            >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                    <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
            </button>

            {/* Mobile Menu Overlay */}
            <div className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`absolute right-0 top-0 h-full w-64 bg-carnage-blue-medium p-4 transition-transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                            <Image src={city} alt="Car" className="w-11/12 h-full object-cover mx-auto" />
                        </PanelItem>
                        <PanelItem className="flex items-center justify-center gap-2">
                            <div className="flex items-center justify-center gap-2 w-11/12 h-full p-2">
                                <Image src={profile} alt="Profile" className="w-1/4 h-full object-cover" />
                                <input 
                                    type="text" 
                                    placeholder="NAME" 
                                    className="w-3/4 h-full p-2 bg-carnage-blue-dark text-white font-montserrat text-3xl uppercase outline-none "
                                />
                            </div>
                        </PanelItem>
                    </div>
                </div>
            </div>

            {/* Desktop Panel - Hidden on mobile */}
            <div className={`${className} hidden md:block`}>
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
                        <Image src={city} alt="Car" className="w-11/12 h-full object-cover mx-auto" />
                    </PanelItem>
                    <PanelItem className="flex items-center justify-center gap-2">
                        <div className="flex items-center justify-center gap-2 w-11/12 h-full p-2">
                            <Image src={profile} alt="Profile" className="w-1/4 h-full object-cover" />
                            <input 
                                type="text" 
                                placeholder="NAME"
                                className="w-3/4 h-full p-2 bg-carnage-blue-dark text-white font-montserrat text-3xl uppercase outline-none "
                            />
                        </div>
                    </PanelItem>
                </div>
            </div>

            <Dialog open={isCarDialogOpen} onOpenChange={setIsCarDialogOpen}>
                <DialogContent className="bg-carnage-blue-dark border-none text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-center">Select Your Car</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-6 mt-8">
                        <button className="p-4 bg-carnage-blue hover:bg-carnage-blue-light rounded-lg transition-colors">
                            Car 1
                        </button>
                        <button className="p-4 bg-carnage-blue hover:bg-carnage-blue-light rounded-lg transition-colors">
                            Car 2
                        </button>
                        <button className="p-4 bg-carnage-blue hover:bg-carnage-blue-light rounded-lg transition-colors">
                            Car 3
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                <DialogContent className="bg-carnage-blue-dark border-none text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-center">Select Your City</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-6 mt-8">
                        <button className="p-4 bg-carnage-blue hover:bg-carnage-blue-light rounded-lg transition-colors">
                            City 1
                        </button>
                        <button className="p-4 bg-carnage-blue hover:bg-carnage-blue-light rounded-lg transition-colors">
                            City 2
                        </button>
                        <button className="p-4 bg-carnage-blue hover:bg-carnage-blue-light rounded-lg transition-colors">
                            City 3
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RightPanel;
