import { format } from 'date-fns';

// `data` is oldest→newest: { date: 'yyyy-MM-dd', active, inCurrentStreak }.
// Full-height bar = a task was completed that day; the trailing run of active
// days counting back from today (or yesterday, if today's still open) is
// highlighted as the current streak, distinct from an active-but-lapsed day.
export const StreakBarChart = ({ data }) => (
  <div className="flex h-[140px] items-end gap-1">
    {data.map((day) => (
      <div
        key={day.date}
        className="group relative h-full flex-1"
        title={`${format(new Date(day.date), 'MMM d, yyyy')}${day.active ? ' — completed a task' : ' — no completions'}`}
      >
        <div
          className={`absolute bottom-0 left-0 w-full rounded-t-sm transition-all ${
            day.inCurrentStreak
              ? 'bg-[hsl(var(--priority-medium-fg))]'
              : day.active
                ? 'bg-[hsl(var(--chart-1)/0.4)]'
                : 'bg-muted'
          }`}
          style={{ height: day.active ? '100%' : '10%' }}
        />
      </div>
    ))}
  </div>
);

export default StreakBarChart;
