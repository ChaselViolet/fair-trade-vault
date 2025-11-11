import { Lock, TrendingUp, TrendingDown } from "lucide-react";

interface Order {
  id: string;
  type: "buy" | "sell";
  amount: string;
  price: string;
  status: "encrypted" | "executed";
  timestamp: string;
}

const mockOrders: Order[] = [
  { id: "1", type: "buy", amount: "1.5", price: "45,230", status: "encrypted", timestamp: "2 min ago" },
  { id: "2", type: "sell", amount: "0.8", price: "45,250", status: "encrypted", timestamp: "5 min ago" },
  { id: "3", type: "buy", amount: "2.1", price: "45,220", status: "encrypted", timestamp: "8 min ago" },
  { id: "4", type: "buy", amount: "0.5", price: "45,240", status: "executed", timestamp: "12 min ago" },
  { id: "5", type: "sell", amount: "1.2", price: "45,260", status: "encrypted", timestamp: "15 min ago" },
];

export const OrderBook = () => {
  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Order Book</h2>
      
      <div className="space-y-2">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className={`p-4 rounded-lg border transition-all ${
              order.status === "encrypted" 
                ? "border-primary/30 bg-primary/5 encrypted-glow" 
                : "border-border/50 bg-secondary/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {order.type === "buy" ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={`font-semibold ${
                  order.type === "buy" ? "text-success" : "text-destructive"
                }`}>
                  {order.type.toUpperCase()}
                </span>
                {order.status === "encrypted" && (
                  <Lock className="w-3 h-3 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">{order.timestamp}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <div className="font-semibold">{order.amount}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <div className="font-semibold">${order.price}</div>
              </div>
            </div>

            {order.status === "encrypted" && (
              <div className="mt-2 text-xs text-primary flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Details encrypted - visible after execution</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
