import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, AlertTriangle, ChevronRight, Fingerprint, LockOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/store/gameStore';
import TopNav from '@/components/TopNav';

export default function DashboardPage() {
  const { teamName, currentStation, totalHintsUsed, isFinished } = useGameStore();
  const navigate = useNavigate();

  const progressPercentage = ((currentStation - 1) / 6) * 100;

  if (isFinished) {
    navigate('/victory');
    return null;
  }

  return (
    <>
      <TopNav />
      <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-5xl">
        <header className="space-y-2">
          <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-glow-primary">
            Mission Dashboard
          </h1>
          <p className="text-muted-foreground font-mono">
            Welcome back, Operative <span className="text-neon-primary">{teamName}</span>
          </p>
        </header>

        {/* Status Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur border-neon-cyan/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase">
                <MapPin className="w-4 h-4 text-neon-cyan" />
                Current Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-neon-cyan">
                Station {currentStation}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Objective {currentStation} of 6 active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase">
                <Clock className="w-4 h-4 text-foreground/70" />
                Time Elapsed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">
                00:42:15
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-yellow-500/80">
                + {totalHintsUsed * 5} min penalty
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase">
                <AlertTriangle className="w-4 h-4 text-destructive/70" />
                Hints Deployed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-destructive">
                {totalHintsUsed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Warning: high penalty active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-neon-primary/30 bg-card/60 backdrop-blur shadow-[0_0_15px_rgba(0,255,0,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Fingerprint className="w-32 h-32" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-neon-primary" />
                  Active Objective
                </CardTitle>
                <CardDescription>
                  Solve the puzzle to reveal your next physical destination.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50 font-mono text-sm space-y-2">
                  <p className="text-muted-foreground">Location Hint:</p>
                  <p className="text-lg text-foreground">??? (Solve station {currentStation} to reveal)</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate(`/station/${currentStation}`)}
                  className="w-full sm:w-auto bg-neon-primary text-primary-foreground hover:bg-neon-primary/90 font-mono"
                >
                  Access Station Terminal
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/lock/${currentStation}`)}
                  className="w-full sm:w-auto font-mono border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <LockOpen className="w-4 h-4 mr-2" />
                  Enter Lock Code
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono uppercase text-muted-foreground mb-1">
                <span>Mission Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-secondary" />
              <div className="grid grid-cols-6 gap-1 mt-2">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div 
                    key={step} 
                    className={`h-1 duration-500 transition-all ${
                      step < currentStation ? 'bg-neon-primary box-glow-primary' : 
                      step === currentStation ? 'bg-neon-cyan animate-pulse' : 
                      'bg-secondary'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono uppercase tracking-wider text-sm text-muted-foreground border-b border-border/50 pb-2">Mission Log</h3>
            <div className="space-y-3 relative pl-4 pb-4">
              <div className="absolute left-0 top-2 bottom-0 w-px bg-border/50" />
              
              {[...Array(currentStation - 1)].map((_, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={`log-${i}`} 
                  className="relative"
                >
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-neon-primary box-glow-primary" />
                  <p className="text-sm font-mono text-foreground">Station {i + 1} Cleared</p>
                  <p className="text-xs text-muted-foreground">Access Code Acquired</p>
                </motion.div>
              ))}

              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse" />
                <p className="text-sm font-mono text-neon-cyan">Deploying Station {currentStation}</p>
                <p className="text-xs text-muted-foreground animate-pulse">Awaiting input sequence...</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
