import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Wallet, Building2, Loader2 } from 'lucide-react';
import { getPayrollContract, getAccount } from '../lib/web3';

export const Onboarding: React.FC = () => {
  const { walletAddress, walletConnected } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    fundingChain: 'Injective',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkCompany = async () => {
      if (!walletConnected) {
        navigate('/');
        return;
      }

      try {
        const account = await getAccount();
        const payroll = await getPayrollContract(false);
        const company = await payroll.companies(account);

        if (company.isRegistered) {
          navigate('/approve');
        }
      } catch (err) {
        console.error('Error checking company:', err);
      }
    };

    checkCompany();
  }, [walletConnected, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.country) return;

    try {
      setIsSubmitting(true);

      const payroll = await getPayrollContract(true);
      const tx = await payroll.registerCompany(
        formData.name,
        formData.country,
        formData.fundingChain
      );

      await tx.wait();
      navigate('/approve');
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || 'Failed to register company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Register Your Company</h2>
          <p className="text-slate-600">Set up your company profile to start managing payroll onchain</p>
        </div>

        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Connected Wallet</div>
                <div className="font-medium text-slate-900">
                  {walletAddress && formatAddress(walletAddress)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Enter your company details to get started with onchain payroll
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Acme Corporation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Bolivia"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingChain">Default Funding Chain</Label>
                <Select
                  value={formData.fundingChain}
                  onValueChange={(value) => setFormData({ ...formData, fundingChain: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Injective">Injective</SelectItem>
                    <SelectItem value="Base">Base</SelectItem>
                    <SelectItem value="Avalanche">Avalanche</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500 mt-2">
                  Note: This MVP demo uses Injective blockchain
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                disabled={!formData.name || !formData.country || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Company'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};