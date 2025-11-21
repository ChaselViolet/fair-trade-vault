import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface Order {
  id: string;
  type: "buy" | "sell";
  amount: string;
  price: string;
  status: "encrypted" | "executed";
  timestamp: string;
  isUserOrder?: boolean;
}

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  orders: Order[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  addOrder: (order: Omit<Order, "id" | "timestamp" | "status" | "isUserOrder">) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const mockOrders: Order[] = [
  { id: "1", type: "buy", amount: "1.5", price: "45230", status: "encrypted", timestamp: "2 min ago" },
  { id: "2", type: "sell", amount: "0.8", price: "45250", status: "encrypted", timestamp: "5 min ago" },
  { id: "3", type: "buy", amount: "2.1", price: "45220", status: "encrypted", timestamp: "8 min ago" },
  { id: "4", type: "buy", amount: "0.5", price: "45240", status: "executed", timestamp: "12 min ago" },
  { id: "5", type: "sell", amount: "1.2", price: "45260", status: "encrypted", timestamp: "15 min ago" },
];

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const connectWallet = async () => {
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40);
      setWalletAddress(mockAddress);
      setIsConnected(true);
      toast.success("Wallet connected successfully!", {
        description: `Address: ${mockAddress.substring(0, 6)}...${mockAddress.substring(38)}`,
      });
    } catch (error) {
      toast.error("Failed to connect wallet", {
        description: "Please make sure Rainbow Wallet is installed.",
      });
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    toast.info("Wallet disconnected");
  };

  const addOrder = (orderData: Omit<Order, "id" | "timestamp" | "status" | "isUserOrder">) => {
    const newOrder: Order = {
      ...orderData,
      id: `user-${Date.now()}`,
      timestamp: "Just now",
      status: "encrypted",
      isUserOrder: true,
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        orders,
        connectWallet,
        disconnectWallet,
        addOrder,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
