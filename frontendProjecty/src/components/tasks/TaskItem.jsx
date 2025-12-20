import { useState } from 'react';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import EditTaskDialog from './EditTaskDialog';
import taskService from '../../services/taskService';
import { format, isPast } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { useToast } from '../../hooks/use-toast'

export const TaskItem = ({ task, projectId, onTaskUpdated, onTaskDeleted }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const {toast} = useToast();

  const handleToggleComplete = async () => {
    setUpdating(true);
    try {
      const updatedTask = await taskService.markTaskCompleted(projectId, task.id);
      onTaskUpdated(updatedTask);
      toast({
        title: "✅ Task updated",
        description: `"${task.title}" has been successfully updated.`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(projectId, task.id);
      onTaskDeleted(task.id);
      toast({
        title: "✅ Task deleted",
        description: `"${task.title}" has been successfully deleted.`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete task",
        variant: "destructive",
       })
    }
  };

  const isOverdue = !task.completed && isPast(new Date(task.dueDate));

  return (
    <>
      <Card
        className={`
          transition-all
          ${task.completed ? 'opacity-60' : ''}
          dark:bg-slate-800 dark:text-slate-200
        `}
      >
        <CardContent className="p-4 font-mono">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              className="mt-1"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4
                    className={`
                      font-medium
                      ${task.completed ? 'line-through text-muted-foreground dark:text-slate-400' : 'text-slate-900 dark:text-slate-200'}
                    `}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!task.completed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditOpen(true)}
                      className="dark:text-slate-200 dark:hover:text-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive dark:text-rose-400 dark:hover:text-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              Task !
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className='bg-red-500 hover:bg-red-600'>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-slate-300">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                </div>

                {isOverdue && (
                  <Badge
                    variant="outline"
                    className="text-white bg-red-400 dark:bg-red-600 dark:text-white"
                  >
                    Overdue
                  </Badge>
                )}

                {task.completed && (
                  <Badge
                    variant="outline"
                    className="text-white bg-green-600 dark:bg-green-500 dark:text-white"
                  >
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog
        task={task}
        projectId={projectId}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onTaskUpdated={onTaskUpdated}
      />
    </>
  );
};

export default TaskItem;
