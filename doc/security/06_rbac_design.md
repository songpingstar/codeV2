# 运维任务调度系统 - RBAC权限设计文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | RBAC权限设计文档 |
| 文档版本 | v1.0.0 |
| 创建日期 | 2026-02-27 |
| 文档状态 | 初稿 |

---

## 1. 权限模型概述

### 1.1 RBAC模型

本系统采用基于角色的访问控制（Role-Based Access Control，RBAC）模型，通过角色来管理用户的权限。

**核心概念**：
- **用户（User）**：系统的实际使用者
- **角色（Role）**：权限的集合，用户通过角色获得权限
- **权限（Permission）**：对系统资源的操作权限

### 1.2 权限模型图

```
用户 (User) ──拥有──> 角色 (Role) ──包含──> 权限 (Permission)
     │                                    │
     └─────────────访问──────────────────> 资源 (Resource)
```

---

## 2. 角色定义

### 2.1 角色列表

| 角色代码 | 角色名称 | 角色描述 | 权限级别 |
|---------|---------|---------|---------|
| admin | 系统管理员 | 拥有所有权限，可管理用户、节点和系统配置 | 最高 |
| ops | 运维工程师 | 可创建和执行脚本、管理节点、查看执行记录 | 中等 |
| readonly | 只读用户 | 仅可查看脚本、任务和执行记录，无法进行修改操作 | 最低 |

### 2.2 角色职责

#### 2.2.1 系统管理员 (admin)

**职责**：
- 系统整体管理和配置
- 用户和权限管理
- 节点管理
- 系统参数配置
- 所有模块的完全访问权限

**典型用户**：系统运维负责人、技术主管

#### 2.2.2 运维工程师 (ops)

**职责**：
- 脚本开发和管理
- 任务调度配置
- 手动执行脚本
- 查看执行记录和日志
- 节点状态监控

**典型用户**：运维工程师、开发人员

#### 2.2.3 只读用户 (readonly)

**职责**：
- 查看脚本列表和详情
- 查看任务调度情况
- 查看执行记录和日志
- 查看节点状态

**典型用户**：项目经理、测试人员、审计人员

---

## 3. 权限点定义

### 3.1 权限点命名规范

权限点采用`模块:操作`的命名格式：

- **模块**：资源类型，如`script`、`task`、`node`等
- **操作**：操作类型，如`create`、`read`、`update`、`delete`、`execute`等

### 3.2 权限点列表

#### 3.2.1 仪表盘模块 (Dashboard)

| 权限点 | 权限名称 | 权限描述 |
|--------|---------|---------|
| dashboard:read | 查看仪表盘 | 查看仪表盘统计数据和最近执行记录 |

#### 3.2.2 脚本管理模块 (Script)

| 权限点 | 权限名称 | 权限描述 |
|--------|---------|---------|
| script:create | 创建脚本 | 创建新的脚本 |
| script:read | 查看脚本 | 查看脚本列表和详情 |
| script:update | 编辑脚本 | 编辑脚本内容和信息 |
| script:delete | 删除脚本 | 删除脚本 |
| script:execute | 执行脚本 | 手动执行脚本 |
| script:version:read | 查看脚本版本 | 查看脚本历史版本 |

#### 3.2.3 任务调度模块 (Task)

| 权限点 | 权限名称 | 权限描述 |
|--------|---------|---------|
| task:create | 创建任务 | 创建新的调度任务 |
| task:read | 查看任务 | 查看任务列表和详情 |
| task:update | 编辑任务 | 编辑任务配置 |
| task:delete | 删除任务 | 删除任务 |
| task:toggle | 启用/暂停任务 | 切换任务的启用状态 |

#### 3.2.4 执行记录模块 (Execution)

| 权限点 | 权限名称 | 权限描述 |
|--------|---------|---------|
| execution:read | 查看执行记录 | 查看执行记录列表和详情 |
| execution:log:read | 查看执行日志 | 查看脚本执行日志 |
| execution:log:download | 下载执行日志 | 下载脚本执行日志文件 |

