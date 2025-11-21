import { Header } from "@/components/Header";
import { BalanceValidatorForm } from "@/components/BalanceValidatorForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
    
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Encrypted Transfer Amount Validation
            </h1>
            <p className="text-muted-foreground">
              Validate transfer amounts without revealing your balance or the transfer amount
            </p>
          </div>
          
          <BalanceValidatorForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
