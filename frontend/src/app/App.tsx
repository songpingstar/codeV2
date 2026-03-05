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
import { UserProfile } from '@/app/components/pages/UserProfile';
import { AccountSettings } from '@/app/components/pages/AccountSettings';

export default function App() {
  const [activeMenu, setActiveMenu] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      return hash || localStorage.getItem('activeMenu') || 'dashboard';
    }
    return 'dashboard';
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
    window.location.hash = activeMenu;
  }, [activeMenu]);

  const handleLogout = () => {
    // 登出处理（可以添加清理逻辑）
    console.log('Logout clicked');
  };

  const renderPage = () => {
    // Handle node detail view
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
        return <SystemSettings />;
      case 'profile':
        return <UserProfile />;
      case 'account-settings':
        return <AccountSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      
      {/* Header */}
      <Header onLogout={handleLogout} onNavigate={setActiveMenu} />
      
      {/* Main Content */}
      <main className="ml-56 mt-16 p-6">
        <div className="max-w-[1440px] mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}