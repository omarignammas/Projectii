import { useState, useEffect, useRef, useMemo } from 'react';
import { Lock, Hand, Send, MessageSquare, Smile } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Avatar from '../shared/Avatar';
import ChatModeSelect from './ChatModeSelect';

const isEmojiOnly = (text) => {
  const stripped = text.replace(/\s+/g, '');
  if (!stripped) return false;
  return [...stripped].every((ch) => /\p{Extended_Pictographic}|\p{Emoji_Component}/u.test(ch));
};

export const ChatPanel = ({
  messages,
  inFocusBlock,
  chatMode,
  isHost,
  onChatModeChange,
  onSend,
  onRaiseHand,
  handRaised,
}) => {
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const restriction = inFocusBlock ? chatMode : 'OPEN';
  const fullyLocked = restriction === 'CLOSED_FOCUS';
  const emojiOnly = restriction === 'EMOJI_ONLY_FOCUS';
  const draftIsValid = useMemo(() => {
    if (!draft.trim()) return false;
    if (emojiOnly) return isEmojiOnly(draft);
    return true;
  }, [draft, emojiOnly]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullyLocked || !draftIsValid) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/80 bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 p-4">
        <p className="section-header">
          <MessageSquare className="h-4 w-4 text-primary" />
          room chat
        </p>
        {isHost && <ChatModeSelect value={chatMode} onChange={onChatModeChange} className="h-8 w-auto text-xs" />}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {fullyLocked && (
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Chat muted during focus — reactions only
          </div>
        )}
        {emojiOnly && (
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Smile className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Emoji reactions only during focus
          </div>
        )}

        {messages.length === 0 && !fullyLocked && !emojiOnly && (
          <p className="text-center text-xs text-muted-foreground">No messages yet.</p>
        )}

        {messages.map((m) =>
          m.type === 'SYSTEM' ? (
            <p key={m.id} className="text-center text-xs text-muted-foreground">{m.body}</p>
          ) : (
            <div key={m.id} className="flex items-start gap-2">
              <Avatar name={m.senderName} size="sm" />
              <div className="min-w-0 text-sm">
                <span className="font-medium text-foreground">{m.senderName}</span>{' '}
                <span className="text-muted-foreground">{m.body}</span>
              </div>
            </div>
          )
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border/60 p-3">
        <Button
          type="button"
          variant={handRaised ? 'default' : 'outline'}
          size="icon"
          className="shrink-0"
          onClick={onRaiseHand}
          title="Raise hand"
        >
          <Hand className="h-4 w-4" />
        </Button>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={fullyLocked ? 'Locked during focus…' : emojiOnly ? 'Emoji only 👍🔥🎉' : 'Type a message'}
          disabled={fullyLocked}
        />
        <Button type="submit" size="icon" disabled={fullyLocked || !draftIsValid} className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
