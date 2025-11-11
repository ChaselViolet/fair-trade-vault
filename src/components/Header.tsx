import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import logo from "@/assets/logo.png";

export const Header = () => {
  return (
    <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="PrivateTradeBoard" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold gradient-text">PrivateTradeBoard</h1>
              <p className="text-xs text-muted-foreground">Trade Fairly. Trade Privately.</p>
            </div>
          </div>
          
          <Button className="gap-2">
            <Wallet className="w-4 h-4" />
            Connect Rainbow Wallet
          </Button>
        </div>
      </div>
    </header>
  );
};
