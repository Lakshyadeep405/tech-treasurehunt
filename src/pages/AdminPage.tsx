import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, QrCode as QRIcon, Download, Search, Trophy, AlertTriangle, Edit3, Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { useGameStore } from '@/store/gameStore';
import { subscribeToLeaderboard, getAllStations, updateStationField } from '@/lib/dbUtils';
import type { TeamDoc } from '@/lib/dbUtils';
import type { StationData } from '@/lib/mockData';
import TopNav from '@/components/TopNav';

export default function AdminPage() {
  const { isAdmin } = useGameStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [teams, setTeams] = useState<TeamDoc[]>([]);
  const [stations, setStations] = useState<Record<number, StationData>>({});
  const [editingStation, setEditingStation] = useState<number | null>(null);
  const [editField, setEditField] = useState<{ field: string; value: string } | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  // Subscribe to live team data
  useEffect(() => {
    setIsRefreshing(true);
    const unsubscribe = subscribeToLeaderboard((fetchedTeams) => {
      setTeams(fetchedTeams);
      setIsRefreshing(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch stations for the questions tab
  useEffect(() => {
    getAllStations().then(setStations).catch(console.error);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const freshStations = await getAllStations();
    setStations(freshStations);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('System Refreshed', { description: 'Latest telemetry data acquired.' });
    }, 300);
  };

  const handleSaveField = async (stationNum: number, field: string, value: string) => {
    try {
      await updateStationField(stationNum, field, value);
      setStations(prev => ({
        ...prev,
        [stationNum]: { ...prev[stationNum], [field]: value }
      }));
      setEditingStation(null);
      setEditField(null);
      toast.success('Station Updated', { description: `Station ${stationNum} ${field} saved.` });
    } catch (err) {
      toast.error('Update Failed', { description: 'Could not save changes.' });
    }
  };

  const generateQRCode = async (stationNum: number, index: number) => {
    try {
      const url = `${window.location.origin}/qr/${stationNum}`;
      if (canvasRefs.current[index]) {
        await QRCode.toCanvas(canvasRefs.current[index], url, {
          width: 250, margin: 2,
          color: { dark: '#1e293b', light: '#ffffff' }
        });
        toast.success(`Station ${stationNum} QR Generated`, { description: `URL: ${url}` });
      }
    } catch (err) {
      toast.error('Generation Failed', { description: 'Could not create QR matrix.' });
    }
  };

  const downloadQR = (stationNum: number, index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `clue-code-station-${stationNum}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort teams: finished first (by endTime), then active (by station desc, hints asc)
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.status === 'finished' && b.status !== 'finished') return -1;
    if (a.status !== 'finished' && b.status === 'finished') return 1;
    if (a.status === 'finished' && b.status === 'finished') {
      return (a.endTime || 0) - (b.endTime || 0);
    }
    if (a.currentStation !== b.currentStation) return b.currentStation - a.currentStation;
    return a.totalHintsUsed - b.totalHintsUsed;
  });

  const filteredTeams = sortedTeams.filter(t =>
    t.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRelativeTime = (time: number | undefined | null) => {
    try {
      if (!time) return 'N/A';
      return formatDistanceToNow(time, { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getTimeTaken = (team: TeamDoc) => {
    if (!team.startTime) return 'N/A';
    const end = team.endTime || Date.now();
    const mins = Math.floor((end - team.startTime) / 60000);
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remainMins}m`;
    return `${remainMins}m`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      
      <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8 relative">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-destructive flex items-center gap-3">
              <Shield className="w-8 h-8 text-destructive" />
              Overwatch Command
            </h1>
            <p className="text-muted-foreground font-mono mt-2">
              Admin Dashboard — {teams.length} teams registered
            </p>
          </div>
          <Button 
            variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}
            className="font-mono text-xs max-w-[150px]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            SYNC DATA
          </Button>
        </header>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-8 bg-card border border-border/50">
            <TabsTrigger value="leaderboard" className="font-mono data-[state=active]:bg-neon-primary data-[state=active]:text-primary-foreground transition-all">
              <Trophy className="w-4 h-4 mr-2" /> Leaderboard
            </TabsTrigger>
            <TabsTrigger value="questions" className="font-mono data-[state=active]:bg-amber-500 data-[state=active]:text-primary-foreground transition-all">
              <BookOpen className="w-4 h-4 mr-2" /> Questions
            </TabsTrigger>
            <TabsTrigger value="qr" className="font-mono data-[state=active]:bg-neon-cyan data-[state=active]:text-primary-foreground transition-all">
              <QRIcon className="w-4 h-4 mr-2" /> QR Codes
            </TabsTrigger>
          </TabsList>

          {/* ===== LEADERBOARD TAB ===== */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="border-neon-primary/20 bg-card/50">
              <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg uppercase font-mono tracking-widest">Live Leaderboard</CardTitle>
                  <CardDescription>Ranked by progress, time, and penalties.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search" placeholder="Search teams..."
                    className="pl-9 h-9 font-mono text-sm bg-background border-border"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/20 font-mono">
                      <tr>
                        <th className="px-4 py-4 font-medium w-10">#</th>
                        <th className="px-4 py-4 font-medium">Team</th>
                        <th className="px-4 py-4 font-medium text-center">Status</th>
                        <th className="px-4 py-4 font-medium text-center">Station</th>
                        <th className="px-4 py-4 font-medium text-center">Hints</th>
                        <th className="px-4 py-4 font-medium text-center">
                          <span className="flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Warnings
                          </span>
                        </th>
                        <th className="px-4 py-4 font-medium text-center">Time</th>
                        <th className="px-4 py-4 font-medium text-right">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-mono text-sm">
                      {filteredTeams.map((team, index) => (
                        <motion.tr 
                          key={team.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-secondary/10 transition-colors ${
                            index === 0 && team.status === 'finished' ? 'bg-neon-primary/5' : ''
                          } ${team.cheatWarnings >= 3 ? 'bg-destructive/5' : ''}`}
                        >
                          <td className="px-4 py-4 text-muted-foreground font-bold">
                            {index === 0 && team.status === 'finished' ? '🏆' : index + 1}
                          </td>
                          <td className="px-4 py-4 font-bold tracking-wide">
                            {team.teamName}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {team.status === 'playing' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neon-primary/10 text-neon-primary border border-neon-primary/20">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                                COMPLETED
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-lg text-foreground font-bold">{team.currentStation}</span>
                            <span className="text-muted-foreground text-xs">/6</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={team.totalHintsUsed > 0 ? "text-destructive font-bold" : "text-muted-foreground"}>
                              {team.totalHintsUsed}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={
                              team.cheatWarnings >= 3 ? "text-destructive font-bold animate-pulse" : 
                              team.cheatWarnings > 0 ? "text-orange-500 font-bold" : 
                              "text-muted-foreground"
                            }>
                              {team.cheatWarnings || 0}
                              {team.cheatWarnings >= 3 && ' 🚨'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center text-muted-foreground">
                            {getTimeTaken(team)}
                          </td>
                          <td className="px-4 py-4 text-right text-muted-foreground text-xs">
                            {getRelativeTime(team.endTime || team.startTime)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTeams.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground font-mono text-sm">
                    No teams found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== QUESTIONS CONTROL TAB ===== */}
          <TabsContent value="questions" className="space-y-6">
            <p className="font-mono text-sm text-muted-foreground">
              View and edit station questions, answers, hints, and lock codes.
            </p>
            <div className="space-y-4">
              {Object.entries(stations).map(([num, station]) => {
                const stationNum = parseInt(num);
                const isEditing = editingStation === stationNum;
                return (
                  <Card key={num} className="border-border/50 bg-card/50">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg font-mono tracking-widest text-amber-500">
                            STATION 0{stationNum} — {station.locationName}
                          </CardTitle>
                          <CardDescription className="font-mono mt-1">
                            {station.name}
                          </CardDescription>
                        </div>
                        <Button
                          variant={isEditing ? "default" : "outline"}
                          size="sm"
                          className="font-mono text-xs"
                          onClick={() => {
                            if (isEditing) {
                              setEditingStation(null);
                              setEditField(null);
                            } else {
                              setEditingStation(stationNum);
                            }
                          }}
                        >
                          {isEditing ? <Save className="w-3 h-3 mr-1" /> : <Edit3 className="w-3 h-3 mr-1" />}
                          {isEditing ? 'DONE' : 'EDIT'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {/* Question */}
                      <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-muted-foreground font-mono text-xs uppercase pt-1">Question:</span>
                        {isEditing && editField?.field === 'question' ? (
                          <div className="flex gap-2">
                            <Input
                              value={editField.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditField({ field: 'question', value: e.target.value })}
                              className="h-8 text-sm font-mono"
                            />
                            <Button size="sm" className="h-8 text-xs" onClick={() => handleSaveField(stationNum, 'question', editField.value)}>
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className={`${isEditing ? 'cursor-pointer hover:text-amber-500 transition-colors' : ''}`}
                            onClick={() => isEditing && setEditField({ field: 'question', value: station.question.prompt })}
                          >
                            {station.question.prompt}
                          </span>
                        )}
                      </div>
                      {/* Answer */}
                      <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-muted-foreground font-mono text-xs uppercase pt-1">Answer:</span>
                        {isEditing && editField?.field === 'answer' ? (
                          <div className="flex gap-2">
                            <Input
                              value={editField.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditField({ field: 'answer', value: e.target.value })}
                              className="h-8 text-sm font-mono"
                            />
                            <Button size="sm" className="h-8 text-xs" onClick={() => handleSaveField(stationNum, 'answer', editField.value)}>
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className={`font-bold text-neon-primary ${isEditing ? 'cursor-pointer hover:text-amber-500 transition-colors' : ''}`}
                            onClick={() => isEditing && setEditField({ field: 'answer', value: station.answer })}
                          >
                            {station.answer}
                          </span>
                        )}
                      </div>
                      {/* Lock Code */}
                      <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-muted-foreground font-mono text-xs uppercase pt-1">Lock Code:</span>
                        {isEditing && editField?.field === 'lockCode' ? (
                          <div className="flex gap-2">
                            <Input
                              value={editField.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditField({ field: 'lockCode', value: e.target.value })}
                              className="h-8 text-sm font-mono"
                            />
                            <Button size="sm" className="h-8 text-xs" onClick={() => handleSaveField(stationNum, 'lockCode', editField.value)}>
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className={`font-mono text-neon-cyan ${isEditing ? 'cursor-pointer hover:text-amber-500 transition-colors' : ''}`}
                            onClick={() => isEditing && setEditField({ field: 'lockCode', value: station.lockCode })}
                          >
                            {station.lockCode}
                          </span>
                        )}
                      </div>
                      {/* Hint */}
                      <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-muted-foreground font-mono text-xs uppercase pt-1">Hint:</span>
                        {isEditing && editField?.field === 'hint' ? (
                          <div className="flex gap-2">
                            <Input
                              value={editField.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditField({ field: 'hint', value: e.target.value })}
                              className="h-8 text-sm font-mono"
                            />
                            <Button size="sm" className="h-8 text-xs" onClick={() => handleSaveField(stationNum, 'hint', editField.value)}>
                              <Save className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className={`text-muted-foreground italic ${isEditing ? 'cursor-pointer hover:text-amber-500 transition-colors' : ''}`}
                            onClick={() => isEditing && setEditField({ field: 'hint', value: station.locationHint })}
                          >
                            {station.locationHint}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {Object.keys(stations).length === 0 && (
                <div className="p-8 text-center text-muted-foreground font-mono text-sm">
                  Loading stations from database...
                </div>
              )}
            </div>
          </TabsContent>

          {/* ===== QR GENERATORS TAB ===== */}
          <TabsContent value="qr" className="space-y-6">
            <p className="font-mono text-sm text-muted-foreground">
              Generate and download the physical QR codes to be placed at campus locations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((stationNum, idx) => {
                const station = stations[stationNum];
                return (
                  <Card key={stationNum} className="border-neon-cyan/30 bg-card/80">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-mono tracking-widest text-neon-cyan">
                            STATION 0{stationNum}
                          </CardTitle>
                          <CardDescription className="uppercase mt-1">
                            {station?.locationName || 'Loading...'}
                          </CardDescription>
                        </div>
                        <QRIcon className="text-muted-foreground w-5 h-5" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-6 space-y-4">
                      <div className="bg-white p-2 rounded-lg border-2 border-border relative min-h-[160px] min-w-[160px] flex items-center justify-center">
                        <canvas 
                          ref={el => {
                            if (canvasRefs.current) {
                              canvasRefs.current[idx] = el;
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 border-t border-border/50 pt-4">
                      <Button 
                        variant="secondary" size="sm" className="w-full font-mono text-xs"
                        onClick={() => generateQRCode(stationNum, idx)}
                      >
                        <RefreshCw className="w-3 h-3 mr-2" /> GENERATE
                      </Button>
                      <Button 
                        size="sm" className="w-full bg-neon-cyan text-primary-foreground font-mono text-xs hover:bg-neon-cyan/90"
                        onClick={() => downloadQR(stationNum, idx)}
                      >
                        <Download className="w-3 h-3 mr-2" /> DOWNLOAD
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
