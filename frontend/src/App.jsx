import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Logout from "./pages/auth/Logout";
import ResetPassword from "./pages/auth/ResetPassword";
import Reports from "./pages/admin/Reports";
import Roles from "./pages/admin/Roles";
import Users from "./pages/admin/Users";
import Team from "./pages/manager/Team";
import Dashboard from "./pages/shared/Dashboard";
import ExpensesPage from "./pages/shared/ExpensesPage";
import NotFound from "./pages/shared/NotFound";
import Notifications from "./pages/shared/Notifications";
import Profile from "./pages/shared/Profile";
import ProjectsPage from "./pages/shared/ProjectsPage";
import Settings from "./pages/shared/Settings";
import TasksPage from "./pages/shared/TasksPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute roles={["Admin", "Manager", "Employee"]} />}>
        <Route element={<AppShell />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["Admin"]} />}>
        <Route element={<AppShell />}>
          <Route path="/admin/dashboard" element={<Dashboard role="Admin" />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/projects" element={<ProjectsPage role="Admin" canDelete />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/expenses" element={<ExpensesPage role="Admin" approver />} />
          <Route path="/admin/tasks" element={<TasksPage role="Admin" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["Manager"]} />}>
        <Route element={<AppShell />}>
          <Route path="/manager/dashboard" element={<Dashboard role="Manager" />} />
          <Route path="/manager/tasks" element={<TasksPage role="Manager" />} />
          <Route path="/manager/projects" element={<ProjectsPage role="Manager" />} />
          <Route path="/manager/expenses" element={<ExpensesPage role="Manager" approver />} />
          <Route path="/manager/team" element={<Team />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["Employee"]} />}>
        <Route element={<AppShell />}>
          <Route path="/employee/dashboard" element={<Dashboard role="Employee" />} />
          <Route path="/employee/tasks" element={<TasksPage role="Employee" employee />} />
          <Route path="/employee/expenses" element={<ExpensesPage role="Employee" />} />
          <Route path="/employee/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

