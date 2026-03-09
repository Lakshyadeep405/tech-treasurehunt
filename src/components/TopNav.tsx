import { useNavigate, useLocation } from 'react-router-dom';
import { Terminal, LogOut, Trophy, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';

export default function TopNav() {
  const { teamName, currentStation, logout, isAdmin } = useGameStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
          >
            <div className="p-1.5 rounded-md bg-neon-primary/10 border border-neon-primary/30 group-hover:bg-neon-primary/20 transition-colors">
              <Terminal className="w-4 h-4 text-neon-primary" />
            </div>
            <span className="font-mono font-bold tracking-tight text-glow-primary uppercase hidden sm:inline-block">
              Clue<span className="text-neon-primary">Code</span>
            </span>
          </div>

          {!isAdmin && teamName && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border text-xs font-mono">
              <span className="text-muted-foreground">Team:</span>
              <span className="text-neon-primary font-bold">{teamName}</span>
              <span className="text-muted-foreground ml-2">Location:</span>
              <span className="text-neon-cyan font-bold">Station {currentStation}/6</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className={location.pathname === '/dashboard' ? 'bg-secondary/50 text-neon-primary' : ''}
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline-block">Dashboard</span>
            </Button>
          )}
          
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/leaderboard')}
              className={location.pathname === '/leaderboard' ? 'bg-secondary/50 text-neon-cyan' : ''}
              title="Leaderboard"
            >
              <Trophy className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline-block">Leaderboard</span>
            </Button>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            title="Disconnect"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
