import { useState } from "react";
import { useParams } from "react-router-dom";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";
import UploadSQLCard from "@/components/upload/UploadSQLCard";

const Workspace = () => {
  const { sessionId } = useParams();
  const [activeSession, setActiveSession] = useState<string | null>(sessionId || null);

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <UploadSQLCard onSessionCreated={setActiveSession} />
      </div>
    );
  }

  return <WorkspaceLayout sessionId={activeSession} />;
};

export default Workspace;
