import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { CircularProgress } from '../shared/CircularProgress';

const TASKS = ['Lab Report 3', 'Reading Ch. 4', 'Problem Set 2'];

// "Courses as containers" — tasks drop into the course one at a time, then reset.
export const CoursesAnimation = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCount((c) => (c + 1) % (TASKS.length + 1)), 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-4 flex h-24 flex-col justify-center gap-1 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-2">
      {TASKS.map((t, i) => (
        <div
          key={t}
          className={`truncate rounded-md border border-border/60 bg-card px-2 py-1 text-[11px] text-foreground shadow-sm transition-all duration-500 ${
            i < count ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
          }`}
        >
          {t}
        </div>
      ))}
    </div>
  );
};

// "Due dates that matter" — the badge flips itself to an overdue pulse, then back.
export const DueDatesAnimation = () => {
  const [overdue, setOverdue] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setOverdue((o) => !o), 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-4 flex h-24 flex-col justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center justify-between rounded-md border border-border/60 bg-card px-2.5 py-2 shadow-sm">
        <span className="truncate text-[11px] text-foreground">Lab Report 3</span>
        <span
          className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors duration-500 ${
            overdue ? 'animate-pulse bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'
          }`}
        >
          {overdue ? 'Overdue' : 'Due tomorrow'}
        </span>
      </div>
    </div>
  );
};

// "Progress at a glance" — the same CircularProgress ring used on real course cards,
// filling up and looping, so the preview is literally the real component.
export const ProgressAnimation = () => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const target = 72;
    const interval = setInterval(() => {
      setPct((p) => (p >= target ? 0 : p + 4));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-4 flex h-24 items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5">
      <CircularProgress percentage={pct} size={62} strokeWidth={6} color="blue" />
    </div>
  );
};

// "Streaks that keep you going" — a flame counts up through a week, day dots filling in behind it.
export const StreakAnimation = () => {
  const [day, setDay] = useState(0);
  const total = 6;

  useEffect(() => {
    const interval = setInterval(() => setDay((d) => (d >= total ? 0 : d + 1)), 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-4 flex h-24 flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center gap-1.5">
        <Flame
          className={`h-4 w-4 transition-all duration-300 ${
            day > 0 ? 'scale-110 text-orange-500' : 'scale-100 text-muted-foreground'
          }`}
        />
        <span className="font-numeric text-lg font-bold leading-none text-foreground">{day}</span>
        <span className="text-[11px] text-muted-foreground">day{day === 1 ? '' : 's'}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${i < day ? 'bg-orange-500' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  );
};
