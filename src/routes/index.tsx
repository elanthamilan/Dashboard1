import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../components/Layout';
import { AdmissionsDashboard } from '../components/AdmissionsDashboard';
import { AttendanceDashboard } from '../components/AttendanceDashboard';
import { BillingDashboard } from '../components/BillingDashboard';
import { StudentPerformanceDashboard } from '../components/StudentPerformanceDashboard';

// Placeholder for a home/overview page if needed
const HomePagePlaceholder: React.FC = () => <div>Home Page / Overview Placeholder</div>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout><HomePagePlaceholder /></MainLayout>, // Wrap with MainLayout
    children: [
      // Could add children routes here if MainLayout has an <Outlet />
      // For now, keeping it simple, MainLayout wraps each page component directly or via element prop
    ],
  },
  {
    path: '/admissions',
    element: <MainLayout><AdmissionsDashboard /></MainLayout>,
  },
  {
    path: '/attendance',
    element: <MainLayout><AttendanceDashboard /></MainLayout>,
  },
  {
    path: '/billing',
    element: <MainLayout><BillingDashboard /></MainLayout>,
  },
  {
    path: '/performance',
    element: <MainLayout><StudentPerformanceDashboard /></MainLayout>,
  },
  // Fallback route for 404
  {
    path: '*',
    element: <MainLayout><div>Page Not Found</div></MainLayout>,
  }
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
