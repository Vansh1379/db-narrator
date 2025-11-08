import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Database,
  FolderTree,
  Columns,
  Link as LinkIcon,
  ArrowLeft,
  RefreshCw,
  Download,
  Search,
  Hash,
  KeySquare,
} from "lucide-react";

interface DatabaseVisualizerProps {
  sessionId: string;
  onBack: () => void;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
  pk?: boolean;
  fk?: {
    table: string;
    column: string;
  };
}

interface IndexInfo {
  name: string;
  type: "btree" | "hash" | "gin" | "gist";
  columns: string[];
  unique?: boolean;
}

interface RelationshipInfo {
  from: string;
  to: string;
  type: "one-to-many" | "many-to-one" | "many-to-many";
  description: string;
}

interface TableInfo {
  name: string;
  rows: number;
  size: string;
  updatedAt: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  relationships: RelationshipInfo[];
  sampleRows: Record<string, string | number | null>[];
}

interface DatabaseInfo {
  name: string;
  engine: string;
  size: string;
  collections: number;
  tables: TableInfo[];
}

const mockDatabase: DatabaseInfo = {
  name: "E-Commerce Intelligence",
  engine: "PostgreSQL 15",
  size: "128.4 MB",
  collections: 6,
  tables: [
    {
      name: "users",
      rows: 1543,
      size: "24.7 MB",
      updatedAt: "2025-11-02 18:43",
      columns: [
        { name: "id", type: "INTEGER", nullable: false, pk: true, description: "Unique user identifier" },
        { name: "name", type: "TEXT", nullable: false, description: "Full name of the user" },
        { name: "email", type: "TEXT", nullable: false, description: "Email address" },
        { name: "created_at", type: "TIMESTAMP", nullable: false, description: "Account creation timestamp" },
        { name: "lifetime_value", type: "NUMERIC(10,2)", nullable: false, description: "Lifetime revenue generated" },
        { name: "segment", type: "TEXT", nullable: true, description: "Marketing segment tag" },
      ],
      indexes: [
        { name: "users_pkey", type: "btree", columns: ["id"], unique: true },
        { name: "users_email_key", type: "btree", columns: ["email"], unique: true },
        { name: "users_segment_idx", type: "hash", columns: ["segment"] },
      ],
      relationships: [
        {
          from: "users.id",
          to: "orders.user_id",
          type: "one-to-many",
          description: "Each user can have multiple orders",
        },
        {
          from: "users.id",
          to: "subscriptions.user_id",
          type: "one-to-many",
          description: "Active recurring subscription (if any)",
        },
      ],
      sampleRows: [
        {
          id: 101,
          name: "Aman Kumar",
          email: "aman@example.com",
          created_at: "2024-12-04 13:21",
          lifetime_value: 12980.5,
          segment: "VIP",
        },
        {
          id: 204,
          name: "Sana Patel",
          email: "sana@example.com",
          created_at: "2025-02-10 09:12",
          lifetime_value: 8743.0,
          segment: "High-Value",
        },
      ],
    },
    {
      name: "orders",
      rows: 8234,
      size: "61.2 MB",
      updatedAt: "2025-11-03 08:11",
      columns: [
        { name: "id", type: "INTEGER", nullable: false, pk: true, description: "Order primary key" },
        { name: "user_id", type: "INTEGER", nullable: false, description: "FK to users.id", fk: { table: "users", column: "id" } },
        { name: "amount", type: "NUMERIC(10,2)", nullable: false, description: "Total order amount" },
        { name: "status", type: "TEXT", nullable: false, description: "Order status (pending, shipped, delivered)" },
        { name: "placed_at", type: "TIMESTAMP", nullable: false, description: "When the order was placed" },
        { name: "channel", type: "TEXT", nullable: true, description: "Acquisition channel" },
      ],
      indexes: [
        { name: "orders_pkey", type: "btree", columns: ["id"], unique: true },
        { name: "orders_user_id_idx", type: "btree", columns: ["user_id"] },
        { name: "orders_status_channel_idx", type: "gin", columns: ["status", "channel"] },
        { name: "orders_placed_at_idx", type: "btree", columns: ["placed_at"] },
      ],
      relationships: [
        {
          from: "orders.id",
          to: "order_items.order_id",
          type: "one-to-many",
          description: "Orders contain multiple line items",
        },
        {
          from: "orders.user_id",
          to: "users.id",
          type: "many-to-one",
          description: "Each order belongs to a single user",
        },
      ],
      sampleRows: [
        {
          id: 9011,
          user_id: 101,
          amount: 499.99,
          status: "delivered",
          placed_at: "2025-11-01 15:07",
          channel: "Email",
        },
        {
          id: 9055,
          user_id: 204,
          amount: 219.5,
          status: "processing",
          placed_at: "2025-11-03 07:42",
          channel: "Paid Social",
        },
      ],
    },
    {
      name: "order_items",
      rows: 25793,
      size: "32.1 MB",
      updatedAt: "2025-11-03 08:05",
      columns: [
        { name: "id", type: "INTEGER", nullable: false, pk: true, description: "Line item identifier" },
        { name: "order_id", type: "INTEGER", nullable: false, description: "FK to orders.id", fk: { table: "orders", column: "id" } },
        { name: "product_id", type: "INTEGER", nullable: false, description: "FK to products.id", fk: { table: "products", column: "id" } },
        { name: "quantity", type: "INTEGER", nullable: false, description: "Units sold" },
        { name: "unit_price", type: "NUMERIC(10,2)", nullable: false, description: "Price per unit" },
        { name: "discount", type: "NUMERIC(5,2)", nullable: true, description: "Discount percent applied" },
      ],
      indexes: [
        { name: "order_items_pkey", type: "btree", columns: ["id"], unique: true },
        { name: "order_items_order_id_idx", type: "btree", columns: ["order_id"] },
        { name: "order_items_product_id_idx", type: "btree", columns: ["product_id"] },
      ],
      relationships: [
        {
          from: "order_items.order_id",
          to: "orders.id",
          type: "many-to-one",
          description: "Each line item belongs to an order",
        },
        {
          from: "order_items.product_id",
          to: "products.id",
          type: "many-to-one",
          description: "Referenced product catalog entry",
        },
      ],
      sampleRows: [
        {
          id: 30101,
          order_id: 9011,
          product_id: 551,
          quantity: 1,
          unit_price: 499.99,
          discount: null,
        },
        {
          id: 30134,
          order_id: 9055,
          product_id: 205,
          quantity: 2,
          unit_price: 89.75,
          discount: 10.0,
        },
      ],
    },
    {
      name: "products",
      rows: 425,
      size: "8.9 MB",
      updatedAt: "2025-10-29 16:23",
      columns: [
        { name: "id", type: "INTEGER", nullable: false, pk: true, description: "Product identifier" },
        { name: "sku", type: "TEXT", nullable: false, description: "Stock keeping unit" },
        { name: "name", type: "TEXT", nullable: false, description: "Product name" },
        { name: "category", type: "TEXT", nullable: true, description: "Product category" },
        { name: "price", type: "NUMERIC(10,2)", nullable: false, description: "Unit price" },
        { name: "is_active", type: "BOOLEAN", nullable: false, description: "Active in catalog" },
      ],
      indexes: [
        { name: "products_pkey", type: "btree", columns: ["id"], unique: true },
        { name: "products_sku_key", type: "btree", columns: ["sku"], unique: true },
        { name: "products_category_idx", type: "hash", columns: ["category"] },
      ],
      relationships: [
        {
          from: "products.id",
          to: "order_items.product_id",
          type: "one-to-many",
          description: "Products referenced in orders",
        },
      ],
      sampleRows: [
        {
          id: 551,
          sku: "LAP-UX-13",
          name: "Ultrabook 13”",
          category: "Electronics",
          price: 1299.99,
          is_active: true,
        },
        {
          id: 205,
          sku: "MUG-CER-12",
          name: "Ceramic Mug",
          category: "Home",
          price: 14.5,
          is_active: true,
        },
      ],
    },
  ],
};

