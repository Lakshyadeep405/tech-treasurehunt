import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Lock, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useGameStore } from '@/store/gameStore';
import { authenticateTeam } from '@/lib/dbUtils';

export default function LoginPage() {
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useGameStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamCode) {
      toast.error('Access Denied', { description: 'Missing credentials.' });
      return;
    }

    setIsLoading(true);
    
    try {
      if (teamCode === 'admin@20' && teamName.toLowerCase() === 'admin') {
        const { adminLogin } = useGameStore.getState();
        adminLogin();
        toast.success('Admin Access Granted', { description: 'Welcome to the grid, Admin.' });
        navigate('/admin');
        return;
      }

      if (teamCode.length < 4) {
        throw new Error('Invalid code format. Codes usually have 4 or more characters.');
      }

      const teamData = await authenticateTeam(teamName, teamCode);
      if (!teamData) {
         throw new Error('Failed to reach server. Check connection.');
      }

      login({
        id: teamData.id,
        teamName: teamData.teamName,
        currentStation: teamData.currentStation,
        startTime: teamData.startTime,
        totalHintsUsed: teamData.totalHintsUsed,
        cheatWarnings: teamData.cheatWarnings,
        isFinished: teamData.status === 'finished'
      });
      
      toast.success('Access Granted', { 
        description: `Welcome to the grid, Team ${teamData.teamName}.` 
      });
      navigate('/dashboard');
      
    } catch (err: any) {
      toast.error('Authentication Failed', { 
        description: err instanceof Error ? err.message : 'Invalid credentials.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background styling elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-primary/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center justify-center p-3 rounded-xl bg-neon-primary/10 mb-4 box-glow-primary border border-neon-primary/30"
            animate={{ boxShadow: ['0 0 10px rgba(0,255,0,0.2)', '0 0 20px rgba(0,255,0,0.4)', '0 0 10px rgba(0,255,0,0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Terminal className="w-8 h-8 text-neon-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-glow-primary mb-2 font-mono uppercase">
            Clue<span className="text-neon-primary">Code</span>
          </h1>
          <p className="text-muted-foreground uppercase tracking-widest text-sm">
            System Identity Verification
          </p>
        </div>

        <Card className="border-neon-primary/20 bg-card/50 backdrop-blur-xl shrink-0 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-primary/50 to-transparent" />
          <CardHeader>
            <CardTitle className="text-xl">Terminal Login</CardTitle>
            <CardDescription>Enter your allocated credentials to proceed.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 relative group">
                <Label htmlFor="teamName" className="font-mono text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-neon-primary transition-colors">Team Identifier</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-neon-primary" />
                  <Input 
                    id="teamName" 
                    placeholder="e.g. CyberPunks" 
                    className="pl-10 bg-background/50 border-border/50 focus-visible:border-neon-primary/50 focus-visible:ring-neon-primary/20 h-11" 
                    value={teamName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 relative group">
                <Label htmlFor="teamCode" className="font-mono text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-neon-primary transition-colors">Access Key</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-neon-primary" />
                  <Input 
                    id="teamCode" 
                    type="password"
                    placeholder="****" 
                    className="pl-10 font-mono tracking-widest bg-background/50 border-border/50 focus-visible:border-neon-primary/50 focus-visible:ring-neon-primary/20 h-11" 
                    value={teamCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamCode(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-neon-primary text-primary-foreground hover:bg-neon-primary/90 font-mono tracking-wider font-bold transition-all relative overflow-hidden group"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? 'VERIFYING...' : 'INITIALIZE SEQUENCE'}
                  {!isLoading && <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                </span>
                {/* Glitch overlay effect on hover */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
