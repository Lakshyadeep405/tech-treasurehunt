import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, LockOpen, Map, HelpCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useGameStore } from '@/store/gameStore';
import TopNav from '@/components/TopNav';
import { MockStations } from '@/lib/mockData';

export default function StationPage() {
  const { num } = useParams();
  const navigate = useNavigate();
  const stationNum = parseInt(num || '1', 10);
  
  const { currentStation, useHint } = useGameStore();

  const [answer, setAnswer] = useState('');
  const [isSolved, setIsSolved] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);

  // Redirect if trying to access a future station
  useEffect(() => {
    if (stationNum > currentStation) {
      toast.error('Access Denied', { description: 'Complete previous stations first.' });
      navigate('/dashboard');
    }
  }, [stationNum, currentStation, navigate]);

  const station = MockStations[stationNum] || MockStations[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate answer (case insensitive, trimmed)
    if (answer.trim().toLowerCase() === station.answer.toLowerCase()) {
      setIsSolved(true);
      toast.success('Sequence Accepted', { description: 'Access code generated.' });
    } else {
      toast.error('Invalid Sequence', { description: 'The system rejected your input.' });
      // Glitch effect on input could go here
    }
  };

  const handleUseHint = () => {
    useHint();
    setIsHintOpen(false);
    toast.warning('Hint Deployed', { description: 'A 5-minute penalty has been added.' });
    // Reveal hint logic would go here
  };

  return (
    <>
      <TopNav />
      <div className="container mx-auto p-4 md:p-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h1 className="text-2xl font-mono font-bold uppercase tracking-widest text-glow-primary flex items-center gap-2">
              <Terminal className="w-6 h-6 text-neon-primary" />
              Terminal {station.stationNumber}: {station.name}
            </h1>
          </div>

          {!isSolved ? (
            <Card className="border-neon-primary/30 bg-card/60 backdrop-blur shadow-[0_0_15px_rgba(0,255,0,0.05)]">
              <CardHeader>
                <CardTitle>Decryption Task</CardTitle>
                <CardDescription>Solve the following sequence to unlock coordinate data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="p-4 rounded-lg bg-background border border-border/50 font-mono text-sm leading-relaxed text-foreground">
                  <p className="mb-4 text-neon-cyan">{station.question.prompt}</p>
                  
                  {station.question.codeSnippet && (
                    <pre className="p-4 bg-black/50 rounded-md overflow-x-auto border border-border text-neon-primary shadow-inner">
                      <code>{station.question.codeSnippet}</code>
                    </pre>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="ENTER SOLUTION..." 
                      className="font-mono text-lg tracking-widest uppercase bg-background/50 focus-visible:ring-neon-primary/50" 
                      value={answer}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value)}
                    />
                    <Button type="submit" className="bg-neon-primary text-primary-foreground hover:bg-neon-primary/90 px-8 transition-all">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>

              </CardContent>
              <CardFooter className="flex justify-between border-t border-border/50 pt-4">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-mono text-xs" onClick={() => navigate('/dashboard')}>
                  &lt; ABORT TASK
                </Button>
                
                <Dialog open={isHintOpen} onOpenChange={setIsHintOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 border-yellow-500/30 font-mono text-xs">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      REQUEST HINT
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-destructive/50 bg-background/95 backdrop-blur-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Warning: Time Penalty
                      </DialogTitle>
                      <DialogDescription className="text-base pt-2">
                        Deploying a hint will add a <strong className="text-destructive font-mono text-lg">+5 minute penalty</strong> to your team's final time.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                      <Button variant="ghost" onClick={() => setIsHintOpen(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleUseHint} className="font-mono font-bold tracking-wider">
                        ACCEPT PENALTY
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Card className="border-neon-cyan/50 bg-card/60 backdrop-blur shadow-[0_0_30px_rgba(0,255,255,0.1)] overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-cyan/10 to-transparent pointer-events-none" />
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mb-4 box-glow-secondary">
                    <LockOpen className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <CardTitle className="text-2xl text-neon-cyan uppercase tracking-widest">Sequence Accepted</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-4">
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm font-mono text-muted-foreground uppercase">Access Code</p>
                    <div className="text-6xl font-black font-mono tracking-widest text-glow-secondary">
                      {station.accessCode}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/80 border border-neon-cyan/30 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan" />
                    <h3 className="flex items-center gap-2 font-mono uppercase text-sm text-neon-cyan mb-2">
                      <Map className="w-4 h-4" /> Next Destination Coordinates
                    </h3>
                    <p className="font-mono text-lg leading-relaxed">
                      "{station.locationHint}"
                    </p>
                  </div>

                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-border/50 pt-6">
                  <p className="text-xs font-mono text-center text-muted-foreground w-full uppercase">
                    Proceed to location • Scan QR Code • Complete Challenge
                  </p>
                  <Button 
                    className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono font-bold text-lg h-12"
                    onClick={() => navigate(`/lock/${station.stationNumber}`)}
                  >
                    ENTER QR LOCK CODE
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

        </motion.div>
      </div>
    </>
  );
}
