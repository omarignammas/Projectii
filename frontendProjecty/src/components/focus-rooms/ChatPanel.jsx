import { useState, useEffect, useRef, useMemo } from 'react';
import { Lock, Hand, Send, MessageSquare, Smile } from 'lucide-react';
import { format } from 'date-fns';
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
  currentUserEmail,
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
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-border/80 bg-card">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 p-4">
        <p className="section-header">
          <MessageSquare className="h-4 w-4 text-primary" />
          room chat
        </p>
        {isHost && <ChatModeSelect value={chatMode} onChange={onChatModeChange} className="h-8 w-auto text-xs" />}
      </div>

      <div ref={listRef} className="bg-grid thin-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
        {fullyLocked && (
          <div className="mb-2 flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Chat muted during focus — reactions only
          </div>
        )}
        {emojiOnly && (
          <div className="mb-2 flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Smile className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Emoji reactions only during focus
          </div>
        )}

        {messages.length === 0 && !fullyLocked && !emojiOnly && (
          <p className="text-center text-xs text-muted-foreground">No messages yet.</p>
        )}

        {messages.map((m, i) => {
          if (m.type === 'SYSTEM') {
            return (
              <p key={m.id} className="py-1 text-center text-xs text-muted-foreground">
                {m.body}
              </p>
            );
          }

          const isMine = Boolean(currentUserEmail) && m.senderEmail === currentUserEmail;
          const prev = messages[i - 1];
          const isGroupStart = !prev || prev.type === 'SYSTEM' || prev.senderEmail !== m.senderEmail;
          const time = m.createdAt ? format(new Date(m.createdAt), 'HH:mm') : '';

          return (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${isGroupStart ? 'mt-3' : 'mt-0.5'} ${isMine ? 'flex-row-reverse' : ''}`}
            >
              {!isMine && (
                <div className="w-7 shrink-0">
                  {isGroupStart && <Avatar name={m.senderName} avatarUrl={m.senderAvatarUrl} size="sm" />}
                </div>
              )}

              <div className={`flex max-w-[75%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {!isMine && isGroupStart && (
                  <span className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">{m.senderName}</span>
                )}
                <div
                  className={`animate-in fade-in slide-in-from-bottom-1 rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isMine
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm border border-border/60 bg-card text-foreground'
                  }`}
                >
                  <span className="whitespace-pre-wrap break-words">{m.body}</span>
                  <span className={`ml-2 align-bottom text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t border-border/60 p-3">
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
