import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, UserCheck, UserX, DollarSign, Plus, Play, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { walletConnected, company, usdcApproved, employees, payrollRuns } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletConnected || !company || !usdcApproved) {
      navigate('/');
    }
  }, [walletConnected, company, usdcApproved, navigate]);

  const activeEmployees = employees.filter((emp) => emp.status === 'active');
  const inactiveEmployees = employees.filter((emp) => emp.status === 'inactive');
  const totalMonthlyPayroll = activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);

  const recentPayrollRuns = payrollRuns.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600">Overview of your company's payroll operations</p>
        </div>

        {/* KPI Cards */}
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

        {/* Quick Actions */}
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Payroll Runs
            </CardTitle>
            <CardDescription>Latest payroll transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayrollRuns.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No payroll runs yet. Click "Run Payroll" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayrollRuns.map((run) => {
                  // Find the first invoice for this payroll run
                  const runDate = new Date(run.date).toISOString().split('T')[0];
                  const invoiceForRun = payrollRuns.find(r => r.id === run.id);
                  
                  return (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => {
                        // Navigate to the payroll page to see details
                        navigate('/payroll');
                      }}
                    >
                      <div>
                        <div className="font-medium text-slate-900">
                          {new Date(run.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-slate-600">
                          {run.employeeCount} employees
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          ${run.totalAmount.toLocaleString()} USDC
                        </div>
                        <div className="text-sm text-green-600">{run.status}</div>
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