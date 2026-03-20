import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ExternalLink, Copy, CheckCircle, FileText, Building2, User, Wallet, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';

export const Invoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { invoices } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const invoice = invoices.find((inv) => inv.id === id);

  useEffect(() => {
    if (!invoice && invoices.length > 0) {
      navigate('/dashboard');
    }
  }, [invoice, invoices, navigate]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-4">Invoice not found</div>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Invoice link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewExplorer = () => {
    // Mock explorer link
    window.open(`https://explorer.injective.network/tx/${invoice.transactionHash}`, '_blank');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">PayFlow</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewExplorer}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Invoice Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Payment Invoice</h2>
              <p className="text-slate-600">Invoice #{invoice.id}</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            {invoice.status}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Company & Employee Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900">{invoice.companyName}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900">{invoice.employeeName}</div>
                <div className="text-sm text-slate-600 mt-1">{invoice.role}</div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2 text-slate-600">
                  <Wallet className="w-4 h-4" />
                  <span>Employee Wallet</span>
                </div>
                <span className="font-mono text-sm text-slate-900">
                  {formatAddress(invoice.employeeWallet)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-slate-600">Amount</span>
                <span className="text-2xl font-bold text-slate-900">
                  ${invoice.amount.toLocaleString()} {invoice.token}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-slate-600">Network</span>
                <span className="font-medium text-slate-900">{invoice.network}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Payment Date</span>
                </div>
                <span className="font-medium text-slate-900">
                  {new Date(invoice.paymentDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-start justify-between py-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Hash className="w-4 h-4" />
                  <span>Transaction Hash</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-slate-900 mb-1">
                    {formatAddress(invoice.transactionHash)}
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleViewExplorer}
                    className="h-auto p-0 text-blue-600"
                  >
                    View on blockchain explorer →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Notice */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 mb-1">Verified Onchain Payment</div>
                  <p className="text-sm text-slate-600">
                    This payment has been executed and verified on the Injective blockchain. All transaction details are permanently recorded and publicly verifiable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center text-sm text-slate-500 pt-6">
            This invoice was generated by PayFlow, an onchain payroll platform on Injective
          </div>
        </div>
      </main>
    </div>
  );
};
