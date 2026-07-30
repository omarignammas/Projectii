import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import Avatar from '../shared/Avatar';
import noteService from '../../services/noteService';

export const SessionNotes = ({ roomCode }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const result = await noteService.getRoomNotes(roomCode);
      setNotes(result);
    } catch (err) {
      console.error('Error loading session notes:', err);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await noteService.createNote({ title: title.trim(), body, roomCode });
      setTitle('');
      setBody('');
      setShowForm(false);
      await loadNotes();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border/80 bg-card">
      <div className="thin-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-xs text-muted-foreground">Loading notes…</p>
        ) : notes.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            No notes yet — jot down anything worth remembering.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="animate-in fade-in rounded-lg border border-border/60 bg-card p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <Avatar name={note.userName} size="sm" />
                <span className="text-xs font-medium text-foreground">{note.userName}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {format(new Date(note.createdAt), 'HH:mm')}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">{note.title}</p>
              {note.body && <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{note.body}</p>}
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-border/60 p-3">
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">New note</span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
            <Textarea
              placeholder="Anything worth remembering…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
            />
            <Button type="submit" size="sm" className="w-full" disabled={submitting || !title.trim()}>
              {submitting ? 'Saving...' : 'Save Note'}
            </Button>
          </form>
        ) : (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add a note
          </Button>
        )}
      </div>
    </div>
  );
};

export default SessionNotes;
