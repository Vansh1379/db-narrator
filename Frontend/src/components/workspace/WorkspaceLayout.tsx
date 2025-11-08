import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Database, Eye } from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import ThemeToggle from "@/components/ThemeToggle";
import LeftRail from "./LeftRail";
import SchemaViewer from "./SchemaViewer";
import ChatPane from "./ChatPane";
import type { SessionsResponse } from "@/lib/api";

type SessionSummary = SessionsResponse["sessions"][number];

interface WorkspaceLayoutProps {
  sessionId: string;
  sessions: SessionSummary[];
  onSelectSession: (sessionId: string) => void;
  onNewUpload: () => void;
  isSessionsLoading: boolean;
  onVisualize?: () => void;
  onDeleteSession: (sessionId: string) => void;
  deletingSessionId?: string | null;
}

const WorkspaceLayout = ({
  sessionId,
  sessions,
  onSelectSession,
  onNewUpload,
  isSessionsLoading,
  onVisualize,
  onDeleteSession,
  deletingSessionId,
}: WorkspaceLayoutProps) => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const { user } = useUser();

  const handleSelectSession = useCallback(
    (nextId: string) => {
      onSelectSession(nextId);
      setLeftOpen(false);
    },
    [onSelectSession]
  );

  const handleNewUpload = useCallback(() => {
    onNewUpload();
    setLeftOpen(false);
  }, [onNewUpload]);

  return (
    <div className="h-screen flex flex-col bg-background animate-fade-in">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <LeftRail
                sessionId={sessionId}
                sessions={sessions}
                onSelectSession={handleSelectSession}
                onNewUpload={handleNewUpload}
                onVisualize={onVisualize}
                isLoading={isSessionsLoading}
                onDeleteSession={onDeleteSession}
                deletingSessionId={deletingSessionId}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <span className="font-semibold">DB RAG Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Welcome, {user.firstName || user.username || "User"}</span>
            </div>
          )}

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex gap-2"
            onClick={onVisualize}
            disabled={!onVisualize}
          >
            <Eye className="h-4 w-4" />
            Visualize
          </Button>

          <Sheet open={rightOpen} onOpenChange={setRightOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                Schema
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-96 p-0">
              <SchemaViewer sessionId={sessionId} />
            </SheetContent>
          </Sheet>

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden animate-fade-in-up animation-delay-200">
        {/* Left Rail - Desktop Only */}
        <aside className="hidden md:block w-64 border-r border-border overflow-y-auto">
          <LeftRail
            sessionId={sessionId}
            sessions={sessions}
            onSelectSession={onSelectSession}
            onNewUpload={onNewUpload}
            onVisualize={onVisualize}
            isLoading={isSessionsLoading}
            onDeleteSession={onDeleteSession}
            deletingSessionId={deletingSessionId}
          />
        </aside>

        {/* Center - Chat & Results */}
        <main className="flex-1 overflow-hidden">
          <ChatPane sessionId={sessionId} />
        </main>

        {/* Right Rail - Desktop Only */}
        <aside className="hidden md:block w-96 border-l border-border overflow-y-auto">
          <SchemaViewer sessionId={sessionId} />
        </aside>
      </div>

      {/* Mobile Visualize Button */}
      {onVisualize && (
        <div className="md:hidden border-t border-border p-3">
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={onVisualize}
          >
            <Eye className="h-4 w-4" />
            Visualize Database
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceLayout;
