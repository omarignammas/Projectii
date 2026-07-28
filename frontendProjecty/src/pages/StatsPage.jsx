import { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Flame, CheckCircle2, Tag, Timer, ListTodo, LayoutGrid, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import taskService from '../services/taskService';
import courseService from '../services/courseService';
import focusRoomService from '../services/focusRoomService';
import { isOverdueTask } from '../lib/taskDates';
import TrendAreaChart from '../components/charts/TrendAreaChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import { CircularProgress } from '../components/shared/CircularProgress';
import PageHero from '../components/shared/PageHero';
import { useAuth } from '../hooks/useAuth';

const CIRCLE_COLORS = ['blue', 'purple', 'green', 'orange'];

const formatMinutes = (mins) => {
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
};

const computeStreak = (completedDayStrings) => {
  const daySet = new Set(completedDayStrings);
  let cursor = new Date();
  if (!daySet.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = addDays(cursor, -1);
  }
  let streak = 0;
  while (daySet.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
};

const StatTile = (props) => {
  const Icon = props.icon;
  return (
    <Card className="border-border/80 bg-card">
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-numeric text-2xl font-bold text-foreground">{props.value}</p>
          <p className="text-sm text-muted-foreground">{props.label}</p>
          {props.sub && <p className="mt-1 text-xs text-muted-foreground">{props.sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export const StatsPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [focusRooms, setFocusRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tasksResult, coursesResult, focusRoomsResult] = await Promise.all([
          taskService.getAllTasks({ size: 500 }),
          courseService.getAllCourses({ size: 100 }),
          focusRoomService.getAllRooms({ size: 100 }),
        ]);
        setTasks(tasksResult.content);
        setCourses(coursesResult.content);
        setFocusRooms(focusRoomsResult.content || []);
      } catch (error) {
        console.error('Error fetching stats data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');

    const dueThisWeek = tasks.filter((t) => t.dueDate && t.dueDate >= weekStart && t.dueDate <= weekEnd);
    const completedThisWeek = dueThisWeek.filter((t) => t.completed);
    const weeklyCompletionRate = dueThisWeek.length > 0
      ? Math.round((completedThisWeek.length / dueThisWeek.length) * 100)
      : 0;

    const completedDayStrings = tasks
      .filter((t) => t.completed && t.completedAt)
      .map((t) => t.completedAt.slice(0, 10));
    const streak = computeStreak(completedDayStrings);

    const courseCounts = {};
    tasks.forEach((t) => {
      if (t.courseTitle) {
        courseCounts[t.courseTitle] = (courseCounts[t.courseTitle] || 0) + 1;
      }
    });
    const mostUsedCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0];

    const weekStartDate = startOfWeek(new Date());
    const focusRoomMinutesThisWeek = focusRooms.reduce((total, room) => {
      if (room.status !== 'COMPLETED' || new Date(room.updatedAt) < weekStartDate) return total;
      const me = room.participants.find((p) => p.email === user?.email);
      return total + (me?.minutesFocused || 0);
    }, 0);

    return {
      weeklyCompletionRate,
      dueThisWeekCount: dueThisWeek.length,
      completedThisWeekCount: completedThisWeek.length,
      streak,
      mostUsedCourse: mostUsedCourse ? mostUsedCourse[0] : '—',
      mostUsedCourseCount: mostUsedCourse ? mostUsedCourse[1] : 0,
      totalTasks: tasks.length,
      totalCompleted: tasks.filter((t) => t.completed).length,
      overdueCount: tasks.filter(isOverdueTask).length,
      focusRoomMinutesThisWeek,
    };
  }, [tasks, focusRooms, user?.email]);

  const trendData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, 'yyyy-MM-dd');
      const count = tasks.filter((t) => t.completedAt && t.completedAt.slice(0, 10) === key).length;
      days.push({ label: format(d, 'MMM d'), fullLabel: format(d, 'EEEE, MMM d'), value: count });
    }
    return days;
  }, [tasks]);

  const focusHoursTrendData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, 'yyyy-MM-dd');
      const minutesForDay = focusRooms.reduce((total, room) => {
        if (room.status !== 'COMPLETED' || format(new Date(room.updatedAt), 'yyyy-MM-dd') !== key) return total;
        const me = room.participants.find((p) => p.email === user?.email);
        return total + (me?.minutesFocused || 0);
      }, 0);
      days.push({
        label: format(d, 'MMM d'),
        fullLabel: format(d, 'EEEE, MMM d'),
        value: Math.round((minutesForDay / 60) * 10) / 10,
      });
    }
    return days;
  }, [focusRooms, user?.email]);

  const courseCompletionRates = useMemo(() => {
    return courses
      .map((course, i) => {
        const courseTasks = tasks.filter((t) => t.courseId === course.id);
        const completed = courseTasks.filter((t) => t.completed).length;
        const percentage = courseTasks.length > 0 ? Math.round((completed / courseTasks.length) * 100) : 0;
        return {
          courseId: course.id,
          label: course.title,
          percentage,
          completed,
          total: courseTasks.length,
          color: CIRCLE_COLORS[i % CIRCLE_COLORS.length],
        };
      })
      .filter((c) => c.total > 0);
  }, [courses, tasks]);

  const tasksByPriority = useMemo(() => {
    const order = [
      { key: 'HIGH', label: 'High', colorVar: '--priority-high-fg' },
      { key: 'MEDIUM', label: 'Medium', colorVar: '--priority-medium-fg' },
      { key: 'LOW', label: 'Low', colorVar: '--priority-low-fg' },
    ];
    return order.map((o) => ({
      label: o.label,
      colorVar: o.colorVar,
      value: tasks.filter((t) => t.priority === o.key).length,
    }));
  }, [tasks]);

  return (
    <div className="accent-teal container mx-auto px-4 py-10">
      <PageHero icon={BarChart3} title="Stats" subtitle="How the term's actually going." />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-border/80 bg-card" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl border border-border/80 bg-card" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatTile icon={ListTodo} label="Total tasks" value={stats.totalTasks} sub={`${stats.totalCompleted} completed`} />
            <StatTile icon={LayoutGrid} label="Courses" value={courses.length} />
            <StatTile icon={AlertTriangle} label="Overdue" value={stats.overdueCount} />
            <StatTile
              icon={CheckCircle2}
              label="Weekly completion rate"
              value={`${stats.weeklyCompletionRate}%`}
              sub={`${stats.completedThisWeekCount}/${stats.dueThisWeekCount} due this week`}
            />
            <StatTile icon={Flame} label="Current streak" value={`${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`} />
            <StatTile
              icon={Tag}
              label="Most-used course"
              value={stats.mostUsedCourse}
              sub={stats.mostUsedCourseCount ? `${stats.mostUsedCourseCount} tasks` : undefined}
            />
            <StatTile icon={Timer} label="Focus time this week" value={formatMinutes(stats.focusRoomMinutesThisWeek)} />
          </div>

          <Card className="border-border/80 bg-card">
            <CardContent className="p-5">
              <p className="section-header mb-1">completions — last 14 days</p>
              <TrendAreaChart data={trendData} height={200} valueLabel="completed" />
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card">
            <CardContent className="p-5">
              <p className="section-header mb-1">focus hours — last 14 days</p>
              <p className="mb-3 text-xs text-muted-foreground">Hours spent in a Focus Room work block, per day.</p>
              <TrendAreaChart data={focusHoursTrendData} height={200} valueLabel="hours" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-border/80 bg-card">
              <CardContent className="p-5">
                <p className="section-header mb-4">tasks by course</p>
                {courseCompletionRates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks assigned to a course yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {courseCompletionRates.map((course) => (
                      <div key={course.courseId} className="flex flex-col items-center gap-2 text-center">
                        <CircularProgress percentage={course.percentage} size={80} strokeWidth={7} color={course.color} />
                        <div>
                          <p className="truncate text-xs font-medium text-foreground" title={course.label}>{course.label}</p>
                          <p className="text-xs text-muted-foreground">{course.completed}/{course.total} done</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card">
              <CardContent className="p-5">
                <p className="section-header mb-4">tasks by priority</p>
                <CategoryBarChart data={tasksByPriority} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
