import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, QrCode as QRIcon, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { useGameStore } from '@/store/gameStore';
import { MockStations } from '@/lib/mockData';
import { subscribeToLeaderboard } from '@/lib/dbUtils';
import type { TeamDoc } from '@/lib/dbUtils';
import TopNav from '@/components/TopNav';

export default function AdminPage() {
  const { isAdmin } = useGameStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [teams, setTeams] = useState<TeamDoc[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  // If somehow accessed without admin rights, redirect silently
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    setIsRefreshing(true);
    const unsubscribe = subscribeToLeaderboard((fetchedTeams) => {
      setTeams(fetchedTeams);
      setIsRefreshing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('System Refreshed', { description: 'Latest telemetry data acquired.' });
    }, 500);
  };

  const generateQRCode = async (stationNum: number, index: number) => {
    try {
      // In production, this would be your actual domain
      // e.g. https://cluecode.techera.com/qr/1
      const url = `${window.location.origin}/qr/${stationNum}`;
      
      if (canvasRefs.current[index]) {
        await QRCode.toCanvas(canvasRefs.current[index], url, {
          width: 250,
          margin: 2,
          color: {
            dark: '#1e293b', // Slate 800
            light: '#ffffff' // White bg
          }
        });
        toast.success(`Station ${stationNum} QR Generated`, { description: `URL: ${url}` });
      }
    } catch (err) {
      toast.error('Generation Failed', { description: 'Could not create QR matrix.' });
      console.error(err);
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

  const filteredTeams = teams.filter(t => 
    t.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRelativeTime = (time: number) => {
    try {
      return formatDistanceToNow(time, { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
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
              System Administrator Access Granted
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="font-mono text-xs max-w-[150px]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            SYNC DATA
          </Button>
        </header>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-card border border-border/50">
            <TabsTrigger value="teams" className="font-mono data-[state=active]:bg-neon-primary data-[state=active]:text-primary-foreground transition-all">
              Live Telemetry
            </TabsTrigger>
            <TabsTrigger value="qr" className="font-mono data-[state=active]:bg-neon-cyan data-[state=active]:text-primary-foreground transition-all">
              QR Generators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <Card className="border-neon-primary/20 bg-card/50">
              <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg uppercase font-mono tracking-widest">Active Units</CardTitle>
                  <CardDescription>Real-time progress monitoring.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search teams..."
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
                        <th className="px-6 py-4 font-medium">Team Identifier</th>
                        <th className="px-6 py-4 font-medium text-center">Status</th>
                        <th className="px-6 py-4 font-medium text-center">Station</th>
                        <th className="px-6 py-4 font-medium text-center">Hints</th>
                        <th className="px-6 py-4 font-medium text-center">Warnings</th>
                        <th className="px-6 py-4 font-medium text-right">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-mono text-sm">
                      {filteredTeams.map((team) => (
                        <motion.tr 
                          key={team.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-secondary/10 transition-colors"
                        >
                          <td className="px-6 py-4 font-bold tracking-wide">
                            {team.teamName}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {team.status === 'playing' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neon-primary/10 text-neon-primary border border-neon-primary/20">
                                ACTIVE
                              </span>
                            ) : team.status === 'finished' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                                COMPLETED
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                                OFFLINE
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg text-foreground font-bold">{team.currentStation}</span>
                            <span className="text-muted-foreground text-xs">/6</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={team.totalHintsUsed > 0 ? "text-destructive font-bold" : "text-muted-foreground"}>
                              {team.totalHintsUsed}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={team.cheatWarnings > 0 ? "text-orange-500 font-bold" : "text-muted-foreground"}>
                              {team.cheatWarnings || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-muted-foreground text-xs">
                            {getRelativeTime(team.endTime || team.startTime)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTeams.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground font-mono text-sm">
                    No matching units found in scanner array.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-6">
            <p className="font-mono text-sm text-muted-foreground">
              Generate and download the physical QR codes to be placed at campus locations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((stationNum, idx) => {
                const station = MockStations[stationNum];
                return (
                  <Card key={stationNum} className="border-neon-cyan/30 bg-card/80">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-mono tracking-widest text-neon-cyan">
                            STATION 0{stationNum}
                          </CardTitle>
                          <CardDescription className="uppercase mt-1">
                            {station?.locationName || 'Unknown Config'}
                          </CardDescription>
                        </div>
                        <QRIcon className="text-muted-foreground w-5 h-5" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-6 space-y-4">
                      
                      {/* Canvas Container */}
                      <div className="bg-white p-2 rounded-lg border-2 border-border relative min-h-[160px] min-w-[160px] flex items-center justify-center">
                        <canvas 
                          ref={el => {
                            if (canvasRefs.current) {
                              canvasRefs.current[idx] = el;
                            }
                          }}
                          className=""
                        />
                        {!canvasRefs.current[idx]?.toDataURL('image/png').length && (
                          <div className="absolute font-mono text-xs text-slate-400">
                            Awaiting Matrix...
                          </div>
                        )}
                      </div>

                    </CardContent>
                    <CardFooter className="flex gap-2 border-t border-border/50 pt-4">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full font-mono text-xs"
                        onClick={() => generateQRCode(stationNum, idx)}
                      >
                        <RefreshCw className="w-3 h-3 mr-2" />
                        INIT
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full bg-neon-cyan text-primary-foreground font-mono text-xs hover:bg-neon-cyan/90"
                        onClick={() => downloadQR(stationNum, idx)}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        EXPORT
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
