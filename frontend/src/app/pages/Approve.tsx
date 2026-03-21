import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ProgressStepper } from '../components/ProgressStepper';
import { Check, Loader2, Shield, Wallet } from 'lucide-react';
import { CONTRACTS } from '../lib/contracts';
import { getAccount, getPayrollContract, getUsdcContract } from '../lib/web3';
import { toast } from 'sonner';

export const Approve: React.FC = () => {
  const { walletAddress, walletConnected } = useApp();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [usdcApproved, setUsdcApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');

  const APPROVE_AMOUNT = 100000000000n; // 100,000 USDC with 6 decimals

  useEffect(() => {
    const loadData = async () => {
      if (!walletConnected) {
        navigate('/');
        return;
      }

      try {
        setIsChecking(true);

        const account = await getAccount();
        const payroll = await getPayrollContract(false);
        const usdc = await getUsdcContract(false);

        const companyData = await payroll.companies(account);

        if (!companyData.isRegistered) {
          navigate('/onboarding');
          return;
        }

        const allowance = await usdc.allowance(account, CONTRACTS.payroll);

        setCompany(companyData);
        setUsdcApproved(allowance > 0n);
      } catch (err) {
        console.error('Error loading approval page:', err);
        setError('Failed to load approval data');
      } finally {
        setIsChecking(false);
      }
    };

    loadData();
  }, [walletConnected, navigate]);

  useEffect(() => {
    if (usdcApproved) {
      navigate('/dashboard');
    }
  }, [usdcApproved, navigate]);

  const handleApprove = async () => {
    try {
      setError('');
      setIsApproving(true);

      const usdc = await getUsdcContract(true);
      const tx = await usdc.approve(CONTRACTS.payroll, APPROVE_AMOUNT);
      await tx.wait();

      setUsdcApproved(true);
      toast.success('USDC approval successful');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || 'Failed to approve USDC');
    } finally {
      setIsApproving(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const steps = [
    { title: 'Company Registered', completed: true },
    { title: 'USDC Approved', completed: usdcApproved },
    { title: 'Employees Enabled', completed: usdcApproved },
  ];

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading approval data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-2xl font-semibold text-slate-900 hover:text-blue-600 transition-colors"
        >
          PayFlow
        </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12">
          <ProgressStepper steps={steps} />
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Approve USDC for Payroll</h2>
          <p className="text-slate-600">
            The payroll contract needs permission to transfer USDC from your company wallet to pay employees.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">
                This approval allows the PayFlow smart contract to transfer USDC from your wallet when you run payroll.
                You maintain full control and can revoke this approval at any time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-slate-600">Your Wallet</span>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-900">
                    {walletAddress && formatAddress(walletAddress)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-slate-600">Token</span>
                <span className="font-medium text-slate-900">USDC</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-slate-600">Network</span>
                <span className="font-medium text-slate-900">
                  {company?.defaultFundingChain || 'Injective'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-slate-600">Contract Address</span>
                <span className="font-mono text-sm text-slate-900">
                  {formatAddress(CONTRACTS.payroll)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-slate-600">Approval Status</span>
                <div className="flex items-center gap-2">
                  {usdcApproved ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Approved</span>
                    </>
                  ) : (
                    <span className="text-amber-600 font-medium">Pending Approval</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <Card className="border-slate-300">
            <CardContent className="pt-6">
              <Button
                onClick={handleApprove}
                disabled={isApproving || usdcApproved}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Approving USDC...
                  </>
                ) : usdcApproved ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    USDC Approved
                  </>
                ) : (
                  'Approve USDC'
                )}
              </Button>

              {!usdcApproved && (
                <p className="text-sm text-slate-500 text-center mt-3">
                  You'll be prompted to confirm this transaction in MetaMask
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};