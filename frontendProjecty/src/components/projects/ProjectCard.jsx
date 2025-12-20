import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Calendar } from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { useToast } from '../../hooks/use-toast'
import projectService from '../../services/projectService'
import { format } from 'date-fns'
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

export const ProjectCard = ({ project, onDelete }) => {
  const [progress, setProgress] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await projectService.getProjectProgress(project.id)
        setProgress(data)
      } catch (error) {
        console.error('Error fetching progress:', error)
      }
    }
    fetchProgress()
  }, [project.id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await projectService.deleteProject(project.id)
      
      toast({
        title: "✅ Project deleted",
        description: `"${project.title}" has been successfully deleted.`,
        variant: "default",
      })
      
      onDelete(project.id)
      setOpen(false)
    } catch (error) {
      console.error('Error deleting project:', error)
      
      toast({
        title: "❌ Error",
        description: error.response?.data?.message || "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation() 
    setOpen(true)
  }

  return (
    <Card
      onClick={handleCardClick}
      className="
        cursor-pointer transition-all
        hover:shadow-md hover:shadow-blue-300
        dark:hover:shadow-blue-300
        dark:bg-slate-900
        bg-card text-card-foreground
      "
    >
      {/* HEADER */}
      <CardHeader>
        <div className="flex items-start justify-between font-mono">
          <CardTitle
            className="
              text-xl
              text-blue-700
              dark:text-blue-200
            "
          >
            {project.title}
          </CardTitle>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                className="
                  text-rose-500
                  hover:text-red-600
                  dark:text-rose-400 dark:hover:text-red-200
                "
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project
                  <strong className="text-blue-500"> "{project.title}" </strong>
                  and all its tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  disabled={deleting}
                  className='bg-red-500 hover:bg-red-600'
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4 font-mono">
        <p className="text-sm text-muted-foreground dark:text-blue-100 line-clamp-2">
          {project.description || 'No description'}
        </p>

        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground dark:text-blue-300">Progress</span>
              <span className="font-medium text-blue-600 dark:text-blue-200">
                {progress.progressPercentage.toFixed(0)}%
              </span>
            </div>

            <Progress value={progress.progressPercentage} />

            <div className="flex items-center gap-4 text-xs dark:text-white text-muted-foreground">
              <span>{progress.completedTasks} completed</span>
              <span>{progress.totalTasks} total</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="flex items-center justify-between font-mono">
        <div className="flex items-center gap-2 text-xs dark:text-blue-300 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
        </div>

        {progress && (
          <Badge
            variant={progress.totalTasks === 0 ? 'secondary' : 'default'}
            className="
              dark:bg-blue-500/15
              dark:text-blue-300
              dark:border-blue-400
              dark:hover:bg-blue-200
              dark:hover:text-blue-600
            "
          >
            {progress.totalTasks} tasks
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}

export default ProjectCard