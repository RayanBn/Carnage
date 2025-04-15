// components/RightPanel/RightPanel.tsx
"use client";
import { useEffect, useState } from "react";
import { getState, myPlayer, setState, useIsHost } from "playroomkit";
import { City } from "@/lib/data";
import { PanelItem } from "./panel-item";
import { MobileMenu } from "./mobile-menu";
import Image from "next/image";
import { CarDialog } from "./car-dialog";
import { CityDialog } from "./city-dialog";

export const RightPanel = ({ className }: { className: string }) => {
    const [isCarDialogOpen, setIsCarDialogOpen] = useState(false);
    const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
    const player = myPlayer();
    const amHost = useIsHost();
    const [playerName, setPlayerName] = useState<string>();
    const [map, setMap] = useState<string>(getState("map"));

    useEffect(() => {
        if (player) {
            setPlayerName(player.getProfile().name);
            setMap(getState("map"));
        }
    }, [player]);

    const updateMap = (city: City) => setState("map", city);

    return (
        <>
            <MobileMenu
                onCarDialogOpen={() => setIsCarDialogOpen(true)}
                onCityDialogOpen={() => setIsCityDialogOpen(true)}
                playerName={playerName}
                onNameChange={(name) => player?.setState("name", name)}
            />

            <div className={`${className} hidden lg:block`}>
                <div className="flex flex-col gap-4 items-center justify-center pointer-events-auto">
                    <PanelItem onClick={() => setIsCarDialogOpen(true)}>
                        <Image
                            src="/icons/cars/car.png"
                            alt="Car"
                            width={100}
                            height={100}
                            className="w-11/12 h-full object-cover mx-auto"
                        />
                    </PanelItem>

                    <PanelItem onClick={() => setIsCityDialogOpen(true)}>
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
                                src="/icons/profile.png"
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
                                    player?.setState("name", e.target.value)
                                }
                                className="w-3/4 h-full px-0.5 py-0 bg-carnage-blue-dark text-white font-montserrat text-sm uppercase outline-none"
                            />
                        </div>
                    </PanelItem>
                </div>
            </div>

            <CarDialog
                isOpen={isCarDialogOpen}
                onOpenChange={setIsCarDialogOpen}
                onCarSelect={(car) => {
                    myPlayer()?.setState("car", car);
                    setIsCarDialogOpen(false);
                }}
            />

            <CityDialog
                isOpen={isCityDialogOpen}
                onOpenChange={setIsCityDialogOpen}
                onCitySelect={updateMap}
                isHost={amHost}
            />
        </>
    );
};
