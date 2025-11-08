import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import { BarChart, Bar, LineChart as RechartsLine, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartCardProps {
  data: any[];
  chartType: "bar" | "line" | "pie";
  xKey: string;
  yKey: string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const ChartCard = ({ data, chartType: initialType, xKey, yKey }: ChartCardProps) => {
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">(initialType);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-end gap-1">
        <Button
          variant={chartType === "bar" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setChartType("bar")}
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
        <Button
          variant={chartType === "line" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setChartType("line")}
        >
          <LineChart className="h-4 w-4" />
        </Button>
        <Button
          variant={chartType === "pie" ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setChartType("pie")}
        >
          <PieChart className="h-4 w-4" />
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        {chartType === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={xKey} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey={yKey} fill={COLORS[0]} radius={[8, 8, 0, 0]} />
          </BarChart>
        ) : chartType === "line" ? (
          <RechartsLine data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={xKey} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} />
          </RechartsLine>
        ) : (
          <RechartsPie>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => entry[xKey]}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </RechartsPie>
        )}
      </ResponsiveContainer>
    </Card>
  );
};

export default ChartCard;
