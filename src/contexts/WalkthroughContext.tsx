import { createContext, useContext, useState, type ReactNode } from 'react';

interface WalkthroughContextType {
  isActive: boolean;
  currentStep: 'daybook-add-incoming' | 'incoming-add-farmer' | 'incoming-select-variety' | 'incoming-enter-quantities' | 'incoming-enter-location' | null;
  startWalkthrough: () => void;
  nextStep: () => void;
  endWalkthrough: () => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export const WalkthroughProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<'daybook-add-incoming' | 'incoming-add-farmer' | 'incoming-select-variety' | 'incoming-enter-quantities' | 'incoming-enter-location' | null>(null);

  const startWalkthrough = () => {
    setIsActive(true);
    setCurrentStep('daybook-add-incoming');
  };

  const nextStep = () => {
    if (currentStep === 'daybook-add-incoming') {
      setCurrentStep('incoming-add-farmer');
    } else if (currentStep === 'incoming-add-farmer') {
      setCurrentStep('incoming-select-variety');
    } else if (currentStep === 'incoming-select-variety') {
      setCurrentStep('incoming-enter-quantities');
    } else if (currentStep === 'incoming-enter-quantities') {
      setCurrentStep('incoming-enter-location');
    } else {
      endWalkthrough();
    }
  };

  const endWalkthrough = () => {
    setIsActive(false);
    setCurrentStep(null);
  };

  return (
    <WalkthroughContext.Provider
      value={{
        isActive,
        currentStep,
        startWalkthrough,
        nextStep,
        endWalkthrough,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
};

export const useWalkthrough = () => {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
};
