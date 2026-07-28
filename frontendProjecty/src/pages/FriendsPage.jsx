import { useState, useEffect } from 'react';
import { Users, UserPlus, Check, X, Clock, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
} from '../components/ui/alert-dialog';
import Avatar from '../components/shared/Avatar';
import PageHero from '../components/shared/PageHero';
import { useToast } from '../hooks/use-toast';
import friendService from '../services/friendService';

export const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [friendsResult, incomingResult, outgoingResult] = await Promise.all([
        friendService.getFriends(),
        friendService.getIncomingRequests(),
        friendService.getOutgoingRequests(),
      ]);
      setFriends(friendsResult.content || []);
      setIncoming(incomingResult);
      setOutgoing(outgoingResult);
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await friendService.sendRequest(email);
      toast({ title: 'Friend request sent', description: `We let ${email} know.` });
      setEmail('');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send that request');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await friendService.acceptRequest(requestId);
      toast({ title: 'Friend request accepted' });
      fetchAll();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' });
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await friendService.declineRequest(requestId);
      fetchAll();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' });
    }
  };

  const handleRemove = async (userId) => {
    try {
      await friendService.removeFriend(userId);
      toast({ title: 'Friend removed' });
      fetchAll();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="accent-blue container mx-auto px-4 py-10">
      <PageHero icon={Users} title="Friends" subtitle="Connect with people to invite into your Focus Rooms." />

      <div className="mb-8 rounded-xl border border-border/80 bg-card p-5">
        <p className="section-header mb-3">
          <UserPlus className="h-4 w-4" />
          add a friend
        </p>
        <form onSubmit={handleSendRequest} className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !email.trim()}>
            {sending ? 'Sending...' : 'Send Request'}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      {!loading && incoming.length > 0 && (
        <div className="mb-8">
          <p className="section-header mb-3">incoming requests ({incoming.length})</p>
          <div className="space-y-2">
            {incoming.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={req.requesterName} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{req.requesterName}</p>
                    <p className="truncate text-xs text-muted-foreground">{req.requesterEmail}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => handleAccept(req.id)}>
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDecline(req.id)}>
                    <X className="mr-1 h-3.5 w-3.5" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && outgoing.length > 0 && (
        <div className="mb-8">
          <p className="section-header mb-3">
            <Clock className="h-3.5 w-3.5" />
            pending ({outgoing.length})
          </p>
          <div className="space-y-2">
            {outgoing.map((req) => (
              <div key={req.id} className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                <Avatar name={req.recipientName} size="sm" />
                Waiting on {req.recipientName} ({req.recipientEmail})
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="section-header mb-3">your friends ({friends.length})</p>
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg border border-border/80 bg-card" />
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-muted-foreground">No friends yet — add one above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {friends.map((friend) => (
              <div key={friend.userId} className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-card p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={friend.displayName} avatarUrl={friend.avatarUrl} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{friend.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {friend.displayName}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You'll need to send a new friend request to reconnect later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(friend.userId)} className="bg-destructive hover:bg-destructive/90">
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
