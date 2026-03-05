---
name: "frontend-api-integration"
description: "Transforms Figma-generated static frontend pages to API-driven pages. Invoke when user asks to connect frontend mock data to backend APIs based on API mapping table."
---

# 前端API集成工作流

根据API映射表将Figma生成的静态前端页面改造为API驱动的动态页面。

## 适用场景

当用户需要：
- 将前端Mock数据替换为真实API调用
- 根据API映射表改造Figma生成的静态页面
- 为前端页面添加数据加载和状态管理
- 绑定前端按钮操作到后端API

## 工作流程

### 第一阶段：创建统一API层

**任务：** 为前端项目创建统一API管理层

**要求：**
1. 创建 `src/api` 目录
2. 创建统一的 axios 实例文件 `src/api/request.ts`（底层请求层）
3. 根据 API 映射表中的模块，分别创建对应的模块API文件：
   - `src/api/dashboard.ts`
   - `src/api/scripts.ts`
   - `src/api/tasks.ts`
   - `src/api/executions.ts`
   - `src/api/nodes.ts`
   - `src/api/users.ts`
   - `src/api/script-categories.ts`
   - `src/api/system-configs.ts`
   - `src/api/auth.ts`
   - `src/api/agent.ts`
4. 使用 axios
5. baseURL = `/api/v1`
6. 添加统一响应处理：
   - 成功返回 data
   - 失败抛出 error
7. 添加全局超时 8000ms
8. 不修改现有页面代码

**参考文件：**
- `doc/api/07_api_mapping_table.md`
- `doc/api/05_openapi.yaml`

**输出：** 新增的 request.ts 和各模块API文件代码

**示例文件结构：**

```
src/api/
├── request.ts              # axios实例配置（底层请求层）
├── dashboard.ts            # 仪表盘模块API
├── scripts.ts              # 脚本管理模块API
├── tasks.ts                # 任务调度模块API
├── executions.ts           # 执行记录模块API
├── nodes.ts                # 节点管理模块API
├── users.ts                # 用户权限模块API
├── script-categories.ts     # 脚本分类模块API
├── system-configs.ts        # 系统配置模块API
├── auth.ts                 # 认证授权模块API
└── agent.ts                # Agent通信模块API
```

**request.ts 示例（底层请求层）：**
```typescript
import axios from "axios"

const instance = axios.create({
  baseURL: "/api/v1",
  timeout: 8000
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加token等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 返回data字段
    return response.data.data
  },
  (error) => {
    // 统一错误处理
    return Promise.reject(error)
  }
)

export default instance
```

**dashboard.ts 示例：**
```typescript
import request from "./request"

export const dashboardApi = {
  // 获取统计概览
  getStats: () => request.get("/dashboard/stats"),

  // 获取脚本类型分布
  getScriptDistribution: () => request.get("/dashboard/script-distribution"),

  // 获取调度任务统计
  getTaskStats: () => request.get("/dashboard/task-stats"),

  // 获取最近执行记录
  getRecentExecutions: (limit = 5) =>
    request.get("/dashboard/recent-executions", { params: { limit } })
}
```

---

### 第二阶段：按钮自动批量绑定

**任务：** 扫描 `components/pages` 目录下所有 TSX 页面，将静态展示页面改造为 API 驱动页面

**页面来源：** Figma 自动生成的 TSX 页面
**页面类型：** React 函数组件（Figma 生成）
**当前状态：** 无 useEffect，无 API 请求，存在静态 mock 数据

**严格执行规则：**

❌ **不允许的操作：**
1. 不修改 UI 样式 className
2. 不删除 JSX 结构
3. 不重构组件层级
4. 不修改 props 定义
5. 不新增未定义接口
6. 不改动现有组件结构

✅ **只允许新增：**
1. import 语句
2. useState
3. useEffect
4. async 数据加载函数
5. 替换静态数据为动态数据
6. loading 状态
7. error console 输出

**参考文件：**
- `doc/api/07_api_mapping_table.md`
- `doc/api/05_openapi.yaml`

**操作步骤：**

#### 第一步：引入依赖

```typescript
import { useState, useEffect } from "react"
import { dashboardApi } from "@/app/api/dashboard"  // 根据页面引入对应模块
```

#### 第二步：删除本地 mock 数据

删除以下内容：
- `const mockList = [...]`
- `const recentExecutions = [...]`
- 静态写死的数组

#### 第三步：新增状态

根据页面类型添加：

**列表页面：**
```typescript
const [list, setList] = useState([])
const [loading, setLoading] = useState(false)
```

**详情页面：**
```typescript
const [detail, setDetail] = useState(null)
const [loading, setLoading] = useState(false)
```

**统计页面：**
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
```

#### 第四步：新增加载函数

```typescript
async function loadData() {
  try {
    setLoading(true)
    const res = await dashboardApi.getStats()  // 使用对应模块的API方法
    setList(res || [])
  } catch (err) {
    console.error("load error:", err)
  } finally {
    setLoading(false)
  }
}
```

#### 第五步：自动加载

```typescript
useEffect(() => {
  loadData()
}, [])
```

如果是详情页：

```typescript
useEffect(() => {
  if (id) loadData()
}, [id])
```

#### 第六步：替换静态数据

把：
```typescript
mockList.map()
```
改为：
```typescript
list.map()
```

把：
```typescript
"127"
```
改为：
```typescript
data?.today_executions ?? 0
```

把：
```typescript
"98.4%"
```
改为：
```typescript
`${data?.success_rate ?? 0}%`
```

#### 第七步：按钮绑定

**删除按钮：**
```typescript
async function handleDelete(id) {
  if (!confirm("确认删除吗？")) return
  await scriptsApi.deleteScript(id)  // 使用对应模块的API方法
  loadData()
}
```

**新增按钮：**
```typescript
async function handleCreate(payload) {
  await scriptsApi.createScript(payload)  // 使用对应模块的API方法
  loadData()
}
```

**编辑按钮：**
```typescript
async function handleUpdate(id, payload) {
  await scriptsApi.updateScript(id, payload)  // 使用对应模块的API方法
  loadData()
}
```

**输出结果：**
1. 完整修改后的页面代码
2. 修改点说明
3. 若新增 request.ts 和模块API文件则输出完整文件

---

### 第三阶段：安全检查

**任务：** 检查当前页面 API 绑定是否存在问题

**检查项：**
1. 是否存在未绑定按钮
2. 是否存在重复 API 路径
3. 是否存在未使用 API
4. 是否存在参数名错误
5. 是否存在未处理异常
6. 是否存在重复点击风险

**输出：** 检查报告

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

## 注意事项

1. **保持UI不变：** 只修改数据来源，不改变界面样式
2. **渐进式改造：** 逐个页面改造，确保每个页面都能正常工作
3. **错误处理：** 所有API调用都要有try-catch和loading状态
4. **类型安全：** 使用TypeScript类型定义确保数据结构正确
5. **性能优化：** 避免不必要的重复请求
6. **模块化：** 每个模块的API独立管理，便于维护

## 参考文档

- `doc/api/07_api_mapping_table.md` - API接口映射表
- `doc/api/05_openapi.yaml` - OpenAPI规范
- `doc/requirements/02_feature_breakdown.md` - 功能点拆分
