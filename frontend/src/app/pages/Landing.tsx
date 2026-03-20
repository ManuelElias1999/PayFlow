import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, DollarSign, FileText, Wallet } from 'lucide-react';

export const Landing: React.FC = () => {
  const { walletConnected, company, usdcApproved, connectWallet } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (walletConnected && company && usdcApproved) {
      navigate('/dashboard');
    } else if (walletConnected && company && !usdcApproved) {
      navigate('/approve');
    } else if (walletConnected && !company) {
      navigate('/onboarding');
    }
  }, [walletConnected, company, usdcApproved, navigate]);

  const handleConnect = () => {
    connectWallet();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-slate-900">PayFlow</h1>
        </div>
      </header>

      {/* Hero Section */}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg h-auto"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect MetaMask
          </Button>
        </div>

        {/* Features */}
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
                Every payment generates a shareable invoice with transaction proof on the blockchain.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 pt-12 border-t border-slate-200">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">100%</div>
              <div className="text-slate-600">Onchain Transparency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">Instant</div>
              <div className="text-slate-600">Payment Settlement</div>
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
