import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '../components/Layout';
// Comment out or remove old dashboard imports if they are fully replaced
// import { AdmissionsDashboard } from '../components/AdmissionsDashboard';
// import { AttendanceDashboard } from '../components/AttendanceDashboard';
// import { BillingDashboard } from '../components/BillingDashboard';
// import { StudentPerformanceDashboard } from '../components/StudentPerformanceDashboard';
import PrincipalDashboardLandingPage from '../components/PrincipalView/PrincipalDashboardLandingPage';
import {
  AdmissionsModule,
  AcademicPerformanceModule,
  AttendanceEngagementModule,
  BillingFeeCollectionModule,
  PlacementAlumniModule,
  DepartmentFacultyModule,
  GrievancesFeedbackModule,
  ComplianceAccreditationModule,
  InfrastructureFacilitiesModule,
  CustomReportsModule
} from '../components/PrincipalView/modules';

const router = createBrowserRouter([
  {
    path: '/',
    // Navigate to the principal-view dashboard by default
    element: <MainLayout><Navigate to="/principal-view" replace /></MainLayout>,
  },
  // {
  //   path: '/admissions',
  //   element: <MainLayout><AdmissionsDashboard /></MainLayout>,
  // },
  // {
  //   path: '/attendance',
  //   element: <MainLayout><AttendanceDashboard /></MainLayout>,
  // },
  // {
  //   path: '/billing',
  //   element: <MainLayout><BillingDashboard /></MainLayout>,
  // },
  // {
  //   path: '/performance',
  //   element: <MainLayout><StudentPerformanceDashboard /></MainLayout>,
  // },
  {
    path: '/principal-view',
    element: <MainLayout><Outlet /></MainLayout>, // Outlet for nested routes
    children: [
      {
        index: true, // This will render at /principal-view
        element: <PrincipalDashboardLandingPage />,
      },
      { path: 'admissions', element: <AdmissionsModule /> },
      { path: 'academic-performance', element: <AcademicPerformanceModule /> },
      { path: 'attendance-engagement', element: <AttendanceEngagementModule /> },
      { path: 'billing-fee-collection', element: <BillingFeeCollectionModule /> },
      { path: 'placement-alumni', element: <PlacementAlumniModule /> },
      { path: 'department-faculty', element: <DepartmentFacultyModule /> },
      { path: 'grievances-feedback', element: <GrievancesFeedbackModule /> },
      { path: 'compliance-accreditation', element: <ComplianceAccreditationModule /> },
      { path: 'infrastructure-facilities', element: <InfrastructureFacilitiesModule /> },
      { path: 'custom-reports', element: <CustomReportsModule /> },
    ]
  },
  // Redirects for old paths
  {
    path: '/admissions',
    element: <Navigate to="/principal-view/admissions" replace />,
  },
  {
    path: '/attendance',
    element: <Navigate to="/principal-view/attendance-engagement" replace />,
  },
  {
    path: '/billing',
    element: <Navigate to="/principal-view/billing-fee-collection" replace />,
  },
  {
    path: '/performance',
    element: <Navigate to="/principal-view/academic-performance" replace />,
  },
  {
    path: '*', // Catch-all for 404
    element: <MainLayout><div>Page Not Found</div></MainLayout>,
  }
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
