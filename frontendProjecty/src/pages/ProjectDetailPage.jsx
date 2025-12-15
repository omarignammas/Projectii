import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Navbar from '../components/shared/Navbar';
import TaskList from '../components/tasks/TaskList';
import CreateTaskDialog from '../components/tasks/CreateTaskDialog';
import EditProjectDialog from '../components/projects/EditProjectDialog';
import projectService from '../services/projectService';
import taskService from '../services/taskService';

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Pagination states
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  // 🔹 Fetch project + paginated tasks
  const fetchProjectData = async (pageNumber = page) => {
    setLoading(true);
    try {
      const [projectData, tasksResult, progressData] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getAllTasks(projectId, {
          page: pageNumber,
          size,
          sortField: 'id',
          direction: 'ASC',
        }),
        projectService.getProjectProgress(projectId),
      ]);

      setProject(projectData);
      setTasks(tasksResult.content);
      setTotalPages(tasksResult.totalPages);
      setPage(tasksResult.page);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData(page);
    
  }, [page, projectId]);

  const reloadTasks = () => fetchProjectData(page);

  const handleTaskCreated = () => {
    reloadTasks();
    setIsCreateTaskOpen(false);
  };

  const handleTaskUpdated = () => reloadTasks();
  const handleTaskDeleted = () => reloadTasks();

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject);
    setIsEditProjectOpen(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          Loading project...
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          Project not found
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-left "
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="space-y-6">
          {/* Project Card */}
          <Card
              className="dark:bg-slate-900 dark:text-slate-200 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-3xl text-blue-600 dark:text-blue-300">
                      {project.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-blue-800 dark:text-blue-200">
                      {project.description || 'No description'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditProjectOpen(true)}
                    className="dark:border-blue-400 dark:text-blue-200 dark:hover:text-blue-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {progress && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium dark:text-slate-200">Project Progress</span>
                      <span className="text-2xl font-bold text-primary dark:text-blue-300">
                        {progress.progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={progress.progressPercentage} className="h-3" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      {progress.completedTasks} of {progress.totalTasks} tasks completed
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>


          {/* Tasks Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Tasks</h2>
            <Button onClick={() => setIsCreateTaskOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Task List */}
          <TaskList
            tasks={tasks}
            projectId={projectId}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>

              <span className="text-sm dark:text-white text-muted-foreground">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Dialogs */}
        <CreateTaskDialog
          projectId={projectId}
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          onTaskCreated={handleTaskCreated}
        />

        <EditProjectDialog
          project={project}
          open={isEditProjectOpen}
          onOpenChange={setIsEditProjectOpen}
          onProjectUpdated={handleProjectUpdated}
        />
      </div>
    </>
  );
};

export default ProjectDetailPage;
