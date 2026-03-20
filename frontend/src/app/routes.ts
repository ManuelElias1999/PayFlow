import { createBrowserRouter } from 'react-router';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { Approve } from './pages/Approve';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Payroll } from './pages/Payroll';
import { Invoice } from './pages/Invoice';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/onboarding',
    Component: Onboarding,
  },
  {
    path: '/approve',
    Component: Approve,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
  {
    path: '/employees',
    Component: Employees,
  },
  {
    path: '/payroll',
    Component: Payroll,
  },
  {
    path: '/invoice/:id',
    Component: Invoice,
  },
]);
