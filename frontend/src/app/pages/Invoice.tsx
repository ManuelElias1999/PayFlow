import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ExternalLink,
  Copy,
  CheckCircle,
  FileText,
  Building2,
  User,
  Wallet,
  Calendar,
  Hash,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getPayrollContract } from '../lib/web3';
import { fromUsdcAmount } from '../lib/usdc';

type InvoiceData = {
  id: number;
  companyName: string;
  employeeName: string;
  role: string;
  employeeWallet: string;
  amount: string;
  token: string;
  network: string;
  paymentDate: number;
  status: string;
  period: number;
  employer: string;
};

export const Invoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        setIsLoading(true);

        const payroll = await getPayrollContract(false);
        const payment = await payroll.getPayment(id);
        const company = await payroll.companies(payment.employer);
        const employee = await payroll.getEmployee(payment.employer, payment.employeeId);

        const invoiceData: InvoiceData = {
          id: Number(payment.id),
          companyName: company.name,
          employeeName: employee.name,
          role: employee.role,
          employeeWallet: payment.employeeWallet,
          amount: fromUsdcAmount(payment.amount),
          token: 'USDC',
          network: 'Injective',
          paymentDate: Number(payment.timestamp),
          status: 'Paid',
          period: Number(payment.period),
          employer: payment.employer,
        };

        setInvoice(invoiceData);
      } catch (err) {
        console.error(err);
        toast.error('Invoice not found');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [id, navigate]);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Invoice link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleViewExplorer = () => {
    if (!invoice) return;
    window.open(
      `https://testnet.blockscout.injective.network/address/${invoice.employer}`,
      '_blank'
    );
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading invoice...
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">PayFlow</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
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
              <Button variant="outline" size="sm" onClick={handleViewExplorer}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                  ${invoice.amount} {invoice.token}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-slate-600">Network</span>
                <span className="font-medium text-slate-900">{invoice.network}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-slate-600">Payroll Period</span>
                <span className="font-medium text-slate-900">{invoice.period}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Payment Date</span>
                </div>
                <span className="font-medium text-slate-900">
                  {new Date(invoice.paymentDate * 1000).toLocaleDateString('en-US', {
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
                  <span>Employer Contract Reference</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-slate-900 mb-1">
                    {formatAddress(invoice.employer)}
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

          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 mb-1">Verified Onchain Payment</div>
                  <p className="text-sm text-slate-600">
                    This payment has been executed and recorded on the Injective blockchain. The payroll
                    data is publicly verifiable through the smart contract.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-slate-500 pt-6">
            This invoice was generated by PayFlow, an onchain payroll platform on Injective
          </div>
        </div>
      </main>
    </div>
  );
};