import { useState, useEffect } from 'react';
import { DoorOpen, Square } from 'lucide-react';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import ParticipantRow from './ParticipantRow';
import ChatPanel from './ChatPanel';
import SessionNotes from './SessionNotes';
import { CircularProgress } from '../shared/CircularProgress';

const PHASE_LABEL = {
  WORK: 'Focus',
  BREAK: 'Break',
  LONG_BREAK: 'Long Break',
};

const formatRemaining = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const LiveSession = ({ room, userEmail, sendEnd, sendLeave, sendHand, sendChat, sendChatMode }) => {
  const [remaining, setRemaining] = useState(0);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (!room.phaseEndsAt) return undefined;
    const tick = () => setRemaining(new Date(room.phaseEndsAt).getTime() - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [room.phaseEndsAt]);

  const me = room.participants.find((p) => p.email === userEmail);
  const isHost = Boolean(me?.host);
  const inFocusBlock = room.currentPhase === 'WORK';

  const phaseDurationMinutes = { WORK: room.workMinutes, BREAK: room.breakMinutes, LONG_BREAK: room.longBreakMinutes }[
    room.currentPhase
  ] || room.workMinutes;
  const totalMs = phaseDurationMinutes * 60 * 1000;
  const ringPercentage = totalMs > 0 ? Math.max(0, Math.min(100, Math.round((remaining / totalMs) * 100))) : 0;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]" style={{ minHeight: '480px' }}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card">
        <div className="shrink-0 border-b border-border/60 p-5">
          <p className="section-header">
            <span className={`h-2 w-2 rounded-full ${inFocusBlock ? 'bg-destructive' : 'bg-[hsl(var(--status-in-progress-fg))]'}`} />
            {PHASE_LABEL[room.currentPhase] || room.currentPhase} · Round {room.currentRound}/{room.totalRounds}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-1 p-8">
          <CircularProgress percentage={ringPercentage} size={220} strokeWidth={12} color="blue">
            <div className="flex flex-col items-center">
              <p className="font-numeric text-4xl font-bold tabular-nums text-foreground">{formatRemaining(remaining)}</p>
              <p className="text-xs text-muted-foreground">remaining</p>
            </div>
          </CircularProgress>
        </div>

        <div className="flex shrink-0 justify-center gap-3 border-t border-border/60 p-5">
          <Button variant="outline" onClick={sendLeave}>
            <DoorOpen className="mr-2 h-4 w-4" />
            Leave
          </Button>
          {isHost && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Square className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End this session for everyone?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This ends the session early for all participants. Everyone still focusing gets credit for the
                    time elapsed in the current round, and the recap shows right away.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={sendEnd} className="bg-destructive hover:bg-destructive/90">
                    End Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto border-t border-border/60 p-5">
          <p className="section-header mb-2">participants ({room.participants.length})</p>
          <div className="divide-y divide-border/40">
            {room.participants.map((p) => (
              <ParticipantRow key={p.userId} participant={p} roomStatus={room.status} isMe={p.email === userEmail} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="flex shrink-0 gap-1 rounded-lg border border-border/80 bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'chat' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'notes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Notes
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {activeTab === 'chat' ? (
            <ChatPanel
              messages={room.recentMessages}
              inFocusBlock={inFocusBlock}
              chatMode={room.chatMode}
              isHost={isHost}
              currentUserEmail={userEmail}
              onChatModeChange={sendChatMode}
              onSend={sendChat}
              onRaiseHand={sendHand}
              handRaised={me?.handRaised}
            />
          ) : (
            <SessionNotes roomCode={room.code} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
