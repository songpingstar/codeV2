import { useState, useEffect } from 'react';
import { Server, Copy, Check, Info, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { copyToClipboard } from '@/app/utils/clipboard';

interface NodeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateToken?: () => void;
  generatedToken?: string;
  mode: 'add' | 'edit';
  onSubmit?: () => void;
  formData?: any;
  setFormData?: (data: any) => void;
}

export function NodeFormDialog({
  isOpen,
  onClose,
  onGenerateToken = () => {},
  generatedToken,
  mode,
  onSubmit,
  formData,
  setFormData,
}: NodeFormDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showAgentGuide, setShowAgentGuide] = useState(false);
  const [localToken, setLocalToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen && generatedToken) {
      setLocalToken(generatedToken);
    }
  }, [isOpen, generatedToken]);

  const handleCopy = async () => {
    if (localToken) {
      const success = await copyToClipboard(localToken);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleClose = () => {
    setCopied(false);
    setShowAgentGuide(false);
    onClose();
  };

  const isAddMode = mode === 'add';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Info className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-700">基本信息</h4>
            </div>

            {isAddMode ? (
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label>Token</Label>
                  <div className="flex gap-2">
                    <Input
                      value={localToken || ''}
                      readOnly
                      disabled
                      placeholder="点击生成 Token"
                      className="font-mono text-sm bg-gray-100"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      disabled={!localToken}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Token 用于 Agent 注册认证，请妥善保管
                  </p>
                </div>

                <div className="flex justify-end">
                  {isAddMode && (
                    <Button
                      onClick={onGenerateToken}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      生成新 Token
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label>节点名称</Label>
                  <Input
                    value={formData?.name || ''}
                    onChange={(e) => setFormData?.({ ...formData, name: e.target.value })}
                    placeholder="请输入节点名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label>IP地址</Label>
                  <Input
                    value={formData?.ip || ''}
                    disabled
                    placeholder="请输入IP地址"
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>环境</Label>
                  <Select
                    value={formData?.environment || ''}
                    onValueChange={(value) => setFormData?.({ ...formData, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择环境" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">开发环境</SelectItem>
                      <SelectItem value="test">测试环境</SelectItem>
                      <SelectItem value="prod">生产环境</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>标签</Label>
                  <Input
                    value={formData?.tags || ''}
                    onChange={(e) => setFormData?.({ ...formData, tags: e.target.value })}
                    placeholder="请输入标签，用逗号分隔"
                  />
                </div>
              </div>
            )}
          </div>

          {isAddMode && (
            <div className="space-y-4">
              <div 
                className="flex items-center gap-2 pb-2 border-b cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded"
                onClick={() => setShowAgentGuide(!showAgentGuide)}
              >
                {showAgentGuide ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <h4 className="text-sm font-medium text-gray-700">Agent 安装说明</h4>
              </div>

              {showAgentGuide && (
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
                        ssh root@&lt;NODE_IP&gt;
                      </code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">
                      步骤 2: 下载并配置 Agent
                    </Label>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <code className="text-xs text-green-400 font-mono break-all">
                        {localToken ? `token=${localToken}` : '请先点击上方按钮生成 Token'}
                      </code>
                    </div>
                    <p className="text-xs text-gray-500">
                      将 Token 配置到 Agent 的 config.yaml 文件中
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">
                      步骤 3: 启动 Agent
                    </Label>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <code className="text-xs text-green-400 font-mono">
                        python agent.py
                      </code>
                    </div>
                    <p className="text-xs text-gray-500">
                      Agent 启动后自动使用 Token 注册并连接到管理平台
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-yellow-900">注意事项</p>
                      <ul className="text-xs text-yellow-700 mt-1.5 space-y-1 list-disc list-inside">
                        <li>需要 root 权限或具有 sudo 权限的用户执行安装</li>
                        <li>确保节点能够访问管理平台</li>
                        <li>首次连接可能需要 1-2 分钟，请耐心等待节点状态变为在线</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!isAddMode && onSubmit && (
            <Button onClick={onSubmit}>
              保存
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
