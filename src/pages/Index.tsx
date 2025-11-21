import { Header } from "@/components/Header";
import { OrderForm } from "@/components/OrderForm";
import { OrderBook } from "@/components/OrderBook";
import { TradingChart } from "@/components/TradingChart";
import { WalletProvider } from "@/contexts/WalletContext";

const Index = () => {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-background">
        <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Order Book */}
          <div className="lg:col-span-2 space-y-6">
            <TradingChart />
            <OrderBook />
          </div>

          {/* Right Column - Order Form */}
          <div className="lg:col-span-1">
            <OrderForm />
          </div>
        </div>
      </main>
      </div>
    </WalletProvider>
  );
};

export default Index;
