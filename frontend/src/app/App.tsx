import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { Header } from '@/app/components/layout/Header';
import { Dashboard } from '@/app/components/pages/Dashboard';
import { ScriptManagement } from '@/app/components/pages/ScriptManagement';
import { TaskScheduling } from '@/app/components/pages/TaskScheduling';
import { ExecutionRecords } from '@/app/components/pages/ExecutionRecords';
import { NodeManagement } from '@/app/components/pages/NodeManagement';
import { NodeDetail } from '@/app/components/pages/NodeDetail';
import { SystemSettings } from '@/app/components/pages/SystemSettings';
import { UserPermissionManagement } from '@/app/components/pages/UserPermissionManagement';
import { EnvironmentConfiguration } from '@/app/components/pages/EnvironmentConfiguration';
import { NotificationConfiguration } from '@/app/components/pages/NotificationConfiguration';
import { SecurityConfiguration } from '@/app/components/pages/SecurityConfiguration';
import { SystemParameterConfiguration } from '@/app/components/pages/SystemParameterConfiguration';
import { UserProfile } from '@/app/components/pages/UserProfile';
import { AccountSettings } from '@/app/components/pages/AccountSettings';
import { LoginPage } from '@/app/components/pages/LoginPage';
import { getToken, clearAuth } from '@/app/utils/permissions';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const token = getToken();
      return !!token;
    }
    return false;
  });
  const [activeMenu, setActiveMenu] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      return hash || localStorage.getItem('activeMenu') || 'dashboard';
    }
    return 'dashboard';
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
    window.location.hash = activeMenu;
  }, [activeMenu]);

  useEffect(() => {
    const settingsSubMenus = [
      'settings-users',
      'settings-categories', 
      'settings-environment',
      'settings-notification',
      'settings-security',
      'settings-system'
    ];
    
    if (settingsSubMenus.includes(activeMenu) && !expandedMenus.includes('settings')) {
      setExpandedMenus(prev => [...prev, 'settings']);
    }
  }, [activeMenu]);

  useEffect(() => {
    const savedExpanded = localStorage.getItem('expandedMenus');
    if (savedExpanded) {
      setExpandedMenus(JSON.parse(savedExpanded));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus));
  }, [expandedMenus]);

  const handleToggleExpand = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setActiveMenu('dashboard');
  };

  const getSettingComponent = (menuId: string) => {
    switch (menuId) {
      case 'settings-users':
        return <UserPermissionManagement />;
      case 'settings-categories':
        return <SystemSettings initialSection="categories" />;
      case 'settings-environment':
        return <EnvironmentConfiguration />;
      case 'settings-notification':
        return <NotificationConfiguration />;
      case 'settings-security':
        return <SecurityConfiguration />;
      case 'settings-system':
        return <SystemParameterConfiguration />;
      default:
        return <UserPermissionManagement />;
    }
  };

  const renderPage = () => {
    if (activeMenu === 'node-detail' && selectedNodeId) {
      return (
        <NodeDetail 
          nodeId={selectedNodeId} 
          onBack={() => {
            setActiveMenu('nodes');
            setSelectedNodeId(null);
          }} 
        />
      );
    }

    const settingsSubMenus = [
      'settings-users',
      'settings-categories', 
      'settings-environment',
      'settings-notification',
      'settings-security',
      'settings-system'
    ];

    if (settingsSubMenus.includes(activeMenu)) {
      return getSettingComponent(activeMenu);
    }

    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'scripts':
        return <ScriptManagement />;
      case 'tasks':
        return <TaskScheduling />;
      case 'executions':
        return <ExecutionRecords />;
      case 'nodes':
        return (
          <NodeManagement 
            onViewNode={(nodeId: string) => {
              setSelectedNodeId(nodeId);
              setActiveMenu('node-detail');
            }} 
          />
        );
      case 'settings':
        return <UserPermissionManagement />;
      case 'profile':
        return <UserProfile />;
      case 'account-settings':
        return <AccountSettings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu} 
        expandedMenus={expandedMenus}
        onToggleExpand={handleToggleExpand}
      />
      
      <Header onLogout={handleLogout} onNavigate={setActiveMenu} />
      
      <main className="ml-56 mt-16 p-6 min-h-screen bg-gray-50">
        <div className="max-w-[1440px] mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
