---
name: "frontend-development-workflow"
description: "引导完整的前端开发流程，从设计到代码实现。包括新功能开发、问题调试、代码重构、性能优化等。适用于前端任何代码变更时调用。"
---

# 前端开发工作流

根据功能需求文档和API映射表进行前端开发。

## 适用场景

当用户需要：
- 新增前端页面或组件
- 前端功能开发
- 前端与后端API集成
- 前端UI组件创建
- 用户要求调试、分析前端问题
- 用户要求清理、优化、重构前端代码

**⚠️ 关键触发条件：在修改任何前端代码前，必须先检查是否符合本工作流规范**

## 工作流程

### 第一阶段：环境准备

**任务：** 确保前端开发环境就绪

**检查项：**
1. Node.js 版本 >= 18
2. pnpm/npm 已安装
3. 前端依赖已安装 (`pnpm install`)
4. 后端服务已启动（用于API测试）
5. 环境配置文件 `.env` 存在

**启动命令：**
```bash
cd frontend
pnpm dev
```

---

### 第二阶段：需求分析

**任务：** 分析功能需求，确定前端实现方案

**输入文档：**
- `doc/requirements/` - 功能需求文档
- `doc/api/07_api_mapping_table.md` - API接口映射表
- `doc/api/05_openapi.yaml` - OpenAPI规范
- Figma设计稿（如果有）

**分析内容：**
1. 页面结构：有哪些页面/路由
2. 组件层级：父组件、子组件关系
3. 状态管理：需要管理的状态类型
4. API调用：页面需要调用的接口
5. 用户交互：按钮、表单、弹框等

---

### 第三阶段：目录结构规范

**任务：** 按照项目规范创建文件

**前端目录结构：**
```
frontend/src/
├── app/                        # Next.js App Router
│   ├── api/                   # API调用层
│   │   ├── request.ts         # axios实例配置
│   │   ├── scripts.ts         # 脚本管理API
│   │   ├── tasks.ts           # 任务调度API
│   │   ├── executions.ts      # 执行记录API
│   │   ├── nodes.ts           # 节点管理API
│   │   ├── users.ts           # 用户权限API
│   │   ├── script-categories.ts
│   │   ├── system-configs.ts
│   │   ├── auth.ts            # 认证API
│   │   └── agent.ts           # Agent通信API
│   ├── components/            # 组件目录
│   │   ├── ui/                # UI基础组件库
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── ...
│   │   └── pages/             # 页面组件
│   │       ├── ScriptManagement.tsx
│   │       ├── ScriptDetail.tsx
│   │       ├── TaskScheduling.tsx
│   │       ├── ExecutionHistory.tsx
│   │       ├── NodeManagement.tsx
│   │       └── ...
│   └── layout.tsx             # 布局组件
├── styles/
│   └── globals.css             # 全局样式
└── package.json
```

**命名规范：**
- 页面组件：`PascalCase`（如 `ScriptManagement.tsx`）
- 工具函数：`camelCase`（如 `formatDate.ts`）
- CSS类名：`kebab-case`（如 `text-red-600`）

**每次新增组件或者改动前端页面代码时，都需要检查是否符合目录结构规范和命名规范。**

---

### 第四阶段：组件开发

**任务：** 创建React组件

**组件类型：**

#### 1. 页面组件
位置：`app/components/pages/`
特征：
- 包含完整业务逻辑
- 管理页面状态
- 调用API层
- 处理用户交互

#### 2. 业务组件
位置：`app/components/`
特征：
- 可复用的业务逻辑
- 接收props传递数据
- 独立于具体页面

#### 3. UI组件
位置：`app/components/ui/`
特征：
- 基础UI组件
- 无业务逻辑
- 可在多个场景复用

**开发步骤：**

#### 第一步：创建组件文件

```typescript
// app/components/pages/ScriptManagement.tsx
import { useState, useEffect } from 'react';
```

#### 第二步：定义类型

```typescript
interface Script {
  id: number;
  name: string;
  type: string;
  category?: string;
  maintainer?: string;
  updateTime?: string;
}
```

#### 第三步：实现组件逻辑

```typescript
export function ScriptManagement() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await scriptsApi.list();
      setScripts(res.items || []);
    } catch (err) {
      console.error("load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    // JSX结构
  );
}
```

---

### 第五阶段：API集成

**任务：** 将组件与后端API连接

**API层规范：**
- 位置：`app/api/`
- 底层：`request.ts` 配置axios实例
- 模块：按功能模块划分API文件

**API调用示例：**

```typescript
// app/api/scripts.ts
import request from "./request";

export const scriptsApi = {
  list: (params?: any) => request.get("/scripts", { params }),
  get: (id: number) => request.get(`/scripts/${id}`),
  create: (data: any) => request.post("/scripts", data),
  update: (id: number, data: any) => request.put(`/scripts/${id}`, data),
  delete: (id: number) => request.delete(`/scripts/${id}`),
};
```

