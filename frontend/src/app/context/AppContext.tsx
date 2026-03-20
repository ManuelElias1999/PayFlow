import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Employee {
  id: string;
  name: string;
  email: string;
  wallet: string;
  role: string;
  salary: number;
  status: 'active' | 'inactive';
}

export interface Company {
  name: string;
  country: string;
  fundingChain: string;
  walletAddress: string;
}

export interface PayrollRun {
  id: string;
  date: string;
  totalAmount: number;
  employeeCount: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface Invoice {
  id: string;
  companyName: string;
  employeeName: string;
  employeeWallet: string;
  role: string;
  amount: number;
  token: string;
  network: string;
  paymentDate: string;
  status: string;
  transactionHash: string;
}

interface AppContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  company: Company | null;
  usdcApproved: boolean;
  employees: Employee[];
  payrollRuns: PayrollRun[];
  invoices: Invoice[];
  connectWallet: () => void;
  disconnectWallet: () => void;
  registerCompany: (company: Company) => void;
  approveUSDC: () => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  runPayroll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [usdcApproved, setUsdcApproved] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    const savedCompany = localStorage.getItem('company');
    const savedUsdcApproved = localStorage.getItem('usdcApproved');
    const savedEmployees = localStorage.getItem('employees');
    const savedPayrollRuns = localStorage.getItem('payrollRuns');
    const savedInvoices = localStorage.getItem('invoices');

    if (savedWallet) {
      setWalletAddress(savedWallet);
      setWalletConnected(true);
    }
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    }
    if (savedUsdcApproved) {
      setUsdcApproved(JSON.parse(savedUsdcApproved));
    }
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
    if (savedPayrollRuns) {
      setPayrollRuns(JSON.parse(savedPayrollRuns));
    }
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  const connectWallet = () => {
    // Mock MetaMask connection
    const mockAddress = '0x' + Math.random().toString(16).substring(2, 42);
    setWalletAddress(mockAddress);
    setWalletConnected(true);
    localStorage.setItem('walletAddress', mockAddress);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletConnected(false);
    setCompany(null);
    setUsdcApproved(false);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('company');
    localStorage.removeItem('usdcApproved');
  };

  const registerCompany = (companyData: Company) => {
    setCompany(companyData);
    localStorage.setItem('company', JSON.stringify(companyData));
  };

  const approveUSDC = () => {
    // Mock USDC approval
    setTimeout(() => {
      setUsdcApproved(true);
      localStorage.setItem('usdcApproved', 'true');
    }, 1500);
  };

  const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now().toString(),
    };
    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === id ? { ...emp, ...updates } : emp
    );
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  const deleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter((emp) => emp.id !== id);
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  const runPayroll = () => {
    const activeEmployees = employees.filter((emp) => emp.status === 'active');
    const totalAmount = activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);
    
    const newPayrollRun: PayrollRun = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      totalAmount,
      employeeCount: activeEmployees.length,
      status: 'completed',
    };

    const newInvoices: Invoice[] = activeEmployees.map((emp) => ({
      id: `INV-${Date.now()}-${emp.id}`,
      companyName: company?.name || '',
      employeeName: emp.name,
      employeeWallet: emp.wallet,
      role: emp.role,
      amount: emp.salary,
      token: 'USDC',
      network: 'Injective',
      paymentDate: new Date().toISOString(),
      status: 'Paid',
      transactionHash: '0x' + Math.random().toString(16).substring(2, 66),
    }));

    const updatedPayrollRuns = [newPayrollRun, ...payrollRuns];
    const updatedInvoices = [...newInvoices, ...invoices];

    setPayrollRuns(updatedPayrollRuns);
    setInvoices(updatedInvoices);
    localStorage.setItem('payrollRuns', JSON.stringify(updatedPayrollRuns));
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };

  return (
    <AppContext.Provider
      value={{
        walletConnected,
        walletAddress,
        company,
        usdcApproved,
        employees,
        payrollRuns,
        invoices,
        connectWallet,
        disconnectWallet,
        registerCompany,
        approveUSDC,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        runPayroll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
