import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Play, CheckCircle, DollarSign, Users, Activity, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const Payroll: React.FC = () => {
  const { walletConnected, company, usdcApproved, employees, payrollRuns, invoices, runPayroll } = useApp();
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!walletConnected || !company || !usdcApproved) {
      navigate('/');
    }
  }, [walletConnected, company, usdcApproved, navigate]);

  const activeEmployees = employees.filter((emp) => emp.status === 'active');
  const totalPayrollAmount = activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);

  const handleRunPayroll = () => {
    if (activeEmployees.length === 0) {
      toast.error('No active employees to pay');
      return;
    }

    setIsRunning(true);
    setTimeout(() => {
      runPayroll();
      setIsRunning(false);
      toast.success(`Payroll completed! Paid ${activeEmployees.length} employees`);
    }, 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

        {/* Summary Card */}
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
                  <div className="text-lg font-bold text-green-600">Approved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees in Payroll */}
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
                  <>Processing...</>
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
                        <TableCell className="text-slate-600">{employee.email}</TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">
                          {formatAddress(employee.wallet)}
                        </TableCell>
                        <TableCell className="text-slate-600">{employee.role}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${employee.salary.toLocaleString()} USDC
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payroll Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Payroll Runs
            </CardTitle>
            <CardDescription>History of completed payroll transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payrollRuns.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No payroll runs yet. Click "Run Payroll" to process your first payment.
              </div>
            ) : (
              <div className="space-y-3">
                {payrollRuns.slice(0, 10).map((run) => {
                  // Find invoices for this payroll run by date
                  const runDate = new Date(run.date).toISOString().split('T')[0];
                  const runInvoices = invoices.filter((inv) => {
                    const invDate = new Date(inv.paymentDate).toISOString().split('T')[0];
                    return invDate === runDate;
                  });
                  const firstInvoice = runInvoices[0];

                  return (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {new Date(run.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-sm text-slate-600">
                            {run.employeeCount} employees paid
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-slate-900">
                            ${run.totalAmount.toLocaleString()} USDC
                          </div>
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            {run.status}
                          </Badge>
                        </div>
                        {firstInvoice && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/invoice/${firstInvoice.id}`)}
                            className="ml-2"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View Invoice
                          </Button>
                        )}
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