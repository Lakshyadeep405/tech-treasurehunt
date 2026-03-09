import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { addTeamCheatWarning, addTeamHintPenalty } from '@/lib/dbUtils';
import { toast } from 'sonner';

export function useAntiCheat() {
  const { id: teamId, isFinished, cheatWarnings, addCheatWarning, addPenalty } = useGameStore();
  const warningCountRef = useRef(cheatWarnings);
  const leftPageRef = useRef(false);
  const leftTimeRef = useRef<number | null>(null);

  // Sync ref with store state
  useEffect(() => {
    warningCountRef.current = cheatWarnings;
  }, [cheatWarnings]);

  useEffect(() => {
    // Only track active non-admin players
    if (!teamId || isFinished || teamId === 'admin') return;

    // 1. Visibility change detection (primary method)
    const onVisibilityChange = () => {
      if (document.hidden) {
        leftPageRef.current = true;
        leftTimeRef.current = Date.now();
      } else if (leftPageRef.current) {
        leftPageRef.current = false;
        const awayTime = leftTimeRef.current ? Date.now() - leftTimeRef.current : 0;
        leftTimeRef.current = null;

        // Only penalize if away for more than 2 seconds (ignore accidental switches)
        if (awayTime < 2000) return;

        applyWarning(awayTime);
      }
    };

    // 2. Blur detection (catches some edge cases visibility doesn't)
    const onBlur = () => {
      leftTimeRef.current = Date.now();
    };

    const onFocus = () => {
      if (leftTimeRef.current) {
        const awayTime = Date.now() - leftTimeRef.current;
        leftTimeRef.current = null;
        if (awayTime >= 2000 && !leftPageRef.current) {
          applyWarning(awayTime);
        }
      }
    };

    // 3. Block DevTools shortcuts
    const onKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j'))
      ) {
        e.preventDefault();
        toast.error('⛔ Access Denied', {
          description: 'Developer tools are disabled during the mission.',
          duration: 3000,
        });
      }
    };

    function applyWarning(awayTime: number) {
      const currentWarnings = warningCountRef.current;
      const newWarnings = currentWarnings + 1;
      const awaySeconds = Math.round(awayTime / 1000);

      addCheatWarning();
      addTeamCheatWarning(teamId!);

      if (newWarnings < 3) {
        toast.error('⚠️ SECURITY ALERT', {
          description: `App switch detected (${awaySeconds}s away)! Warning ${newWarnings}/2. Do NOT leave this app.`,
          duration: 6000,
        });
      } else {
        addPenalty();
        addTeamHintPenalty(teamId!);

        toast.error('🚨 CRITICAL VIOLATION', {
          description: `App switch detected (${awaySeconds}s away)! +5 min penalty applied. (Violation #${newWarnings})`,
          duration: 10000,
        });
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [teamId, isFinished, addCheatWarning, addPenalty]);
}
