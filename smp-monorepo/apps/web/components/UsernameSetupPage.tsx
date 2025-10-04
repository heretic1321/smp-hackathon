import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, User, Sparkles, AlertCircle } from "lucide-react";
import { authService } from '../src/lib/auth';
import { apiClient, type ProfileUpsertInput } from '@smp/shared';

interface UsernameSetupPageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile') => void;
}

export function UsernameSetupPage({ onNavigate }: UsernameSetupPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    hunterClass: '',
    imageUrl: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  // Data for the hunter classes
  const hunterClasses = [
    { value: 'assassin', label: 'Assassin', description: 'High speed, critical strikes', icon: '🗡️', disabled: false },
    { value: 'fighter', label: 'Fighter', description: 'Balanced combat abilities', icon: '⚔️', disabled: true },
    { value: 'mage', label: 'Mage', description: 'Powerful magical attacks', icon: '🔮', disabled: true },
    { value: 'healer', label: 'Healer', description: 'Support and recovery magic', icon: '✨', disabled: true },
    { value: 'tank', label: 'Tank', description: 'High defense, damage absorption', icon: '🛡️', disabled: true },
  ];

  const selectedClass = hunterClasses.find(c => c.value === formData.hunterClass);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const address = authService.address;
      if (!address) {
        throw new Error('No wallet address found');
      }

      // Create profile data
      const profileData: ProfileUpsertInput = {
        displayName: formData.username,
        avatarId: formData.hunterClass,
        imageUrl: formData.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`
      };

      // Create profile via API
      await apiClient.createProfile(profileData);

      // Navigate to profile
      onNavigate('profile');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create profile';
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center p-4">
      {/* Enhanced Purple Aura Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/80 via-purple-900/70 to-slate-950/90 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-violet-600/15 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none"></div>
      
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-4 sm:top-6 left-4 sm:left-6 text-white hover:text-purple-200 hover:bg-purple-800/40 z-20 border border-purple-600/30"
        onClick={() => onNavigate('auth')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Wallet
      </Button>

      {/* Setup Card */}
      <div className="relative z-10 w-full max-w-lg mx-auto py-2">
        <Card className="bg-black/90 backdrop-blur-sm border-purple-500/50 shadow-2xl shadow-purple-700/40">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl shadow-purple-600/30">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-white mb-2">
              Create Your Hunter
            </CardTitle>
            <p className="text-gray-300">
              Welcome, new Hunter! Let's set up your profile to begin your journey.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="bg-purple-950/50 border border-purple-600/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-semibold">New Hunter Detected</p>
                    <p className="text-sm text-gray-400">Starting Rank: E | Level: 1</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Hunter Name</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose your hunter name"
                  className="bg-black/70 border-purple-500/50 text-white placeholder:text-gray-400 focus:border-purple-400 focus:bg-black/80"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-400">
                  This name will be visible to other hunters in the realm.
                </p>
              </div>

              {/* MODIFIED SELECT COMPONENT */}
              <div className="space-y-2">
                <Label htmlFor="hunterClass" className="text-white">Starting Class</Label>
                <Select value={formData.hunterClass} onValueChange={(value: string) => setFormData({...formData, hunterClass: value})}>
                  <SelectTrigger className="bg-black/70 border-purple-500/50 text-white focus:border-purple-400">
                    <SelectValue placeholder="Select your starting class">
                      {/* This renders the selected value's custom display */}
                      {selectedClass && (
                        <div className="flex items-center space-x-3">
                          <span>{selectedClass.icon}</span>
                          <p>{selectedClass.label}</p>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-purple-500/50">
                    {hunterClasses.map((hunterClass) => (
                      <SelectItem 
                        key={hunterClass.value}
                        value={hunterClass.value} 
                        className="text-white hover:bg-purple-800/50 focus:bg-purple-800/50"
                        disabled={hunterClass.disabled}
                      >
                        {/* This renders the full item in the dropdown list */}
                        <div className="flex items-center space-x-3">
                          <span>{hunterClass.icon}</span>
                          <div>
                            <p>{hunterClass.label}</p>
                            <p className="text-xs text-gray-400">{hunterClass.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="flex items-center text-red-400 text-sm bg-red-950/20 border border-red-500/30 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={!formData.username || !formData.hunterClass || isCreating}
                className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30 py-6 disabled:opacity-50"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating Hunter Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Begin Your Awakening
                  </>
                )}
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-slate-950/60 border border-purple-600/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">What happens next:</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Your hunter profile will be created on-chain
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  You'll receive your PlayerCard SBT
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Access to dungeons and combat will be unlocked
                </li>
              </ul>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center space-x-4 pt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Floating Rank Display with better contrast */}
        <div className="absolute -top-3 -right-6 bg-black/90 backdrop-blur-sm border border-purple-500/50 rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <p className="text-purple-300 text-xs">Starting Rank</p>
            <p className="text-white font-bold text-lg">E</p>
          </div>
        </div>

        {/* Floating Level Display */}
        <div className="absolute -bottom-1 -left-4 bg-black/90 backdrop-blur-sm border border-purple-500/50 rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <p className="text-purple-300 text-xs">Level</p>
            <p className="text-white font-bold text-lg">1</p>
          </div>
        </div>
      </div>
    </div>
  );
}