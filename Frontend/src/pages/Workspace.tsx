import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import UploadSQLCard from "@/components/upload/UploadSQLCard";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";
import DatabaseVisualizer from "@/components/workspace/DatabaseVisualizer";
import { fetchSessions, deleteSession, fetchSchema } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const SESSION_STORAGE_KEY = "dbNarratorActiveSession";
const SCHEMA_STORAGE_PREFIX = "dbNarratorSchema:";

const Workspace = () => {
  const { sessionId: sessionIdParam } = useParams();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const initialSessionId = useMemo(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem(SESSION_STORAGE_KEY) ?? sessionIdParam ?? null
      );
    }
    return sessionIdParam ?? null;
  }, [sessionIdParam]);

  const [activeSession, setActiveSession] = useState<string | null>(
    initialSessionId
  );
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null
  );

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    isFetching: isSessionsFetching,
  } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => fetchSessions(getToken),
    enabled: typeof getToken === "function",
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!sessionIdParam) return;
    setActiveSession(sessionIdParam);
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionIdParam);
    }
  }, [sessionIdParam]);

  useEffect(() => {
    if (!sessionsData || isSessionsFetching) return;

    if (!sessionsData.sessions || sessionsData.sessions.length === 0) {
      if (activeSession) {
        setActiveSession(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
      return;
    }

    if (
      activeSession &&
      sessionsData.sessions.some(
        (session) => session.sessionId === activeSession
      )
    ) {
      return;
    }

    const fallback = sessionsData.sessions[0]?.sessionId ?? null;
    if (fallback) {
      setActiveSession(fallback);
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_STORAGE_KEY, fallback);
      }
    }
  }, [sessionsData, activeSession, isSessionsFetching]);

  const handleSessionCreated = async (newSessionId: string) => {
    setActiveSession(newSessionId);
    setShowVisualizer(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    }
    await queryClient.invalidateQueries({ queryKey: ["sessions"] });
    await queryClient.invalidateQueries({ queryKey: ["schema", newSessionId] });
  };

  const handleSelectSession = (nextSessionId: string) => {
    setActiveSession(nextSessionId);
    setShowVisualizer(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
    }
  };

  const handleNewUpload = () => {
    setActiveSession(null);
    setShowVisualizer(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  const handleVisualizerToggle = () => setShowVisualizer(true);
  const closeVisualizer = () => setShowVisualizer(false);

  const sessions = sessionsData?.sessions ?? [];
  const sessionsLoadingState = isSessionsLoading || isSessionsFetching;
  const {
    data: schemaData,
    isLoading: isSchemaLoading,
    isFetching: isSchemaFetching,
  } = useQuery({
    queryKey: ["schema", activeSession],
    enabled: Boolean(activeSession && typeof getToken === "function"),
    queryFn: async () => {
      if (!activeSession) return undefined;
      const schema = await fetchSchema(getToken, activeSession);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `${SCHEMA_STORAGE_PREFIX}${activeSession}`,
          JSON.stringify(schema)
        );
      }
      return schema;
    },
    initialData: () => {
      if (!activeSession || typeof window === "undefined") return undefined;
      const cached = localStorage.getItem(
        `${SCHEMA_STORAGE_PREFIX}${activeSession}`
      );
      if (!cached) return undefined;
      try {
        return JSON.parse(cached);
      } catch {
        return undefined;
      }
    },
    staleTime: 60_000,
  });
  const schemaTables = schemaData?.tables ?? [];
  const schemaLoadingState = isSchemaLoading || isSchemaFetching;
  const schemaInitialLoading = schemaLoadingState && schemaTables.length === 0;

  const handleDeleteSession = async (sessionToDelete: string) => {
    if (deletingSessionId) return;

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("Delete this session and its data?");
    if (!confirmed) return;

    setDeletingSessionId(sessionToDelete);
    try {
      await deleteSession(getToken, sessionToDelete);
      toast({
        title: "Session deleted",
        description: "The session has been removed.",
      });

      if (activeSession === sessionToDelete) {
        setActiveSession(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(`${SCHEMA_STORAGE_PREFIX}${sessionToDelete}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      await queryClient.invalidateQueries({
        queryKey: ["schema", sessionToDelete],
      });
    } catch (error) {
      console.error("Failed to delete session", error);
      toast({
        title: "Delete failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to delete that session.",
        variant: "destructive",
      });
    } finally {
      setDeletingSessionId(null);
    }
  };

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <UploadSQLCard onSessionCreated={handleSessionCreated} />
      </div>
    );
  }

  return (
    <>
      <WorkspaceLayout
        sessionId={activeSession}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onNewUpload={handleNewUpload}
        isSessionsLoading={sessionsLoadingState}
        onVisualize={handleVisualizerToggle}
        onDeleteSession={handleDeleteSession}
        deletingSessionId={deletingSessionId}
        schemaTables={schemaTables}
        isSchemaLoading={schemaInitialLoading}
      />
      {showVisualizer && (
        <div className="fixed inset-0 z-50 bg-background">
          <DatabaseVisualizer
            sessionId={activeSession}
            onBack={closeVisualizer}
            tables={schemaTables}
            isLoading={schemaInitialLoading}
          />
        </div>
      )}
    </>
  );
};

export default Workspace;
