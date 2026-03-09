import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { addTeamCheatWarning, addTeamHintPenalty } from '@/lib/dbUtils';
import { toast } from 'sonner';

export function useAntiCheat() {
  const { id: teamId, isFinished, cheatWarnings, addCheatWarning, addPenalty } = useGameStore();
  const warningCountRef = useRef(cheatWarnings);

  // Sync ref with store state
  useEffect(() => {
    warningCountRef.current = cheatWarnings;
  }, [cheatWarnings]);

  useEffect(() => {
    // If there's no active team or the team has already finished the game, anti-cheat is disabled
    if (!teamId || isFinished || teamId === 'admin') return;

    const handleCheatDetection = async () => {
      // Small debounce just in case both events fire
      const currentWarnings = warningCountRef.current;
      const newWarnings = currentWarnings + 1;
      
      // Update local state and DB
      addCheatWarning();
      await addTeamCheatWarning(teamId);

      if (newWarnings < 3) {
        toast.error('SECURITY ALERT!', {
          description: `Unauthorized terminal access detected. Warning ${newWarnings}/3. Focus the app.`,
          duration: 5000,
        });
      } else {
        // 3rd time or more: hit them with a penalty
        addPenalty(); // Local store increment
        await addTeamHintPenalty(teamId); // DB increment
        
        toast.error('CRITICAL VIOLATION', {
          description: `App backgrounded again. A +5 minute penalty has been added.`,
          duration: 8000,
        });
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleCheatDetection();
      }
    };

    const onBlur = () => {
      handleCheatDetection();
    };

    // Listeners
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [teamId, isFinished, addCheatWarning, addPenalty]);
}
