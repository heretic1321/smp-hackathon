import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { authService } from '../src/lib/auth';
import { LogOut } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'dev') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [authState, setAuthState] = useState(authService.state);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authState.isAuthenticated) {
        setAdminLoading(true);
        try {
          const adminStatus = await authService.checkAdminStatus();
          setIsAdmin(adminStatus);
        } catch (error) {
          setIsAdmin(false);
        } finally {
          setAdminLoading(false);
        }
      } else {
        setIsAdmin(false);
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [authState.isAuthenticated]);

  const isAuthenticated = authState.isAuthenticated;
  return (
    <div className="w-full min-h-screen relative">
      {/* Enhanced Purple Aura Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/80 via-purple-900/70 to-slate-950/90 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-violet-600/15 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none"></div>
      <div className="fixed top-3/4 left-1/6 w-48 h-48 bg-purple-700/12 rounded-full blur-2xl animate-pulse delay-300 pointer-events-none"></div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg shadow-purple-600/25"></div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Shadow Monarch's Path</h1>
          </div>
          <nav className="flex space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30 border border-purple-600/30"
                  onClick={() => onNavigate('dungeons')}
                >
                  Enter Dungeons
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-800/40"
                    onClick={() => onNavigate('dev')}
                  >
                    Dev Panel
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-800/40"
                  onClick={() => authService.signOut().then(() => onNavigate('home'))}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30 border border-purple-600/30"
                onClick={() => onNavigate('auth')}
              >
                Connect Wallet
              </Button>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4">
                Shadow Monarch's Path
              </h2>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-transparent py-1 bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500">
                Own. Fight. Rise.
              </h3>
              <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
                Enter the ultimate Solo Leveling experience. Command shadow armies, conquer dungeons, 
                and ascend to become the Shadow Monarch in this immersive blockchain-powered RPG.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30 px-6 sm:px-8 py-4 sm:py-6"
                  onClick={() => onNavigate('auth')}
                >
                  Begin Your Awakening
                </Button>
                
              </div>
            </div>

            {/* Right Content - Game Preview */}
            <div className="hidden md:flex relative w-full max-w-xs md:max-w-md mx-auto">
              <Card className="bg-black/80 border-purple-500/50 shadow-2xl shadow-purple-700/40 overflow-hidden">
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1662099768240-40d27dd0c843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwZmFudGFzeSUyMHdhcnJpb3IlMjBwdXJwbGUlMjBhdXJhJTIwbXlzdGljYWx8ZW58MXx8fHwxNzU4OTE0MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Shadow Monarch's Path Game Preview"
                    className="w-full h-150 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm opacity-75">Unity WebGL</p>
                    <p className="font-semibold">Shadow Monarch's Awakening</p>
                  </div>
                </div>
              </Card>
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-black/90 backdrop-blur-sm border border-purple-500/50 rounded-lg p-4 shadow-lg">
                <div className="text-center">
                  <p className="text-purple-300 text-sm">Rank</p>
                  <p className="text-white font-bold">S</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Technology Stack Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">
              Powered by Advanced Technology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  category: "Frontend",
                  description: "Next.js web app for profiles and marketplace, Unity WebGL for smooth combat gameplay",
                  icon: "💻",
                  tech: "Next.js + Unity WebGL"
                },
                {
                  category: "Backend", 
                  description: "Colyseus realtime server for combat, Node.js API with MongoDB for data management",
                  icon: "⚙️",
                  tech: "Colyseus + Node.js + MongoDB"
                },
                {
                  category: "Blockchain",
                  description: "PlayerCard SBT for identity, Relic721 for items, BossLog for kill receipts, and Marketplace contracts",
                  icon: "🔗",
                  tech: "Smart Contracts + NFTs"
                }
              ].map((tech, index) => (
                <Card key={index} className="bg-black/80 border-purple-500/50 p-6 hover:border-purple-400/70 hover:bg-black/90 transition-all duration-300 group shadow-lg shadow-purple-700/20">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {tech.icon}
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">{tech.category}</h4>
                  <p className="text-purple-300 text-sm mb-3">{tech.tech}</p>
                  <p className="text-gray-300 text-sm sm:text-base">{tech.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">
              Master the Shadow Realm
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Shadow Army",
                  description: "Command your own army of shadow soldiers extracted from defeated enemies",
                  icon: "👥"
                },
                {
                  title: "Blockchain Items", 
                  description: "True ownership of weapons and relics through NFT technology",
                  icon: "⚔️"
                },
                {
                  title: "Real-time Combat",
                  description: "Engage in fast-paced multiplayer battles with Unity WebGL",
                  icon: "⚡"
                },
                {
                  title: "Boss Hunting",
                  description: "Hunt legendary bosses and earn verified kill receipts on-chain",
                  icon: "🏆"
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-black/80 border-purple-500/50 p-6 hover:border-purple-400/70 hover:bg-black/90 transition-all duration-300 group shadow-lg shadow-purple-700/20">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-200 text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}