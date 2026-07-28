import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, DoorOpen, Copy, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import focusRoomService from '../../services/focusRoomService';

export const SessionRecap = ({ room, userEmail }) => {
  const [rematching, setRematching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalMinutes = room.workMinutes * room.totalRounds;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const sortedParticipants = [...room.participants].sort((a, b) => b.minutesFocused - a.minutesFocused);
  const isHost = room.participants.some((p) => p.email === userEmail && p.host);

  const handleCopyRecap = () => {
    const lines = [
      `${room.name} — Session Complete (${totalLabel})`,
      ...sortedParticipants.map((p) =>
        `${p.email === userEmail ? 'You' : p.displayName}: ${p.minutesFocused} min focused — ${p.status === 'COMPLETED' ? 'completed' : 'quit'}`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    toast({ title: 'Recap copied', description: 'Paste it anywhere to share.' });
  };

  const handleRematch = async () => {
    setRematching(true);
    try {
      const newRoom = await focusRoomService.rematchRoom(room.code);
      navigate(`/focus-rooms/${newRoom.code}`);
    } catch (err) {
      toast({
        title: 'Could not start rematch',
        description: err.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRematching(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex flex-col items-center rounded-xl border border-border/80 bg-card p-8 text-center">
        <CheckCircle2 className="mb-3 h-8 w-8 text-[hsl(var(--status-done-fg))]" />
        <h2 className="text-xl font-semibold text-foreground">Session Complete — {totalLabel}</h2>

        <div className="mt-6 w-full divide-y divide-border/40 text-left">
          {sortedParticipants.map((p) => (
            <div key={p.userId} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-foreground">{p.email === userEmail ? 'You' : p.displayName}</span>
              <span className="font-numeric text-muted-foreground">{p.minutesFocused} min focused</span>
              <span className="flex items-center gap-1 text-xs">
                {p.status === 'COMPLETED' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--status-done-fg))]" />
                    completed
                  </>
                ) : (
                  <>
                    <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    quit
                  </>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={handleCopyRecap}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Recap
          </Button>
          {isHost && (
            <Button onClick={handleRematch} disabled={rematching}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {rematching ? 'Starting...' : 'Rematch'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionRecap;
