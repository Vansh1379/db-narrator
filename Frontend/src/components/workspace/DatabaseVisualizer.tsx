import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Database,
  FolderTree,
  Columns,
  Link as LinkIcon,
  ArrowLeft,
  Search,
  Hash,
} from "lucide-react";
import type { SchemaTable } from "@/lib/api";

interface DatabaseVisualizerProps {
  sessionId: string;
  onBack: () => void;
  tables?: SchemaTable[];
  isLoading: boolean;
}

interface RelationshipInfo {
  from: string;
  to: string;
  description: string;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  pk: boolean;
  defaultValue: string | null;
}

interface TableInfo {
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
  relationships: RelationshipInfo[];
  sampleRows: Record<string, string | number | null>[];
}

const mapSchemaTable = (table: SchemaTable): TableInfo => {
  const relationships: RelationshipInfo[] = (table.foreignKeys ?? []).map(
    (fk) => ({
      from: `${table.name}.${fk.from}`,
      to: `${fk.table}.${fk.to}`,
      description: `ON UPDATE ${fk.onUpdate}, ON DELETE ${fk.onDelete}`,
    }),
  );

  const sampleRows = (table.sampleRows ?? []).map((row) => {
    const normalized: Record<string, string | number | null> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        value === null
      ) {
        normalized[key] = value;
      } else {
        normalized[key] = value === undefined ? null : String(value);
      }
    });
    return normalized;
  });

  return {
    name: table.name,
    rowCount: table.rowCount ?? 0,
    columns: (table.columns ?? []).map((column) => ({
      name: column.name,
      type: column.type ?? "TEXT",
      nullable: !column.notNull,
      pk: column.pk,
      defaultValue: column.defaultValue ?? null,
    })),
    relationships,
    sampleRows,
  };
};

