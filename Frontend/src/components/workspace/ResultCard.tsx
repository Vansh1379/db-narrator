import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Copy, Download, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResultTable from "./ResultTable";
import ChartCard from "./ChartCard";

interface ResultCardProps {
  result: {
    sql: string;
    explanation: string;
    rows: any[];
    chartData: any;
    sources: any[];
    confidence: number;
  };
}

const ResultCard = ({ result }: ResultCardProps) => {
  const [sqlOpen, setSqlOpen] = useState(false);
  const { toast } = useToast();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(result.sql);
    toast({
      title: "SQL copied to clipboard",
    });
  };

  const handleExport = () => {
    // Mock export functionality
    toast({
      title: "Export started",
      description: "Your data is being exported to CSV",
    });
  };

  return (
    <Card className="shadow-lg animate-scale-in">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-base">{result.explanation}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Returned {result.rows.length} rows</span>
              <span>•</span>
              <span>
                {result.executionTime !== undefined
                  ? `executed in ${result.executionTime.toFixed(3)}s`
                  : "execution time N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="gap-1">
              Sources: {result.sources.length}
            </Badge>
            <Badge variant="outline" className="gap-1">
              Confidence: {Math.round(result.confidence * 100)}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SQL Preview */}
        <Collapsible open={sqlOpen} onOpenChange={setSqlOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                {sqlOpen ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {sqlOpen ? "Hide SQL" : "Show SQL"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    sqlOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySQL}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy SQL
            </Button>
          </div>

          <CollapsibleContent>
            <div className="mt-3 p-4 rounded-xl bg-code-bg border border-border overflow-x-auto">
              <pre className="text-sm font-mono text-code-foreground whitespace-pre-wrap">
                {result.sql}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Data Table</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <ResultTable rows={result.rows} />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Chart</h4>
            <ChartCard
              data={result.rows}
              chartType={result.chartData.type}
              xKey={result.chartData.xKey}
              yKey={result.chartData.yKey}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultCard;
