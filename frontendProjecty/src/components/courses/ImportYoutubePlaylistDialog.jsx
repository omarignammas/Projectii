import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import youtubeService from '../../services/youtubeService';
import termService from '../../services/termService';

export const ImportYoutubePlaylistDialog = ({ open, onOpenChange, onCourseCreated }) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [termId, setTermId] = useState('');
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const result = await termService.getAllTerms({ size: 100 });
        setTerms(result.content || []);
      } catch (err) {
        console.error('Error loading terms:', err);
      }
    })();
  }, [open]);

  const resetForm = () => {
    setPlaylistUrl('');
    setTermId('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await youtubeService.importPlaylist({
        playlistUrl,
        termId: Number(termId),
      });
      toast({
        title: 'Playlist imported',
        description: `${response.tasksImported} task${response.tasksImported === 1 ? '' : 's'} imported${
          response.tasksSkipped ? `, ${response.tasksSkipped} skipped` : ''
        }`,
      });
      onCourseCreated(response.course);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import YouTube Playlist</DialogTitle>
          <DialogDescription>
            Turn a public YouTube playlist into a course — each video becomes a task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="playlistUrl">Playlist URL *</Label>
              <Input
                id="playlistUrl"
                placeholder="https://www.youtube.com/playlist?list=..."
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Only public or unlisted playlists can be imported.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Term *</Label>
              <Select value={termId} onValueChange={setTermId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={String(term.id)}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !termId || !playlistUrl}>
              {loading ? 'Importing...' : 'Import Playlist'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportYoutubePlaylistDialog;
