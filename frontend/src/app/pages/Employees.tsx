import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus, Edit, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getAccount, getPayrollContract, getUsdcContract } from '../lib/web3';
import { CONTRACTS } from '../lib/contracts';
import { fromUsdcAmount, toUsdcAmount } from '../lib/usdc';
import { toast } from 'sonner';
import { saveEmployeeEmail, getEmployeeEmail } from '../lib/api';

type ChainEmployee = {
  id: number;
  name: string;
  email: string;
  wallet: string;
  role: string;
  salary: string;
  status: 'active' | 'inactive';
};

export const Employees: React.FC = () => {
  const { walletConnected } = useApp();
  const navigate = useNavigate();

  const [company, setCompany] = useState<any>(null);
  const [employees, setEmployees] = useState<ChainEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<ChainEmployee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wallet: '',
    role: '',
    salary: '',
    status: 'active' as 'active' | 'inactive',
  });

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

        const ids = await payroll.getEmployeeIdsByCompany(account);
        const chainEmployees = await Promise.all(
          ids.map(async (id: bigint) => {
            const emp = await payroll.getEmployee(account, id);
        
            let email = '';
            try {
              const emailResponse = await getEmployeeEmail(account, Number(emp.id));
              email = emailResponse?.data?.email || '';
            } catch (err) {
              console.error(`Failed to fetch email for employee ${emp.id}:`, err);
            }
        
            return {
              id: Number(emp.id),
              name: emp.name,
              email,
              wallet: emp.wallet,
              role: emp.role,
              salary: fromUsdcAmount(emp.salary),
              status: emp.active ? 'active' : 'inactive',
            };
          })
        );

        setEmployees(chainEmployees);
      } catch (err) {
        console.error(err);
        setError('Failed to load employees');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [walletConnected, navigate]);

  const refreshEmployees = async () => {
    const account = await getAccount();
    const payroll = await getPayrollContract(false);
    const ids = await payroll.getEmployeeIdsByCompany(account);

    const chainEmployees = await Promise.all(
      ids.map(async (id: bigint) => {
        const emp = await payroll.getEmployee(account, id);
    
        let email = '';
        try {
          const emailResponse = await getEmployeeEmail(account, Number(emp.id));
          email = emailResponse?.data?.email || '';
        } catch (err) {
          console.error(`Failed to fetch email for employee ${emp.id}:`, err);
        }
    
        return {
          id: Number(emp.id),
          name: emp.name,
          email,
          wallet: emp.wallet,
          role: emp.role,
          salary: fromUsdcAmount(emp.salary),
          status: emp.active ? 'active' : 'inactive',
        };
      })
    );

    setEmployees(chainEmployees);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      wallet: '',
      role: '',
      salary: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: ChainEmployee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      wallet: employee.wallet,
      role: employee.role,
      salary: employee.salary,
      status: employee.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setIsSaving(true);
      const payroll = await getPayrollContract(true);
      const salary = toUsdcAmount(formData.salary);

      if (selectedEmployee) {
        const tx = await payroll.updateEmployee(
          selectedEmployee.id,
          formData.name,
          formData.role,
          formData.wallet,
          salary
        );
        await tx.wait();
        
        const account = await getAccount();
        
        if (formData.email) {
          await saveEmployeeEmail({
            companyWallet: account,
            employeeId: selectedEmployee.id,
            employeeWallet: formData.wallet,
            employeeName: formData.name,
            email: formData.email,
          });
        }

        if (selectedEmployee.status !== formData.status) {
          const tx2 = await payroll.setEmployeeStatus(
            selectedEmployee.id,
            formData.status === 'active'
          );
          await tx2.wait();
        }
      } else {
        const tx = await payroll.addEmployee(
          formData.name,
          formData.role,
          formData.wallet,
          salary
        );
        await tx.wait();
        
        const account = await getAccount();
        const ids = await payroll.getEmployeeIdsByCompany(account);
        const newEmployeeId = Number(ids[ids.length - 1]);
        
        if (formData.email) {
          await saveEmployeeEmail({
            companyWallet: account,
            employeeId: newEmployeeId,
            employeeWallet: formData.wallet,
            employeeName: formData.name,
            email: formData.email,
          });
        }
      }

      await refreshEmployees();
      setIsModalOpen(false);
      toast.success(selectedEmployee ? 'Employee updated successfully' : 'Employee added successfully');
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || 'Failed to save employee');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (employee: ChainEmployee) => {
    try {
      setError('');
      const payroll = await getPayrollContract(true);
      const tx = await payroll.setEmployeeStatus(
        employee.id,
        employee.status !== 'active'
      );
      await tx.wait();
      await refreshEmployees();
      toast.success(
        employee.status === 'active'
          ? 'Employee marked as inactive'
          : 'Employee marked as active'
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.reason || err?.message || 'Failed to update employee status');
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
          Loading employees...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Employees</h2>
            <p className="text-slate-600">Manage your team members and their salary information</p>
          </div>
          <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              {employees.length} total employees • {employees.filter((e) => e.status === 'active').length} active
            </CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">No employees added yet</div>
                <Button onClick={handleAddEmployee} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Employee
                </Button>
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
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell className="text-slate-600">
                          {employee.email || <span className="text-slate-400">Not stored yet</span>}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">
                          {formatAddress(employee.wallet)}
                        </TableCell>
                        <TableCell className="text-slate-600">{employee.role}</TableCell>
                        <TableCell className="font-medium">
                          ${employee.salary} USDC
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={employee.status === 'active' ? 'default' : 'secondary'}
                            className={
                              employee.status === 'active'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                            }
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(employee)}
                              className={
                                employee.status === 'active'
                                  ? 'text-slate-600 hover:text-slate-900'
                                  : 'text-green-600 hover:text-green-700'
                              }
                            >
                              {employee.status === 'active' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Stored later in backend"
              />
            </div>

            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                value={formData.wallet}
                onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role / Position</Label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Monthly Salary (USDC)</Label>
              <Input
                type="number"
                step="0.000001"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full h-10 rounded-md border border-slate-200 px-3"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                }
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : selectedEmployee ? (
                'Save Changes'
              ) : (
                'Add Employee'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};