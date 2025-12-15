
export const CircularProgress = ({ percentage, size = 120, strokeWidth = 10, color = "blue" }) => {

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: { from: '#3b82f6', to: '#1d4ed8', bg: '#dbeafe' },
    purple: { from: '#a855f7', to: '#7e22ce', bg: '#e9d5ff' },
    green: { from: '#10b981', to: '#059669', bg: '#d1fae5' },
    orange: { from: '#f97316', to: '#ea580c', bg: '#fed7aa' },
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color].bg}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[color].from} />
            <stop offset="100%" stopColor={colors[color].to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-blue-800 dark:text-white">
          {percentage}%
        </span>
      </div>
    </div>
  );
};
