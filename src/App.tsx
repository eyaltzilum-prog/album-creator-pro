/**
 * App Router v1.1
 * ⚠️ ROUTING RULES:
 * - <BrowserRouter> is in main.tsx. DO NOT add another router here.
 * - Use <Routes> and <Route> for routing. DO NOT use useRoutes().
 * - Page components must be static imports (no React.lazy).
 * - Import from 'react-router', NOT 'react-router-dom'.
 */
import { Routes, Route, Navigate } from 'react-router';

// Pages
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminClients from '@/pages/admin/Clients';
import AdminAssets from '@/pages/admin/Assets';
import AdminReviews from '@/pages/admin/Reviews';
import AdminSettings from '@/pages/admin/Settings';
import AdminTemplateBuilder from '@/pages/admin/TemplateBuilder';
import ClientProjects from '@/pages/client/Projects';
import ClientEditor from '@/pages/client/Editor';

// Layouts
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/clients" element={<AdminLayout><AdminClients /></AdminLayout>} />
      <Route path="/admin/assets" element={<AdminLayout><AdminAssets /></AdminLayout>} />
      <Route path="/admin/reviews" element={<AdminLayout><AdminReviews /></AdminLayout>} />
      <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
      <Route path="/admin/templates/builder" element={<AdminLayout><AdminTemplateBuilder /></AdminLayout>} />
      <Route path="/admin/templates/builder/:templateId" element={<AdminLayout><AdminTemplateBuilder /></AdminLayout>} />
      
      {/* Client Routes */}
      <Route path="/projects" element={<ClientLayout><ClientProjects /></ClientLayout>} />
      <Route path="/editor/:projectId" element={<ClientEditor />} />
      
      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
