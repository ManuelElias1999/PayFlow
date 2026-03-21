import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Play, CheckCircle, DollarSign, Users, Activity, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getEmployeeEmail, sendInvoiceEmail } from '../lib/api';
import { getAccount, getPayrollContract, getUsdcContract } from '../lib/web3';
import { CONTRACTS } from '../lib/contracts';
import { fromUsdcAmount } from '../lib/usdc';


type ChainEmployee = {
  id: number;
  name: string;
  email: string;
  wallet: string;
  role: string;
  salary: string;
  status: 'active' | 'inactive';
};

type PaymentItem = {
  id: number;
  employeeId: number;
  employeeWallet: string;
  amount: string;
  timestamp: number;
  period: number;
};

export const Payroll: React.FC = () => {
  const { walletConnected } = useApp();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [employees, setEmployees] = useState<ChainEmployee[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [usdcApproved, setUsdcApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      if (!walletConnected) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);

        const account = await getAccount();
        const payroll = await getPayrollContract(false);
        const usdc = await getUsdcContract(false);

        const companyData = await payroll.companies(account);
        if (!companyData.isRegistered) {
          navigate('/onboarding');
          return;
        }

        const allowance = await usdc.allowance(account, CONTRACTS.payroll);
        if (allowance <= 0n) {
          navigate('/approve');
          return;
        }

        setCompany(companyData);
        setUsdcApproved(true);

        const ids = await payroll.getEmployeeIdsByCompany(account);
        const chainEmployees = await Promise.all(
          ids.map(async (id: bigint) => {
            const emp = await payroll.getEmployee(account, id);
            return {
              id: Number(emp.id),
              name: emp.name,
              email: '',
              wallet: emp.wallet,
              role: emp.role,
              salary: fromUsdcAmount(emp.salary),
              status: emp.active ? 'active' : 'inactive',
            } as ChainEmployee;
          })
        );

        setEmployees(chainEmployees);

        const paymentCount = await payroll.paymentCount();
        const allPayments: PaymentItem[] = [];

        for (let i = 1; i <= Number(paymentCount); i++) {
          const payment = await payroll.getPayment(i);
          if (payment.employer.toLowerCase() === account.toLowerCase()) {
            allPayments.push({
              id: Number(payment.id),
              employeeId: Number(payment.employeeId),
              employeeWallet: payment.employeeWallet,
              amount: fromUsdcAmount(payment.amount),
              timestamp: Number(payment.timestamp),
              period: Number(payment.period),
            });
          }
        }

        allPayments.sort((a, b) => b.timestamp - a.timestamp);
        setPayments(allPayments);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load payroll data');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [walletConnected, navigate]);

  const refreshData = async () => {
    const account = await getAccount();
    const payroll = await getPayrollContract(false);

    const ids = await payroll.getEmployeeIdsByCompany(account);
    const chainEmployees = await Promise.all(
      ids.map(async (id: bigint) => {
        const emp = await payroll.getEmployee(account, id);
        return {
          id: Number(emp.id),
          name: emp.name,
          email: '',
          wallet: emp.wallet,
          role: emp.role,
          salary: fromUsdcAmount(emp.salary),
          status: emp.active ? 'active' : 'inactive',
        } as ChainEmployee;
      })
    );
    setEmployees(chainEmployees);

    const paymentCount = await payroll.paymentCount();
    const allPayments: PaymentItem[] = [];

    for (let i = 1; i <= Number(paymentCount); i++) {
      const payment = await payroll.getPayment(i);
      if (payment.employer.toLowerCase() === account.toLowerCase()) {
        allPayments.push({
          id: Number(payment.id),
          employeeId: Number(payment.employeeId),
          employeeWallet: payment.employeeWallet,
          amount: fromUsdcAmount(payment.amount),
          timestamp: Number(payment.timestamp),
          period: Number(payment.period),
        });
      }
    }

    allPayments.sort((a, b) => b.timestamp - a.timestamp);
    setPayments(allPayments);
  };

  const activeEmployees = employees.filter((emp) => emp.status === 'active');
  const totalPayrollAmount = activeEmployees.reduce((sum, emp) => sum + Number(emp.salary), 0);

  const handleRunPayroll = async () => {
    if (activeEmployees.length === 0) {
      toast.error('No active employees to pay');
      return;
    }
  
    try {
      setIsRunning(true);
  
      const account = await getAccount();
      const payroll = await getPayrollContract(true);
      const payrollRead = await getPayrollContract(false);
  
      const beforeCount = Number(await payrollRead.paymentCount());
      const period = Date.now();
  
      const tx = await payroll.runPayroll(period);
      await tx.wait();
  
      const afterCount = Number(await payrollRead.paymentCount());
  
      for (let paymentId = beforeCount + 1; paymentId <= afterCount; paymentId++) {
        const payment = await payrollRead.getPayment(paymentId);
        const employee = await payrollRead.getEmployee(account, payment.employeeId);
        const companyData = await payrollRead.companies(account);
  
        try {
          const emailResponse = await getEmployeeEmail(account, Number(payment.employeeId));
          const emailRecord = emailResponse.data;
  
          if (emailRecord?.email) {
            await sendInvoiceEmail({
              email: emailRecord.email,
              companyName: companyData.name,
              employeeName: employee.name,
              amount: fromUsdcAmount(payment.amount),
              period: Number(payment.period),
              invoiceUrl: `http://localhost:5173/invoice/${paymentId}`,
              employeeWallet: payment.employeeWallet,
            });
          }
        } catch (emailErr) {
          console.error(`Failed to send email for payment ${paymentId}:`, emailErr);
        }
      }
  
      await refreshData();
      toast.success(`Payroll completed successfully. Paid ${activeEmployees.length} employees and triggered invoice emails.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.reason || err?.message || 'Failed to run payroll');
    } finally {
      setIsRunning(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading payroll...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-slate-900">Payroll</h2>
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
              Demo Mode: Every 5 minutes
            </Badge>
          </div>
          <p className="text-slate-600">Execute payroll payments to active employees</p>
        </div>

        <Card className="mb-8 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg">Payroll Summary</CardTitle>
            <CardDescription>Overview of the next payroll run</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Active Employees</div>
                  <div className="text-2xl font-bold text-slate-900">{activeEmployees.length}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Total Amount</div>
                  <div className="text-2xl font-bold text-slate-900">
                    ${totalPayrollAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">USDC Approval</div>
                  <div className="text-lg font-bold text-green-600">
                    {usdcApproved ? 'Approved' : 'Pending'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employees in Next Payroll</CardTitle>
                <CardDescription>
                  {activeEmployees.length} employees will receive payment
                </CardDescription>
              </div>
              <Button
                onClick={handleRunPayroll}
                disabled={isRunning || activeEmployees.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Payroll
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeEmployees.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No active employees to pay. Add employees and set them as active to run payroll.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell className="text-slate-600">
                          {employee.email || <span className="text-slate-400">Not stored yet</span>}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">
                          {formatAddress(employee.wallet)}
                        </TableCell>
                        <TableCell className="text-slate-600">{employee.role}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${employee.salary} USDC
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Payroll Runs
            </CardTitle>
            <CardDescription>History of completed payroll transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No payroll runs yet. Click "Run Payroll" to process your first payment.
              </div>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 10).map((payment) => {
                  const employee = employees.find((e) => e.id === payment.employeeId);

                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {employee?.name || `Employee #${payment.employeeId}`}
                          </div>
                          <div className="text-sm text-slate-600">
                            {new Date(payment.timestamp * 1000).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-slate-900">
                            ${payment.amount} USDC
                          </div>
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            Paid
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/invoice/${payment.id}`)}
                          className="ml-2"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Invoice
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};