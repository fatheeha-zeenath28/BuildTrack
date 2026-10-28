
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Photos from './pages/Photos';
import Users from './pages/Users';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000 }}
      />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected application pages */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="projects"
            element={<Projects />}
          />

          <Route
            path="projects/:id"
            element={<ProjectDetail />}
          />

          <Route
            path="tasks"
            element={<Tasks />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="photos"
            element={<Photos />}
          />

          <Route
            path="users"
            element={
              <PrivateRoute roles={['admin']}>
                <Users />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Redirect unknown URLs */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </AuthProvider>
  );
}
