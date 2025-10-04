import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Crown, Sword, Trophy, MapPin, Calendar, Target, LogOut, Zap } from "lucide-react";
import { authService } from '../src/lib/auth';
import { apiClient, type Profile } from '@smp/shared';
import { DevPanel } from './DevPanel';

interface ProfilePageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'inventory' | 'marketplace') => void;
}

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'S': return 'from-yellow-400 to-orange-500';
    case 'A': return 'from-purple-500 to-pink-500';
    case 'B': return 'from-blue-500 to-cyan-500';
    case 'C': return 'from-green-500 to-emerald-500';
    case 'D': return 'from-gray-400 to-gray-600';
    case 'E': return 'from-red-400 to-red-600';
    default: return 'from-gray-400 to-gray-600';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'S': return 'bg-yellow-500';
    case 'A': return 'bg-purple-500';
    case 'B': return 'bg-blue-500';
    case 'C': return 'bg-green-500';
    case 'D': return 'bg-gray-500';
    case 'E': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showDevPanel, setShowDevPanel] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const address = authService.address;
      if (!address) {
        throw new Error('No wallet address found');
      }

      const profileData = await apiClient.getProfile(address);
      setProfile(profileData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-screen relative flex items-center justify-center">
        <div className="text-red-400 text-lg">{error || 'Profile not found'}</div>
      </div>
    );
  }

  const experiencePercentage = 100; // Simplified for now
  const isDevUser = profile?.displayName.toLowerCase() === 'heretic';

  return (
    <div className="w-full min-h-screen relative">
      {/* Dev Panel Modal */}
      {showDevPanel && <DevPanel onNavigate={() => setShowDevPanel(false)} />}
      {/* Enhanced Purple Aura Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/80 via-purple-900/70 to-slate-950/90 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-violet-600/15 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4">
          <Button
            variant="ghost"
            className="text-white hover:text-purple-200 hover:bg-purple-800/40 border border-purple-600/30"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center space-x-4">
            {isDevUser && (
              <Button
                className="bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-800 hover:to-orange-800 text-white shadow-xl shadow-red-600/30"
                onClick={() => setShowDevPanel(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Dev Panel
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30"
              onClick={() => onNavigate('dungeons')}
            >
              Browse Dungeons
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30"
              onClick={() => onNavigate('inventory')}
            >
              Inventory
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30"
              onClick={() => onNavigate('marketplace')}
            >
              Marketplace
            </Button>
            <Button
              variant="outline"
              className="border-purple-500/50 text-purple-700 hover:bg-purple-800/40 hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="mb-8">
              <Card className="bg-black/90 border-purple-500/50 shadow-2xl shadow-purple-700/40">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-600/30">
                        <Crown className="w-12 h-12 text-white" />
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${getRankColor(profile.rank)} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                        {profile.rank}
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        {profile.displayName}
                      </h1>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                        <Badge className={`bg-gradient-to-r ${getRankColor(profile.rank)} text-white border-0`}>
                          Rank {profile.rank}
                        </Badge>
                        <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                          Level {profile.level}
                        </Badge>
                        <Badge variant="outline" className="border-indigo-500/50 text-indigo-300">
                          {profile.avatarId}
                        </Badge>
                      </div>

                      {/* Experience Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Experience</span>
                          <span className="text-white">{profile.xp} XP</span>
                        </div>
                        <Progress
                          value={experiencePercentage}
                          className="h-3 bg-slate-800 border border-purple-600/30"
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-purple-950/50 border border-purple-600/30 rounded-lg p-3">
                        <p className="text-2xl font-bold text-white">-</p>
                        <p className="text-xs text-purple-300">Total Kills</p>
                      </div>
                      <div className="bg-purple-950/50 border border-purple-600/30 rounded-lg p-3">
                        <p className="text-2xl font-bold text-white">-</p>
                        <p className="text-xs text-purple-300">Bosses</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-black/80 border border-purple-600/40">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-700 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="dungeons" className="text-white data-[state=active]:bg-purple-700 data-[state=active]:text-white">
                  Dungeons
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-white data-[state=active]:bg-purple-700 data-[state=active]:text-white">
                  Achievements
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Sword, label: "Total Kills", value: "-", color: "text-red-400" },
                    { icon: Trophy, label: "Bosses Defeated", value: "-", color: "text-yellow-400" },
                    { icon: Target, label: "Rare Items", value: "-", color: "text-purple-400" },
                    { icon: Calendar, label: "Hours Played", value: "-", color: "text-blue-400" }
                  ].map((stat, index) => (
                    <Card key={index} className="bg-black/80 border-purple-600/40 hover:border-purple-500/60 transition-colors">
                      <CardContent className="p-4 text-center">
                        <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-black/80 border-purple-600/40">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                      Hunter Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><span className="text-purple-400">Wallet:</span> {profile.wallet.slice(0, 6)}...{profile.wallet.slice(-4)}</p>
                        <p><span className="text-purple-400">Class:</span> {profile.avatarId}</p>
                      </div>
                      <div>
                        <p><span className="text-purple-400">Current Rank:</span> {profile.rank}</p>
                        <p><span className="text-purple-400">Level:</span> {profile.level}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dungeons Tab */}
              <TabsContent value="dungeons" className="space-y-4 mt-6">
                <Card className="bg-black/80 border-purple-600/40">
                  <CardHeader>
                    <CardTitle className="text-white">Cleared Dungeons (0)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-400">
                      <p>No dungeons cleared yet. Start your journey!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "First Steps", description: "Complete your first dungeon", completed: true },
                    { title: "Boss Hunter", description: "Defeat 10 bosses", completed: true },
                    { title: "Collector", description: "Find 10 rare items", completed: true },
                    { title: "Shadow Master", description: "Reach Rank A", completed: true },
                    { title: "Legend", description: "Reach Rank S", completed: false },
                    { title: "Nightmare Slayer", description: "Clear all S-rank dungeons", completed: false }
                  ].map((achievement, index) => (
                    <Card key={index} className={`border-purple-600/40 ${achievement.completed ? 'bg-purple-950/30' : 'bg-black/60'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.completed ? 'bg-purple-600' : 'bg-gray-600'}`}>
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${achievement.completed ? 'text-white' : 'text-gray-400'}`}>
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-gray-400">{achievement.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}