import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";
import Productores from "../pages/Productores";
import Productos from "../pages/Productos";
import Ventas from "../pages/Ventas";
import Comprobadores from "../pages/Comprobadores";
import AdminForms from "../pages/AdminForms";
import Unauthorized from "../pages/Unauthorized";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<AdminRoute><DashboardLayout /></AdminRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/productores" element={<Productores />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/comprobadores" element={<Comprobadores />} />
          <Route path="/admin-forms" element={<AdminForms />} />
        </Route>
        
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
