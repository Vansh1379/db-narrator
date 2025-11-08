import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResultTableProps {
  rows: any[];
}

const ResultTable = ({ rows }: ResultTableProps) => {
  if (!rows || rows.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-border rounded-xl">
        No data to display
      </div>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((column) => (
                  <TableCell key={column} className="font-mono text-sm">
                    {row[column] !== null && row[column] !== undefined
                      ? String(row[column])
                      : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ResultTable;
