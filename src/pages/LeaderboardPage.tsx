import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Home, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

// Simplified mock data specifically for the leaderboard
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'NullPointers', station: 6, score: 9800, time: '38:12' },
  { rank: 2, name: 'CyberPunks', station: 4, score: 7500, time: '29:45' },
  { rank: 3, name: 'SyntaxErrors', station: 2, score: 4200, time: '14:20' },
  { rank: 4, name: 'ByteMe', station: 2, score: 3900, time: '18:05' },
  { rank: 5, name: 'sudo win', station: 1, score: 1000, time: '02:10' },
];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(MOCK_LEADERBOARD);

  // Simulate real-time updates for visual flare
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev];
        // Randomly bump up someone's score slightly to show it's "live"
        const idx = Math.floor(Math.random() * newData.length);
        newData[idx] = { ...newData[idx], score: newData[idx].score + Math.floor(Math.random() * 50) };
        // Re-sort
        return newData.sort((a, b) => {
          if (a.station !== b.station) return b.station - a.station;
          return b.score - a.score;
        }).map((item, index) => ({ ...item, rank: index + 1 }));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-primary/10 via-background to-background" />
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-neon-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto p-4 md:p-8 relative z-10 max-w-4xl">
        <header className="flex items-center justify-between mb-12 border-b border-border/50 pb-6">
          <Button variant="ghost" className="font-mono text-muted-foreground hover:text-foreground group" onClick={() => navigate('/dashboard')}>
            <Home className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">DASHBOARD</span>
          </Button>

          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-neon-primary/10 mb-2 box-glow-primary border border-neon-primary/30"
            >
              <Trophy className="w-6 h-6 text-neon-primary" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-mono font-bold uppercase tracking-widest text-glow-primary text-foreground">
              GLOBAL RANKING
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2 text-neon-cyan font-mono text-xs">
              <Activity className="w-3 h-3 animate-pulse" />
              LIVE TELEMETRY STREAM
            </div>
          </div>

          <div className="w-[100px]" /> {/* Spacer for centering */}
        </header>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-mono uppercase text-muted-foreground border-b border-border/30">
            <div className="col-span-1 text-center font-bold">POS</div>
            <div className="col-span-5">OPERATIVE UNIT</div>
            <div className="col-span-2 text-center">STATION</div>
            <div className="col-span-2 text-center block sm:hidden"></div>
            <div className="col-span-4 sm:col-span-2 text-right">TIME</div>
          </div>

          <AnimatePresence>
            {data.map((team, i) => (
              <motion.div
                key={team.name}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 ${
                  i === 0 ? 'border-neon-primary/50 shadow-[0_0_20px_rgba(0,255,0,0.1)] bg-card/80 scale-[1.02] z-10' :
                  i === 1 ? 'border-neon-cyan/50 shadow-[0_0_15px_rgba(0,255,255,0.05)] bg-card/60' :
                  i === 2 ? 'border-secondary bg-card/50' :
                  'border-border/30 bg-card/30 scale-95 opacity-80'
                }`}>
                  {i === 0 && (
                     <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-primary to-transparent blur-sm" />
                  )}
                  
                  <CardContent className="p-0">
                    <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">
                      
                      <div className="col-span-1 text-center font-mono font-black text-2xl">
                        <span className={
                          i === 0 ? 'text-neon-primary text-glow-primary' :
                          i === 1 ? 'text-neon-cyan text-glow-secondary' :
                          'text-muted-foreground'
                        }>
                          {team.rank}
                        </span>
                      </div>
                      
                      <div className="col-span-5">
                        <p className={`font-mono font-bold text-lg tracking-wide uppercase truncate ${
                          i === 0 ? 'text-foreground' : 'text-foreground/80'
                        }`}>
                          {team.name}
                        </p>
                        {i === 0 && <span className="text-[10px] uppercase text-neon-primary border border-neon-primary/30 px-1.5 py-0.5 rounded-sm bg-neon-primary/10 animate-pulse hidden sm:inline-block ml-2">ALPHA LEADER</span>}
                      </div>
                      
                      <div className="col-span-2 text-center font-mono text-xl text-muted-foreground">
                        {team.station}
                      </div>

                      <div className="col-span-2 block sm:hidden"></div>
                      
                      <div className="col-span-4 sm:col-span-2 text-right font-mono font-bold">
                        <span className={i === 0 ? 'text-neon-primary' : 'text-muted-foreground'}>
                          {team.time}
                        </span>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
