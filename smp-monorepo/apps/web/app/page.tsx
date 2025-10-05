"use client";
import Image, { type ImageProps } from "next/image";
// import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { useState, useEffect } from 'react';
import { HomePage } from '../components/HomePage';
import { AuthPage } from '../components/AuthPage';
import { UsernameSetupPage } from '../components/UsernameSetupPage';
import { ProfilePage } from '../components/ProfilePage';
import { DungeonsPage } from '../components/DungeonsPage';
import { PartyPage } from '../components/PartyPage';
import { InventoryPage } from '../components/InventoryPage';
import { MarketplacePage } from '../components/MarketplacePage';
import { DevPanel } from '../components/DevPanel';
import { GameCompletedPage } from '../components/GameCompletedPage';
import { GameStartedPage } from '../components/GameStartedPage';
import { authService } from '../src/lib/auth';
import { apiClient } from '@smp/shared';

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party' | 'inventory' | 'marketplace' | 'dev' | 'gamecompleted' | 'gamestarted'>('home');
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      setIsCheckingSession(true);
      try {
        const hasSession = await authService.checkSession();
        if (hasSession) {
          // Check if user has a profile
          try {
            const address = authService.address;
            if (address) {
              const profile = await apiClient.getProfile(address);
              if (profile) {
                // User is fully set up, go to profile page
                setCurrentPage('profile');
              } else {
                // User is authenticated but no profile, go to username setup
                setCurrentPage('username-setup');
              }
            }
          } catch (error) {
            // Profile doesn't exist, go to username setup
            setCurrentPage('username-setup');
          }
        }
        // If no session, stay on home page
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, []);

  const handleNavigateToParty = (gateId: string) => {
    setSelectedGateId(gateId);
    setCurrentPage('party');
  };
  
  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'auth':
        return <AuthPage onNavigate={setCurrentPage} />;
      case 'username-setup':
        return <UsernameSetupPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      case 'dungeons':
        return <DungeonsPage onNavigate={setCurrentPage} onJoinDungeon={handleNavigateToParty} />;
      case 'party':
        return <PartyPage onNavigate={setCurrentPage} gateId={selectedGateId} />;
      case 'inventory':
        return <InventoryPage onNavigate={setCurrentPage} onNavigateToMarketplace={(relicId) => setCurrentPage('marketplace')} />;
      case 'marketplace':
        return <MarketplacePage onNavigate={setCurrentPage} />;
      case 'dev':
        return <DevPanel onNavigate={(page: string) => setCurrentPage(page as any)} />;
      case 'gamecompleted':
        return <GameCompletedPage onNavigate={setCurrentPage} />;
      case 'gamestarted':
        return <GameStartedPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {renderPage()}
    </div>
  );
}
