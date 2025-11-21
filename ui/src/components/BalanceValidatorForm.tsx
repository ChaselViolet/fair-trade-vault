import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBalanceValidator } from "@/hooks/useBalanceValidator";
import { useAccount } from "wagmi";

export const BalanceValidatorForm = () => {
  const { address, isConnected } = useAccount();
  const { hasBalance, setBalance, clearBalance, validateTransfer, contractDeployed, isLoading } = useBalanceValidator();
  const [balance, setBalanceValue] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [userHasBalance, setUserHasBalance] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isSettingBalance, setIsSettingBalance] = useState(false);
  const [isClearingBalance, setIsClearingBalance] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Check if user has balance set
  useEffect(() => {
    let cancelled = false;
    
    const checkBalance = async () => {
      if (!isConnected || !address || !contractDeployed) {
        if (!cancelled) {
          setUserHasBalance(false);
          setIsCheckingBalance(false);
        }
        return;
      }

      if (!cancelled) {
        setIsCheckingBalance(true);
      }
      
      try {
        const hasBal = await hasBalance();
        if (!cancelled) {
          setUserHasBalance(hasBal);
          setIsCheckingBalance(false);
        }
      } catch (error) {
        console.error("Error checking balance:", error);
        if (!cancelled) {
          setUserHasBalance(false);
          setIsCheckingBalance(false);
        }
      }
    };

    checkBalance();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, contractDeployed]);

  const handleSetBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractDeployed) {
      toast.error("Contract not deployed on this network");
      return;
    }

    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum) || balanceNum <= 0) {
      toast.error("Please enter a valid balance amount");
      return;
    }

    setIsSettingBalance(true);
    try {
      const success = await setBalance(balanceNum);
      if (success) {
        setUserHasBalance(true);
        setBalanceValue("");
        toast.success("Balance set successfully!", {
          description: "Your balance is now encrypted and stored on-chain.",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to set balance");
    } finally {
      setIsSettingBalance(false);
    }
  };

  const handleValidateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractDeployed) {
      toast.error("Contract not deployed on this network");
      return;
    }

    if (!userHasBalance) {
      toast.error("Please set your balance first");
      return;
    }

    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid transfer amount");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await validateTransfer(amountNum);
      
      if (result !== null) {
        setValidationResult(result);
        if (result) {
          toast.success("Validation successful!", {
            description: "Your balance is sufficient for this transfer.",
          });
        } else {
          toast.error("Validation failed", {
            description: "Your balance is insufficient for this transfer.",
          });
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to validate transfer");
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearBalance = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractDeployed) {
      toast.error("Contract not deployed on this network");
      return;
    }

    setIsClearingBalance(true);
    try {
      const success = await clearBalance();
      if (success) {
        setUserHasBalance(false);
        setBalanceValue("");
        setTransferAmount("");
        setValidationResult(null);
        toast.success("Balance cleared successfully!", {
          description: "Your encrypted balance has been removed.",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to clear balance");
    } finally {
      setIsClearingBalance(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="glass-card rounded-xl encrypted-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Encrypted Balance Validator
          </CardTitle>
          <CardDescription>
            Connect your wallet to start using encrypted balance validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please connect your Rainbow wallet to continue.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!contractDeployed) {
    return (
      <Card className="glass-card rounded-xl encrypted-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Encrypted Balance Validator
          </CardTitle>
          <CardDescription>
            Contract not deployed on this network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              The BalanceValidator contract is not deployed on the current network. Please switch to localhost (31337) or Sepolia (11155111).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Set Balance Section */}
      <Card className="glass-card rounded-xl encrypted-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Set Encrypted Balance
          </CardTitle>
          <CardDescription>
            Encrypt and store your balance on-chain. Only you can decrypt it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCheckingBalance ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking balance status...</span>
            </div>
          ) : userHasBalance ? (
            <div className="space-y-3">
              <Alert className="bg-success/10 border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <AlertDescription className="text-success">
                  Your encrypted balance is set. You can now validate transfers.
                </AlertDescription>
              </Alert>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleClearBalance}
                disabled={isClearingBalance || isLoading}
              >
                {isClearingBalance ? "Clearing..." : "Clear Balance"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSetBalance} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="balance">Balance Amount</Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="1000"
                  value={balance}
                  onChange={(e) => setBalanceValue(e.target.value)}
                  className="font-mono text-lg"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="glass-card p-3 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Lock className="w-3 h-3" />
                  <span>Balance will be encrypted before being stored on-chain</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSettingBalance || isLoading}
              >
                {isSettingBalance ? "Setting Balance..." : "Set Encrypted Balance"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Validate Transfer Section */}
      {userHasBalance && (
        <Card className="glass-card rounded-xl encrypted-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Validate Transfer Amount
            </CardTitle>
            <CardDescription>
              Encrypt your transfer amount and check if your balance is sufficient. Only YES/NO result is revealed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleValidateTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transferAmount">Transfer Amount</Label>
                <Input
                  id="transferAmount"
                  type="number"
                  placeholder="500"
                  value={transferAmount}
                  onChange={(e) => {
                    setTransferAmount(e.target.value);
                    setValidationResult(null);
                  }}
                  className="font-mono text-lg"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {validationResult !== null && (
                <Alert className={validationResult ? "bg-success/10 border-success/20" : "bg-destructive/10 border-destructive/20"}>
                  {validationResult ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <AlertDescription className={validationResult ? "text-success" : "text-destructive"}>
                    <strong>{validationResult ? "YES" : "NO"}</strong> - Your balance is {validationResult ? "sufficient" : "insufficient"} for this transfer.
                  </AlertDescription>
                </Alert>
              )}

              <div className="glass-card p-3 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Lock className="w-3 h-3" />
                  <span>Amount and balance remain encrypted. Only validation result is revealed.</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isValidating || isLoading}
              >
                {isValidating ? "Validating..." : "Validate Transfer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

