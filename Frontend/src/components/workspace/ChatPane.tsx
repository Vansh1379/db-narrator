import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ResultCard from "./ResultCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/clerk-react";
import { runQuery } from "@/lib/api";

interface ChatPaneProps {
  sessionId: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: {
    sql: string;
    explanation: string;
    rows: Record<string, unknown>[];
    chartData: {
      type: "bar" | "line" | "pie";
      xKey: string;
      yKey: string;
    };
    sources: Array<{ id: string; text: string }>;
    confidence?: number;
    executionTime?: number;
  };
}

const samplePrompts = [
  "Top 5 customers by revenue last 3 months",
  "Show product categories with most orders",
  "Average order value by month",
];

const ChatPane = ({ sessionId }: ChatPaneProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getToken } = useAuth();

  const canSend = useMemo(
    () => Boolean(input.trim()) && !isLoading,
    [input, isLoading]
  );

  const buildChartConfig = (
    rows: Record<string, unknown>[]
  ): { type: "bar" | "line" | "pie"; xKey: string; yKey: string } => {
    if (!rows.length) {
      return {
        type: "bar",
        xKey: "label",
        yKey: "value",
      };
    }

    const sampleRow = rows[0];
    const keys = Object.keys(sampleRow);

    const stringKey =
      keys.find((key) => typeof sampleRow[key] === "string") ??
      keys[0] ??
      "label";
    const numericKey =
      keys.find((key) => typeof sampleRow[key] === "number") ??
      keys.find((key) => {
        const value = sampleRow[key];
        return value !== null && !Number.isNaN(Number(value));
      }) ??
      stringKey;

    return {
      type: "bar",
      xKey: stringKey,
      yKey: numericKey,
    };
  };

  const buildSourceList = (tablesUsed?: string[]) => {
    if (!tablesUsed?.length) return [];
    return tablesUsed.map((table) => ({
      id: table,
      text: `Table: ${table}`,
    }));
  };

  useEffect(() => {
    setMessages([]);
    setInput("");
    setIsLoading(false);
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await runQuery(getToken, sessionId, {
        query: userMessage.content,
      });

      const chartConfig = buildChartConfig(response.rows);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Here are the results for your query:",
        result: {
          sql: response.sql,
          explanation:
            response.explanation ??
            "The AI-generated SQL query and its explanation.",
          rows: response.rows ?? [],
          chartData: chartConfig,
          sources: buildSourceList(response.tables_used),
          confidence: response.confidence,
          executionTime: response.executionTime,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Query failed", error);
      toast({
        title: "Query failed",
        description:
          error instanceof Error
            ? error.message
            : "We couldn't run that query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <ScrollArea className="flex-1 p-6 animate-fade-in-up">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto animate-fade-in-up">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-scale-in">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                Ask anything about this database
              </h2>
              <p className="text-muted-foreground">
                Type your question in plain English and I'll generate the SQL
                query for you
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {samplePrompts.map((prompt, index) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  className="text-sm animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * index + 0.1}s` }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto pb-6">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl px-4 py-3">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </div>
                      <div className="text-sm text-muted-foreground pt-1">
                        {message.content}
                      </div>
                    </div>
                    {message.result && <ResultCard result={message.result} />}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 text-accent animate-spin" />
                </div>
                <div className="text-sm text-muted-foreground pt-1">
                  Generating SQL query...
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>
            Ask anything about this DB — e.g., "Top 5 customers by revenue last
            3 months"
          </span>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none"
            rows={2}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!canSend}
            className="h-[60px] w-[60px] shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd> to
          send,{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted">Shift+Enter</kbd> for
          new line
        </div>
      </div>
    </div>
  );
};

export default ChatPane;
