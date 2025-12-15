import TaskItem from './TaskItem';

export const TaskList = ({ tasks, projectId, onTaskUpdated, onTaskDeleted }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg dark:border-slate-700 dark:text-slate-200">
        <p className="text-muted-foreground dark:text-slate-200">
          No tasks yet. Create your first task!
        </p>
      </div>
    );
  }

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="space-y-6 font-mono">
      {incompleteTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
            To Do ({incompleteTasks.length})
          </h3>
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projectId={projectId}
                onTaskUpdated={onTaskUpdated}
                onTaskDeleted={onTaskDeleted}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground dark:text-slate-300">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projectId={projectId}
                onTaskUpdated={onTaskUpdated}
                onTaskDeleted={onTaskDeleted}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
