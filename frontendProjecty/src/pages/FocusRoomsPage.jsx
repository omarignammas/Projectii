import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Timer, Users, ArrowRight, CalendarClock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import CreateFocusRoomDialog from '../components/focus-rooms/CreateFocusRoomDialog';
import focusRoomService from '../services/focusRoomService';
import PageHero from '../components/shared/PageHero';

const STATUS_LABEL = {
  LOBBY: 'In lobby',
  ACTIVE: 'In progress',
  COMPLETED: 'Completed',
};

const RoomCard = ({ room, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start rounded-xl border border-border/80 bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
  >
    <div className="mb-3 flex w-full items-start justify-between gap-2">
      <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {room.name}
      </h3>
      <Badge variant="outline" className="shrink-0 border-primary/30 bg-primary/10 font-numeric text-primary">
        {room.code}
      </Badge>
    </div>

    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5" />
        {room.participants?.length || 0} in room
      </span>
      {room.courseTitle && <span>{room.courseTitle}</span>}
      {room.scheduledFor && (
        <span className="flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          {format(new Date(room.scheduledFor), 'MMM d, p')}
        </span>
      )}
    </div>

    <div className="mt-auto flex w-full items-center justify-between border-t border-border/60 pt-3 text-sm">
      <span className="text-muted-foreground">{STATUS_LABEL[room.status] || room.status}</span>
      <span className="flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Enter <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </div>
  </button>
);

export const FocusRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const result = await focusRoomService.getAllRooms({ size: 100 });
      setRooms(result.content || []);
    } catch (error) {
      console.error('Error fetching focus rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomCreated = (room) => {
    setIsCreateOpen(false);
    navigate(`/focus-rooms/${room.code}`);
  };

  const { scheduledRooms, otherRooms } = useMemo(() => {
    const now = Date.now();
    const scheduled = [];
    const others = [];
    rooms.forEach((room) => {
      if (room.status === 'LOBBY' && room.scheduledFor && new Date(room.scheduledFor).getTime() > now) {
        scheduled.push(room);
      } else {
        others.push(room);
      }
    });
    scheduled.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    return { scheduledRooms: scheduled, otherRooms: others };
  }, [rooms]);

  return (
    <div className="accent-teal container mx-auto px-4 py-10">
      <PageHero
        icon={Timer}
        title="Focus Rooms"
        subtitle="Synchronized Pomodoro sessions with friends — join with a code, focus together."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Room
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border border-border/80 bg-card" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <h3 className="mb-2 text-lg font-semibold text-foreground">No focus rooms yet</h3>
          <p className="mb-4 text-muted-foreground">Start a session and share the code with friends.</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create a Room
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {scheduledRooms.length > 0 && (
            <section>
              <p className="section-header mb-3">
                <CalendarClock className="h-4 w-4" />
                scheduled ({scheduledRooms.length})
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scheduledRooms.map((room) => (
                  <RoomCard key={room.id} room={room} onClick={() => navigate(`/focus-rooms/${room.code}`)} />
                ))}
              </div>
            </section>
          )}

          {otherRooms.length > 0 && (
            <section>
              {scheduledRooms.length > 0 && <p className="section-header mb-3">all rooms</p>}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherRooms.map((room) => (
                  <RoomCard key={room.id} room={room} onClick={() => navigate(`/focus-rooms/${room.code}`)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <CreateFocusRoomDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
};

export default FocusRoomsPage;
