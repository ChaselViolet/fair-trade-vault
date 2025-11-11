import { Lock, TrendingUp, TrendingDown, User } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

export const OrderBook = () => {
  const { orders } = useWallet();

  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Order Book</h2>
      
      <div className="space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`p-4 rounded-lg border transition-all ${
              order.isUserOrder
                ? "border-primary/50 bg-primary/10 encrypted-glow ring-1 ring-primary/30"
                : order.status === "encrypted" 
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
                {order.isUserOrder && (
                  <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    <User className="w-3 h-3" />
                    Your Order
                  </span>
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
