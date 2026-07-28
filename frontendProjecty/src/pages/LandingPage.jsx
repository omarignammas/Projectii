import { Link } from 'react-router-dom';
import {
  FolderKanban,
  ArrowRight,
  Layers,
  CalendarClock,
  Gauge,
  SunMoon,
  CheckCircle2,
  Home,
  ListTodo,
  LayoutGrid,
  CalendarDays,
  BarChart3,
  Github,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { Reveal } from '../components/shared/Reveal';
import ScreensShowcase from '../components/landing/ScreensShowcase';
import CollaborateShowcase from '../components/landing/CollaborateShowcase';
import RotatingWord from '../components/landing/RotatingWord';
import HeroNotifications from '../components/landing/HeroNotifications';
import { ModeToggle } from '../components/ui/mode-toggle';

const NAV_LINKS = [
  { href: '#screens', label: 'Screens' },
  { href: '#collaborate', label: 'Collaborate' },
  { href: '#workspace', label: 'Workspace' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'Process' },
];

// Kept to identical character length on purpose — the rotating swiper swaps these
// in place, and same-length words mean the swap never looks lopsided mid-transition.
const HERO_WORDS = ['spreadsheet', 'sticky note', 'index cards', 'messy notes', 'loose paper'];
const WORKSPACE_WORDS = ['your terms', 'your rules', 'your speed', 'your plans'];

const FEATURES = [
  {
    icon: Layers,
    title: 'Courses as containers',
    description: 'Group each term into courses, add tasks underneath, and keep every assignment in one place.',
  },
  {
    icon: CalendarClock,
    title: 'Due dates that matter',
    description: 'Set a due date per task and Projectii flags anything overdue automatically — nothing slips through.',
  },
  {
    icon: Gauge,
    title: 'Progress at a glance',
    description: 'Live completion rings on every course and a dashboard summary roll everything up in real time.',
  },
  {
    icon: SunMoon,
    title: 'Looks good either way',
    description: 'A considered dark theme by default, with a one-click light mode when you want it.',
  },
];

const AREAS = [
  { tag: 'MAIN', module: 'Dashboard', icon: Home, focus: 'Today, this week, by priority' },
  { tag: 'MAIN', module: 'Tasks', icon: ListTodo, focus: 'List view or drag-and-drop board' },
  { tag: 'PLAN', module: 'Calendar', icon: CalendarDays, focus: 'Every due date, one month at a time' },
  { tag: 'TRACK', module: 'Stats', icon: BarChart3, focus: 'Streaks, trends, completion rate' },
];

const STEPS = [
  {
    number: '01',
    title: 'Create a course',
    description: 'Give it a name, a term, and an instructor. That\'s your workspace for everything related to it.',
  },
  {
    number: '02',
    title: 'Break it into tasks',
    description: 'Add assignments, readings, and exams with due dates as the work gets defined. Edit or remove them anytime.',
  },
  {
    number: '03',
    title: 'Track it automatically',
    description: 'Check tasks off as you go — progress rings and overdue flags update themselves.',
  },
];

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FolderKanban className="h-4 w-4" />
            </span>
            Projectii
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            {user ? (
              <Button asChild size="sm" variant="outline" className="border-primary/60">
                <Link to="/courses">
                  Enter App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-primary/60">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob-a absolute -left-40 -top-40 h-[440px] w-[440px] rounded-full bg-[hsl(var(--chart-1)/0.08)] blur-3xl dark:bg-[hsl(var(--chart-1)/0.22)]" />
          <div className="animate-blob-b absolute -right-32 top-0 h-[380px] w-[380px] rounded-full bg-[hsl(var(--chart-2)/0.07)] blur-3xl dark:bg-[hsl(var(--chart-2)/0.18)]" />
          <div className="animate-blob-a absolute -bottom-48 left-1/3 h-[380px] w-[380px] rounded-full bg-[hsl(var(--chart-3)/0.06)] blur-3xl [animation-delay:-8s] dark:bg-[hsl(var(--chart-3)/0.16)]" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_65%)]" />

        <HeroNotifications />

        <div className="container relative mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow-label animate-in fade-in slide-in-from-bottom-2 mx-auto mb-6 w-fit duration-500">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              [ system notice ] status · online
              <span className="animate-blink text-primary">_</span>
            </p>

            <h1 className="animate-in fade-in slide-in-from-bottom-3 text-balance text-4xl font-bold leading-tight text-foreground duration-700 [animation-delay:100ms] [animation-fill-mode:backwards] sm:text-5xl md:text-6xl">
              Run your coursework without{' '}
              <span className="text-neon-blue">
                the <RotatingWord words={HERO_WORDS} />.
              </span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-3 mx-auto mt-6 max-w-xl text-balance text-sm uppercase tracking-wide text-muted-foreground duration-700 [animation-delay:200ms] [animation-fill-mode:backwards]">
              No busywork, no fields you'll never use — courses, tasks, and the status of both.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-3 mx-auto mt-8 max-w-lg rounded-lg border border-border/80 bg-card px-5 py-3 duration-700 [animation-delay:300ms] [animation-fill-mode:backwards]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">workflow</span>
                <span className="text-foreground">
                  to do <span className="text-muted-foreground">→</span> in progress{' '}
                  <span className="text-muted-foreground">→</span> <span className="text-primary">done</span>
                </span>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 mt-8 flex flex-col items-center justify-center gap-3 duration-700 [animation-delay:400ms] [animation-fill-mode:backwards] sm:flex-row">
              <Button asChild size="lg" className="w-full transition-transform hover:-translate-y-0.5 sm:w-auto">
                <Link to={user ? '/courses' : '/register'}>
                  {user ? 'Go to Courses' : 'Get Started Free'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {!user && (
                <Button asChild size="lg" variant="outline" className="w-full transition-transform hover:-translate-y-0.5 sm:w-auto">
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Screens: tabbed product showcase */}
      <section id="screens" className="border-t border-border/80 py-20">
        <div className="container mx-auto px-4">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow-label mx-auto mb-4 w-fit">[ the app ]</p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Every screen, <span className="text-primary">built for the work</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              A quick look around — this is what you'll actually be using.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <ScreensShowcase />
          </Reveal>
        </div>
      </section>

      {/* Collaborate: friends + focus room invites */}
      <section id="collaborate" className="border-t border-border/80 py-20">
        <div className="container mx-auto px-4">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow-label mx-auto mb-4 w-fit">[ together ]</p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Bring <span className="text-primary">friends</span> into focus
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Invite a friend to a Focus Room and they get a real-time notification the moment you do.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <CollaborateShowcase />
          </Reveal>
        </div>
      </section>

      {/* Workspace: terminal mock + area table */}
      <section id="workspace" className="border-t border-border/80 py-20">
        <div className="container mx-auto px-4">
          <Reveal>
            <p className="eyebrow-label mb-4">[ the workspace ]</p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Real work on <span className="text-neon-blue"><RotatingWord words={WORKSPACE_WORDS} />.</span>
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              A taste of what the dashboard looks like day to day — the rest is in the app.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Reveal delay={100} className="rounded-lg border border-border/80 bg-card p-5 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3 text-xs">
                <span className="text-muted-foreground">// dashboard.session</span>
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  live
                </span>
              </div>
              <div className="space-y-1.5 text-sm leading-relaxed">
                <p className="text-muted-foreground">$ open projectii --today</p>
                <p className="text-muted-foreground">[app] loading today's tasks...</p>
                <p className="text-foreground">[app] 3 due today · 1 overdue</p>
                <p className="text-muted-foreground">→ next up:</p>
                <p className="text-foreground">&nbsp;&nbsp;Lab Report 3 — Organic Chemistry <span className="pill-priority-high rounded px-1.5 py-0.5 text-xs">High</span></p>
              </div>
            </Reveal>

            <Reveal delay={200} className="overflow-hidden rounded-lg border border-border/80 bg-card transition-transform hover:-translate-y-1">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 border-b border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
                <span>module</span>
                <span>focus</span>
              </div>
              {AREAS.map((area) => (
                <div key={area.module} className="grid grid-cols-[auto_1fr] items-center gap-x-4 border-b border-border/60 px-4 py-3 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border/80 text-primary">
                      <area.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{area.module}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{area.focus}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/80 py-20">
        <div className="container mx-auto px-4">
          <Reveal>
            <p className="eyebrow-label mb-4">[ features ]</p>
            <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">Everything a course needs</h2>
            <p className="mb-14 max-w-xl text-muted-foreground">
              No workflow builders to configure, no fields you'll never use.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <Reveal
                key={feature.title}
                delay={i * 100}
                className="rounded-xl border border-border/80 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/80 py-20">
        <div className="container mx-auto px-4">
          <Reveal>
            <p className="eyebrow-label mb-4">[ process ]</p>
            <h2 className="mb-14 text-3xl font-bold text-foreground sm:text-4xl">Up and running in three steps</h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 100} className="text-left">
                <span className="font-numeric text-sm font-semibold text-primary">{step.number}</span>
                <h3 className="mt-2 mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/80 py-20">
        <div className="container mx-auto px-4">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center rounded-2xl border border-border/80 bg-card px-6 py-14 text-center">
            <CheckCircle2 className="mb-4 h-8 w-8 text-primary" />
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Start organizing your work today
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Free to use. No credit card, no setup calls — just create a course and go.
            </p>
            <Button asChild size="lg" className="mt-8 transition-transform hover:-translate-y-0.5">
              <Link to={user ? '/courses' : '/register'}>
                {user ? 'Go to Courses' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Footer — scoped to the dark palette (via the same `.dark` token-scoping
          trick used for accent-* scopes) so this band stays dark regardless of
          the site's light/dark toggle, like a fixed brand signature. */}
      <footer className="dark relative flex min-h-[280px] flex-col overflow-hidden border-t border-border bg-background sm:min-h-[320px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
        >
          <span
            className="whitespace-nowrap font-black leading-none tracking-tighter text-foreground/[0.05]"
            style={{ fontSize: 'clamp(5rem, 22vw, 300px)' }}
          >
            PROJECTII
          </span>
        </div>

        <div className="container relative mx-auto flex flex-1 flex-col justify-between gap-8 px-4 py-10">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-foreground transition-colors hover:bg-accent"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FolderKanban className="h-3.5 w-3.5" />
            </span>
            Projectii
          </a>

          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Projectii. Built for students, not spreadsheets.</p>
            <a
              href="https://github.com/omarignammas/Projectii"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 px-4 py-2 text-foreground transition-colors hover:border-foreground/40 hover:bg-accent"
            >
              <Github className="h-4 w-4" />
              View source on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
