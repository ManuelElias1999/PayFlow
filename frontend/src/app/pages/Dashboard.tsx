import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserCheck, UserX, DollarSign, Plus, Play, Activity, Loader2 } from 'lucide-react';
import { getAccount, getPayrollContract, getUsdcContract } from '../lib/web3';
import { CONTRACTS } from '../lib/contracts';
import { fromUsdcAmount } from '../lib/usdc';

type ChainEmployee = {
  id: number;
  name: string;
  wallet: string;
  role: string;
  salary: string;
  status: 'active' | 'inactive';
};

type PaymentItem = {
  id: number;
  employeeId: number;
  amount: string;
  timestamp: number;
  period: number;
};

export const Dashboard: React.FC = () => {
  const { walletConnected } = useApp();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [employees, setEmployees] = useState<ChainEmployee[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
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

        const ids = await payroll.getEmployeeIdsByCompany(account);
        const chainEmployees = await Promise.all(
          ids.map(async (id: bigint) => {
            const emp = await payroll.getEmployee(account, id);
            return {
              id: Number(emp.id),
              name: emp.name,
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
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [walletConnected, navigate]);

  const activeEmployees = employees.filter((emp) => emp.status === 'active');
  const inactiveEmployees = employees.filter((emp) => emp.status === 'inactive');
  const totalMonthlyPayroll = activeEmployees.reduce((sum, emp) => sum + Number(emp.salary), 0);
  const recentPayments = payments.slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading dashboard...
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600">
            Overview of {company?.name || 'your company'} payroll operations
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4" />
                Total Employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{employees.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-slate-600">
                <UserCheck className="w-4 h-4" />
                Active Employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeEmployees.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-slate-600">
                <UserX className="w-4 h-4" />
                Inactive Employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-400">{inactiveEmployees.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-slate-600">
                <DollarSign className="w-4 h-4" />
                Monthly Payroll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                ${totalMonthlyPayroll.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your payroll operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/employees')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
              <Button
                onClick={() => navigate('/payroll')}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Payroll
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Payments
            </CardTitle>
            <CardDescription>Latest payroll transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No payroll runs yet. Click "Run Payroll" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => {
                  const employee = employees.find((e) => e.id === payment.employeeId);

                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/invoice/${payment.id}`)}
                    >
                      <div>
                        <div className="font-medium text-slate-900">
                          {employee?.name || `Employee #${payment.employeeId}`}
                        </div>
                        <div className="text-sm text-slate-600">
                          {new Date(payment.timestamp * 1000).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          ${payment.amount} USDC
                        </div>
                        <div className="text-sm text-green-600">Paid</div>
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