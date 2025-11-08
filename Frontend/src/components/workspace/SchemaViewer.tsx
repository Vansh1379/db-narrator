import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Copy, Pin, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchemaViewerProps {
  sessionId: string;
}

const mockSchema = [
  {
    name: "users",
    rowCount: 1543,
    columns: [
      { name: "id", type: "INTEGER", pk: true, nullable: false },
      { name: "name", type: "TEXT", pk: false, nullable: false },
      { name: "email", type: "TEXT", pk: false, nullable: false },
      { name: "created_at", type: "TIMESTAMP", pk: false, nullable: false },
    ],
    sampleRows: [
      { id: 1, name: "Aman Kumar", email: "aman@example.com", created_at: "2025-01-15" },
      { id: 2, name: "Sana Patel", email: "sana@example.com", created_at: "2025-02-20" },
    ],
  },
  {
    name: "orders",
    rowCount: 8234,
    columns: [
      { name: "id", type: "INTEGER", pk: true, nullable: false },
      { name: "user_id", type: "INTEGER", pk: false, nullable: false },
      { name: "amount", type: "REAL", pk: false, nullable: false },
      { name: "date", type: "DATE", pk: false, nullable: false },
    ],
    sampleRows: [
      { id: 1, user_id: 5, amount: 500.0, date: "2025-11-02" },
      { id: 2, user_id: 3, amount: 125.5, date: "2025-10-31" },
    ],
  },
  {
    name: "products",
    rowCount: 425,
    columns: [
      { name: "id", type: "INTEGER", pk: true, nullable: false },
      { name: "name", type: "TEXT", pk: false, nullable: false },
      { name: "price", type: "REAL", pk: false, nullable: false },
      { name: "category", type: "TEXT", pk: false, nullable: true },
    ],
    sampleRows: [
      { id: 1, name: "Laptop", price: 999.99, category: "Electronics" },
      { id: 2, name: "Coffee Mug", price: 12.99, category: "Home" },
    ],
  },
];

const SchemaViewer = ({ sessionId }: SchemaViewerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredSchema = mockSchema.filter(
    (table) =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.columns.some((col) => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <Badge variant="secondary">{mockSchema.length} tables</Badge>
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
                        {table.rowCount.toLocaleString()} rows • {table.columns.length} columns
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3">
                  {/* Columns */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">
                      Columns
                    </div>
                    {table.columns.map((column) => (
                      <div
                        key={column.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-sm truncate">{column.name}</span>
                          {column.pk && (
                            <Badge variant="outline" className="text-xs shrink-0">
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
                            onClick={() => handleCopyColumn(table.name, column.name)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sample Rows */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">
                      Sample Rows
                    </div>
                    <div className="space-y-2">
                      {table.sampleRows.map((row, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-muted/30 text-xs font-mono">
                          {JSON.stringify(row, null, 2)}
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SchemaViewer;
