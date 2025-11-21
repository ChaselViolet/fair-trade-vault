import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "@/assets/logo.svg";

export const Header = () => {
  return (
    <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Fair Trade Vault" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold gradient-text">Fair Trade Vault</h1>
              <p className="text-xs text-muted-foreground">Encrypted Balance Validation System</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};
