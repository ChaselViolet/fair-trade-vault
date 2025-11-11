import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";

export const OrderForm = () => {
  const { isConnected, addOrder } = useWallet();
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    addOrder({
      type: orderType,
      amount,
      price,
    });

    toast.success("Encrypted order submitted successfully!", {
      description: "Your order will remain private until execution.",
    });
    setAmount("");
    setPrice("");
  };

  return (
    <div className="glass-card rounded-xl p-6 encrypted-glow">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Place Encrypted Order</h2>
      </div>

      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "buy" | "sell")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="buy" className="data-[state=active]:bg-success/20 data-[state=active]:text-success">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value={orderType} className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono text-lg"
                required
              />
            </div>

            <div className="glass-card p-3 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Total</span>
                <span className="font-mono font-semibold">
                  {amount && price ? (Number(amount) * Number(price)).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary mt-2">
                <Lock className="w-3 h-3" />
                <span>Order will be encrypted until execution</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              variant={orderType === "buy" ? "default" : "destructive"}
            >
              Place {orderType === "buy" ? "Buy" : "Sell"} Order
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};
