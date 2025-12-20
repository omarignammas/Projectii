import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {Popover,PopoverContent,PopoverTrigger} from '../ui/popover'
import {Calendar} from '../ui/calendar'
import taskService from '../../services/taskService';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';



export const CreateTaskDialog = ({ projectId, open, onOpenChange, onTaskCreated }) => {

  const [formData, setFormData] = useState({
  title: '',
  description: '',
  })
  const [dueDate, setDueDate] = useState(undefined)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const payload = {
      ...formData,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
    }

    const newTask = await taskService.createTask(projectId, payload)
    onTaskCreated(newTask)
    setFormData({ title: '', description: '' })
    setDueDate(undefined)
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to create task')
  } finally {
    setLoading(false)
  }
}


  const handleClose = () => {
    setFormData({ title: '', description: '', dueDate: '' });
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] font-mono">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to this project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 font-mono">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2 font-mono">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Design homepage mockup"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2 font-mono">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Task details..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full  justify-start text-left font-normal ${
                      !dueDate && 'text-muted-foreground'
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="rounded-lg border"
                  />
                </PopoverContent>
              </Popover>
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !dueDate}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>

          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;