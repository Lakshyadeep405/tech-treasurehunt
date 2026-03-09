import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { useGameStore } from './store/gameStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StationPage from './pages/StationPage';
import QRChallengePage from './pages/QRChallengePage';
import LockEntryPage from './pages/LockEntryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import VictoryPage from './pages/VictoryPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { id, isAdmin } = useGameStore();
  
  if (!id) return <Navigate to="/" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

import { useEffect } from 'react';

function App() {
  const { id, isAdmin, addPenalty } = useGameStore();

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only penalize active non-admin players when they hide the tab
      if (document.hidden && id && !isAdmin) {
        addPenalty();
        // Use a short timeout to ensure toast appears when they return
        setTimeout(() => {
          toast.error('SECURITY VIOLATION DETECTED', { 
            description: 'Tab switching registered. A 5-minute penalty has been applied to your team.',
            duration: 8000,
          });
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Disable right-click / context menu
    const handleContextMenu = (e: MouseEvent) => {
      if (!isAdmin) e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [id, isAdmin, addPenalty]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground selection:bg-neon-primary/30 relative">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={id ? <Navigate to="/dashboard" /> : <LoginPage />} />
          
          {/* Team Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/station/:num" element={
            <ProtectedRoute>
              <StationPage />
            </ProtectedRoute>
          } />
          <Route path="/qr/:num" element={
            <ProtectedRoute>
              <QRChallengePage />
            </ProtectedRoute>
          } />
          <Route path="/lock/:num" element={
            <ProtectedRoute>
              <LockEntryPage />
            </ProtectedRoute>
          } />
          <Route path="/victory" element={
            <ProtectedRoute>
              <VictoryPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute requireAdmin>
              <LeaderboardPage />
            </ProtectedRoute>
          } />
        </Routes>
        
        <Toaster theme="dark" position="top-center" 
          toastOptions={{
            duration: 4000,
            className: 'border-border/50 bg-background/95 backdrop-blur-md',
          }} 
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
