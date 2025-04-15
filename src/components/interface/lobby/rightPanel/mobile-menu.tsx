// components/RightPanel/MobileMenu.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { PanelItem } from "./panel-item";

interface MobileMenuProps {
    onCarDialogOpen: () => void;
    onCityDialogOpen: () => void;
    playerName?: string;
    onNameChange: (name: string) => void;
}

export const MobileMenu = ({
    onCarDialogOpen,
    onCityDialogOpen,
    playerName,
    onNameChange,
}: MobileMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-carnage-blue-dark rounded-lg pointer-events-auto"
                aria-label="Toggle mobile menu"
            >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                    <span
                        className={`w-full h-0.5 bg-white transition-all ${
                            isOpen ? "rotate-45 translate-y-2" : ""
                        }`}
                    />
                    <span
                        className={`w-full h-0.5 bg-white transition-all ${
                            isOpen ? "opacity-0" : ""
                        }`}
                    />
                    <span
                        className={`w-full h-0.5 bg-white transition-all ${
                            isOpen ? "-rotate-45 -translate-y-2" : ""
                        }`}
                    />
                </div>
            </button>

            <div
                className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
                <div
                    className={`absolute right-0 top-0 h-full w-64 bg-carnage-blue-medium p-4 transition-transform overflow-y-auto pointer-events-auto ${
                        isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <div className="flex flex-col gap-4 items-center justify-center mt-16">
                        <PanelItem
                            onClick={() => {
                                onCarDialogOpen();
                                setIsOpen(false);
                            }}
                        >
                            <Image
                                src="/icons/cars/car.png"
                                alt="Car"
                                width={100}
                                height={100}
                                className="w-11/12 h-full object-cover mx-auto"
                            />
                        </PanelItem>

                        <PanelItem
                            onClick={() => {
                                onCityDialogOpen();
                                setIsOpen(false);
                            }}
                        >
                            <Image
                                src="/icons/cities/japan.png"
                                alt="City"
                                width={100}
                                height={100}
                                className="w-11/12 h-full object-cover mx-auto"
                            />
                        </PanelItem>

                        <PanelItem className="gap-2">
                            <div className="flex items-center justify-center gap-2 w-11/12 h-full p-2">
                                <Image
                                    src={"/icons/profile.png"}
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="w-1/4 h-full object-cover"
                                />
                                <input
                                    type="text"
                                    placeholder="NAME"
                                    defaultValue={playerName}
                                    maxLength={10}
                                    onChange={(e) =>
                                        onNameChange(e.target.value)
                                    }
                                    className="w-3/4 h-full px-0.5 py-0 bg-carnage-blue-dark text-white font-montserrat text-sm uppercase outline-none"
                                />
                            </div>
                        </PanelItem>
                    </div>
                </div>
            </div>
        </>
    );
};
