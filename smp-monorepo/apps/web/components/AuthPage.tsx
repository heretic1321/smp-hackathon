import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Wallet, AlertCircle } from "lucide-react";
import { authService } from '../src/lib/auth';
import { type Address, apiClient } from '@smp/shared';

interface AuthPageProps {
  onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile') => void;
}

export function AuthPage({ onNavigate }: AuthPageProps) {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      if (state.isAuthenticated && state.address) {
        setConnectionStatus('success');
      } else if (state.isLoading) {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('idle');
      }
    });

    return unsubscribe;
  }, []);

  const connectWallet = async () => {
    setConnectionStatus('connecting');
    setErrorMessage('');

    try {
      const address = await authService.signIn();

      setConnectionStatus('success');

      // Check if user has profile
      try {
        await apiClient.getProfile(address);
        setTimeout(() => {
          onNavigate('profile');
        }, 1000);
      } catch (error) {
        setTimeout(() => {
          onNavigate('username-setup');
        }, 1000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setErrorMessage(message);
      setConnectionStatus('error');
    }
  };

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center p-4">
      {/* Enhanced Purple Aura Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-950/80 via-purple-900/70 to-slate-950/90 pointer-events-none"></div>
      <div className="fixed top-1/3 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-indigo-600/15 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none"></div>
      
      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-4 sm:top-6 left-4 sm:left-6 text-white hover:text-purple-200 hover:bg-purple-800/40 z-20 border border-purple-600/30"
        onClick={() => onNavigate('home')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <Card className="bg-black/90 backdrop-blur-sm border-purple-500/50 shadow-2xl shadow-purple-700/40">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl shadow-purple-600/30">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-white mb-2">
              Connect Your Wallet
            </CardTitle>
            <p className="text-gray-300">
              Connect your MetaMask wallet to enter the Shadow Realm
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                Your wallet serves as your Hunter license and gateway to the blockchain world.
              </p>
              
              {connectionStatus === 'idle' && (
                <Button 
                  onClick={connectWallet}
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30 py-6"
                  size="lg"
                >
                  <Wallet className="w-5 h-5 mr-3" />
                  Connect MetaMask Wallet
                </Button>
              )}

              {connectionStatus === 'connecting' && (
                <Button 
                  disabled
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-6"
                  size="lg"
                >
                  <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Connecting Wallet...
                </Button>
              )}

              {connectionStatus === 'success' && (
                <Button 
                  disabled
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6"
                  size="lg"
                >
                  ✓ Wallet Connected
                </Button>
              )}

              {connectionStatus === 'error' && (
                <div className="space-y-4">
                  <div className="flex items-center text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errorMessage || 'Failed to connect wallet. Please try again.'}
                  </div>
                  <Button
                    onClick={connectWallet}
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30 py-6"
                    size="lg"
                  >
                    <Wallet className="w-5 h-5 mr-3" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>

            {/* Wallet Requirements */}
            <div className="bg-purple-950/50 border border-purple-600/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Requirements:</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  MetaMask wallet installed
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Connected to supported network
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Sufficient gas for transactions
                </li>
              </ul>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center space-x-4 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.4}s` }}
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Floating Power Level */}
        <div className="absolute -top-8 -right-4 bg-black/90 backdrop-blur-sm border border-purple-500/50 rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <p className="text-purple-300 text-xs">Connection Status</p>
            <p className="text-white font-bold">
              {connectionStatus === 'idle' ? 'READY' : 
               connectionStatus === 'connecting' ? 'SYNC' :
               connectionStatus === 'success' ? 'LINKED' : 'ERROR'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}