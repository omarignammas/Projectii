import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Backpack, GraduationCap, User, Gauge } from 'lucide-react';
import { Button } from '../components/ui/button';
import { CircularProgress } from '../components/shared/CircularProgress';
import { Card, CardContent } from '../components/ui/card';
import CourseBackpack from '../components/courses/CourseBackpack';
import CreateTaskDialog from '../components/tasks/CreateTaskDialog';
import EditCourseDialog from '../components/courses/EditCourseDialog';
import courseService from '../services/courseService';
import taskService from '../services/taskService';
import PageHero from '../components/shared/PageHero';
import Callout from '../components/shared/Callout';

export const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const [courseData, tasksResult, progressData] = await Promise.all([
        courseService.getCourseById(courseId),
        taskService.getAllTasks({ courseId, size: 500, sortField: 'id', direction: 'ASC' }),
        courseService.getCourseProgress(courseId),
      ]);

      setCourse(courseData);
      setTasks(tasksResult.content);
      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const handleTaskCreated = () => {
    fetchCourseData();
    setIsCreateTaskOpen(false);
  };

  const handleCourseUpdated = (updatedCourse) => {
    setCourse(updatedCourse);
    setIsEditCourseOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        Course not found
      </div>
    );
  }

  return (
    <div className="accent-purple container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/courses')}
        className="mb-6 text-left text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Button>

      <div className="mb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className="hero-icon mb-4"
              style={course.colorTag ? { backgroundColor: `${course.colorTag}26`, color: course.colorTag } : undefined}
            >
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{course.description || 'No description'}</p>
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsEditCourseOpen(true)} className="shrink-0">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Callout icon={Gauge}>
          Course progress is computed from completed vs. total tasks in this course — it updates itself as you check things off, nothing to set manually.
        </Callout>

        {course.instructorName ? (
          <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-card p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{course.instructorName}</p>
              {course.instructorEmail && (
                <p className="truncate text-xs text-muted-foreground">{course.instructorEmail}</p>
              )}
            </div>
          </div>
        ) : (
          <Callout icon={User}>No instructor on file for this course yet — add one from the edit button above.</Callout>
        )}
      </div>

      <Card className="mb-8 border-border/80 bg-card">
        <CardContent className="flex items-center gap-6 p-5">
          {progress && (
            <>
              <CircularProgress percentage={Math.round(progress.progressPercentage)} size={100} strokeWidth={9} color="blue" />
              <div>
                <p className="text-sm font-medium text-foreground">course progress</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {progress.completedTasks} of {progress.totalTasks} tasks completed
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Backpack Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="section-header">
          <Backpack className="h-5 w-5 text-primary" />
          backpack
        </p>
        <Button onClick={() => setIsCreateTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Backpack (tasks grouped by type) */}
      <CourseBackpack
        tasks={tasks}
        onTaskUpdated={fetchCourseData}
        onTaskDeleted={fetchCourseData}
      />

      {/* Dialogs */}
      <CreateTaskDialog
        defaultCourseId={courseId}
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        onTaskCreated={handleTaskCreated}
      />

      <EditCourseDialog
        course={course}
        open={isEditCourseOpen}
        onOpenChange={setIsEditCourseOpen}
        onCourseUpdated={handleCourseUpdated}
      />
    </div>
  );
};

export default CourseDetailPage;
