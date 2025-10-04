"use client";

import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { 
  ArrowLeft, Code, Rocket, Database, Coins, Trophy, 
  Users, CheckCircle, XCircle, Copy, ExternalLink, Shield, AlertTriangle
} from "lucide-react";
import { authService } from '../src/lib/auth';
import { apiClient, type ResultSummary } from '@smp/shared';

interface DevPanelProps {
  onNavigate: (page: string) => void;
}

export function DevPanel({ onNavigate }: DevPanelProps) {
  const [activeTab, setActiveTab] = useState("runs");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  // Run Finish Test
  const [runId, setRunId] = useState('');
  const [bossId, setBossId] = useState('TestBoss');
  const [damage, setDamage] = useState('1000');

  // Gate Seed Test
  const [gatesSeedResult, setGatesSeedResult] = useState<any>(null);

  // Profile Test
  const [testAddress, setTestAddress] = useState('');

  useEffect(() => {
    const address = authService.address;
    if (address) {
      setTestAddress(address);
    }
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authService.isAuthenticated) {
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
  }, []);

  const handleFinishRun = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const address = authService.address;
      if (!address) {
        throw new Error('Not authenticated');
      }

      const finishData = {
        bossId,
        contributions: [
          { wallet: address, damage: parseInt(damage) }
        ]
      };

      const idempotencyKey = `test_${Date.now()}`;

      const response = await apiClient.finishRun(runId, finishData, idempotencyKey);

      setResult({
        type: 'success',
        title: 'Run Finished Successfully!',
        data: response,
        txHash: response.txHash,
        relics: response.relics
      });
    } catch (err: any) {
      setError(err.message || 'Failed to finish run');
      setResult({
        type: 'error',
        title: 'Error',
        data: err
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeedGates = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://api.lvh.me:4000/v1/gates/seed', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      setGatesSeedResult(data);
      setResult({
        type: 'success',
        title: 'Gates Seeded Successfully!',
        data
      });
    } catch (err: any) {
      setError(err.message || 'Failed to seed gates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestRun = async () => {
    setLoading(true);
    setError('');

    try {
      const gateId = 'C_FROST'; // Test gate ID

      const response = await fetch(`http://api.lvh.me:4000/v1/runs/create-test/${gateId}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.ok) {
        setResult({
          type: 'success',
          title: 'Test Run Created!',
          data: data.data,
          runId: data.data.runId // Use run ID from the response
        });
        setRunId(data.data.runId);
      } else {
        throw new Error(data.error?.message || 'Failed to create test run');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create test run');
      setResult({
        type: 'error',
        title: 'Error',
        data: err
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetProfile = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const profile = await apiClient.getProfile(testAddress as any);
      setResult({
        type: 'success',
        title: 'Profile Retrieved',
        data: profile
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get profile');
      setResult({
        type: 'error',
        title: 'Error',
        data: err
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetInventory = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const inventory = await apiClient.getInventory(testAddress as any);
      setResult({
        type: 'success',
        title: 'Inventory Retrieved',
        data: inventory
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get inventory');
      setResult({
        type: 'error',
        title: 'Error',
        data: err
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckHealth = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://api.lvh.me:4000/v1/health');
      const data = await response.json();
      setResult({
        type: 'success',
        title: 'Backend Health Check',
        data
      });
    } catch (err: any) {
      setError(err.message || 'Health check failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Show loading state while checking admin status
  if (adminLoading) {
    return (
      <div className="w-full min-h-screen relative">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900 pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="bg-black/80 border-purple-600/40 p-8">
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-white">Checking admin access...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show unauthorized access message if not admin
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen relative">
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900 pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="bg-black/80 border-red-600/40 p-8 max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="w-16 h-16 text-red-400" />
              </div>
              <CardTitle className="text-white flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-400" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-300">
                You don't have admin privileges to access the Developer Panel.
              </p>
              <Button
                onClick={() => onNavigate('home')}
                className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-900 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-purple-600/30">
          <div className="flex items-center space-x-4">
            <Code className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Developer Panel</h1>
            <Badge className="bg-yellow-600">DEV MODE</Badge>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:text-purple-200 hover:bg-purple-800/40 border border-purple-600/30"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 bg-black/80 border border-purple-600/40">
                <TabsTrigger value="runs" className="text-white data-[state=active]:bg-purple-700">
                  <Rocket className="w-4 h-4 mr-2" />
                  Runs & Minting
                </TabsTrigger>
                <TabsTrigger value="gates" className="text-white data-[state=active]:bg-purple-700">
                  <Database className="w-4 h-4 mr-2" />
                  Gates
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-white data-[state=active]:bg-purple-700">
                  <Users className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="inventory" className="text-white data-[state=active]:bg-purple-700">
                  <Coins className="w-4 h-4 mr-2" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="health" className="text-white data-[state=active]:bg-purple-700">
                  <Trophy className="w-4 h-4 mr-2" />
                  System
                </TabsTrigger>
              </TabsList>

              {/* Runs & Minting Tab */}
              <TabsContent value="runs" className="space-y-6 mt-6">
                <Card className="bg-black/80 border-purple-600/40">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Rocket className="w-5 h-5 mr-2 text-purple-400" />
                      Test Run Finish & Blockchain Minting
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                      Complete testing workflow for blockchain minting and SBT updates
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSeedGates}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white"
                      >
                        {loading ? 'Seeding...' : '1. Seed Gates'}
                      </Button>
                      <Button
                        onClick={handleCreateTestRun}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-700 to-blue-700 hover:from-green-800 hover:to-blue-800 text-white"
                      >
                        {loading ? 'Creating...' : '2. Create Test Run'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="runId" className="text-white">Run ID</Label>
                        <Input
                          id="runId"
                          value={runId || 'Generated after creating test run'}
                          disabled
                          className="bg-black/70 border-purple-500/50 text-gray-400"
                          placeholder="Generated after creating test run"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bossId" className="text-white">Boss ID</Label>
                        <Input
                          id="bossId"
                          value={bossId}
                          onChange={(e) => setBossId(e.target.value)}
                          className="bg-black/70 border-purple-500/50 text-white"
                          placeholder="TestBoss"
                        />
                      </div>
                      <div>
                        <Label htmlFor="damage" className="text-white">Damage Dealt</Label>
                        <Input
                          id="damage"
                          type="number"
                          value={damage}
                          onChange={(e) => setDamage(e.target.value)}
                          className="bg-black/70 border-purple-500/50 text-white"
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Your Address</Label>
                        <Input
                          value={testAddress}
                          disabled
                          className="bg-black/70 border-purple-500/50 text-gray-400"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleFinishRun}
                      disabled={loading || !testAddress || !runId}
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white"
                    >
                      {loading ? 'Processing...' : '3. Finish Run & Mint NFTs'}
                    </Button>

                    <div className="bg-purple-950/30 border border-purple-600/30 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2">Testing Flow:</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>1. ✅ Connect wallet and authenticate</li>
                        <li>2. ✅ Create profile (if new user)</li>
                        <li>3. ✅ Seed gates data</li>
                        <li>4. ✅ Create test run</li>
                        <li>5. ✅ Finish run → trigger blockchain minting</li>
                        <li>6. ✅ View minted relics and SBT updates</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gates Tab */}
              <TabsContent value="gates" className="space-y-6 mt-6">
                <Card className="bg-black/80 border-purple-600/40">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Database className="w-5 h-5 mr-2 text-purple-400" />
                      Seed Gates Data
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                      Populate the database with initial gate/dungeon data
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleSeedGates}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white"
                    >
                      {loading ? 'Seeding...' : 'Seed Gates'}
                    </Button>

                    {gatesSeedResult && (
                      <div className="bg-green-950/20 border border-green-500/30 rounded-lg p-4">
                        <p className="text-green-400">
                          ✅ Seeded {gatesSeedResult.data?.count || 0} gates
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6 mt-6">
                <Card className="bg-black/80 border-purple-600/40">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-400" />
                      Test Profile API
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="profileAddress" className="text-white">Address</Label>
                      <Input
                        id="profileAddress"
                        value={testAddress}
                        onChange={(e) => setTestAddress(e.target.value)}
                        className="bg-black/70 border-purple-500/50 text-white"
                        placeholder="0x..."
                      />
                    </div>

                    <Button
                      onClick={handleGetProfile}
                      disabled={loading || !testAddress}
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white"
                    >
                      {loading ? 'Loading...' : 'Get Profile'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-6 mt-6">
                <Card className="bg-black/80 border-purple-600/40">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Coins className="w-5 h-5 mr-2 text-purple-400" />
                      Test Inventory API
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                      View minted relics for an address
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="inventoryAddress" className="text-white">Address</Label>
                      <Input
                        id="inventoryAddress"
                        value={testAddress}
                        onChange={(e) => setTestAddress(e.target.value)}
                        className="bg-black/70 border-purple-500/50 text-white"
                        placeholder="0x..."
                      />
                    </div>

                    <Button
                      onClick={handleGetInventory}
                      disabled={loading || !testAddress}
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white"
                    >
                      {loading ? 'Loading...' : 'Get Inventory'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Health Tab */}
              <TabsContent value="health" className="space-y-6 mt-6">
                <Card className="bg-black/80 border-purple-600/40">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-purple-400" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleCheckHealth}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white"
                    >
                      {loading ? 'Checking...' : 'Check Backend Health'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Results Display */}
            {result && (
              <Card className="mt-6 bg-black/90 border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      {result.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 mr-2 text-red-400" />
                      )}
                      {result.title}
                    </span>
                    {result.txHash && (
                      <a
                        href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
                      >
                        View on BaseScan
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.relics && result.relics.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-2">Minted Relics:</h4>
                      <div className="space-y-2">
                        {result.relics.map((relic: any, index: number) => (
                          <div key={index} className="bg-purple-950/30 border border-purple-600/30 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-white">Token ID: {relic.tokenId}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(relic.cid)}
                                className="text-purple-300"
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                CID: {relic.cid.substring(0, 8)}...
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <ScrollArea className="h-[400px] w-full">
                    <pre className="text-sm text-green-400 bg-slate-950/60 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="mt-6 bg-red-950/20 border-red-500/50">
                <CardContent className="p-4">
                  <p className="text-red-400 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    {error}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Reference */}
            <Card className="mt-6 bg-black/80 border-purple-600/40">
              <CardHeader>
                <CardTitle className="text-white">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-purple-400 font-semibold mb-2">API Endpoints</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• POST /v1/runs/:runId/finish</li>
                      <li>• GET /v1/results/:runId</li>
                      <li>• GET /v1/inventory/:address</li>
                      <li>• POST /v1/gates/seed</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-purple-400 font-semibold mb-2">Blockchain Actions</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• BossLog.emitBossKilled()</li>
                      <li>• Relic721.mint()</li>
                      <li>• PlayerCardSBT.updateProgress()</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}