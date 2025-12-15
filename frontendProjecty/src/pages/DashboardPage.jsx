import { useState, useEffect } from 'react';
import { Plus, Search, Filter} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Navbar from '../components/shared/Navbar';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectDialog from '../components/projects/CreateProjectDialog';
import projectService from '../services/projectService';
import { StatCard } from '../components/shared/StatCard';

export const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [projectsWithProgress, setProjectsWithProgress] = useState([]); // Nouveau state
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overallProgress: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [size] = useState(6);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProjects = async (pageNumber = page) => {
    setLoading(true);
    try {
      const result = await projectService.getAllProjects({
        page: pageNumber,
        size,
        sortField: 'id',
        direction: 'DESC',
      });

      setProjects(result.content);
      
      // Fetch progress for each project
      await fetchProjectsWithProgress(result.content);
      
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsWithProgress = async (projectsList) => {
    const progressPromises = projectsList.map(async (project) => {
      try {
        const progress = await projectService.getProjectProgress(project.id);
        return {
          ...project,
          progress: progress.progressPercentage,
          totalTasks: progress.totalTasks,
          completedTasks: progress.completedTasks,
        };
      } catch (error) {
        console.error(`Error fetching progress for project ${project.id}:`, error);
        return {
          ...project,
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
        };
      }
    });

    const projectsWithProgressData = await Promise.all(progressPromises);
    setProjectsWithProgress(projectsWithProgressData);
    
    // Calculate stats
    calculateStats(projectsWithProgressData);
  };

  const calculateStats = (projectsWithProgressData) => {
    let totalProjects = projectsWithProgressData.length;
    let completedProjects = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    projectsWithProgressData.forEach(project => {
      totalTasks += project.totalTasks;
      completedTasks += project.completedTasks;
      
      if (project.progress === 100) {
        completedProjects++;
      }
    });

    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const projectCompletionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    setStats({
      totalProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overallProgress: Math.round(overallProgress),
      projectCompletionRate: Math.round(projectCompletionRate),
      taskCompletionRate: Math.round(taskCompletionRate),
    });
  };

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  // Apply filters - CORRIGÉ ICI
  useEffect(() => {
    let filtered = [...projectsWithProgress]; // Utiliser projectsWithProgress au lieu de projects

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter - IMPLÉMENTÉ ICI
    if (statusFilter === 'completed') {
      filtered = filtered.filter(project => project.progress === 100);
    } else if (statusFilter === 'in-progress') {
      filtered = filtered.filter(project => project.progress < 100);
    }
    // 'all' ne nécessite pas de filtre

    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, projectsWithProgress]);

  const handleProjectCreated = () => {
    fetchProjects(page);
    setIsCreateDialogOpen(false);
  };

  const handleProjectDeleted = () => {
    fetchProjects(page);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading projects...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 font-mono">
        {/* Stats Cards with Circular Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Overall Progress */}
          <StatCard
            title="Overall Progress"
            subtitle={`${stats.completedTasks}/${stats.totalTasks} tasks done`}
            percentage={stats.overallProgress}
            color="blue"
          />

          {/* Total Projects */}
          <StatCard
            title="Total Projects"
            subtitle={`${stats.completedProjects} completed`}
            percentage={stats.projectCompletionRate || 0}
            color="purple"
          />

          {/* Tasks Completed */}
          <StatCard
            title="Tasks Completed"
            subtitle={`out of ${stats.totalTasks} total`}
            percentage={stats.taskCompletionRate || 0}
            color="green"
          />

          {/* Projects Achieved */}
          <StatCard
            title="Projects Achieved"
            subtitle={`${stats.projectCompletionRate || 0}% completion rate`}
            percentage={stats.projectCompletionRate || 0}
            color="orange"
          />
        </div>

        {/* Header with Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl text-blue-900 dark:text-blue-200 font-bold">
                My Projects
              </h1>
              <p className="text-blue-400 mt-1 dark:text-gray-300">
                Manage your projects and tasks
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          {(searchTerm || statusFilter !== 'all') && (
            <p className="text-sm text-muted-foreground mt-4">
              Found {filteredProjects.length} project(s)
              {statusFilter !== 'all' && ` • Filter: ${statusFilter === 'completed' ? 'Completed' : 'In Progress'}`}
            </p>
          )}
        </div>

        {/* Content */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm || statusFilter !== 'all' ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <div className="flex gap-2 justify-center">
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  )}
                  {statusFilter !== 'all' && (
                    <Button variant="outline" onClick={() => setStatusFilter('all')}>
                      Clear Filter
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Launch your project life-changing journey 🚀
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleProjectDeleted}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground dark:text-white">
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
          </>
        )}

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </>
  );
};

export default DashboardPage;