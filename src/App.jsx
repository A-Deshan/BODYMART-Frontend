import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DeliveriesPage from './pages/DeliveriesPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MembershipsPage from './pages/MembershipsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import WorkoutPlansPage from './pages/WorkoutPlansPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedLayout />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="/products"
          element={<ProductsPage />}
        />
        <Route
          path="/inventory"
          element={<InventoryPage />}
        />
        <Route
          path="/users"
          element={<UsersPage />}
        />
        <Route
          path="/memberships"
          element={<MembershipsPage />}
        />
        <Route
          path="/orders"
          element={<OrdersPage />}
        />
        <Route
          path="/deliveries"
          element={<DeliveriesPage />}
        />
        <Route
          path="/reports"
          element={<ReportsPage />}
        />
        <Route
          path="/workout-plans"
          element={<WorkoutPlansPage />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
