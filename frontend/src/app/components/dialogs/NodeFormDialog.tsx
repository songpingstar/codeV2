import { useState } from 'react';
import { Server, Terminal, Copy, Check, Info, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { copyToClipboard } from '@/app/utils/clipboard';

interface NodeFormData {
  name: string;
  ip: string;
  environment: 'dev' | 'test' | 'prod';
  tags: string;
}

interface NodeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NodeFormData) => void;
  formData: NodeFormData;
  setFormData: (data: NodeFormData) => void;
  mode: 'add' | 'edit';
}

export function NodeFormDialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  mode,
}: NodeFormDialogProps) {
  const [copiedCommand, setCopiedCommand] = useState(false);

  const installCommand = `curl -fsSL https://ops-agent.example.com/install.sh | sudo bash -s -- --server=${formData.ip || '<NODE_IP>'}`;

  const handleCopyCommand = async () => {
    const success = await copyToClipboard(installCommand);
    if (success) {
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name.trim() || !formData.ip.trim()) {
      alert('请填写节点名称和 IP 地址');
      return;
    }
    onSubmit(formData);
  };

  const isAddMode = mode === 'add';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            {isAddMode ? '新增节点' : '编辑节点'}
          </DialogTitle>
          <DialogDescription>
            {isAddMode 
              ? '添加新的脚本执行节点到系统中，并配置 Agent 进行管理' 
              : '修改节点配置信息'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Info className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-700">基本信息</h4>
            </div>

            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="node-name">
                  节点名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="node-name"
                  placeholder="例如: web-server-01"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  使用易于识别的名称，建议包含服务器用途和编号
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-ip">
                  IP 地址 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="node-ip"
                  placeholder="例如: 192.168.1.10"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  节点的可访问 IP 地址，确保管理平台能够连接到此地址
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="node-env">
                    所属环境 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.environment}
                    onValueChange={(value: 'dev' | 'test' | 'prod') =>
                      setFormData({ ...formData, environment: value })
                    }
                  >
                    <SelectTrigger id="node-env">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>开发环境 (DEV)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="test">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span>测试环境 (TEST)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="prod">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>生产环境 (PROD)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="node-tags">节点标签</Label>
                  <Input
                    id="node-tags"
                    placeholder="例如: web, nginx"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  💡 标签用于标识节点类型和用途，多个标签用逗号分隔
                </p>
              </div>
            </div>
          </div>

          {/* Agent Installation Instructions (Only for Add Mode) */}
          {isAddMode && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Terminal className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-medium text-gray-700">Agent 安装说明</h4>
              </div>

              <div className="pl-6 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      为什么需要安装 Agent？
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Agent 是运行在目标节点上的轻量级守护进程，负责接收和执行来自管理平台的脚本任务，并实时上报节点状态和资源使用情况。
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    步骤 1: SSH 登录到目标节点
                  </Label>
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <code className="text-xs text-green-400 font-mono">
                      ssh root@{formData.ip || '<NODE_IP>'}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    步骤 2: 执行安装命令
                  </Label>
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 relative group">
                    <code className="text-xs text-green-400 font-mono break-all">
                      {installCommand}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyCommand}
                      className="absolute top-2 right-2 h-7 px-2 bg-gray-800 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedCommand ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    点击代码块右上角复制按钮快速复制安装命令
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    步骤 3: 验证安装
                  </Label>
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <code className="text-xs text-green-400 font-mono">
                      systemctl status ops-agent
                    </code>
                  </div>
                  <p className="text-xs text-gray-500">
                    确认 Agent 服务状态为 <span className="text-green-600 font-medium">active (running)</span>
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-yellow-900">注意事项</p>
                    <ul className="text-xs text-yellow-700 mt-1.5 space-y-1 list-disc list-inside">
                      <li>需要 root 权限或具有 sudo 权限的用户执行安装</li>
                      <li>确保节点能够访问互联网下载 Agent 安装包</li>
                      <li>安装完成后 Agent 会自动启动并连接到管理平台</li>
                      <li>首次连接可能需要 1-2 分钟，请耐心等待节点状态变为在线</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
          >
            {isAddMode ? '确认添加' : '保存修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}