import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import { useProgress } from "@react-three/drei";
import Loader from "./loader";

interface AssetsContextType {
    assetsLoaded: boolean;
    registerAssetLoad: () => void;
    isInitialLoading: boolean;
    forceHideLoader: () => void;
}

const AssetsContext = createContext<AssetsContextType>({
    assetsLoaded: false,
    registerAssetLoad: () => {},
    isInitialLoading: true,
    forceHideLoader: () => {},
});

export const useAssets = () => useContext(AssetsContext);

interface AssetsProviderProps {
    children: ReactNode;
    minimumLoadingTime?: number;
    maxLoadingTime?: number;
}

export const AssetsProvider = ({
    children,
    minimumLoadingTime = 800,
    maxLoadingTime = 5000,
}: AssetsProviderProps) => {
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [manuallyLoadedAssets, setManuallyLoadedAssets] = useState(0);
    const [canHideLoader, setCanHideLoader] = useState(false);
    const { active, progress, loaded, total } = useProgress();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loadingStuck, setLoadingStuck] = useState(false);

    const forceHideLoader = useCallback(() => {
        setAssetsLoaded(true);
        setIsInitialLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCanHideLoader(true);
        }, minimumLoadingTime);

        return () => clearTimeout(timer);
    }, [minimumLoadingTime]);

    useEffect(() => {
        if (progress === 100) {
            const stuckTimer = setTimeout(() => {
                setLoadingStuck(true);
            }, 1000);

            return () => clearTimeout(stuckTimer);
        }
    }, [progress]);

    useEffect(() => {
        const maxTimer = setTimeout(() => {
            if (!assetsLoaded) {
                setAssetsLoaded(true);
                setIsInitialLoading(false);
            }
        }, maxLoadingTime);

        return () => clearTimeout(maxTimer);
    }, [assetsLoaded, maxLoadingTime]);

    useEffect(() => {
        if (
            !assetsLoaded &&
            (((!active || progress === 100) && canHideLoader) || loadingStuck)
        ) {
            setAssetsLoaded(true);
            setIsInitialLoading(false);
        }
    }, [
        active,
        progress,
        manuallyLoadedAssets,
        canHideLoader,
        loadingStuck,
        assetsLoaded,
    ]);

    const registerAssetLoad = useCallback(() => {
        setManuallyLoadedAssets((prev) => prev + 1);
    }, []);

    return (
        <AssetsContext.Provider
            value={{
                assetsLoaded,
                registerAssetLoad,
                isInitialLoading,
                forceHideLoader,
            }}
        >
            <Loader
                isLoading={!assetsLoaded}
                progress={progress}
                stuck={progress === 100 && !assetsLoaded}
                onManualClose={forceHideLoader}
            />
            {children}
        </AssetsContext.Provider>
    );
};
