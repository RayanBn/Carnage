import React, { useEffect, useState } from "react";

interface LoaderProps {
  isLoading: boolean;
  progress?: number;
  stuck?: boolean;
  onManualClose?: () => void;
}

const Loader = ({ isLoading, progress = 0, stuck = false, onManualClose }: LoaderProps) => {
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      console.log("Loader isLoading:", isLoading, "Progress:", progress, "Stuck:", stuck);
    }
  }, [isLoading, progress, stuck]);
  
  // Afficher un bouton de continuation après un certain temps
  useEffect(() => {
    if (isLoading && progress >= 90) {
      const buttonTimer = setTimeout(() => {
        console.log("Showing continue button after delay");
        setShowContinueButton(true);
      }, 1500);
      
      return () => clearTimeout(buttonTimer);
    }
  }, [isLoading, progress]);
  
  if (!isLoading) return null;
  
  // Ensure progress is between 0 and 100
  const safeProgress = Math.min(Math.max(0, Math.round(progress)), 100);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-carnage-blue-dark bg-opacity-90">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 relative">
          <div className="absolute inset-0 border-4 border-t-carnage-red border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-1 border-4 border-t-transparent border-r-carnage-yellow border-b-transparent border-l-transparent rounded-full animate-spin animate-delay-150"></div>
          <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-carnage-red border-l-transparent rounded-full animate-spin animate-delay-300"></div>
        </div>
        <p className="mt-4 text-white font-bold text-xl font-montserrat">LOADING... {safeProgress}%</p>
        <div className="w-64 h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-carnage-yellow rounded-full transition-all duration-300 ease-out"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
        
        {/* Afficher un bouton pour continuer manuellement si bloqué à 100% ou après un délai */}
        {(stuck || showContinueButton) && onManualClose && (
          <button 
            onClick={onManualClose}
            className="mt-6 px-4 py-2 bg-carnage-red text-white font-bold font-montserrat rounded-md hover:bg-opacity-80 transition-all"
          >
            CONTINUER
          </button>
        )}
      </div>
    </div>
  );
};

export default Loader; 