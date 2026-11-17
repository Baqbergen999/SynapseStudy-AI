import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AiSettingsModal } from './components/AiSettingsModal';
import { ToastContainer } from './components/ToastContainer';
import { AuthGate } from './components/AuthGate';
import { DecorativeBackground } from './components/DecorativeBackground';
import { DashboardPage } from './pages/DashboardPage';
import { AudioStudioPage } from './pages/AudioStudioPage';
import { ProjectPlannerPage } from './pages/ProjectPlannerPage';

function AppShell() {
  const { authReady, user, route } = useStudy();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-100 flex items-center justify-center relative">
        <DecorativeBackground />
        <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl px-5 py-3.5 shadow-2xl">
          <RotateCw className="h-4 w-4 text-indigo-400 animate-spin" />
          <span className="text-sm font-medium text-zinc-200">SynapseStudy AI</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthGate />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-100 flex overflow-x-hidden">
      <DecorativeBackground />

      <div className="relative z-10 flex w-full min-w-0">
        <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1440px] w-full mx-auto">
            {route === '/dashboard' && <DashboardPage />}
            {route === '/audio-studio' && <AudioStudioPage />}
            {route === '/project-planner' && <ProjectPlannerPage />}
          </main>
        </div>
      </div>

      <AiSettingsModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <AppShell />
    </StudyProvider>
  );
}
