import { format, addDays, endOfMonth } from 'date-fns';

// new Date("yyyy-MM-dd") parses as UTC midnight, which can display as the
// previous/next day once date-fns formats it in the browser's local timezone.
// Building the Date from its parts instead keeps it anchored to local time.
export const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Task.dueDate is a plain "yyyy-MM-dd" string (no time/timezone component).
// Comparing it as a string against another "yyyy-MM-dd" string sidesteps
// timezone-parsing pitfalls that come from turning it into a Date first.
export const todayStr = () => format(new Date(), 'yyyy-MM-dd');
export const tomorrowStr = () => format(addDays(new Date(), 1), 'yyyy-MM-dd');
export const weekEndStr = () => format(addDays(new Date(), 6), 'yyyy-MM-dd');
export const monthEndStr = () => format(endOfMonth(new Date()), 'yyyy-MM-dd');

export const isOverdueTask = (task) =>
  !task.completed && !!task.dueDate && task.dueDate < todayStr();

export const isUnscheduledTask = (task) => !task.completed && !task.dueDate;

export const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
