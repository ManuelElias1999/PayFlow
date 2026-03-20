export const payrollAbi = [
    "function registerCompany(string name, string country, string defaultFundingChain)",
    "function companies(address) view returns (string name, string country, string defaultFundingChain, bool isRegistered)",
    "function addEmployee(string name, string role, address wallet, uint256 salary)",
    "function updateEmployee(uint256 employeeId, string name, string role, address wallet, uint256 salary)",
    "function setEmployeeStatus(uint256 employeeId, bool active)",
    "function employeeCount(address) view returns (uint256)",
    "function getEmployeeIdsByCompany(address employer) view returns (uint256[])",
    "function getEmployee(address employer, uint256 employeeId) view returns ((uint256 id, string name, string role, address wallet, uint256 salary, bool active))",
    "function runPayroll(uint256 period)",
    "function paymentCount() view returns (uint256)",
    "function getPayment(uint256 paymentId) view returns ((uint256 id, address employer, uint256 employeeId, address employeeWallet, uint256 amount, uint256 timestamp, uint256 period))",
  ] as const;