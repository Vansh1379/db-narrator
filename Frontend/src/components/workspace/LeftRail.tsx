import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Upload, Database, History, FileText, Plus } from "lucide-react";

interface LeftRailProps {
  sessionId: string;
}

const LeftRail = ({ sessionId }: LeftRailProps) => {
  const sessions = [
    { id: "session_sample", name: "Sample Database", date: "Today" },
    { id: "session_1", name: "E-commerce DB", date: "Yesterday" },
    { id: "session_2", name: "Analytics Schema", date: "2 days ago" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-2">
        <Button className="w-full justify-start" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Upload
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Sessions
            </h3>
            <div className="space-y-1">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={session.id === sessionId ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                >
                  <Database className="h-4 w-4 mr-2 shrink-0" />
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm truncate w-full">{session.name}</span>
                    <span className="text-xs text-muted-foreground">{session.date}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <History className="h-4 w-4 mr-2" />
                Query History
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Saved Queries
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Upload className="h-4 w-4 mr-2" />
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
