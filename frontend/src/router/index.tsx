import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../AppLayout';
import { CostAnalytics } from '../pages/CostAnalytics';
import { Dashboard } from '../pages/Dashboard';
import { FleetTracking } from '../pages/FleetTracking';
import { ShipmentMonitor } from '../pages/ShipmentMonitor';
import { WarehouseAnalytics } from '../pages/WarehouseAnalytics';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'shipments', element: <ShipmentMonitor /> },
      { path: 'warehouse-analytics', element: <WarehouseAnalytics /> },
      { path: 'fleet', element: <FleetTracking /> },
      { path: 'cost-analytics', element: <CostAnalytics /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
