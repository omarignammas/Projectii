import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, FileText, RotateCcw, Share2, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import PageHero from '../components/shared/PageHero';
import MermaidDiagram from '../components/summaries/MermaidDiagram';
import ShareDialog from '../components/summaries/ShareDialog';
import courseSummaryService from '../services/courseSummaryService';
import quizService from '../services/quizService';
import { useToast } from '../hooks/use-toast';

const DIFFICULTY_LABEL = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' };

const markdownComponents = {
  h1: (props) => <h2 className="mb-3 mt-6 text-xl font-bold text-foreground first:mt-0" {...props} />,
  h2: (props) => <h3 className="mb-2 mt-5 text-lg font-semibold text-foreground first:mt-0" {...props} />,
  h3: (props) => <h4 className="mb-2 mt-4 text-base font-semibold text-foreground first:mt-0" {...props} />,
  p: (props) => <p className="mb-3 text-sm leading-relaxed text-muted-foreground" {...props} />,
  ul: (props) => <ul className="mb-3 ml-5 list-disc space-y-1 text-sm text-muted-foreground" {...props} />,
  ol: (props) => <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm text-muted-foreground" {...props} />,
  li: (props) => <li className="text-sm text-muted-foreground" {...props} />,
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  table: (props) => <table className="mb-3 w-full border-collapse text-sm" {...props} />,
  th: (props) => <th className="border border-border/60 bg-accent/50 p-2 text-left text-xs font-semibold text-foreground" {...props} />,
  td: (props) => <td className="border border-border/60 p-2 text-muted-foreground" {...props} />,
};

export const SummaryDetailPage = () => {
  const { summaryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const fetchQuizzes = async (id) => {
    const result = await quizService.getQuizzesForSummary(id);
    setQuizzes(result);
  };

  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    const poll = async () => {
      try {
        const data = await courseSummaryService.getSummaryById(summaryId);
        if (cancelled) return;
        setSummary(data);
        setLoading(false);
        if (data.status === 'PENDING') {
          timeoutId = setTimeout(poll, 3000);
        } else {
          fetchQuizzes(summaryId);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [summaryId]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await courseSummaryService.retry(summaryId);
      setSummary((prev) => ({ ...prev, status: 'PENDING' }));
      toast({ title: 'Retrying', description: 'Regenerating your summary…' });
      const data = await courseSummaryService.getSummaryById(summaryId);
      setSummary(data);
    } catch (error) {
      toast({ title: 'Could not retry', description: error.response?.data?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setRetrying(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const quiz = await quizService.requestQuizGeneration(summaryId, difficulty);
      setIsQuizDialogOpen(false);
      toast({ title: 'Quiz generating', description: 'It\'ll be ready in a few seconds.' });
      fetchQuizzes(summaryId);
      navigate(`/quizzes/${quiz.id}/take`);
    } catch (error) {
      toast({ title: 'Could not generate quiz', description: error.response?.data?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleShare = async (userIds) => {
    for (const userId of userIds) {
      await courseSummaryService.shareSummary(summaryId, userId);
    }
    toast({ title: 'Shared', description: `Shared with ${userIds.length} friend${userIds.length === 1 ? '' : 's'}.` });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Loading summary...</div>;
  }

  if (!summary) {
    return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Summary not found</div>;
  }

  return (
    <div className="accent-blue container mx-auto max-w-3xl px-4 py-10">
      <Button variant="ghost" onClick={() => navigate('/summaries')} className="mb-6 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Summaries
      </Button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHero
          icon={FileText}
          title={summary.title}
          subtitle={summary.courseTitle ? `From ${summary.courseTitle}` : (!summary.isOwner ? `Shared by ${summary.ownerName}` : undefined)}
        />
        {summary.isOwner && (
          <Button variant="outline" size="icon" onClick={() => setIsShareOpen(true)} title="Share">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {summary.status === 'PENDING' && (
        <Card className="border-border/80 bg-card">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            Generating your summary and diagram…
          </CardContent>
        </Card>
      )}

      {summary.status === 'FAILED' && (
        <Card className="border-border/80 bg-card">
          <CardContent className="flex items-center justify-between gap-3 p-6">
            <p className="text-sm text-muted-foreground">Couldn't generate a summary for this file.</p>
            {summary.isOwner && (
              <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying}>
                <RotateCcw className={`mr-2 h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Retrying...' : 'Retry'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {summary.status === 'READY' && (
        <div className="space-y-6">
          {summary.diagramMermaid && <MermaidDiagram code={summary.diagramMermaid} />}

          <Card className="border-border/80 bg-card">
            <CardContent className="p-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {summary.summaryMarkdown}
              </ReactMarkdown>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="section-header">
              <HelpCircle className="h-4 w-4 text-primary" />
              quizzes
            </p>
            <Button size="sm" onClick={() => setIsQuizDialogOpen(true)}>
              Generate Quiz
            </Button>
          </div>

          {quizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quizzes yet — generate one to test yourself on this material.</p>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <Link key={quiz.id} to={`/quizzes/${quiz.id}/take`}>
                  <Card className="border-border/80 bg-card transition-colors hover:border-primary/40">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                            {DIFFICULTY_LABEL[quiz.difficulty]}
                          </Badge>
                          {quiz.status === 'PENDING' && (
                            <span className="text-xs text-muted-foreground">generating…</span>
                          )}
                          {quiz.status === 'FAILED' && (
                            <span className="text-xs text-destructive">failed</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate a quiz</DialogTitle>
            <DialogDescription>Choose a difficulty level for the questions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsQuizDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateQuiz} disabled={generatingQuiz}>
              {generatingQuiz ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        title="Share this summary"
        onShare={handleShare}
      />
    </div>
  );
};

export default SummaryDetailPage;
