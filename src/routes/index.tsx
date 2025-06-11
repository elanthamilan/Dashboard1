import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout';
import { AdmissionsDashboard } from '../components/AdmissionsDashboard';
import { AttendanceDashboard } from '../components/AttendanceDashboard';
import { BillingDashboard } from '../components/BillingDashboard';
import { StudentPerformanceDashboard } from '../components/StudentPerformanceDashboard';
import PrincipalDashboardLandingPage from '../components/PrincipalView/PrincipalDashboardLandingPage'; // New import

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout><Navigate to="/admissions" replace /></MainLayout>,
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
  {
    path: '/principal-view', // New Route
    element: <MainLayout><PrincipalDashboardLandingPage /></MainLayout>,
  },
  {
    path: '*',
    element: <MainLayout><div>Page Not Found</div></MainLayout>,
  }
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