**在组件中使用：**

```typescript
import { scriptsApi } from '@/app/api/scripts';

async function loadData() {
  const res = await scriptsApi.list({ page: 1, size: 20 });
  setScripts(res.items);
}
```

---

### 第六阶段：UI交互处理

**任务：** 实现用户交互功能

#### 1. 按钮点击

```typescript
async function handleCreate() {
  await scriptsApi.create(formData);
  loadData();
}
```

#### 2. 表单提交

```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  await scriptsApi.update(id, formData);
  onSuccess();
}
```

#### 3. 删除确认（⚠️ 重要）

**禁止使用系统原生弹框，必须使用AlertDialog：**

---

### 第七阶段：样式与响应式

**任务：** 确保UI美观且响应式

**样式规范：**
- 使用 Tailwind CSS
- 保持与现有组件风格一致
- 使用 `shadcn/ui` 组件库

**常用类名：**
- 布局：`flex`, `grid`, `container`
- 间距：`p-4`, `m-4`, `gap-2`
- 颜色：`text-gray-600`, `bg-white`, `border-gray-200`
- 响应式：`md:flex`, `lg:grid-cols-3`

---

### 第八阶段：测试与调试

**任务：** 确保功能正常

**检查项：**
1. 页面正常加载
2. 数据正确显示
3. 按钮点击有效
4. 表单提交正常
5. 删除确认弹框正常
6. 错误处理正常

**调试命令：**
```bash
# 前端开发服务器
cd frontend
pnpm dev

# 检查TypeScript错误
pnpm tsc --noEmit

# 运行 lint
pnpm lint
```

---

## API模块映射表

| 页面 | API模块 | 文件路径 |
|------|---------|----------|
| Dashboard | dashboard | `src/api/dashboard.ts` |
| ScriptManagement | scripts | `src/api/scripts.ts` |
| ScriptDetail | scripts | `src/api/scripts.ts` |
| TaskScheduling | tasks | `src/api/tasks.ts` |
| TaskDialog | tasks | `src/api/tasks.ts` |
| ExecutionHistory | executions | `src/api/executions.ts` |
| LogDetail | executions | `src/api/executions.ts` |
| NodeManagement | nodes | `src/api/nodes.ts` |
| NodeDetail | nodes | `src/api/nodes.ts` |
| NodeFormDialog | nodes | `src/api/nodes.ts` |
| UserPermissionManagement | users | `src/api/users.ts` |
| UserProfile | users | `src/api/users.ts` |
| SystemSettings | script-categories | `src/api/script-categories.ts` |
| SystemSettings | system-configs | `src/api/system-configs.ts` |
| - | auth | `src/api/auth.ts` |
| - | agent | `src/api/agent.ts` |

---

## 注意事项

1. **UI一致性：** 使用 shadcn/ui 组件库，保持界面风格统一
2. **禁止原生弹框：** 所有删除和确认操作必须使用 AlertDialog
3. **类型安全：** 使用 TypeScript 类型定义
4. **错误处理：** 所有 API 调用都要有 try-catch
5. **状态管理：** 合理使用 useState 和 useEffect
6. **代码规范：** 遵循 ESLint 规则
7. **时间显示规范：** 所有时间显示必须为北京时间（UTC+8），格式为 `YYYY-MM-DD HH:mm:ss`
8. **页面状态持久化：** 使用 URL hash 保持当前页面状态，刷新页面时保持当前页面


## 时间处理最佳实践

### 统一使用北京时间

前端在处理时间时必须统一使用北京时间（UTC+8），确保与后端保持一致。

### 实现方式

1. **创建时间工具模块** `src/app/utils/datetime.ts`：
```typescript
export function nowBeijing(): Date {
  const now = new Date();
  const beijingOffset = 8 * 60 * 60 * 1000;
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + beijingOffset);
}

export function formatDate(dateStr: string): string {
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
```

2. **使用场景**：
   - 时间计算/比较：`const now = nowBeijing()`（如心跳超时判断）
   - 时间显示：`<span>{formatDate(node.last_heartbeat)}</span>`

3. **注意事项**：
   - 后端返回的 ISO 字符串已包含时区信息，直接用 `new Date()` 解析
   - 本地时间比较用 `nowBeijing()`，显示用 `formatDate()`

## 页面状态持久化

使用 URL hash 保存当前访问的页面，刷新时直接定位到之前页面：

```typescript
export default function App() {
  const [activeMenu, setActiveMenu] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      return hash || localStorage.getItem('activeMenu') || 'dashboard';
    }
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
    window.location.hash = activeMenu;
  }, [activeMenu]);
}
```

## 参考文档

- `doc/api/07_api_mapping_table.md` - API接口映射表
- `doc/api/05_openapi.yaml` - OpenAPI规范
- `doc/requirements/02_feature_breakdown.md` - 功能点拆分
- `frontend/src/app/components/ui/` - UI组件参考