const DatabaseVisualizer = ({
  sessionId,
  onBack,
  tables,
  isLoading,
}: DatabaseVisualizerProps) => {
  const tableInfos = useMemo(
    () => (tables && tables.length ? tables.map(mapSchemaTable) : []),
    [tables],
  );

  const showInitialLoading = isLoading && tableInfos.length === 0;

  const [search, setSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState<string>(
    tableInfos[0]?.name ?? "",
  );
  const [activeTab, setActiveTab] =
    useState<"structure" | "relationships" | "sample">("structure");

  useEffect(() => {
    setSelectedTable(tableInfos[0]?.name ?? "");
    setActiveTab("structure");
  }, [tableInfos, sessionId]);

  const filteredTables = useMemo(() => {
    if (!search.trim()) return tableInfos;
    const query = search.trim().toLowerCase();
    return tableInfos.filter(
      (table) =>
        table.name.toLowerCase().includes(query) ||
        table.columns.some((column) =>
          column.name.toLowerCase().includes(query),
        ),
    );
  }, [search, tableInfos]);

  const table =
    filteredTables.find((candidate) => candidate.name === selectedTable) ??
    filteredTables[0];

  const columns = table?.columns ?? [];
  const relationships = table?.relationships ?? [];
  const sampleRows = table?.sampleRows ?? [];
  const rowCount = table?.rowCount ?? 0;

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      <header className="border-b border-border animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Session {sessionId}</p>
                <h1 className="text-lg font-semibold">
                  {tableInfos.length ? `Session ${sessionId.slice(0, 8)}…` : "No schema loaded"}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              Tables: {tableInfos.length}
            </Badge>
            <Badge variant="outline" className="gap-1">
              Samples: {sampleRows.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden animate-fade-in-up animation-delay-100">
        <aside className="w-72 border-r border-border bg-muted/20 flex flex-col animate-fade-in-up">
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                Database Explorer
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tables or columns"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                  disabled={tableInfos.length === 0 && !showInitialLoading}
                />
              </div>
            </div>

            <Separator />

            <ScrollArea className="h-[calc(100vh-220px)] pr-2">
              {showInitialLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              ) : filteredTables.length ? (
                <div className="space-y-1">
                  {filteredTables.map((candidate) => (
                    <Button
                      key={candidate.name}
                      variant={
                        candidate.name === table?.name ? "secondary" : "ghost"
                      }
                      onClick={() => setSelectedTable(candidate.name)}
                      className="w-full justify-between px-3"
                      size="sm"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Columns className="h-4 w-4 text-muted-foreground" />
                        {candidate.name}
                      </span>
                      <Badge variant="outline">{candidate.columns.length}</Badge>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                  {tableInfos.length
                    ? "No tables match your search."
                    : "Upload a schema to explore tables here."}
                </div>
              )}
            </ScrollArea>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in-up animation-delay-200">
          {showInitialLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
          ) : table ? (
            <>
              <Card className="animate-scale-in">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-xl font-semibold">{table.name}</span>
                        <Badge variant="secondary">
                          {rowCount.toLocaleString()} rows
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Columns, relationships, and sample rows captured during ingestion.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="relationships">Relationships</TabsTrigger>
                  <TabsTrigger value="sample">Sample Data</TabsTrigger>
                </TabsList>

                <TabsContent value="structure">
                  <Card className="animate-scale-in">
                    <CardHeader>
                      <CardTitle className="text-base">Columns</CardTitle>
                      <CardDescription>
                        Inspect column definitions and constraints.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {columns.length ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Column</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Constraints</TableHead>
                              <TableHead>Default</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {columns.map((column) => (
                              <TableRow key={column.name}>
                                <TableCell className="font-mono text-sm">
                                  {column.name}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono">
                                    {column.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="space-x-2">
                                  {!column.nullable && (
                                    <Badge variant="secondary">NOT NULL</Badge>
                                  )}
                                  {column.pk && (
                                    <Badge variant="secondary" className="gap-1">
                                      <Hash className="h-3 w-3" />
                                      Primary
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  {column.defaultValue ?? "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No column metadata available for this table.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="relationships">
                  <Card className="animate-scale-in">
                    <CardHeader>
                      <CardTitle className="text-base">Relationships</CardTitle>
                      <CardDescription>
                        Foreign key relationships inferred from the schema.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {relationships.length ? (
                        relationships.map((relation) => (
                          <div
                            key={`${relation.from}-${relation.to}`}
                            className="rounded-xl border border-border bg-muted/20 px-4 py-3 space-y-2"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className="gap-1">
                                <LinkIcon className="h-3 w-3" />
                                Foreign key
                              </Badge>
                              <span className="font-mono text-sm">{relation.from}</span>
                              <span className="text-muted-foreground text-sm">→</span>
                              <span className="font-mono text-sm">{relation.to}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {relation.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No foreign keys detected for this table.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sample">
                  <Card className="animate-scale-in">
                    <CardHeader>
                      <CardTitle className="text-base">Sample Rows</CardTitle>
                      <CardDescription>
                        Preview of sampled rows captured during ingestion.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-hidden rounded-xl border border-border">
                      {sampleRows.length ? (
                        <ScrollArea className="h-[260px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(sampleRows[0]).map((column) => (
                                  <TableHead key={column} className="font-semibold">
                                    {column}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sampleRows.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  {Object.entries(row).map(([column, value]) => (
                                    <TableCell key={column} className="font-mono text-sm">
                                      {value === null || value === undefined
                                        ? "—"
                                        : String(value)}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No sample rows captured yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="border-dashed border-2 border-muted p-12 text-center">
              <CardContent className="space-y-3">
                <h3 className="text-lg font-semibold">
                  {tableInfos.length
                    ? "No tables match your search"
                    : "Schema not available"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tableInfos.length
                    ? "Try clearing the search input or adjust your filters to continue exploring the schema."
                    : "Upload a SQL schema or re-run ingestion to view tables here."}
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default DatabaseVisualizer;

