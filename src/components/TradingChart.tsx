import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "00:00", price: 45100 },
  { time: "04:00", price: 45250 },
  { time: "08:00", price: 45180 },
  { time: "12:00", price: 45320 },
  { time: "16:00", price: 45280 },
  { time: "20:00", price: 45350 },
  { time: "24:00", price: 45420 },
];

export const TradingChart = () => {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Price Chart</h2>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold font-mono">$45,420</span>
          <span className="text-success text-sm font-semibold">+2.3%</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
