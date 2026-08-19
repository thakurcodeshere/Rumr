import React from 'react';
import { AppProvider, useApp } from './lib/store';
import { MobileFrameShell } from './components/layout/MobileFrameShell';
import { OnboardingView } from './views/OnboardingView';
import { FeedView } from './views/FeedView';
import { TopicsView } from './views/TopicsView';
import { RoomsView } from './views/RoomsView';
import { MatchmakerView } from './views/MatchmakerView';
import { ChatView } from './views/ChatView';
import { ProfileView } from './views/ProfileView';
import { BoostView } from './views/BoostView';
import { SafetyView } from './views/SafetyView';
import { CatalogView } from './views/CatalogView';
import { ArrowLeft, Layers, Sparkles } from 'lucide-react';

const ViewRouter: React.FC = () => {
  const { currentView, selectedCatalogScreen, clearSelectedCatalogScreen, navigate } = useApp();

  return (
    <div className="flex-1 flex flex-col">
      {/* If viewing a selected screen from the 66-screen catalog */}
      {selectedCatalogScreen && (
        <div className="bg-[#1b1526] border-b-2 border-[#a855f7] px-4 py-2 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearSelectedCatalogScreen();
                navigate('catalog');
              }}
              className="p-1 text-[#ccff00] hover:text-white"
              title="Return to 66-Screen Catalog"
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
      {currentView === 'matchmaker' && <MatchmakerView />}
      {currentView === 'chat' && <ChatView />}
      {currentView === 'profile' && <ProfileView />}
      {currentView === 'boost' && <BoostView />}
      {currentView === 'safety' && <SafetyView />}
      {currentView === 'catalog' && <CatalogView />}
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