const DatabaseVisualizer = ({ sessionId, onBack }: DatabaseVisualizerProps) => {
  const [search, setSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState<string>(mockDatabase.tables[0]?.name ?? "");
  const [activeTab, setActiveTab] = useState<string>("structure");

  const filteredTables = useMemo(() => {
    if (!search.trim()) return mockDatabase.tables;
    return mockDatabase.tables.filter(
      (table) =>
        table.name.toLowerCase().includes(search.toLowerCase()) ||
        table.columns.some((column) => column.name.toLowerCase().includes(search.toLowerCase())),
    );
  }, [search]);

  const tableToDisplay = filteredTables.find((table) => table.name === selectedTable) ?? filteredTables[0];

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
                <h1 className="text-lg font-semibold">{mockDatabase.name}</h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              Engine: {mockDatabase.engine}
            </Badge>
            <Badge variant="outline" className="gap-1">
              Size: {mockDatabase.size}
            </Badge>
            <Badge variant="outline" className="gap-1">
              Collections: {mockDatabase.collections}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh schema
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export ERD
            </Button>
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
                />
              </div>
            </div>

            <Separator />

            <ScrollArea className="h-[calc(100vh-220px)] pr-2">
              <Accordion type="single" collapsible defaultValue={mockDatabase.name}>
                <AccordionItem value={mockDatabase.name} className="border-none">
                  <AccordionTrigger className="px-0 py-2 text-left font-semibold">
                    {mockDatabase.name}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-1">
                    {filteredTables.map((table, index) => (
                      <Button
                        key={table.name}
                        variant={table.name === tableToDisplay?.name ? "secondary" : "ghost"}
                        onClick={() => setSelectedTable(table.name)}
                        className="w-full justify-between px-3 animate-fade-in-up"
                        size="sm"
                        style={{ animationDelay: `${index * 0.05}s` }}
                        data-animate="true"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Columns className="h-4 w-4 text-muted-foreground" />
                          {table.name}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {table.columns.length}
                        </Badge>
                      </Button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in-up animation-delay-200">
          {tableToDisplay ? (
            <>
              <Card className="animate-scale-in">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span className="text-xl font-semibold">{tableToDisplay.name}</span>
                        <Badge variant="secondary">{tableToDisplay.rows.toLocaleString()} rows</Badge>
                        <Badge variant="outline">Size {tableToDisplay.size}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Last updated {tableToDisplay.updatedAt}. Structure view pulled from indexed schema snapshot.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Preview SQL
                      </Button>
                      <Button variant="outline" size="sm">
                        Open in Query Builder
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="relationships">Relationships</TabsTrigger>
                  <TabsTrigger value="sample">Sample Data</TabsTrigger>
                </TabsList>

                <TabsContent value="structure" className="space-y-6">
                  <Card className="animate-scale-in">
                    <CardHeader>
                      <CardTitle className="text-base">Columns</CardTitle>
                      <CardDescription>Inspect column definitions and constraints.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Column</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Constraints</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableToDisplay.columns.map((column) => (
                            <TableRow key={column.name}>
                              <TableCell className="font-mono text-sm">{column.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {column.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="space-x-2">
                                {!column.nullable && <Badge variant="secondary">NOT NULL</Badge>}
                                {column.pk && (
                                  <Badge variant="secondary" className="gap-1">
                                    <Hash className="h-3 w-3" />
                                    Primary
                                  </Badge>
                                )}
                                {column.fk && (
                                  <Badge variant="outline" className="gap-1">
                                    <LinkIcon className="h-3 w-3" />
                                    {column.fk.table}.{column.fk.column}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm max-w-md">
                                {column.description ?? "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card className="animate-scale-in animation-delay-100">
                    <CardHeader>
                      <CardTitle className="text-base">Indexes</CardTitle>
                      <CardDescription>Performance optimizations detected during ingestion.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {tableToDisplay.indexes.map((index) => (
                        <div
                          key={index.name}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <KeySquare className="h-4 w-4 text-primary" />
                              <span className="font-mono text-sm">{index.name}</span>
                              {index.unique && <Badge variant="secondary">Unique</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {index.type.toUpperCase()} index on {index.columns.join(", ")}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Explain Plan
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="relationships">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Relationships</CardTitle>
                      <CardDescription>Foreign key relationships inferred from the schema.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tableToDisplay.relationships.map((relation) => (
                        <div
                          key={`${relation.from}-${relation.to}`}
                          className="rounded-xl border border-border bg-muted/20 px-4 py-3 space-y-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                              <LinkIcon className="h-3 w-3" />
                              {relation.type.replace(/-/g, " ")}
                            </Badge>
                            <span className="font-mono text-sm">{relation.from}</span>
                            <span className="text-muted-foreground text-sm">→</span>
                            <span className="font-mono text-sm">{relation.to}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{relation.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sample">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Sample Rows</CardTitle>
                      <CardDescription>Preview of sampled rows captured during ingestion.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-hidden rounded-xl border border-border">
                      <ScrollArea className="h-[260px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {tableToDisplay.sampleRows.length
                                ? Object.keys(tableToDisplay.sampleRows[0]).map((column) => (
                                    <TableHead key={column} className="font-semibold">
                                      {column}
                                    </TableHead>
                                  ))
                                : null}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableToDisplay.sampleRows.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {Object.entries(row).map(([column, value]) => (
                                  <TableCell key={column} className="font-mono text-sm">
                                    {value === null || value === undefined ? "—" : String(value)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="border-dashed border-2 border-muted p-12 text-center">
              <CardContent className="space-y-3">
                <h3 className="text-lg font-semibold">No tables match your search</h3>
                <p className="text-sm text-muted-foreground">
                  Try clearing the search input or adjust your filters to continue exploring the schema.
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

