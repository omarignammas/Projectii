import { MessageSquare } from 'lucide-react';

export const Callout = (props) => {
  const Icon = props.icon || MessageSquare;
  return (
    <div className="flex gap-3 rounded-lg border border-border/80 bg-card/50 p-4 text-sm text-muted-foreground">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{props.children}</p>
    </div>
  );
};

export default Callout;
