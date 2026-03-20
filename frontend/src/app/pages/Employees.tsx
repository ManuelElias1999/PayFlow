import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp, Employee } from '../context/AppContext';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { EmployeeModal } from '../components/EmployeeModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, CheckCircle, XCircle } from 'lucide-react';

export const Employees: React.FC = () => {
  const { walletConnected, company, usdcApproved, employees, updateEmployee } = useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (!walletConnected || !company || !usdcApproved) {
      navigate('/');
    }
  }, [walletConnected, company, usdcApproved, navigate]);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (employee: Employee) => {
    updateEmployee(employee.id, {
      status: employee.status === 'active' ? 'inactive' : 'active',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
          <Button
            onClick={handleAddEmployee}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

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
                        <TableCell className="text-slate-600">{employee.email}</TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">
                          {formatAddress(employee.wallet)}
                        </TableCell>
                        <TableCell className="text-slate-600">{employee.role}</TableCell>
                        <TableCell className="font-medium">
                          ${employee.salary.toLocaleString()} USDC
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

      <EmployeeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};