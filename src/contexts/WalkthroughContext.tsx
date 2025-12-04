import { createContext, useContext, useState, type ReactNode } from 'react';

interface WalkthroughContextType {
  isActive: boolean;
  currentStep: 'daybook-add-incoming' | 'incoming-add-farmer' | 'incoming-select-variety' | 'incoming-enter-quantities' | 'incoming-enter-location' | 'incoming-create-button' | 'incoming-voucher-explanation' | 'incoming-voucher-more-details' | 'incoming-voucher-farmer-details' | 'incoming-voucher-quantities' | 'incoming-voucher-locations' | 'incoming-voucher-remarks' | 'daybook-add-outgoing' | 'outgoing-add-farmer' | 'outgoing-select-variety' | 'outgoing-view-table' | 'outgoing-select-checkbox' | 'outgoing-continue-button' | 'outgoing-create-button' | 'outgoing-voucher-created' | 'outgoing-voucher-card' | 'outgoing-voucher-more-details' | 'outgoing-voucher-farmer-details' | 'outgoing-voucher-net-outgoing' | 'outgoing-voucher-detailed-breakdown' | 'outgoing-voucher-remarks' | null;
  startWalkthrough: () => void;
  startOutgoingWalkthrough: () => void;
  nextStep: () => void;
  endWalkthrough: () => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export const WalkthroughProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<'daybook-add-incoming' | 'incoming-add-farmer' | 'incoming-select-variety' | 'incoming-enter-quantities' | 'incoming-enter-location' | 'incoming-create-button' | 'incoming-voucher-explanation' | 'incoming-voucher-more-details' | 'incoming-voucher-farmer-details' | 'incoming-voucher-quantities' | 'incoming-voucher-locations' | 'incoming-voucher-remarks' | 'daybook-add-outgoing' | 'outgoing-add-farmer' | 'outgoing-select-variety' | 'outgoing-view-table' | 'outgoing-select-checkbox' | 'outgoing-continue-button' | 'outgoing-create-button' | 'outgoing-voucher-created' | 'outgoing-voucher-card' | 'outgoing-voucher-more-details' | 'outgoing-voucher-farmer-details' | 'outgoing-voucher-net-outgoing' | 'outgoing-voucher-detailed-breakdown' | 'outgoing-voucher-remarks' | null>(null);

  const startWalkthrough = () => {
    setIsActive(true);
    setCurrentStep('daybook-add-incoming');
  };

  const startOutgoingWalkthrough = () => {
    setIsActive(true);
    setCurrentStep('daybook-add-outgoing');
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
    } else if (currentStep === 'incoming-enter-location') {
      setCurrentStep('incoming-create-button');
    } else if (currentStep === 'incoming-create-button') {
      setCurrentStep('incoming-voucher-explanation');
    } else if (currentStep === 'incoming-voucher-explanation') {
      setCurrentStep('incoming-voucher-more-details');
    } else if (currentStep === 'incoming-voucher-more-details') {
      setCurrentStep('incoming-voucher-farmer-details');
    } else if (currentStep === 'incoming-voucher-farmer-details') {
      setCurrentStep('incoming-voucher-quantities');
    } else if (currentStep === 'incoming-voucher-quantities') {
      setCurrentStep('incoming-voucher-locations');
    } else if (currentStep === 'incoming-voucher-locations') {
      setCurrentStep('incoming-voucher-remarks');
    } else if (currentStep === 'daybook-add-outgoing') {
      setCurrentStep('outgoing-add-farmer');
    } else if (currentStep === 'outgoing-add-farmer') {
      setCurrentStep('outgoing-select-variety');
    } else if (currentStep === 'outgoing-select-variety') {
      setCurrentStep('outgoing-view-table');
    } else if (currentStep === 'outgoing-view-table') {
      setCurrentStep('outgoing-select-checkbox');
    } else if (currentStep === 'outgoing-select-checkbox') {
      setCurrentStep('outgoing-continue-button');
    } else if (currentStep === 'outgoing-continue-button') {
      setCurrentStep('outgoing-create-button');
    } else if (currentStep === 'outgoing-create-button') {
      setCurrentStep('outgoing-voucher-created');
    } else if (currentStep === 'outgoing-voucher-created') {
      setCurrentStep('outgoing-voucher-card');
    } else if (currentStep === 'outgoing-voucher-card') {
      setCurrentStep('outgoing-voucher-more-details');
    } else if (currentStep === 'outgoing-voucher-more-details') {
      setCurrentStep('outgoing-voucher-farmer-details');
    } else if (currentStep === 'outgoing-voucher-farmer-details') {
      setCurrentStep('outgoing-voucher-net-outgoing');
    } else if (currentStep === 'outgoing-voucher-net-outgoing') {
      setCurrentStep('outgoing-voucher-detailed-breakdown');
    } else if (currentStep === 'outgoing-voucher-detailed-breakdown') {
      setCurrentStep('outgoing-voucher-remarks');
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
        startOutgoingWalkthrough,
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
