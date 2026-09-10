import React from 'react';
import { AppProvider, useApp } from './lib/store';
import { MobileFrameShell } from './components/layout/MobileFrameShell';
import { OnboardingView } from './views/OnboardingView';
import { FeedView } from './views/FeedView';
import { TopicsView } from './views/TopicsView';
import { RoomsView } from './views/RoomsView';
import { MatchesView } from './views/MatchesView';
import { MatchmakerView } from './views/MatchmakerView';
import { ChatView } from './views/ChatView';
import { ProfileView } from './views/ProfileView';
import { BoostView } from './views/BoostView';
import { SafetyView } from './views/SafetyView';
import { CatalogView } from './views/CatalogView';
import { WorkflowView } from './views/WorkflowView';
import { ArrowLeft, Layers, GitBranch } from 'lucide-react';
import { BrowserLocationModal } from './components/ui/BrowserLocationModal';

const LocationPromptManager: React.FC = () => {
  const { 
    currentView,
    isRegistered,
    userLocation, 
    updateUserLocation, 
    isLocationModalOpen, 
    setIsLocationModalOpen 
  } = useApp();

  React.useEffect(() => {
    // Only prompt mobile browser users when inside the app (not during onboarding flow)
    if (currentView === 'onboarding' || !isRegistered) return;

    if (typeof window !== 'undefined') {
      const alreadyPrompted = localStorage.getItem('rumr_location_prompted');
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(navigator.userAgent || '');
      const isSmallScreen = window.innerWidth <= 1024;
      const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

      if (!alreadyPrompted && (isMobileUA || (isTouch && isSmallScreen))) {
        localStorage.setItem('rumr_location_prompted', 'true');
        setIsLocationModalOpen(true);
      }
    }
  }, [currentView, isRegistered]);

  return (
    <BrowserLocationModal
      isOpen={isLocationModalOpen}
      onClose={() => setIsLocationModalOpen(false)}
      currentCity={userLocation.city}
      onLocationApproved={(city, coords) => {
        updateUserLocation(city, coords);
      }}
    />
  );
};

const ViewRouter: React.FC = () => {
  const { currentView, selectedCatalogScreen, clearSelectedCatalogScreen, navigate } = useApp();

  return (
    <div className="flex-1 flex flex-col">
      {/* If viewing a selected screen from the design catalog */}
      {selectedCatalogScreen && (
        <div className="bg-[#1b1526] border-b-2 border-[#a855f7] px-4 py-2 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearSelectedCatalogScreen();
                navigate('catalog');
              }}
              className="p-1 text-[#ccff00] hover:text-white"
              title="Return to Design Catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="font-mono text-[10px] text-[#a855f7] font-bold uppercase">
                SCREEN #{selectedCatalogScreen.index.toString().padStart(2, '0')} // {selectedCatalogScreen.category}
              </div>
              <div className="font-serif text-xs font-bold text-white truncate max-w-[200px]">
                {selectedCatalogScreen.title}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              clearSelectedCatalogScreen();
              navigate('catalog');
            }}
            className="font-mono text-[10px] bg-[#ccff00] text-black font-bold uppercase px-2 py-1 flex items-center gap-1"
          >
            <Layers className="w-3 h-3 text-black" />
            Catalog
          </button>
        </div>
      )}

      {/* Primary View Switcher */}
      {currentView === 'onboarding' && <OnboardingView />}
      {currentView === 'feed' && <FeedView />}
      {currentView === 'topics' && <TopicsView />}
      {currentView === 'rooms' && <RoomsView />}
      {currentView === 'matches' && <MatchesView />}
      {currentView === 'matchmaker' && <MatchmakerView />}
      {currentView === 'chat' && <ChatView />}
      {currentView === 'profile' && <ProfileView />}
      {currentView === 'boost' && <BoostView />}
      {currentView === 'safety' && <SafetyView />}
      {currentView === 'catalog' && <CatalogView />}
      {currentView === 'workflow' && <WorkflowView />}

      {/* Browser Location Modal Manager */}
      <LocationPromptManager />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MobileFrameShell>
        <ViewRouter />
      </MobileFrameShell>
    </AppProvider>
  );
};

export default App;
