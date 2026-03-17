import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Play, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { hasPermission } from '@/app/utils/permissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { ScriptDetail } from '@/app/components/pages/ScriptDetail';
import { ScriptExecuteDialog } from '@/app/components/dialogs/ScriptExecuteDialog';
import { scriptsApi } from '@/app/api/scripts';
import { scriptCategoriesApi } from '@/app/api/script-categories';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  date.setHours(date.getHours() + 8);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

interface Script {
  id: number;
  name: string;
  type: 'Python' | 'Shell';
  category: string;
  maintainer: string;
  updateTime: string;
  description?: string;
}

export function ScriptManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [scriptType, setScriptType] = useState('all');
  const [category, setCategory] = useState('all');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<number | undefined>();
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [categories, setCategories] = useState<{id: number; name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadData() {
    try {
      setLoading(true);
      const params: any = {
        page,
        size: 20
      };
      if (searchTerm) params.keyword = searchTerm;
      if (scriptType !== 'all') params.type = scriptType;
      if (category !== 'all') {
        const selectedCat = categories.find(c => c.name === category);
        if (selectedCat) params.category_id = selectedCat.id;
      }
      
      const res = await scriptsApi.getList(params);
      setScripts(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const res = await scriptCategoriesApi.getList();
      setCategories(res || []);
    } catch (err) {
      console.error("load categories error:", err);
    }
  }

  function handleDeleteClick(id: number) {
    setDeleteConfirmId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirmId) return;
    try {
      await scriptsApi.delete(deleteConfirmId);
      loadData();
    } catch (err) {
      console.error("delete error:", err);
    } finally {
      setDeleteConfirmId(null);
    }
  }

  function handleEdit(id: number) {
    setViewOnly(false);
    setSelectedScriptId(id);
    setShowDetail(true);
  }

  function handleView(id: number) {
    setViewOnly(true);
    setSelectedScriptId(id);
    setShowDetail(true);
  }

  function handleCreate() {
    setViewOnly(false);
    setSelectedScriptId(undefined);
    setShowDetail(true);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, searchTerm, scriptType, category]);

  // If showing detail view, render ScriptDetail component
  if (showDetail) {
    return <ScriptDetail onBack={() => { setShowDetail(false); loadData(); }} scriptId={selectedScriptId} viewOnly={viewOnly} />;
  }

  const filteredScripts = scripts.filter((script) => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = scriptType === 'all' || script.type === scriptType;
    const matchesCategory = category === 'all' || script.category === category;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeBadge = (type: string) => {
    const styles = {
      Python: 'bg-blue-50 text-blue-700 border-blue-200',
      Shell: 'bg-green-50 text-green-700 border-green-200',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-medium ${styles[type as keyof typeof styles]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">脚本管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理 Python 和 Shell 运维脚本</p>
        </div>
        {hasPermission("script:create") && (
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          新建脚本
        </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="按脚本名称搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Script Type Filter */}
            <div className="w-full lg:w-48">
              <Select value={scriptType} onValueChange={setScriptType}>
                <SelectTrigger>
                  <SelectValue placeholder="脚本类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Shell">Shell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scripts Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    脚本名称
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    维护人
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新时间
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-sm text-gray-500">
                      加载中...
                    </td>
                  </tr>
                ) : filteredScripts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-sm text-gray-500">
                      暂无匹配的脚本
                    </td>
                  </tr>
                ) : (
                  filteredScripts.map((script) => (
                    <tr 
                      key={script.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {script.name}
                          </span>
                          {script.description && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              {script.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getTypeBadge(script.type)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{script.category}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{script.maintainer}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{formatDate(script.updateTime)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Actions */}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setViewOnly(true); setSelectedScriptId(script.id); setShowDetail(true); }}
                            className="h-8 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission("script:execute") && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setSelectedScriptId(script.id); setShowExecuteDialog(true); }}
                            className="h-8 px-2 text-gray-600 hover:text-green-600 hover:bg-green-50"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          )}
                          
                          {/* More Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex items-center justify-center h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(script.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                查看详情
                              </DropdownMenuItem>
                              {hasPermission("script:update") && (
                              <DropdownMenuItem onClick={() => handleEdit(script.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑脚本
                              </DropdownMenuItem>
                              )}
                              {hasPermission("script:execute") && (
                              <DropdownMenuItem onClick={() => { setSelectedScriptId(script.id); setShowExecuteDialog(true); }}>
                                <Play className="mr-2 h-4 w-4" />
                                立即执行
                              </DropdownMenuItem>
                              )}
                              {hasPermission("script:delete") && (
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(script.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除脚本
                              </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {filteredScripts.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                显示 {filteredScripts.length} 条记录，共 {total} 条
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  上一页
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={filteredScripts.length < 20}>
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script Execute Dialog */}
      <ScriptExecuteDialog
        open={showExecuteDialog}
        onOpenChange={setShowExecuteDialog}
        scriptId={selectedScriptId}
        scriptName={filteredScripts.find(s => s.id === selectedScriptId)?.name}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除该脚本吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
