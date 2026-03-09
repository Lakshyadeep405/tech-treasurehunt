import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, ShieldAlert, Cpu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { MockStations } from '@/lib/mockData';

export default function QRChallengePage() {
  const { num } = useParams();
  const navigate = useNavigate();
  const stationNum = parseInt(num || '1', 10);
  
  const { currentStation, id } = useGameStore();

  useEffect(() => {
    // If not logged in, redirect to login
    if (!id) {
      navigate('/');
    }
  }, [id, navigate]);

  const station = MockStations[stationNum];

  if (!station) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background text-foreground">
        <Card className="border-destructive pt-6">
          <CardContent className="text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-mono text-destructive">Invalid Node</h1>
            <p>This QR code does not exist in the system registry.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prevent accessing future station QR codes
  if (stationNum > currentStation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background text-foreground">
        <Card className="border-yellow-500/50 pt-6 max-w-sm">
          <CardContent className="text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto" />
            <h1 className="text-xl font-mono text-yellow-500 uppercase">Sequence Error</h1>
            <p className="text-sm text-muted-foreground">
              You must complete Station {currentStation} before accessing this node.
            </p>
            <Button className="w-full font-mono mt-4" onClick={() => navigate('/dashboard')}>
              RETURN TO DASHBOARD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prevent accessing past station QR codes
  if (stationNum < currentStation) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background text-foreground">
        <Card className="border-neon-primary/50 pt-6 max-w-sm w-full">
          <CardContent className="text-center space-y-4">
            <Cpu className="w-12 h-12 text-neon-primary mx-auto" />
            <h1 className="text-xl font-mono text-neon-primary uppercase">Node Cleared</h1>
            <p className="text-sm text-muted-foreground">
              You have already completed this station.
            </p>
            <Button className="w-full font-mono mt-4 border-neon-primary text-neon-primary hover:bg-neon-primary/10" variant="outline" onClick={() => navigate('/dashboard')}>
              RETURN TO DASHBOARD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background selection:bg-neon-secondary/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-secondary/10 via-background to-background" />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-neon-secondary/50 bg-card/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,255,0.05)]">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-16 h-16 rounded-xl bg-neon-secondary/10 flex items-center justify-center mb-2 border border-neon-secondary/30 box-glow-secondary">
              <QrCode className="w-8 h-8 text-neon-secondary" />
            </div>
            <CardTitle className="text-2xl font-mono uppercase tracking-widest text-glow-secondary text-neon-secondary">
              Target Acquired
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase">
              Location: {station.locationName}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="p-5 rounded-lg bg-background/90 border border-neon-secondary/30 relative">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-neon-secondary" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-neon-secondary" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-neon-secondary" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-neon-secondary" />
              
              <h3 className="text-sm font-mono text-muted-foreground mb-4 uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Physical Override Task
              </h3>
              
              <div className="text-foreground font-mono space-y-4">
                <p className="text-sm leading-relaxed text-neon-cyan drop-shadow-sm">
                  {station.qrChallenge.prompt}
                </p>
                {station.qrChallenge.codeSnippet && (
                  <pre className="p-3 bg-black/60 rounded border border-border/50 text-xs overflow-x-auto text-neon-primary">
                    <code>{station.qrChallenge.codeSnippet}</code>
                  </pre>
                )}
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Solve to reveal LOCK CODE
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 border-t border-border/50 pt-6">
            <Button 
              className="w-full bg-neon-secondary text-background hover:bg-neon-secondary/90 font-mono font-bold tracking-widest h-12"
              onClick={() => navigate(`/lock/${station.stationNumber}`)}
            >
              PROCEED TO INPUT
            </Button>
            <Button 
              variant="link" 
              className="text-muted-foreground font-mono text-xs"
              onClick={() => navigate('/dashboard')}
            >
              Hold Position (Dashboard)
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
