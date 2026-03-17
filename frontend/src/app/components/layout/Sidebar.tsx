import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileCode, 
  Calendar, 
  ListChecks, 
  Server, 
  Settings,
  Users,
  FolderTree,
  Bell,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'scripts', label: '脚本管理', icon: FileCode },
  { id: 'tasks', label: '任务调度', icon: Calendar },
  { id: 'executions', label: '执行记录', icon: ListChecks },
  { id: 'nodes', label: '节点管理', icon: Server },
  { 
    id: 'settings', 
    label: '系统设置', 
    icon: Settings,
    children: [
      { id: 'settings-users', label: '用户与权限' },
      { id: 'settings-categories', label: '脚本分类管理' },
      { id: 'settings-environment', label: '执行环境配置' },
      { id: 'settings-notification', label: '通知配置' },
      { id: 'settings-security', label: '安全设置' },
      { id: 'settings-system', label: '系统参数' },
    ]
  },
];

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
  expandedMenus: string[];
  onToggleExpand: (menuId: string) => void;
}

export function Sidebar({ activeMenu, onMenuChange, expandedMenus, onToggleExpand }: SidebarProps) {
  const isExpanded = (menuId: string) => expandedMenus.includes(menuId);

  const handleClick = (item: MenuItem) => {
    if (item.children) {
      onToggleExpand(item.id);
    } else {
      onMenuChange(item.id);
    }
  };

  const handleSubMenuClick = (subMenuId: string) => {
    onMenuChange(subMenuId);
  };

  return (
    <aside className="w-56 bg-[#1a1d23] text-gray-200 flex flex-col min-h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 flex-shrink-0 flex items-center px-5 border-b border-gray-700/50">
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
      <nav className="flex-1 overflow-hidden">
        <ul className="space-y-1 px-3 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id || (item.children && item.children.some(child => activeMenu === child.id));
            const isMenuExpanded = isExpanded(item.id);
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item)}
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
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                  {item.children && (
                    isMenuExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Submenu */}
                {item.children && isMenuExpanded && (
                  <ul className="ml-4 mt-1 space-y-0.5">
                    <li className="h-px bg-gray-700/50 mx-2 my-2"></li>
                    {item.children.map((child) => {
                      const isSubActive = activeMenu === child.id;
                      return (
                        <li key={child.id}>
                          <button
                            onClick={() => handleSubMenuClick(child.id)}
                            className={`
                              w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                              transition-all duration-150
                              ${isSubActive 
                                ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500 ml-2' 
                                : 'text-gray-400 hover:bg-gray-700/30 hover:text-gray-200 ml-2'
                              }
                            `}
                          >
                            {child.label}
                          </button>
                        </li>
                      );
                    })}
                    <li className="h-px bg-gray-700/50 mx-2 my-2"></li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-700/50">
        <div className="text-xs text-gray-500">
          v1.0.0 | 运维中心
        </div>
      </div>
    </aside>
  );
}
