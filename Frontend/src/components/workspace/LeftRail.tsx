import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  Database,
  History,
  FileText,
  Plus,
  Eye,
  Trash2,
} from "lucide-react";
import type { SessionsResponse } from "@/lib/api";

type SessionSummary = SessionsResponse["sessions"][number];

interface LeftRailProps {
  sessionId: string | null;
  sessions: SessionSummary[];
  onSelectSession: (sessionId: string) => void;
  onNewUpload: () => void;
  onVisualize?: () => void;
  isLoading: boolean;
  onDeleteSession: (sessionId: string) => void;
  deletingSessionId?: string | null;
}

const formatUploadedAt = (uploadedAt?: string) => {
  if (!uploadedAt) return "";
  const date = new Date(uploadedAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return formatDistanceToNow(date, { addSuffix: true });
};

const LeftRail = ({
  sessionId,
  sessions,
  onSelectSession,
  onNewUpload,
  onVisualize,
  isLoading,
  onDeleteSession,
  deletingSessionId,
}: LeftRailProps) => {
  const hasSessions = sessions.length > 0;

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="p-4 space-y-2 animate-fade-in-up">
        <Button
          className="w-full justify-start gap-2"
          size="sm"
          onClick={onNewUpload}
        >
          <Plus className="h-4 w-4" />
          New Upload
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 animate-fade-in-up animation-delay-100">
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Sessions
            </h3>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : hasSessions ? (
              <div className="space-y-1">
                {sessions.map((session, index) => {
                  const isActive = session.sessionId === sessionId;
                  const uploadedAt = formatUploadedAt(session.uploadedAt);

                  return (
                    <div
                      key={session.sessionId}
                      className="space-y-1 animate-fade-in-up"
                      style={{ animationDelay: `${0.08 * index + 0.1}s` }}
                    >
                      <div className="flex items-center gap-2">
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="flex-1 justify-start gap-3"
                          size="sm"
                          onClick={() => onSelectSession(session.sessionId)}
                        >
                          <Database className="h-4 w-4 shrink-0 text-primary" />
                          <div className="flex flex-col items-start overflow-hidden">
                            <span className="w-full truncate text-sm font-medium">
                              {session.fileName || session.sessionId}
                            </span>
                            <span className="text-xs text-muted-foreground w-full truncate">
                              {uploadedAt || `${session.tables.length} tables`}
                            </span>
                          </div>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteSession(session.sessionId);
                          }}
                          disabled={deletingSessionId === session.sessionId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {isActive && onVisualize && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 pl-9 text-sm text-muted-foreground hover:text-foreground"
                          onClick={onVisualize}
                        >
                          <Eye className="h-4 w-4" />
                          Visualize schema
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">No sessions yet</p>
                <p>Upload a SQL dump to bootstrap your workspace experience.</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                size="sm"
                disabled
              >
                <History className="h-4 w-4" />
                Query History
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                size="sm"
                disabled
              >
                <FileText className="h-4 w-4" />
                Saved Queries
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                size="sm"
                disabled
              >
                <Upload className="h-4 w-4" />
                Export Session
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LeftRail;
