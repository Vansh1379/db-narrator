import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ResultCard from "./ResultCard";

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
    rows: any[];
    chartData: any;
    sources: any[];
    confidence: number;
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Here are the results for your query:",
      result: {
        sql: `SELECT u.name, SUM(o.amount) as total_revenue 
FROM users u 
JOIN orders o ON u.id = o.user_id 
WHERE o.date >= '2025-08-01' 
GROUP BY u.name 
ORDER BY total_revenue DESC 
LIMIT 5;`,
        explanation: "This query selects the top 5 customers by summing their order amounts from the last 3 months.",
        rows: [
          { name: "Aman Kumar", total_revenue: 12000 },
          { name: "Sana Patel", total_revenue: 9800 },
          { name: "Raj Singh", total_revenue: 8500 },
          { name: "Priya Sharma", total_revenue: 7200 },
          { name: "Vikram Reddy", total_revenue: 6900 },
        ],
        chartData: {
          type: "bar",
          xKey: "name",
          yKey: "total_revenue",
        },
        sources: [
          {
            id: "schema_orders",
            text: "TABLE orders (id INT, user_id INT, amount REAL, date TEXT)",
            score: 0.92,
          },
          {
            id: "schema_users",
            text: "TABLE users (id INT, name TEXT, email TEXT, created_at TIMESTAMP)",
            score: 0.88,
          },
        ],
        confidence: 0.86,
      },
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Ask anything about this database</h2>
              <p className="text-muted-foreground">
                Type your question in plain English and I'll generate the SQL query for you
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {samplePrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  className="text-sm"
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
                      <div className="text-sm text-muted-foreground pt-1">{message.content}</div>
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
          <span>Ask anything about this DB — e.g., "Top 5 customers by revenue last 3 months"</span>
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
            disabled={!input.trim() || isLoading}
            className="h-[60px] w-[60px] shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd> to send,{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted">Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};

export default ChatPane;