#### 3.2.5 节点管理模块 (Node)

| 权限点 | 权限名称 | 权限描述 |
|--------|---------|---------|
| node:create | 创建节点 | 添加新的执行节点 |
| node:read | 查看节点 | 查看节点列表和详情 |
| node:update | 编辑节点 | 编辑节点信息 |
| node:delete | 删除节点 | 删除节点 |
| node:execute:read | 查看节点执行历史 | 查看节点的执行历史记录 |

#### 3.2.6 用户权限模块 (User)

| 权限点 | 权限名称 | 权限描述 |
|--------|---------|---------|
| user:create | 创建用户 | 创建新的系统用户 |
| user:read | 查看用户 | 查看用户列表和详情 |
| user:update | 编辑用户 | 编辑用户信息 |
| user:delete | 删除用户 | 删除系统用户 |
| user:password:reset | 重置用户密码 | 重置其他用户的密码 |
| user:password:change | 修改自己的密码 | 修改当前用户的密码 |

#### 3.2.7 脚本分类模块 (Category)

| 权限点 | 权限名称 | 权限描述 |
|--------|---------|---------|
| category:create | 创建分类 | 创建新的脚本分类 |
| category:read | 查看分类 | 查看脚本分类列表 |
| category:update | 编辑分类 | 编辑脚本分类信息 |
| category:delete | 删除分类 | 删除脚本分类 |

#### 3.2.8 系统配置模块 (Config)

| 权限点 | 权限名称 | 权限描述 |
|--------|---------|---------|
| config:read | 查看配置 | 查看系统配置 |
| config:update | 更新配置 | 更新系统配置 |

---

## 4. 角色权限映射

### 4.1 角色权限矩阵

| 权限点 | admin | ops | readonly |
|--------|-------|-----|----------|
| dashboard:read | ✓ | ✓ | ✓ |
| script:create | ✓ | ✓ | ✗ |
| script:read | ✓ | ✓ | ✓ |
| script:update | ✓ | ✓ | ✗ |
| script:delete | ✓ | ✗ | ✗ |
| script:execute | ✓ | ✓ | ✗ |
| script:version:read | ✓ | ✓ | ✓ |
| task:create | ✓ | ✓ | ✗ |
| task:read | ✓ | ✓ | ✓ |
| task:update | ✓ | ✓ | ✗ |
| task:delete | ✓ | ✗ | ✗ |
| task:toggle | ✓ | ✓ | ✗ |
| execution:read | ✓ | ✓ | ✓ |
| execution:log:read | ✓ | ✓ | ✓ |
| execution:log:download | ✓ | ✓ | ✓ |
| node:create | ✓ | ✗ | ✗ |
| node:read | ✓ | ✓ | ✓ |
| node:update | ✓ | ✗ | ✗ |
| node:delete | ✓ | ✗ | ✗ |
| node:execute:read | ✓ | ✓ | ✓ |
| user:create | ✓ | ✗ | ✗ |
| user:read | ✓ | ✗ | ✗ |
| user:update | ✓ | ✗ | ✗ |
| user:delete | ✓ | ✗ | ✗ |
| user:password:reset | ✓ | ✗ | ✗ |
| user:password:change | ✓ | ✓ | ✓ |
| category:create | ✓ | ✗ | ✗ |
| category:read | ✓ | ✓ | ✓ |
| category:update | ✓ | ✗ | ✗ |
| category:delete | ✓ | ✗ | ✗ |
| config:read | ✓ | ✗ | ✗ |
| config:update | ✓ | ✗ | ✗ |

**图例**：
- ✓：拥有权限
- ✗：无权限

### 4.2 角色权限统计

| 角色 | 权限数量 | 占比 |
|------|---------|------|
| admin | 33 | 100% |
| ops | 19 | 57.6% |
| readonly | 11 | 33.3% |

