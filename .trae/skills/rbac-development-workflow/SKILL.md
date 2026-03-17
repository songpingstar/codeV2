---
name: "rbac-development-workflow"
description: "为已有系统添加RBAC权限控制能力（最小侵入版）。适用于需要为现有系统添加权限管理时调用。"
---

# RBAC权限实现工作流

本skill提供为已有系统添加RBAC权限控制的最小侵入方案，实现用户登录认证、角色权限管理、API接口权限控制、前端页面/按钮权限控制。

## 何时调用

**关键：在以下情况下立即调用本skill：**
- 在系统设计阶段，输出权限设计文档
- 用户要求为现有系统添加权限控制
- 用户需要实现用户登录认证
- 用户需要实现角色权限管理
- 用户需要实现API接口权限控制
- 用户需要实现前端按钮/页面权限控制

## 设计原则

### 核心原则
- **最小侵入**：不修改业务逻辑
- **集中控制**：权限控制集中在框架层
- **UI分离**：前端只控制UI展示，后端保证安全控制

### 权限模型

采用RBAC（Role Based Access Control）模型：

```
User（用户） → Role（角色） → Permission（权限）
```

---

## 权限模型设计

### 1. 权限标识设计规则

权限标识统一格式：`module:action`

**示例**：
- `task:create` - 创建任务
- `task:update` - 编辑任务
- `task:delete` - 删除任务
- `task:view` - 查看任务
- `node:view` - 查看节点
- `script:execute` - 执行脚本
- `dashboard:view` - 查看仪表盘

### 2. 角色定义

| 角色代码 | 角色名称 | 权限级别 |
|---------|---------|---------|
| admin | 系统管理员 | 所有权限（*） |
| ops | 运维工程师 | 增删改查 |
| readonly | 只读用户 | 仅查看 |

### 3. 权限矩阵

| 权限点 | admin | ops | readonly |
|--------|-------|-----|----------|
| dashboard:view | ✓ | ✓ | ✓ |
| script:create | ✓ | ✓ | ✗ |
| script:view | ✓ | ✓ | ✓ |
| script:update | ✓ | ✓ | ✗ |
| script:delete | ✓ | ✗ | ✗ |
| script:execute | ✓ | ✓ | ✗ |
| task:create | ✓ | ✓ | ✗ |
| task:view | ✓ | ✓ | ✓ |
| task:update | ✓ | ✓ | ✗ |
| task:delete | ✓ | ✗ | ✗ |
| task:toggle | ✓ | ✓ | ✗ |
| execution:view | ✓ | ✓ | ✓ |
| execution:log:view | ✓ | ✓ | ✓ |
| node:create | ✓ | ✗ | ✗ |
| node:view | ✓ | ✓ | ✓ |
| node:update | ✓ | ✗ | ✗ |
| node:delete | ✓ | ✗ | ✗ |
| user:create | ✓ | ✗ | ✗ |
| user:view | ✓ | ✗ | ✗ |
| user:update | ✓ | ✗ | ✗ |
| user:delete | ✓ | ✗ | ✗ |
| user:password:reset | ✓ | ✗ | ✗ |
| category:create | ✓ | ✗ | ✗ |
| category:view | ✓ | ✓ | ✓ |
| category:update | ✓ | ✗ | ✗ |
| category:delete | ✓ | ✗ | ✗ |
| config:view | ✓ | ✗ | ✗ |
| config:update | ✓ | ✗ | ✗ |

---

## 数据库表结构设计

### 最小RBAC表设计

```sql
-- users表（已有，只需确认role字段）
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'readonly';

-- roles表（可选，简化版可直接硬编码）
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- permissions表
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(100) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- role_permissions表
CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'ops', 'readonly')),
    permission_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role, permission_id)
);
```

---

## 后端权限控制架构

### 1. 权限控制必须在API层实现

```
API Route
    ↓
权限依赖检查
    ↓
业务逻辑（Service）
```

**业务逻辑层不写权限判断。**

### 2. FastAPI权限依赖实现

创建统一权限检查函数：

```python
# app/core/dependencies.py
from fastapi import Depends, Header, HTTPException
from typing import Optional, List

# 角色权限映射
ROLE_PERMISSIONS = {
    "admin": ["*"],  # 所有权限
    "ops": [
        "dashboard:view",
        "script:create", "script:view", "script:update", "script:execute",
        "task:create", "task:view", "task:update", "task:toggle",
        "execution:view", "execution:log:view",
        "node:view",
        "user:password:change",
        "category:view"
    ],
    "readonly": [
        "dashboard:view",
        "script:view",
        "task:view",
        "execution:view", "execution:log:view",
        "node:view",
        "user:password:change",
        "category:view"
    ]
}

async def get_current_user(x_role: Optional[str] = Header(None)) -> dict:
    """从Header获取当前用户信息"""
    role = x_role or "admin"
    return {"role": role}

async def require_permission(permission: str, user: dict = Depends(get_current_user)):
    """权限校验依赖"""
    user_role = user["role"]
    permissions = ROLE_PERMISSIONS.get(user_role, [])
    if "*" not in permissions and permission not in permissions:
        raise HTTPException(status_code=403, detail="权限不足")
    return user

async def require_roles(allowed_roles: List[str], user: dict = Depends(get_current_user)):
    """角色校验依赖"""
    if user["role"] not in allowed_roles:
        raise HTTPException(status_code=403, detail="权限不足")
    return user
```

