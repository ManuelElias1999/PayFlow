import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';

interface AppContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const restoreWallet = async () => {
      try {
        if (!window.ethereum) return;

        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      } catch (err) {
        console.error('Failed to restore wallet:', err);
      }
    };

    restoreWallet();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletAddress(null);
          setWalletConnected(false);
        } else {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }
  
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
  
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
      setWalletConnected(true);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletConnected(false);
  };

  return (
    <AppContext.Provider
      value={{
        walletConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};