---

## 5. API权限映射

### 5.1 API权限映射表

| API路径 | HTTP方法 | 所需权限 | 允许角色 |
|---------|---------|---------|---------|
| /api/v1/dashboard/* | GET | dashboard:read | admin, ops, readonly |
| /api/v1/scripts | GET | script:read | admin, ops, readonly |
| /api/v1/scripts | POST | script:create | admin, ops |
| /api/v1/scripts/{id} | GET | script:read | admin, ops, readonly |
| /api/v1/scripts/{id} | PUT | script:update | admin, ops |
| /api/v1/scripts/{id} | DELETE | script:delete | admin |
| /api/v1/scripts/{id}/execute | POST | script:execute | admin, ops |
| /api/v1/scripts/{id}/versions | GET | script:version:read | admin, ops, readonly |
| /api/v1/scripts/batch | DELETE | script:delete | admin |
| /api/v1/scheduled-tasks | GET | task:read | admin, ops, readonly |
| /api/v1/scheduled-tasks | POST | task:create | admin, ops |
| /api/v1/scheduled-tasks/{id} | GET | task:read | admin, ops, readonly |
| /api/v1/scheduled-tasks/{id} | PUT | task:update | admin, ops |
| /api/v1/scheduled-tasks/{id} | DELETE | task:delete | admin |
| /api/v1/scheduled-tasks/{id}/toggle | PUT | task:toggle | admin, ops |
| /api/v1/scheduled-tasks/stats | GET | task:read | admin, ops, readonly |
| /api/v1/executions | GET | execution:read | admin, ops, readonly |
| /api/v1/executions/{execution_id} | GET | execution:read | admin, ops, readonly |
| /api/v1/executions/{execution_id}/logs | GET | execution:log:read | admin, ops, readonly |
| /api/v1/executions/{execution_id}/logs/download | GET | execution:log:download | admin, ops, readonly |
| /api/v1/executions/stats | GET | execution:read | admin, ops, readonly |
| /api/v1/nodes | GET | node:read | admin, ops, readonly |
| /api/v1/nodes | POST | node:create | admin |
| /api/v1/nodes/{id} | GET | node:read | admin, ops, readonly |
| /api/v1/nodes/{id} | PUT | node:update | admin |
| /api/v1/nodes/{id} | DELETE | node:delete | admin |
| /api/v1/nodes/{id}/executions | GET | node:execute:read | admin, ops, readonly |
| /api/v1/nodes/stats | GET | node:read | admin, ops, readonly |
| /api/v1/nodes/batch | DELETE | node:delete | admin |
| /api/v1/users | GET | user:read | admin |
| /api/v1/users | POST | user:create | admin |
| /api/v1/users/{id} | GET | user:read | admin |
| /api/v1/users/{id} | PUT | user:update | admin |
| /api/v1/users/{id} | DELETE | user:delete | admin |
| /api/v1/users/{id}/reset-password | PUT | user:password:reset | admin |
| /api/v1/users/me/change-password | PUT | user:password:change | admin, ops, readonly |
| /api/v1/script-categories | GET | category:read | admin, ops, readonly |
| /api/v1/script-categories | POST | category:create | admin |
| /api/v1/script-categories/{id} | GET | category:read | admin, ops, readonly |
| /api/v1/script-categories/{id} | PUT | category:update | admin |
| /api/v1/script-categories/{id} | DELETE | category:delete | admin |
| /api/v1/system-configs | GET | config:read | admin |
| /api/v1/system-configs/{id} | PUT | config:update | admin |
| /api/v1/system-configs/batch | PUT | config:update | admin |
| /api/v1/auth/login | POST | - | 公开 |
| /api/v1/auth/logout | POST | - | admin, ops, readonly |
| /api/v1/auth/refresh | POST | - | 公开 |
| /api/v1/auth/me | GET | - | admin, ops, readonly |

---

## 6. 数据库设计

### 6.1 用户表 (users)

用户表已包含角色字段，无需额外设计。

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'readonly' CHECK(role IN ('admin', 'ops', 'readonly')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 权限表 (permissions)

存储系统所有权限点。

```sql
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(100) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 角色权限关联表 (role_permissions)

存储角色与权限的关联关系。

```sql
CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'ops', 'readonly')),
    permission_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role, permission_id)
);
```

### 6.4 初始化权限数据

```sql
-- 插入权限点
INSERT INTO permissions (permission_code, permission_name, description, module, action) VALUES
('dashboard:read', '查看仪表盘', '查看仪表盘统计数据和最近执行记录', 'dashboard', 'read'),
('script:create', '创建脚本', '创建新的脚本', 'script', 'create'),
('script:read', '查看脚本', '查看脚本列表和详情', 'script', 'read'),
('script:update', '编辑脚本', '编辑脚本内容和信息', 'script', 'update'),
('script:delete', '删除脚本', '删除脚本', 'script', 'delete'),
('script:execute', '执行脚本', '手动执行脚本', 'script', 'execute'),
('script:version:read', '查看脚本版本', '查看脚本历史版本', 'script', 'version:read'),
('task:create', '创建任务', '创建新的调度任务', 'task', 'create'),
('task:read', '查看任务', '查看任务列表和详情', 'task', 'read'),
('task:update', '编辑任务', '编辑任务配置', 'task', 'update'),
('task:delete', '删除任务', '删除任务', 'task', 'delete'),
('task:toggle', '启用/暂停任务', '切换任务的启用状态', 'task', 'toggle'),
('execution:read', '查看执行记录', '查看执行记录列表和详情', 'execution', 'read'),
('execution:log:read', '查看执行日志', '查看脚本执行日志', 'execution', 'log:read'),
('execution:log:download', '下载执行日志', '下载脚本执行日志文件', 'execution', 'log:download'),
('node:create', '创建节点', '添加新的执行节点', 'node', 'create'),
('node:read', '查看节点', '查看节点列表和详情', 'node', 'read'),
('node:update', '编辑节点', '编辑节点信息', 'node', 'update'),
('node:delete', '删除节点', '删除节点', 'node', 'delete'),
('node:execute:read', '查看节点执行历史', '查看节点的执行历史记录', 'node', 'execute:read'),
('user:create', '创建用户', '创建新的系统用户', 'user', 'create'),
('user:read', '查看用户', '查看用户列表和详情', 'user', 'read'),
('user:update', '编辑用户', '编辑用户信息', 'user', 'update'),
('user:delete', '删除用户', '删除系统用户', 'user', 'delete'),
('user:password:reset', '重置用户密码', '重置其他用户的密码', 'user', 'password:reset'),
('user:password:change', '修改自己的密码', '修改当前用户的密码', 'user', 'password:change'),
('category:create', '创建分类', '创建新的脚本分类', 'category', 'create'),
('category:read', '查看分类', '查看脚本分类列表', 'category', 'read'),
('category:update', '编辑分类', '编辑脚本分类信息', 'category', 'update'),
('category:delete', '删除分类', '删除脚本分类', 'category', 'delete'),
('config:read', '查看配置', '查看系统配置', 'config', 'read'),
('config:update', '更新配置', '更新系统配置', 'config', 'update');

-- 为admin角色分配所有权限
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions;

-- 为ops角色分配权限
INSERT INTO role_permissions (role, permission_id)
SELECT 'ops', id FROM permissions WHERE permission_code IN (
    'dashboard:read',
    'script:create', 'script:read', 'script:update', 'script:execute', 'script:version:read',
    'task:create', 'task:read', 'task:update', 'task:toggle',
    'execution:read', 'execution:log:read', 'execution:log:download',
    'node:read', 'node:execute:read',
    'user:password:change',
    'category:read'
);

-- 为readonly角色分配权限
INSERT INTO role_permissions (role, permission_id)
SELECT 'readonly', id FROM permissions WHERE permission_code IN (
    'dashboard:read',
    'script:read', 'script:version:read',
    'task:read',
    'execution:read', 'execution:log:read', 'execution:log:download',
    'node:read', 'node:execute:read',
    'user:password:change',
    'category:read'
);
```

---

## 7. FastAPI权限中间件实现

### 7.1 依赖注入装饰器

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import jwt
from datetime import datetime, timedelta

# JWT配置
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# 权限检查装饰器
def require_permissions(*required_permissions: str):
    """
    权限检查装饰器
    
    Args:
        *required_permissions: 需要的权限点列表
        
    Returns:
        依赖函数
    """
    async def check_permissions(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ):
        # 验证JWT Token
        token = credentials.credentials
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="无效的认证凭据"
                )
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据"
            )
        
        # 查询用户信息
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="用户已被禁用"
            )
        
        # 查询用户权限
        user_permissions = db.query(Permission.permission_code)\
            .join(RolePermission, RolePermission.permission_id == Permission.id)\
            .filter(RolePermission.role == user.role)\
            .all()
        
        user_permission_codes = {p.permission_code for p in user_permissions}
        
        # 检查是否拥有所需权限
        for permission in required_permissions:
            if permission not in user_permission_codes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"缺少权限: {permission}"
                )
        
        return user
    
    return check_permissions

# 角色检查装饰器
def require_roles(*allowed_roles: str):
    """
    角色检查装饰器
    
    Args:
        *allowed_roles: 允许的角色列表
        
    Returns:
        依赖函数
    """
    async def check_roles(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ):
        # 验证JWT Token
        token = credentials.credentials
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="无效的认证凭据"
                )
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据"
            )
        
        # 查询用户信息
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="用户已被禁用"
            )
        
        # 检查角色
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"角色不允许访问，需要角色: {', '.join(allowed_roles)}"
            )
        
        return user
    
    return check_roles

# 获取当前用户
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    获取当前登录用户
    
    Returns:
        User: 当前用户对象
    """
    # 验证JWT Token
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据"
        )
    
    # 查询用户信息
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用"
        )
    
    return user
```

### 7.2 API端点使用示例

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

# 示例1：需要特定权限
@router.get("/scripts")
async def get_scripts(
    user: User = Depends(require_permissions("script:read")),
    db: Session = Depends(get_db)
):
    """获取脚本列表 - 需要script:read权限"""
    scripts = db.query(Script).all()
    return {"data": scripts}

# 示例2：需要多个权限
@router.post("/scripts")
async def create_script(
    script_data: ScriptCreate,
    user: User = Depends(require_permissions("script:create")),
    db: Session = Depends(get_db)
):
    """创建脚本 - 需要script:create权限"""
    new_script = Script(**script_data.dict())
    db.add(new_script)
    db.commit()
    db.refresh(new_script)
    return {"data": new_script}

# 示例3：需要特定角色
@router.get("/users")
async def get_users(
    user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """获取用户列表 - 仅admin角色可访问"""
    users = db.query(User).all()
    return {"data": users}

# 示例4：需要特定角色或权限
@router.delete("/scripts/{script_id}")
async def delete_script(
    script_id: int,
    user: User = Depends(require_permissions("script:delete")),
    db: Session = Depends(get_db)
):
    """删除脚本 - 需要script:delete权限"""
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(status_code=404, detail="脚本不存在")
    
    db.delete(script)
    db.commit()
    return {"message": "删除成功"}

# 示例5：公开接口（无需认证）
@router.post("/auth/login")
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """用户登录 - 公开接口"""
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
```

### 7.3 权限检查辅助函数

```python
def has_permission(user: User, permission_code: str, db: Session) -> bool:
    """
    检查用户是否拥有指定权限
    
    Args:
        user: 用户对象
        permission_code: 权限代码
        db: 数据库会话
        
    Returns:
        bool: 是否拥有权限
    """
    permission = db.query(Permission)\
        .join(RolePermission, RolePermission.permission_id == Permission.id)\
        .filter(
            RolePermission.role == user.role,
            Permission.permission_code == permission_code
        )\
        .first()
    
    return permission is not None

def has_any_permission(user: User, permission_codes: List[str], db: Session) -> bool:
    """
    检查用户是否拥有任意一个指定权限
    
    Args:
        user: 用户对象
        permission_codes: 权限代码列表
        db: 数据库会话
        
    Returns:
        bool: 是否拥有任意一个权限
    """
    permissions = db.query(Permission.permission_code)\
        .join(RolePermission, RolePermission.permission_id == Permission.id)\
        .filter(
            RolePermission.role == user.role,
            Permission.permission_code.in_(permission_codes)
        )\
        .all()
    
    return len(permissions) > 0

def has_all_permissions(user: User, permission_codes: List[str], db: Session) -> bool:
    """
    检查用户是否拥有所有指定权限
    
    Args:
        user: 用户对象
        permission_codes: 权限代码列表
        db: 数据库会话
        
    Returns:
        bool: 是否拥有所有权限
    """
    permissions = db.query(Permission.permission_code)\
        .join(RolePermission, RolePermission.permission_id == Permission.id)\
        .filter(
            RolePermission.role == user.role,
            Permission.permission_code.in_(permission_codes)
        )\
        .all()
    
    user_permission_codes = {p.permission_code for p in permissions}
    return all(code in user_permission_codes for code in permission_codes)
```

---

## 8. 权限管理最佳实践

### 8.1 权限设计原则

1. **最小权限原则**：用户只拥有完成工作所需的最小权限
2. **职责分离**：不同角色职责明确，权限不交叉
3. **权限粒度适中**：权限粒度不宜过粗或过细
4. **易于维护**：权限设计应便于后续扩展和维护

### 8.2 权限使用建议

1. **优先使用角色**：在大多数情况下，使用角色检查即可
2. **精确权限控制**：对于敏感操作，使用精确的权限检查
3. **权限组合使用**：可以组合使用角色和权限检查
4. **缓存用户权限**：对于频繁访问的权限，考虑缓存

### 8.3 安全注意事项

1. **JWT安全**：确保JWT密钥安全，定期更换
2. **Token过期**：设置合理的Token过期时间
3. **日志记录**：记录所有权限检查和拒绝访问的情况
4. **定期审计**：定期审计用户权限分配情况

---

## 9. 附录

### 9.1 权限检查流程图

```
用户请求
    │
    ▼
验证JWT Token
    │
    ├─ 失败 → 返回401未授权
    │
    ▼
查询用户信息
    │
    ├─ 用户不存在 → 返回404未找到
    │
    ▼
检查用户状态
    │
    ├─ 用户被禁用 → 返回403禁止访问
    │
    ▼
检查用户角色/权限
    │
    ├─ 权限不足 → 返回403禁止访问
    │
    ▼
允许访问
```

### 9.2 常见问题

**Q1：如何添加新的权限点？**

A：在`permissions`表中插入新的权限记录，然后在`role_permissions`表中为相应角色分配该权限。

**Q2：如何修改用户的角色？**

A：更新`users`表中的`role`字段即可，用户的权限会自动更新。

**Q3：如何实现临时权限？**

A：可以为用户创建临时角色，或在用户表中添加临时权限字段。

**Q4：如何实现数据级权限控制？**

A：在权限检查的基础上，增加数据归属判断，如只能查看自己创建的脚本。

### 9.3 参考资料

- FastAPI官方文档：https://fastapi.tiangolo.com/
- JWT认证：https://jwt.io/
- RBAC模型：https://en.wikipedia.org/wiki/Role-based_access_control
