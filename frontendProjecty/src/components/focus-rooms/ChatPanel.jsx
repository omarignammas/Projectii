import { useState, useEffect, useRef, useMemo } from 'react';
import { Lock, Hand, Send, MessageSquare, Smile, Sparkles, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Avatar from '../shared/Avatar';
import ChatModeSelect from './ChatModeSelect';
import markdownComponents from '../shared/markdownComponents';

// Slightly denser than the shared page-level defaults — this renders inside a chat bubble, not a full page.
const aiMarkdownComponents = {
  ...markdownComponents,
  p: (props) => <p className="mb-1.5 text-sm leading-relaxed last:mb-0" {...props} />,
  ul: (props) => <ul className="mb-1.5 ml-4 list-disc space-y-0.5 text-sm last:mb-0" {...props} />,
  ol: (props) => <ol className="mb-1.5 ml-4 list-decimal space-y-0.5 text-sm last:mb-0" {...props} />,
  li: (props) => <li className="text-sm" {...props} />,
  h1: (props) => <p className="mb-1 text-sm font-bold last:mb-0" {...props} />,
  h2: (props) => <p className="mb-1 text-sm font-bold last:mb-0" {...props} />,
  h3: (props) => <p className="mb-1 text-sm font-semibold last:mb-0" {...props} />,
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2 hover:text-primary/80"
      {...props}
    >
      <ExternalLink className="h-3 w-3 shrink-0" />
      {children}
    </a>
  ),
};

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
              <p key={m.id} className="flex items-center justify-center gap-1 py-1 text-center text-xs text-muted-foreground">
                {m.body === 'AI is thinking…' && <Sparkles className="h-3 w-3 shrink-0 text-primary" />}
                {m.body}
              </p>
            );
          }

          if (m.type === 'AI') {
            // The chat message immediately before this AI turn's "thinking"
            // beat is the one that triggered it — surface who asked, with
            // their real avatar, rather than just labeling the reply "AI".
            let askedBy = null;
            for (let j = i - 1; j >= 0; j--) {
              if (messages[j].type === 'CHAT') { askedBy = messages[j]; break; }
              if (messages[j].type === 'AI') break;
            }

            return (
              <div key={m.id} className="mt-3 flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex max-w-[85%] flex-col items-start">
                  <span className="mb-0.5 flex items-center gap-1.5 px-1 text-xs font-medium text-primary">
                    AI
                    {askedBy && (
                      <span className="flex items-center gap-1 font-normal text-muted-foreground">
                        <span className="text-muted-foreground/50">·</span>
                        replying to
                        <Avatar name={askedBy.senderName} avatarUrl={askedBy.senderAvatarUrl} size="sm" />
                        {askedBy.senderName}
                      </span>
                    )}
                  </span>
                  <div className="animate-in fade-in slide-in-from-bottom-1 rounded-2xl rounded-bl-sm border border-primary/30 bg-primary/5 px-3 py-2 text-foreground shadow-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={aiMarkdownComponents}>
                      {m.body}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          }

          const isMine = Boolean(currentUserEmail) && m.senderEmail === currentUserEmail;
          const prev = messages[i - 1];
          const isGroupStart = !prev || prev.type === 'SYSTEM' || prev.type === 'AI' || prev.senderEmail !== m.senderEmail;
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
          placeholder={fullyLocked ? 'Locked during focus…' : emojiOnly ? 'Emoji only 👍🔥🎉' : 'Type a message, or @ai <question>'}
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
