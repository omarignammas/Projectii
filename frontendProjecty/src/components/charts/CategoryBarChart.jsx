// Horizontal bar chart — categorical colors assigned in a fixed slot order.
// Mark spec: square baseline (left), rounded data-end (right), track = lighter rail.
export const CategoryBarChart = ({ data }) => {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing to show yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = Math.max((d.value / maxValue) * 100, 2);
        return (
          <div key={d.label} title={`${d.label}: ${d.value}`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: `hsl(var(${d.colorVar}))` }} />
                <span className="truncate">{d.label}</span>
              </span>
              <span className="font-numeric shrink-0 text-muted-foreground">{d.value}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-r-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: `hsl(var(${d.colorVar}))` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryBarChart;
