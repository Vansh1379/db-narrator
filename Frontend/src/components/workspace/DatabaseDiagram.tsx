import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { SchemaTable } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Table as TableIcon } from 'lucide-react';

interface DatabaseDiagramProps {
  tables: SchemaTable[];
}

// Custom Table Node Component
const TableNode = ({ data }: { data: any }) => {
  const table = data.table as SchemaTable;
  const primaryKeys = table.columns.filter(col => col.pk);
  const regularColumns = table.columns.filter(col => !col.pk);

  return (
    <div className="bg-background border-2 border-primary rounded-lg shadow-lg min-w-[250px] max-w-[350px]">
      {/* Table Header */}
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-md flex items-center gap-2">
        <TableIcon className="h-4 w-4" />
        <span className="font-semibold text-sm">{table.name}</span>
      </div>

      {/* Table Body */}
      <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
        {/* Primary Keys */}
        {primaryKeys.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
              PRIMARY KEY{primaryKeys.length > 1 ? 'S' : ''}
            </div>
            {primaryKeys.map((col) => (
              <div
                key={col.name}
                className="flex items-center justify-between px-2 py-1 text-xs bg-primary/10 rounded"
              >
                <span className="font-mono font-medium">{col.name}</span>
                <span className="text-muted-foreground text-[10px]">{col.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Regular Columns */}
        {regularColumns.length > 0 && (
          <div className="space-y-1">
            {primaryKeys.length > 0 && (
              <div className="border-t border-border my-2" />
            )}
            {regularColumns.slice(0, 10).map((col) => (
              <div
                key={col.name}
                className="flex items-center justify-between px-2 py-1 text-xs hover:bg-muted/50 rounded"
              >
                <span className="font-mono truncate">{col.name}</span>
                <span className="text-muted-foreground text-[10px] shrink-0 ml-2">
                  {col.type}
                </span>
              </div>
            ))}
            {regularColumns.length > 10 && (
              <div className="text-center text-[10px] text-muted-foreground py-1">
                + {regularColumns.length - 10} more columns
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table Footer */}
      <div className="px-3 py-2 bg-muted/30 rounded-b-md border-t border-border">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{table.columns.length} columns</span>
          {table.rowCount !== undefined && (
            <span>{table.rowCount.toLocaleString()} rows</span>
          )}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  table: TableNode,
};

const DatabaseDiagram = ({ tables }: DatabaseDiagramProps) => {
  // Calculate layout positions for tables
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create a simple grid layout
    const cols = Math.ceil(Math.sqrt(tables.length));
    const horizontalSpacing = 400;
    const verticalSpacing = 500;

    tables.forEach((table, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      nodes.push({
        id: table.name,
        type: 'table',
        position: {
          x: col * horizontalSpacing + 50,
          y: row * verticalSpacing + 50,
        },
        data: { table },
      });

      // Create edges for foreign keys
      if (table.foreignKeys && table.foreignKeys.length > 0) {
        table.foreignKeys.forEach((fk) => {
          edges.push({
            id: `${table.name}-${fk.from}-${fk.table}-${fk.to}`,
            source: table.name,
            target: fk.table,
            sourceHandle: fk.from,
            targetHandle: fk.to,
            type: 'smoothstep',
            animated: true,
            label: `${fk.from} → ${fk.to}`,
            labelStyle: {
              fontSize: 10,
              fill: 'hsl(var(--muted-foreground))',
            },
            labelBgStyle: {
              fill: 'hsl(var(--background))',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: 'hsl(var(--primary))',
            },
            style: {
              strokeWidth: 2,
              stroke: 'hsl(var(--primary))',
            },
          });
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [tables]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onLayout = useCallback(() => {
    // Simple auto-layout: arrange in a grid
    const cols = Math.ceil(Math.sqrt(tables.length));
    const horizontalSpacing = 400;
    const verticalSpacing = 500;

    setNodes((nds) =>
      nds.map((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
          ...node,
          position: {
            x: col * horizontalSpacing + 50,
            y: row * verticalSpacing + 50,
          },
        };
      })
    );
  }, [tables.length, setNodes]);

  if (tables.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <TableIcon className="h-12 w-12 mx-auto opacity-50" />
          <p>No tables to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background color="hsl(var(--muted-foreground))" gap={16} />
        <Controls className="bg-background border border-border rounded-lg shadow-lg" />
        <MiniMap
          className="bg-background border border-border rounded-lg shadow-lg"
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--muted) / 0.3)"
        />
        <Panel position="top-left" className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 m-2 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{tables.length} Tables</Badge>
              {edges.length > 0 && (
                <Badge variant="outline">{edges.length} Relationships</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Drag to pan • Scroll to zoom • Click and drag tables to rearrange
            </p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default DatabaseDiagram;



