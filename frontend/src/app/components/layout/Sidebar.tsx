import { 
  LayoutDashboard, 
  FileCode, 
  Calendar, 
  ListChecks, 
  Server, 
  Settings 
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'scripts', label: '脚本管理', icon: FileCode },
  { id: 'tasks', label: '任务调度', icon: Calendar },
  { id: 'executions', label: '执行记录', icon: ListChecks },
  { id: 'nodes', label: '节点管理', icon: Server },
  { id: 'settings', label: '系统设置', icon: Settings },
];

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  return (
    <aside className="w-56 bg-[#1a1d23] text-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">运维调度</div>
            <div className="text-xs text-gray-400">OpsScheduler</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onMenuChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                    transition-all duration-150
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="text-xs text-gray-500">
          v1.0.0 | 运维中心
        </div>
      </div>
    </aside>
  );
}
