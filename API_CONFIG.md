# API 配置说明

## 配置文件位置

前端API配置文件位于 `frontend/` 目录下：

- `.env` - 默认环境变量配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `src/api/request.ts` - Axios 实例配置
- `vite.config.ts` - Vite 开发服务器配置（包含代理设置）

## 环境变量说明

### VITE_API_BASE_URL
后端API服务器地址

**开发环境**：
```
VITE_API_BASE_URL=http://localhost:8000
```

**生产环境**（根据实际部署修改）：
```
VITE_API_BASE_URL=https://your-backend-domain.com
```

### VITE_API_PREFIX
API路径前缀

```
VITE_API_PREFIX=/api/v1
```

## 配置方式

### 方式1：使用环境变量（推荐）

前端通过环境变量直接连接后端API。

**优点**：
- 灵活，可以针对不同环境配置不同的后端地址
- 生产环境无需额外配置
- 支持跨域（后端已配置CORS）

**配置文件**：
```bash frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
```

**使用方式**：
```typescript frontend/src/api/request.ts
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_PREFIX,
  timeout: 8000
})
```

### 方式2：使用 Vite 代理

前端通过 Vite 开发服务器代理请求到后端。

**优点**：
- 无需修改前端代码
- 开发环境自动代理
- 避免跨域问题

**配置文件**：
```typescript frontend/vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

**使用方式**：
```typescript frontend/src/api/request.ts
const instance = axios.create({
  baseURL: "/api/v1",
  timeout: 8000
})
```

## 当前配置

当前项目同时配置了两种方式：

1. **环境变量配置**（主要方式）
   - 适用于开发和生产环境
   - 后端已配置CORS，支持跨域请求

2. **Vite 代理配置**（备用方式）
   - 适用于开发环境
   - 作为环境变量的备用方案

## 修改后端地址

### 开发环境

编辑 `frontend/.env` 或 `frontend/.env.development`：

```bash
VITE_API_BASE_URL=http://your-backend-ip:port
```

例如：
```bash
VITE_API_BASE_URL=http://192.168.1.100:8000
```

### 生产环境

编辑 `frontend/.env.production`：

```bash
VITE_API_BASE_URL=https://your-production-domain.com
```

## 跨域问题解决

后端已配置CORS中间件，允许所有来源的请求：

```python backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

因此前端可以直接通过环境变量连接后端，无需额外配置。

## API请求示例

### 登录请求
```typescript
import request from '@/api/request'

const login = async (username: string, password: string) => {
  return request.post('/auth/login', { username, password })
}
```

实际请求地址：
```
http://localhost:8000/api/v1/auth/login
```

### 获取用户列表
```typescript
const getUsers = async () => {
  return request.get('/users')
}
```

实际请求地址：
```
http://localhost:8000/api/v1/users
```

## 故障排除

### 前端无法连接后端

1. **检查后端是否启动**
   ```bash
   curl http://localhost:8000/health
   ```

2. **检查环境变量是否正确**
   - 确认 `.env` 文件存在
   - 确认 `VITE_API_BASE_URL` 正确

3. **检查网络连接**
   - 确认后端地址可访问
   - 确认防火墙未阻止连接

4. **检查浏览器控制台**
   - 查看网络请求错误
   - 查看CORS错误

### 环境变量不生效

1. **重启前端服务**
   - 修改 `.env` 文件后需要重启
   - Vite 只在启动时读取环境变量

2. **检查文件名**
   - 必须是 `.env`、`.env.development` 或 `.env.production`
   - 不要有其他后缀

3. **检查变量名**
   - 必须以 `VITE_` 开头
   - 例如：`VITE_API_BASE_URL`

## 推荐配置

### 开发环境
```bash frontend/.env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
```

### 生产环境
```bash frontend/.env.production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_PREFIX=/api/v1
```

### 测试环境
```bash frontend/.env.test
VITE_API_BASE_URL=http://test-api.yourdomain.com
VITE_API_PREFIX=/api/v1
```

## 相关文件

- [frontend/.env](frontend/.env) - 默认环境变量
- [frontend/.env.development](frontend/.env.development) - 开发环境变量
- [frontend/.env.production](frontend/.env.production) - 生产环境变量
- [frontend/src/api/request.ts](frontend/src/api/request.ts) - Axios 配置
- [frontend/vite.config.ts](frontend/vite.config.ts) - Vite 配置
- [backend/main.py](backend/main.py) - 后端 CORS 配置
