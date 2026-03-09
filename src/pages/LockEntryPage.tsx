import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useGameStore } from '@/store/gameStore';
import { getStation, updateTeamStation } from '@/lib/dbUtils';
import type { StationData } from '@/lib/mockData';
import TopNav from '@/components/TopNav';

export default function LockEntryPage() {
  const { num } = useParams();
  const navigate = useNavigate();
  const stationNum = parseInt(num || '1', 10);
  
  const { id: teamId, currentStation, updateProgress, finishGame } = useGameStore();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [station, setStation] = useState<StationData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stationNum !== currentStation) {
      navigate('/dashboard');
    } else {
      getStation(stationNum).then(s => setStation(s));
    }
    // Auto-focus input on mound
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [stationNum, currentStation, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsVerifying(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Case-insensitive exact match
    if (station && code.trim().toUpperCase() === station.lockCode.toUpperCase()) {
      toast.success('Override Successful', { 
        description: 'System unlocked. Proceeding to next phase.' 
      });
      
      if (teamId) {
        if (currentStation === 6) {
          await updateTeamStation(teamId, currentStation, true);
          finishGame();
          navigate('/victory');
        } else {
          await updateTeamStation(teamId, currentStation + 1);
          updateProgress(currentStation + 1);
          navigate('/dashboard');
        }
      } else {
        toast.error('Session Error', { description: 'Team ID is missing.' });
      }
    } else {
      toast.error('Access Denied', { 
        description: 'Invalid lock code sequence.' 
      });
      setCode(''); // Reset attempt
      inputRef.current?.focus();
    }
    
    setIsVerifying(false);
  };

  if (!station) {
    return (
      <>
        <TopNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] text-neon-primary font-mono animate-pulse">
          LOADING SECURE INTERFACE...
        </div>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-neon-primary/30 bg-card/80 backdrop-blur shadow-[0_0_20px_rgba(0,255,0,0.05)]">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="mx-auto w-12 h-12 rounded-full border border-neon-primary/50 flex items-center justify-center mb-2 bg-neon-primary/5">
                <KeyRound className="w-6 h-6 text-neon-primary" />
              </div>
              <CardTitle className="text-2xl font-mono uppercase tracking-widest text-glow-primary">
                System Lock
              </CardTitle>
              <CardDescription className="font-mono text-xs uppercase">
                Input override code from physical terminal
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <Input 
                    ref={inputRef}
                    placeholder="ENTER CODE" 
                    className="h-16 text-center text-3xl font-mono tracking-[0.5em] font-bold uppercase bg-background/50 border-border focus-visible:ring-neon-primary/50 focus-visible:border-neon-primary placeholder:text-muted-foreground/30 placeholder:tracking-widest placeholder:text-lg" 
                    value={code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                    maxLength={8}
                    autoComplete="off"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isVerifying || !code}
                  className="w-full h-12 bg-neon-primary text-primary-foreground hover:bg-neon-primary/90 font-mono font-bold tracking-wider relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isVerifying ? (
                      'VERIFYING...'
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        INITIATE OVERRIDE
                      </>
                    )}
                  </span>
                  {!isVerifying && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="justify-center border-t border-border/50 pt-4">
              <Button 
                variant="ghost" 
                className="text-muted-foreground font-mono text-xs hover:text-foreground"
                onClick={() => navigate('/dashboard')}
              >
                Cancel Override Request
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
