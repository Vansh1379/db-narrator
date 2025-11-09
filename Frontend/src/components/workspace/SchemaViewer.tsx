import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Copy, Pin, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { SchemaTable } from "@/lib/api";

interface SchemaViewerProps {
  sessionId: string;
  tables?: SchemaTable[];
  isLoading: boolean;
}

const SchemaViewer = ({ sessionId, tables, isLoading }: SchemaViewerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const schemaTables = tables ?? [];

  const filteredSchema = useMemo(() => {
    if (!schemaTables.length) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return schemaTables;

    return schemaTables.filter(
      (table) =>
        table.name.toLowerCase().includes(query) ||
        table.columns?.some((col) => col.name.toLowerCase().includes(query))
    );
  }, [schemaTables, searchQuery]);

  const handleCopyColumn = (tableName: string, columnName: string) => {
    navigator.clipboard.writeText(`${tableName}.${columnName}`);
    toast({
      title: "Copied to clipboard",
      description: `${tableName}.${columnName}`,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Schema</h2>
          <Badge variant="secondary">{schemaTables.length} tables</Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables or columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredSchema.length ? (
            <Accordion type="multiple" className="space-y-2">
              {filteredSchema.map((table) => (
                <AccordionItem
                  key={table.name}
                  value={table.name}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-3 text-left">
                      <TableIcon className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <div className="font-medium">{table.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(table.rowCount ?? 0).toLocaleString()} rows •{" "}
                          {table.columns?.length ?? 0} columns
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-3">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">
                        Columns
                      </div>
                      {(table.columns ?? []).map((column) => (
                        <div
                          key={column.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-sm truncate">
                              {column.name}
                            </span>
                            {column.pk && (
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                PK
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground shrink-0">
                              {column.type}
                            </span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() =>
                                handleCopyColumn(table.name, column.name)
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              disabled
                            >
                              <Pin className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">
                        Sample Rows
                      </div>
                      <div className="space-y-2">
                        {(table.sampleRows ?? []).map((row, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-muted/30 text-xs font-mono"
                          >
                            {JSON.stringify(row, null, 2)}
                          </div>
                        ))}
                        {!table.sampleRows?.length && (
                          <div className="text-xs text-muted-foreground">
                            No sample rows captured yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              {schemaTables.length
                ? "No tables match your search. Try a different term."
                : "No schema available for this session yet. Run an upload to ingest your database."}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SchemaViewer;
