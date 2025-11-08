import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { ArrowLeft, ArrowRight, BarChart3, Database, MessageSquare, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import ChartCard from "@/components/workspace/ChartCard";

const demoFlow = [
  {
    title: "Upload schema effortlessly",
    description:
      "Drop your SQL dump or connect via integrations. We parse tables, relationships, and sample data in seconds.",
    icon: Database,
    highlight: "2-minute average ingestion time across enterprise datasets.",
  },
  {
    title: "Explore your knowledge graph",
    description:
      "Visualize tables, indexes, and foreign keys. Every column is annotated and searchable, just like the schema viewer in the workspace.",
    icon: Sparkles,
    highlight: "Pin critical tables and copy column refs straight into queries.",
  },
  {
    title: "Chat with Narrator",
    description:
      "Ask in natural language. Narrator drafts SQL, runs it, and explains results with sources and confidence scoring.",
    icon: MessageSquare,
    highlight: "Supports follow-up prompts, parameter changes, and saved query histories.",
  },
  {
    title: "Share insight-ready visuals",
    description:
      "Auto-generate charts, export CSVs, or embed dashboards. Collaborate with teammates directly in the workspace.",
    icon: BarChart3,
    highlight: "One-click exports to PDF, Slack, and presentation mode.",
  },
];

const walkthroughTimeline = [
  {
    label: "Upload",
    title: "Session created",
    copy: "SQL file parsed, schema indexed, embeddings ready for retrieval.",
  },
  {
    label: "Explore",
    title: "Schema map live",
    copy: "Tables, relationships, sample rows available in the right rail.",
  },
  {
    label: "Chat",
    title: "Question answered",
    copy: "Narrator returned SQL, results table, and auto-generated chart.",
  },
  {
    label: "Share",
    title: "Insight exported",
    copy: "CSV + chart deck sent to Slack channel #growth-weekly.",
  },
];

const chartSampleData = [
  { segment: "VIP", revenue: 186 },
  { segment: "High-value", revenue: 132 },
  { segment: "New upsells", revenue: 98 },
  { segment: "Self-serve", revenue: 74 },
];

const Demo = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignedOut>
              <Link to="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link to="/workspace">
                <Button variant="outline">Open Workspace</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 space-y-16">
        <section className="text-center space-y-6 animate-fade-in">
          <Badge variant="outline" className="gap-2 border-primary/50 text-primary">
            <Zap className="h-3 w-3" />
            Guided Tour
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            See how DB Narrator turns raw databases into living stories
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            This interactive walkthrough mirrors the experience you’ll have in the workspace. Each step highlights
            what you’ll see and the value it provides, from uploading your schema to presenting insights.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/workspace">
              <Button size="lg" variant="outline" className="gap-2">
                Jump to Workspace
              </Button>
            </Link>
          </div>
        </section>

        <section className="space-y-10">
          <div className="hidden items-center justify-center gap-6 lg:flex">
            {demoFlow.map((step, index) => (
              <div key={step.title} className="flex items-center gap-6">
                <Card
                  className="w-64 border border-border/60 bg-card/80 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-primary/10 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner shadow-primary/20">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-full border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-xs text-primary/90 text-center">
                      {step.highlight}
                    </div>
                  </CardContent>
                </Card>
                {index < demoFlow.length - 1 && (
                  <div className="flex flex-col items-center gap-2 text-primary animate-fade-in-up" style={{ animationDelay: `${index * 0.1 + 0.05}s` }}>
                    <div className="h-px w-12 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/80" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/50 bg-primary/5">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <div className="h-px w-12 bg-gradient-to-r from-primary/80 via-primary/40 to-primary/0" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:hidden">
            {demoFlow.map((step, index) => (
              <Card
                key={step.title}
                className="border border-border/60 bg-card/80 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-primary/10 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-primary/90">
                    {step.highlight}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="gap-2">
              <Sparkles className="h-3 w-3" />
              What you’ll experience
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Your narrative, chapter by chapter
            </h2>
            <p className="max-w-3xl text-lg text-muted-foreground">
              Follow the live storytelling flow—from the upload card to the chat pane—to understand how everything
              fits together before you drop in your own SQL.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border border-border/60 bg-card/80 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Guided workspace flow
                </CardTitle>
                <CardDescription>
                  A visual timeline of what happens from the moment you upload to sharing your insight.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative border-l border-dashed border-primary/40 pl-6">
                <div className="absolute left-[11px] top-3 h-[calc(100%-24px)] border-l border-dashed border-primary/20" />
                <div className="space-y-6">
                  {walkthroughTimeline.map((step, index) => (
                    <div key={step.label} className="relative animate-fade-in-up" style={{ animationDelay: `${0.15 + index * 0.1}s` }}>
                      <div className="absolute -left-[23px] top-0 flex h-5 w-5 items-center justify-center rounded-full border border-primary/60 bg-background text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <Badge variant="secondary" className="mb-1">{step.label}</Badge>
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.copy}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/80 shadow-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Sample insight preview
                </CardTitle>
                <CardDescription>
                  The kind of chart you’ll see right after Narrator executes your query.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChartCard
                  data={chartSampleData}
                  chartType="bar"
                  xKey="segment"
                  yKey="revenue"
                />
                <p className="text-xs text-muted-foreground">
                  Confidence 86% • Derived from tables `orders`, `users`, `order_items`
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-12 text-center animate-scale-in">
          <div className="mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to try it yourself?</h2>
            <p className="text-lg text-muted-foreground">
              The demo is just the beginning. Bring your schema, invite teammates, and let Narrator surface the
              insights hiding in your tables.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/sign-up">
                <Button size="lg" className="gap-2 px-8 text-lg">
                  Start Building
                  <Zap className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/workspace">
                <Button size="lg" variant="outline" className="gap-2 px-8 text-lg">
                  Go to Workspace
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 DB RAG Analytics. Demo generated for your team.</p>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-primary">
              Home
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

export default Demo;