### 3. API接口使用方式

在路由层添加权限依赖：

```python
from app.core.dependencies import require_permission

@router.delete(
    "/tasks/{id}",
    dependencies=[Depends(require_permission("task:delete"))]
)
async def delete_task(id: int):
    return service.delete_task(id)
```

**特点**：
- 不修改业务代码
- 权限控制统一
- 侵入性极小

---

## 登录认证实现

### 1. 登录接口返回权限列表

登录成功后返回：

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "permissions": [
    "task:view",
    "task:create",
    "node:view"
  ]
}
```

### 2. JWT Token实现

```python
# app/core/security.py
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
```

### 3. 登录接口实现

```python
# app/routers/auth.py
from app.core.security import verify_password, create_access_token
from app.services.user_service import UserService

@router.post("/login")
async def login(request: LoginRequest):
    user = service.get_user_by_username(request.username)
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(hours=24)
    )
    
    return SuccessResponse.create(data={
        "token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        },
        "permissions": ROLE_PERMISSIONS.get(user.role, [])
    })
```

---

## 前端权限控制设计

### 1. 前端只做UI控制，不负责安全

创建工具函数：

```typescript
// frontend/src/app/utils/permissions.ts
export function hasPermission(permission: string): boolean {
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]")
  return permissions.includes(permission)
}

export function hasAnyPermission(permissions: string[]): boolean {
  const userPermissions = JSON.parse(localStorage.getItem("permissions") || "[]")
  return permissions.some(p => userPermissions.includes(p))
}
```

### 2. 按钮权限控制

```tsx
import { hasPermission } from '@/app/utils/permissions'

{hasPermission("task:delete") && (
  <Button onClick={handleDelete}>删除</Button>
)}
```

没有权限时：按钮不显示

### 3. 页面路由权限控制

路由配置：

```typescript
// frontend/src/app/router.tsx
const routes = [
  { path: "/tasks", component: TaskScheduling, permission: "task:view" },
  { path: "/users", component: UserManagement, permission: "user:view" }
]
```

页面进入时：

```tsx
import { useEffect } from 'react'
import { hasPermission } from '@/app/utils/permissions'
import { useNavigate } from 'react-router-dom'

function ProtectedRoute({ children, permission }) {
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!hasPermission(permission)) {
      navigate("/403")
    }
  }, [permission])
  
  return <>{children}</>
}
```

---

## 权限系统改造步骤

对已有系统进行权限补充时，按以下步骤实施：

### 第一步：数据库表准备
1. 确认 users 表包含 role 字段
2. 创建 permissions 表
3. 创建 role_permissions 表
4. 初始化权限数据

### 第二步：登录接口改造
1. 实现JWT Token生成
2. 登录接口返回 permissions[]
3. 实现登出和刷新Token

### 第三步：创建权限检查依赖
1. 创建 app/core/dependencies.py
2. 实现 require_permission 函数
3. 实现 require_roles 函数
4. 从Header获取当前用户角色

### 第四步：为关键API添加权限
按优先级添加：
1. 删除类API（delete）
2. 创建类API（post）
3. 更新类API（put）
4. 执行类API（execute）

### 第五步：前端按钮增加权限判断
1. 创建权限工具函数
2. 为删除/编辑/执行按钮添加权限判断
3. 为路由添加权限守卫

---

## 权限系统设计原则

### 必须遵守
1. **权限检查在API层**：业务逻辑不包含权限代码
2. **前端权限仅用于UI控制**：不负责安全
3. **所有权限标识统一命名**：API与权限标识一一对应
4. **最小侵入原则**：不修改业务逻辑

### 权限标识命名规范
- 格式：`module:action`
- module：资源类型（task、script、node等）
- action：操作类型（create、read、update、delete、execute等）

---

## 可扩展能力

该RBAC设计支持未来扩展：

- 组织权限（多租户）
- 数据权限（行级权限）
- 多角色用户
- Casbin集成
- API网关权限

无需重构现有代码。

---

## 最终架构结构

```
Frontend UI
     ↓
Permission UI Control
     ↓
API Request
     ↓
FastAPI Route
     ↓
Permission Dependency
     ↓
Business Logic (Service)
     ↓
Database
```

---

