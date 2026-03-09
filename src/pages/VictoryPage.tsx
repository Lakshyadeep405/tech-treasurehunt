import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Star, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import confetti from 'canvas-confetti';
import { useGameStore } from '@/store/gameStore';
import TopNav from '@/components/TopNav';

export default function VictoryPage() {
  const { teamName, startTime, totalHintsUsed, isFinished } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFinished) {
      navigate('/dashboard');
      return;
    }

    // Trigger celebration confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#00ff00', '#00ffff', '#ffffff'] // Theme neon colors
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#00ff00', '#00ffff', '#ffffff']
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isFinished, navigate]);

  if (!isFinished) return null;

  // Mock calculation - this would be real data from the server
  const elapsedMinutes = startTime ? Math.floor((Date.now() - startTime) / 60000) : 42;
  const penaltyMinutes = totalHintsUsed * 5;
  const totalMinutes = elapsedMinutes + penaltyMinutes;

  return (
    <>
      <TopNav />
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 relative overflow-hidden bg-background">
        
        {/* Victory background styling */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
          className="w-full max-w-lg z-10"
        >
          <Card className="border-neon-primary/50 bg-card/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,0,0.15)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-primary to-neon-cyan" />
            
            <CardHeader className="text-center pb-2 pt-8">
              <motion.div 
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="mx-auto w-24 h-24 rounded-full bg-neon-primary/20 flex items-center justify-center mb-6 border-2 border-neon-primary box-glow-primary"
              >
                <Trophy className="w-12 h-12 text-neon-primary" />
              </motion.div>
              
              <CardTitle className="text-4xl font-mono font-black uppercase tracking-widest text-glow-primary text-neon-primary mb-2">
                Mission Complete
              </CardTitle>
              <CardDescription className="text-lg font-mono text-muted-foreground uppercase">
                All Systems Successfully Overridden
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 pt-6">
              <div className="text-center">
                <p className="text-sm font-mono text-muted-foreground uppercase mb-1">Operative Unit</p>
                <h2 className="text-2xl font-bold tracking-wide text-foreground">{teamName}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-neon-cyan/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <Clock className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                  <p className="text-xs font-mono text-muted-foreground uppercase">Base Time</p>
                  <p className="text-xl font-bold font-mono">{elapsedMinutes}m</p>
                </div>
                
                <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-destructive/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <Activity className="w-5 h-5 text-destructive mx-auto mb-2" />
                  <p className="text-xs font-mono text-muted-foreground uppercase">Penalties</p>
                  <p className="text-xl font-bold font-mono">+{penaltyMinutes}m</p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-neon-primary/5 border-2 border-neon-primary/30 text-center relative">
                <Star className="absolute top-2 right-2 w-4 h-4 text-neon-primary opacity-50" />
                <Star className="absolute bottom-2 left-2 w-4 h-4 text-neon-primary opacity-50" />
                <p className="text-sm font-mono text-neon-primary uppercase mb-1">Final Official Time</p>
                <p className="text-5xl font-black font-mono text-glow-primary text-neon-primary">
                  {totalMinutes}<span className="text-2xl">m</span>
                </p>
              </div>

            </CardContent>
            
            <CardContent className="pt-0 pb-8 flex justify-center">
              <Button 
                onClick={() => navigate('/leaderboard')}
                className="font-mono uppercase tracking-widest bg-ghost border border-border hover:bg-secondary w-full"
                variant="outline"
              >
                View Global Rankings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
