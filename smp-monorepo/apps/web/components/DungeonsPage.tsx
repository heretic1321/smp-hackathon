import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ArrowLeft, Users, Crown, Info, Sword, Clock, Trophy, MapPin, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { apiClient, type GatesResponse, type GateWithOccupancy } from '@smp/shared';
import { authService } from '../src/lib/auth';

interface DungeonsPageProps {
    onNavigate: (page: 'home' | 'auth' | 'username-setup' | 'profile' | 'dungeons' | 'party') => void;
    onJoinDungeon: (gateId: string) => void;
}

export function DungeonsPage({ onNavigate, onJoinDungeon }: DungeonsPageProps) {
    const [gates, setGates] = useState<GateWithOccupancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedGate, setSelectedGate] = useState<GateWithOccupancy | null>(null);

    useEffect(() => {
        loadGates();
    }, []);

    const loadGates = async () => {
        try {
            const response = await apiClient.getGates();
            // Normalize to ensure occupancy exists on every gate
            const normalized = (response.gates || []).map((g: any) => ({
                ...g,
                occupancy: Array.isArray(g.occupancy) ? g.occupancy : [],
            })) as GateWithOccupancy[];
            setGates(normalized);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load dungeons');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen relative flex items-center justify-center">
                <div className="text-white text-lg">Loading dungeons...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-screen relative flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-400" />
                    <div className="text-red-400 text-lg">{error}</div>
                    <Button
                        onClick={loadGates}
                        className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
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

const getRankBadgeColor = (rank: string) => {
    switch (rank) {
        case 'S': return 'bg-yellow-500 text-black';
        case 'A': return 'bg-purple-500 text-white';
        case 'B': return 'bg-blue-500 text-white';
        case 'C': return 'bg-green-500 text-white';
        case 'D': return 'bg-gray-500 text-white';
        case 'E': return 'bg-red-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
};

    return (
        <div className="w-full min-h-screen relative">
            {/* Enhanced Purple Aura Background Effects - More intense for dungeons */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-950/90 via-purple-900/80 to-slate-950/95 pointer-events-none"></div>
            <div className="fixed top-1/6 left-1/6 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="fixed bottom-1/5 right-1/5 w-[400px] h-[400px] bg-indigo-500/25 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
            <div className="fixed top-1/2 left-1/2 w-[350px] h-[350px] bg-violet-600/20 rounded-full blur-2xl animate-pulse delay-500 pointer-events-none"></div>
            <div className="fixed top-3/4 left-1/8 w-[300px] h-[300px] bg-purple-700/15 rounded-full blur-2xl animate-pulse delay-300 pointer-events-none"></div>
            <div className="fixed top-1/8 right-1/3 w-[250px] h-[250px] bg-indigo-600/18 rounded-full blur-2xl animate-pulse delay-700 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-4">
                    <Button
                        variant="ghost"
                        className="text-white hover:text-purple-200 hover:bg-purple-800/40 border border-purple-600/30"
                        onClick={() => onNavigate('profile')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Profile
                    </Button>

                    <div className="flex items-center space-x-4">
                        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 px-4 py-2">
                            <Crown className="w-4 h-4 mr-2" />
                            Active Dungeons
                        </Badge>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 px-4 sm:px-6 pb-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                                Shadow Dungeons
                            </h1>
                            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
                                Enter mystical dungeons filled with shadow creatures and valuable treasures. Choose your challenge wisely, Hunter.
                            </p>
                        </div>

                        {/* Dungeons Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {gates.map((gate) => {
                                const totalOccupancy = gate.occupancy.reduce((sum, occ) => sum + occ.current, 0);
                                const maxCapacity = gate.capacity;

                                return (
                                    <Card key={gate.id} className="bg-black/90 border-purple-500/50 shadow-2xl shadow-purple-700/30 hover:shadow-purple-600/40 hover:border-purple-400/70 transition-all duration-300 group overflow-hidden">
                                    <div className="relative">
                                        {/* Dungeon Image */}
                                        <div className="aspect-video relative overflow-hidden">
                                            <ImageWithFallback
                                                    src={gate.thumbUrl}
                                                    alt={gate.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                            {/* Rank Badge */}
                                                <div className={`absolute top-3 left-3 w-10 h-10 ${getRankBadgeColor(gate.rank)} rounded-full flex items-center justify-center font-bold shadow-lg`}>
                                                    {gate.rank}
                                            </div>

                                            {/* Player Count */}
                                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center space-x-1">
                                                <Users className="w-4 h-4 text-purple-300" />
                                                    <span className="text-white font-semibold">{totalOccupancy}/{maxCapacity}</span>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <CardContent className="p-4">
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                                                    {gate.name}
                                            </h3>

                                            <div className="flex items-center justify-between mb-4">
                                                <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                                                        {gate.rank} Rank
                                                </Badge>
                                                <div className="flex items-center space-x-1 text-sm text-gray-400">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{gate.mapCode}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <Button
                                                    className="flex-1 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-lg"
                                                        disabled={totalOccupancy >= maxCapacity}
                                                        onClick={() => onJoinDungeon(gate.id)}
                                                >
                                                    <Sword className="w-4 h-4 mr-2" />
                                                        {totalOccupancy >= maxCapacity ? 'Full' : 'Join'}
                                                </Button>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-lg"
                                                                onClick={() => setSelectedGate(gate)}
                                                        >
                                                            <Info className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-black/95 border-purple-500/50 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-2xl text-white flex items-center space-x-3">
                                                                    <div className={`w-8 h-8 ${getRankBadgeColor(selectedGate?.rank || 'E')} rounded-full flex items-center justify-center font-bold`}>
                                                                        {selectedGate?.rank || 'E'}
                                                                </div>
                                                                    <span>{selectedGate?.name || 'Unknown Gate'}</span>
                                                            </DialogTitle>
                                                            <DialogDescription className="text-purple-200">
                                                                    Detailed information about {selectedGate?.name || 'this gate'} including capacity and active parties.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="space-y-6">
                                                            {/* Large Image */}
                                                            <div className="aspect-video relative overflow-hidden rounded-lg">
                                                                <ImageWithFallback
                                                                        src={selectedGate?.thumbUrl || ''}
                                                                        alt={selectedGate?.name || 'Gate'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                            </div>

                                                            {/* Description */}
                                                            <div>
                                                                <h4 className="text-lg font-semibold text-purple-300 mb-2">Description</h4>
                                                                    <p className="text-gray-300 leading-relaxed">{selectedGate?.description || 'No description available'}</p>
                                                            </div>

                                                                {/* Gate Stats */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-purple-950/50 border border-purple-600/30 rounded-lg p-3">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <Users className="w-4 h-4 text-purple-400" />
                                                                            <span className="text-sm text-purple-300">Total Capacity</span>
                                                                    </div>
                                                                        <p className="text-white font-semibold">{maxCapacity}</p>
                                                                </div>

                                                                <div className="bg-purple-950/50 border border-purple-600/30 rounded-lg p-3">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                            <MapPin className="w-4 h-4 text-purple-400" />
                                                                            <span className="text-sm text-purple-300">Map Code</span>
                                                                    </div>
                                                                        <p className="text-white font-semibold">{selectedGate?.mapCode || 'Unknown'}</p>
                                                                </div>
                                                            </div>

                                                                {/* Occupancy */}
                                                                {selectedGate?.occupancy && selectedGate.occupancy.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-lg font-semibold text-purple-300 mb-3">Active Parties</h4>
                                                                        <div className="space-y-2">
                                                                            {selectedGate.occupancy.map((party, index) => (
                                                                                <div key={index} className="bg-slate-950/60 border border-purple-600/30 rounded-lg p-3">
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-white font-semibold">Party {party.partyId}</span>
                                                                                        <Badge className="bg-purple-600/20 text-purple-300">
                                                                                            {party.current}/{party.max} players
                                                                                        </Badge>
                                                            </div>
                                                                </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                                )}

                                                            {/* Action Button */}
                                                            <Button
                                                                className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-xl shadow-purple-600/30 py-6"
                                                                    disabled={totalOccupancy >= maxCapacity}
                                                                size="lg"
                                                                    onClick={() => selectedGate && onJoinDungeon(selectedGate.id)}
                                                            >
                                                                <Sword className="w-5 h-5 mr-3" />
                                                                    {totalOccupancy >= maxCapacity ? 'Gate Full' : `Join ${selectedGate?.name || 'Gate'}`}
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardContent>

                                        {/* Aura Effect Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                </Card>
                                );
                            })}
                        </div>

                        {/* Stats Footer */}
                        <div className="mt-12 text-center">
                            <div className="inline-flex items-center space-x-8 bg-black/80 border border-purple-600/40 rounded-lg px-8 py-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{gates.length}</p>
                                    <p className="text-sm text-purple-300">Active Gates</p>
                                </div>
                                <div className="w-px h-8 bg-purple-600/40"></div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {gates.reduce((sum, gate) => sum + gate.occupancy.reduce((occSum, occ) => occSum + occ.current, 0), 0)}
                                    </p>
                                    <p className="text-sm text-purple-300">Active Hunters</p>
                                </div>
                                <div className="w-px h-8 bg-purple-600/40"></div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {gates.filter(g => ['S', 'A', 'B'].includes(g.rank)).length}
                                    </p>
                                    <p className="text-sm text-purple-300">Elite Gates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}