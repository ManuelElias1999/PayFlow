import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, DollarSign, FileText, Wallet, Loader2 } from 'lucide-react';
import { getAccount, getPayrollContract, getUsdcContract } from '../lib/web3';
import { CONTRACTS } from '../lib/contracts';

export const Landing: React.FC = () => {
  const { walletConnected, connectWallet } = useApp();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkFlow = async () => {
      if (!walletConnected) return;

      try {
        setIsChecking(true);

        const account = await getAccount();
        const payroll = await getPayrollContract(false);
        const usdc = await getUsdcContract(false);

        const company = await payroll.companies(account);

        if (!company.isRegistered) {
          navigate('/onboarding');
          return;
        }

        const allowance = await usdc.allowance(account, CONTRACTS.payroll);

        if (allowance > 0n) {
          navigate('/dashboard');
        } else {
          navigate('/approve');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    };

    checkFlow();
  }, [walletConnected, navigate]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-slate-900">PayFlow</h1>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Wallet className="w-4 h-4" />
            Onchain Payroll Platform
          </div>

          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Payroll in USDC on Injective
          </h2>

          <p className="text-xl text-slate-600 mb-8">
            Manage employees and pay salaries onchain with transparency, speed, and efficiency. Built for modern companies embracing Web3.
          </p>

          <Button
            size="lg"
            onClick={handleConnect}
            disabled={isChecking}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg h-auto"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Manage Employees</CardTitle>
              <CardDescription className="text-slate-600">
                Add and manage your team members with their wallet addresses, roles, and salaries in one clean dashboard.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Run Payroll Onchain</CardTitle>
              <CardDescription className="text-slate-600">
                Execute payroll directly on Injective. Fast, transparent, and verifiable payments in USDC.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Share Verifiable Invoices</CardTitle>
              <CardDescription className="text-slate-600">
                Every payment generates a shareable invoice with onchain payroll proof.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-20 pt-12 border-t border-slate-200">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">100%</div>
              <div className="text-slate-600">Onchain Transparency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">Fast</div>
              <div className="text-slate-600">Payroll Settlement</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">USDC</div>
              <div className="text-slate-600">Stable Payments</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};