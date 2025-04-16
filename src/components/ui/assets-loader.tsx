import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  minimumLoadingTime?: number; // Minimum time to show loader (ms)
  maxLoadingTime?: number; // Maximum time to show loader (ms)
}

export const AssetsProvider = ({
  children,
  minimumLoadingTime = 800,
  maxLoadingTime = 5000
}: AssetsProviderProps) => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [manuallyLoadedAssets, setManuallyLoadedAssets] = useState(0);
  const [canHideLoader, setCanHideLoader] = useState(false);
  const { active, progress, loaded, total } = useProgress();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingStuck, setLoadingStuck] = useState(false);

  // Force de fermer le loader si nécessaire
  const forceHideLoader = () => {
    setAssetsLoaded(true);
    setIsInitialLoading(false);
  };

  // Ensure minimum loading time for UX reasons
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanHideLoader(true);
    }, minimumLoadingTime);

    return () => clearTimeout(timer);
  }, [minimumLoadingTime]);

  // Ajouter un timer de sécurité pour fermer le loader après un certain temps
  useEffect(() => {
    // Si le loader est à 100% pendant 1 seconde, on considère que le chargement est terminé
    if (progress === 100) {
      const stuckTimer = setTimeout(() => {
        setLoadingStuck(true);
      }, 1000); // Réduit à 1s au lieu de 3s

      return () => clearTimeout(stuckTimer);
    }
  }, [progress]);

  // Fermeture forcée après un délai maximum
  useEffect(() => {
    const maxTimer = setTimeout(() => {
      if (!assetsLoaded) {
        setAssetsLoaded(true);
        setIsInitialLoading(false);
      }
    }, maxLoadingTime);

    return () => clearTimeout(maxTimer);
  }, [assetsLoaded, maxLoadingTime]);

  // Determine when assets are fully loaded
  useEffect(() => {
    // Assets are loaded when:
    // 1. R3F loader is done (progress is 100% or active is false)
    // 2. Any manually registered assets are loaded
    // 3. Minimum loading time has passed
    // 4. Or if loading is stuck at 100%
    if (!assetsLoaded && (((!active || progress === 100) && canHideLoader) || loadingStuck)) {
      setAssetsLoaded(true);
      setIsInitialLoading(false);
    }
  }, [active, progress, manuallyLoadedAssets, canHideLoader, loadingStuck, assetsLoaded]);

  const registerAssetLoad = () => {
    setManuallyLoadedAssets(prev => prev + 1);
  };

  return (
    <AssetsContext.Provider value={{ assetsLoaded, registerAssetLoad, isInitialLoading, forceHideLoader }}>
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