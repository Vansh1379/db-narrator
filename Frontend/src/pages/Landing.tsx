import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Database,
  Layers,
  LineChart,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const highlights = [
  {
    title: "Live schema explorer",
    description: "Visualize tables, relationships, and indexes instantly after upload.",
    icon: Layers,
  },
  {
    title: "AI SQL co-pilot",
    description: "Turn questions into verified SQL with transparent reasoning and sources.",
    icon: Brain,
  },
  {
    title: "Actionable dashboards",
    description: "Auto-generate charts, tables, and exports tailored to your stakeholders.",
    icon: LineChart,
  },
];

const stats = [
  { label: "Queries automated", value: "120K+" },
  { label: "Avg. time saved", value: "4.6 hrs" },
  { label: "Teams onboarded", value: "380+" },
];

const workflow = [
  {
    step: "01",
    title: "Upload schema",
    description: "Drag & drop your SQL dump or connect directly to your datasource.",
  },
  {
    step: "02",
    title: "Explore knowledge graph",
    description: "Inspect tables, relationships, and sample rows with our visual explorer.",
  },
  {
    step: "03",
    title: "Ask anything",
    description: "Type questions in plain English—AI drafts queries you can refine in seconds.",
  },
  {
    step: "04",
    title: "Share insights",
    description: "Export charts, send insights to Slack, or schedule recurring reports.",
  },
];

const Landing = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/30 blur-[160px] dark:bg-primary/20" />
        <div className="absolute -left-32 top-1/3 h-[360px] w-[360px] rounded-full bg-accent/20 blur-[140px] dark:bg-accent/10" />
        <div className="absolute -right-24 bottom-0 h-[280px] w-[280px] rounded-full bg-chart-2/20 blur-[140px] dark:bg-chart-2/10" />
      </div>

      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
              <div className="absolute -bottom-2 -right-2 h-4 w-4 animate-ping rounded-full bg-primary/60" />
            </div>
            <span className="text-xl font-semibold tracking-tight">DB RAG Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignedOut>
              <Link to="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/workspace">
                <Button variant="outline" className="gap-2">
                  Go to Workspace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="relative flex flex-col items-center gap-12 py-24 text-center animate-fade-in">
          <div className="absolute inset-0 -z-10 flex justify-center">
            <div className="h-96 w-96 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
          </div>

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-muted-foreground backdrop-blur animate-fade-in-up">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI-powered database storytelling</span>
            </div>

            <div className="space-y-6 animate-fade-in-up animation-delay-100">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                Ask questions,
                <br />
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  get SQL answers in seconds
                </span>
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl animate-fade-in-up animation-delay-200">
                Upload your schema, explore relationships, and chat with your data like you would with a teammate.
                DB Narrator translates business questions into confident SQL and stunning visuals—no waitlists,
                no analyst bottlenecks.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
              <SignedOut>
                <Link to="/sign-up">
                  <Button size="lg" className="gap-2 px-8 text-lg">
                    Launch Studio
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/workspace">
                  <Button size="lg" className="gap-2 px-8 text-lg">
                    Open Workspace
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="gap-2 px-6 text-lg">
                  See how it works
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card/70 px-6 py-4 text-center shadow-lg shadow-primary/5 transition duration-200 hover:-translate-y-1 hover:border-primary/60 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <span className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="max-w-3xl border-border/60 bg-card/80 shadow-xl backdrop-blur animate-scale-in animation-delay-200">
            <CardContent className="space-y-6 p-8">
              <div className="flex flex-col gap-2 text-left">
                <Badge variant="secondary" className="w-fit gap-1">
                  <Sparkles className="h-3 w-3" />
                  Live demo
                </Badge>
                <h3 className="text-lg font-semibold text-foreground">Narrate a story from raw tables</h3>
                <p className="text-sm text-muted-foreground">
                  Watch DB Narrator break down business questions, generate SQL, and surface the story behind the
                  numbers instantly.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">You</p>
                    <p className="text-sm text-foreground">
                      Show monthly revenue for VIP customers vs. last year. Highlight any channels driving the lift.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-card/80 p-3 shadow-inner shadow-primary/10">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-chart-2" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Narrator</p>
                    <p className="text-sm text-foreground">
                      Generated SQL in 1.2s · YOY lift of 18.6% · TikTok + Email bundles driving 62% of growth · Auto-created exec chart.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Highlights Section */}
        <section className="space-y-12 py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="outline" className="gap-2 border-primary/50 text-primary">
              <Sparkles className="h-3 w-3" />
              Why teams love DB Narrator
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Designed for analysts, adopted by everyone
            </h2>
            <p className="max-w-3xl text-lg text-muted-foreground">
              From self-serve business intelligence to in-depth analytics, our platform gives you a clear map
              of your data universe and the tools to turn raw tables into real decisions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item, index) => (
              <Card
                key={item.title}
                className="group border border-border/60 bg-card/80 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-primary/10 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index + 0.1}s` }}
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition duration-200 group-hover:scale-105 group-hover:bg-primary/20">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="space-y-10 rounded-3xl border border-border/60 bg-muted/40 p-10 backdrop-blur">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="gap-2">
              <Zap className="h-3 w-3" />
              Flow in minutes
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              A modern workflow built for speed
            </h2>
            <p className="max-w-3xl text-lg text-muted-foreground">
              Every interaction is intentional—from schema ingestion to board-ready storyboards. Stay in control
              while our AI co-pilot handles the heavy lifting.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {workflow.map((step, index) => (
              <div
                key={step.step}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-6 transition duration-200 hover:border-primary/60 hover:bg-card/90 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index + 0.2}s` }}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground transition duration-200 group-hover:border-primary group-hover:text-primary">
                  {step.step}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative mt-20 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-12 animate-scale-in">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl dark:bg-primary/20" />
          <div className="relative mx-auto max-w-3xl space-y-6 text-center">
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <Zap className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">Ready to unlock your data narrative?</h2>
            <p className="text-lg text-muted-foreground">
              Upload a schema, pick a sample dataset, or invite your team for a collaborative walkthrough. Our
              concierge onboarding can get you live in under a week.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <SignedOut>
                <Link to="/sign-up">
                  <Button size="lg" className="gap-2 px-8 text-lg">
                    Start free trial
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/workspace">
                  <Button size="lg" className="gap-2 px-8 text-lg">
                    Open workspace
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
              <Button size="lg" variant="outline" className="gap-2 px-8 text-lg">
                Book a demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 DB RAG Analytics. Powered by AI storytelling for your data.</p>
          <div className="flex items-center gap-4">
            <a href="#workflow" className="hover:text-primary">
              Product
            </a>
            <a href="mailto:hello@dbnarrator.ai" className="hover:text-primary">
              Contact
            </a>
            <a href="/sign-in" className="hover:text-primary">
              Sign In
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
