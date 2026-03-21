const API_BASE = 'https://payflow-backend-hrw0.onrender.com';

export async function saveEmployeeEmail(payload: {
  companyWallet: string;
  employeeId: number;
  employeeWallet: string;
  employeeName: string;
  email: string;
}) {
  const res = await fetch(`${API_BASE}/employees/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to save employee email');
  }

  return res.json();
}

export async function getEmployeeEmail(companyWallet: string, employeeId: number) {
  const res = await fetch(
    `${API_BASE}/employees/email?companyWallet=${encodeURIComponent(companyWallet)}&employeeId=${employeeId}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch employee email');
  }

  return res.json();
}

export async function sendInvoiceEmail(payload: {
  email: string;
  companyName: string;
  employeeName: string;
  amount: string;
  period: string | number;
  invoiceUrl: string;
  employeeWallet: string;
}) {
  const res = await fetch(`${API_BASE}/emails/send-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to send invoice email');
  }

  return res.json();
}