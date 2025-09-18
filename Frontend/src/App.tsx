import { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LoginForm } from './components/LoginForm';
import { CMMSSidebar } from './components/CMMSSidebar';
import { Dashboard } from './components/Dashboard';
import { AssetManagement } from './components/AssetManagement';
import { WorkOrderManagement } from './components/WorkOrderManagement';
import { PreventiveMaintenance } from './components/PreventiveMaintenance';
import { Helpdesk } from './components/Helpdesk';
import { InventoryManagement } from './components/InventoryManagement';
import { CalibrationManagement } from './components/CalibrationManagement';
import { DigitalLogbook } from './components/DigitalLogbook';
import { UserManagement } from './components/UserManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { BackendTestPanel } from './components/BackendTestPanel';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CMMS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'assets':
        return <AssetManagement />;
      case 'workorders':
        return <WorkOrderManagement />;
      case 'preventive':
        return <PreventiveMaintenance />;
      case 'helpdesk':
        return <Helpdesk />;
      case 'inventory':
        return <InventoryManagement />;
      case 'calibration':
        return <CalibrationManagement />;
      case 'logbook':
        return <DigitalLogbook />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <SystemSettings />;
      case 'backend-test':
        return <BackendTestPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <CMMSSidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Placeholder components for missing modules

function SystemSettings() {
  return (
    <div className="p-6">
      <h1>System Settings</h1>
      <p className="text-muted-foreground">
        System configuration and administration panel coming soon. This module will include:
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        <li>• Company and facility configuration</li>
        <li>• Email and notification settings</li>
        <li>• Workflow and approval processes</li>
        <li>• Data backup and restore</li>
        <li>• Integration settings</li>
        <li>• Security and audit configurations</li>
        <li>• Custom fields and forms</li>
      </ul>
    </div>
  );
}