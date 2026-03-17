import { useState, useEffect } from 'react';
import { Save, Play, ArrowLeft, Copy, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { hasPermission } from '@/app/utils/permissions';
import { formatDate } from '@/app/utils/datetime';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { ScriptExecuteDialog } from '@/app/components/dialogs/ScriptExecuteDialog';
import { copyToClipboard } from '@/app/utils/clipboard';
import { scriptsApi } from '@/app/api/scripts';
import { scriptCategoriesApi, Category } from '@/app/api/script-categories';

interface ScriptDetailProps {
  onBack?: () => void;
  scriptId?: number;
  viewOnly?: boolean;
}

interface ScriptFormData {
  id?: number;
  name: string;
  description: string;
  type: 'Python' | 'Shell' | 'Go';
  category_id: number;
  category_name?: string;
  maintainer: string;
  content: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export function ScriptDetail({ onBack, scriptId, viewOnly = false }: ScriptDetailProps) {
  const [script, setScript] = useState<ScriptFormData>({
    name: '',
    description: '',
    type: 'Python',
    category_id: 0,
    maintainer: '',
    content: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const isNew = !scriptId;

  async function loadCategories() {
    try {
      const res = await scriptCategoriesApi.getList();
      setCategories(res || []);
    } catch (err) {
      console.error("load categories error:", err);
    }
  }

  async function loadScript() {
    if (!scriptId) return;
    try {
      setLoading(true);
      setError('');
      const res = await scriptsApi.getDetail(scriptId);
      if (res) {
        setScript({
          name: res.name || '',
          description: res.description || '',
          type: (res.type as 'Python' | 'Shell' | 'Go') || 'Python',
          category_id: res.category_id || 0,
          category_name: res.category,
          maintainer: res.maintainer || '',
          content: res.content || '',
          created_by: res.created_by,
          created_at: res.created_at,
          updated_at: res.updateTime
        });
      }
    } catch (err: any) {
      console.error("load script error:", err);
      setError(err.response?.data?.message || '加载脚本失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!script.name || !script.type || !script.category_id || !script.content) {
      setError('请填写所有必填字段');
      return;
    }
    try {
      setSaving(true);
      setError('');
      if (isNew) {
        await scriptsApi.create({
          name: script.name,
          type: script.type,
          category_id: script.category_id,
          content: script.content,
          description: script.description,
          maintainer: script.maintainer
        });
      } else {
        await scriptsApi.update(scriptId!, {
          name: script.name,
          type: script.type,
          category_id: script.category_id,
          content: script.content,
          description: script.description,
          maintainer: script.maintainer
        });
      }
      onBack?.();
    } catch (err: any) {
      console.error("save error:", err);
      setError(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadScript();
  }, [scriptId]);

  const handleCopyCode = async () => {
    const success = await copyToClipboard(script.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const lineNumbers = script.content.split('\n').length;

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? '新建脚本' : viewOnly ? '查看脚本' : script.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{isNew ? '创建新的脚本' : viewOnly ? '查看脚本详情' : '编辑脚本信息和代码'}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Script Info */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>脚本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Script Name */}
              <div className="space-y-2">
                <Label htmlFor="name">脚本名称 *</Label>
                <Input
                  id="name"
                  value={script.name}
                  onChange={(e) => setScript({ ...script, name: e.target.value })}
                  placeholder="输入脚本名称"
                  disabled={viewOnly}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={script.description}
                  onChange={(e) => setScript({ ...script, description: e.target.value })}
                  placeholder="输入脚本描述"
                  rows={3}
                  disabled={viewOnly}
                />
              </div>

              {/* Script Type */}
              <div className="space-y-2">
                <Label htmlFor="type">脚本类型 *</Label>
                <Select value={script.type} onValueChange={(value: any) => setScript({ ...script, type: value })} disabled={viewOnly}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Shell">Shell</SelectItem>
                    <SelectItem value="Go">Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">分类 *</Label>
                <Select value={script.category_id.toString()} onValueChange={(value) => setScript({ ...script, category_id: parseInt(value) })} disabled={viewOnly}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Maintainer */}
              <div className="space-y-2">
                <Label htmlFor="maintainer">维护人 *</Label>
                <Input
                  id="maintainer"
                  value={script.maintainer}
                  onChange={(e) => setScript({ ...script, maintainer: e.target.value })}
                  placeholder="输入维护人"
                  disabled={viewOnly}
                />
              </div>

              {/* Timestamps (only show for existing scripts) */}
              {!isNew && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>创建人：</span>
                    <span>{script.created_by || '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>创建时间：</span>
                    <span>{formatDate(script.created_at) || '-'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>更新时间：</span>
                    <span>{formatDate(script.updated_at) || '-'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Code Editor */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>脚本代码</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{lineNumbers} 行</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-8"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      复制
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Code Editor Container */}
              <div className="relative">
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 py-4 text-right pr-3 select-none overflow-hidden">
                  {Array.from({ length: lineNumbers }, (_, i) => (
                    <div
                      key={i + 1}
                      className="text-xs text-gray-400 leading-6 font-mono"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Code Editor */}
                <textarea
                  value={script.content}
                  onChange={(e) => setScript({ ...script, content: e.target.value })}
                  className="w-full min-h-[600px] pl-16 pr-4 py-4 font-mono text-sm leading-6 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset bg-white"
                  spellCheck={false}
                  disabled={viewOnly}
                  style={{
                    tabSize: 4,
                  }}
                />
              </div>

              {/* Editor Footer */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>UTF-8</span>
                  <span>{script.type}</span>
                  <span>空格: 4</span>
                </div>
                <div>
                  字符数: {script.content.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        {!isNew && hasPermission("script:execute") && (
          <Button
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50"
            onClick={() => setExecuteDialogOpen(true)}
          >
            <Play className="w-4 h-4 mr-2" />
            执行脚本
          </Button>
        )}
        {!viewOnly && hasPermission(isNew ? "script:create" : "script:update") && (
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存修改'}
          </Button>
        )}
      </div>

      {/* Script Execute Dialog */}
      {!isNew && (
        <ScriptExecuteDialog
          open={executeDialogOpen}
          onOpenChange={setExecuteDialogOpen}
          scriptId={scriptId}
          scriptName={script.name}
        />
      )}
    </div>
  );
}