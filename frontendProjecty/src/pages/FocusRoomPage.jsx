import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFocusRoomSocket } from '../hooks/useFocusRoomSocket';
import { useToast } from '../hooks/use-toast';
import focusRoomService from '../services/focusRoomService';
import RoomLobby from '../components/focus-rooms/RoomLobby';
import LiveSession from '../components/focus-rooms/LiveSession';
import SessionRecap from '../components/focus-rooms/SessionRecap';
import { Button } from '../components/ui/button';

export const FocusRoomPage = () => {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { room, setRoom, connected, error, clearError, sendStart, sendEnd, sendLeave, sendHand, sendChat, sendChatMode } =
    useFocusRoomSocket(roomCode);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const snapshot = await focusRoomService.getRoomByCode(roomCode);
        const myParticipant = snapshot.participants.find((p) => p.email === user.email);
        const needsJoin =
          (!myParticipant ||
            myParticipant.status === 'INVITED' ||
            myParticipant.status === 'QUIT' ||
            myParticipant.status === 'DECLINED') &&
          snapshot.status !== 'COMPLETED';
        const finalSnapshot = needsJoin ? await focusRoomService.joinRoom(roomCode) : snapshot;
        if (!cancelled) {
          setRoom(finalSnapshot);
          setLoadError('');
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.response?.data?.message || 'Focus room not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  useEffect(() => {
    if (error) {
      toast({ title: 'Focus Room', description: error, variant: 'destructive' });
      clearError();
    }
  }, [error, toast, clearError]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto h-64 max-w-xl animate-pulse rounded-xl border border-border/80 bg-card" />
      </div>
    );
  }

  if (loadError || !room) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
        <h2 className="mb-2 text-lg font-semibold text-foreground">{loadError || 'Focus room not found'}</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/focus-rooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Focus Rooms
          </Link>
        </Button>
      </div>
    );
  }

  const isHost = room.participants.some((p) => p.email === user.email && p.host);

  return (
    <div className="accent-teal flex h-full w-full min-h-0 flex-col px-4 py-10">
      {room.status === 'LOBBY' && (
        <RoomLobby
          room={room}
          isHost={isHost}
          userEmail={user.email}
          onStart={sendStart}
          onChatModeChange={sendChatMode}
          connected={connected}
        />
      )}
      {room.status === 'ACTIVE' && (
        <LiveSession
          room={room}
          userEmail={user.email}
          sendEnd={sendEnd}
          sendLeave={sendLeave}
          sendHand={sendHand}
          sendChat={sendChat}
          sendChatMode={sendChatMode}
        />
      )}
      {room.status === 'COMPLETED' && <SessionRecap room={room} userEmail={user.email} />}
    </div>
  );
};

export default FocusRoomPage;
