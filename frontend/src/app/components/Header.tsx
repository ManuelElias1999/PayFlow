import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { LogOut, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Header: React.FC = () => {
  const { walletAddress, disconnectWallet } = useApp();
  const navigate = useNavigate();

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">PayFlow</h1>

          {walletAddress && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <Wallet className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {formatAddress(walletAddress)}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-slate-600 hover:text-slate-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};