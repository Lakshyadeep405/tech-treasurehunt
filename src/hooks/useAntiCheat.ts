import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { addTeamCheatWarning, addTeamHintPenalty } from '@/lib/dbUtils';
import { toast } from 'sonner';

export function useAntiCheat() {
  const { id: teamId, isFinished, cheatWarnings, addCheatWarning, addPenalty } = useGameStore();
  const warningCountRef = useRef(cheatWarnings);
  const leftPageRef = useRef(false);

  // Sync ref with store state
  useEffect(() => {
    warningCountRef.current = cheatWarnings;
  }, [cheatWarnings]);

  useEffect(() => {
    // Only track active non-admin players
    if (!teamId || isFinished || teamId === 'admin') return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        // User LEFT the app — record it
        leftPageRef.current = true;
      } else if (leftPageRef.current) {
        // User CAME BACK — now show the warning & penalize
        leftPageRef.current = false;

        const currentWarnings = warningCountRef.current;
        const newWarnings = currentWarnings + 1;

        // Update local state and DB
        addCheatWarning();
        addTeamCheatWarning(teamId);

        if (newWarnings < 3) {
          toast.error('⚠️ SECURITY ALERT', {
            description: `Unauthorized app switch detected! Warning ${newWarnings}/2. Do NOT leave this app.`,
            duration: 6000,
          });
        } else {
          // 3rd+ offense: apply penalty
          addPenalty();
          addTeamHintPenalty(teamId);

          toast.error('🚨 CRITICAL VIOLATION', {
            description: `App switch detected again! A +5 minute penalty has been applied to your team. (Violation #${newWarnings})`,
            duration: 10000,
          });
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [teamId, isFinished, addCheatWarning, addPenalty]);
}
