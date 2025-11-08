import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Database } from "lucide-react";
import LeftRail from "./LeftRail";
import SchemaViewer from "./SchemaViewer";
import ChatPane from "./ChatPane";

interface WorkspaceLayoutProps {
  sessionId: string;
}

const WorkspaceLayout = ({ sessionId }: WorkspaceLayoutProps) => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <LeftRail sessionId={sessionId} />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <span className="font-semibold">DB RAG Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail - Desktop Only */}
        <aside className="hidden md:block w-64 border-r border-border overflow-y-auto">
          <LeftRail sessionId={sessionId} />
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
    </div>
  );
};

export default WorkspaceLayout;
