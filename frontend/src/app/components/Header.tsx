import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { LogOut, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Header: React.FC = () => {
  const { walletAddress, company, disconnectWallet } = useApp();
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
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-semibold text-slate-900">PayFlow</h1>
            {company && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Company:</span>
                  <span className="font-medium text-slate-900">{company.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Chain:</span>
                  <span className="font-medium text-slate-900">{company.fundingChain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Country:</span>
                  <span className="font-medium text-slate-900">{company.country}</span>
                </div>
              </div>
            )}
          </div>
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
