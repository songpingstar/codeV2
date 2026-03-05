# 运维任务调度系统 - 启动说明

## 快速启动

### Windows 用户（推荐）

双击运行 `start_simple.bat` 文件即可启动前后端服务。

### 命令行启动

如果需要使用 Python 脚本启动，可以运行：
```bash
python start.py
```

## 服务地址

启动成功后，可以通过以下地址访问：

- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **API 文档 (ReDoc)**: http://localhost:8000/redoc

## 停止服务

### 使用 start_simple.bat 启动时
- 分别关闭 "Backend" 和 "Frontend" 两个命令行窗口

### 使用 start.py 启动时
- 在命令行窗口中按 `Ctrl+C` 即可停止所有服务

## 首次运行

### 检查环境

运行环境检查工具：
```bash
python check_env.py
```

这会检查 Python、Node.js 和 npm 是否已正确安装。

### 安装依赖

如果依赖未安装，请按以下步骤操作：

#### 后端依赖
```bash
cd backend
pip install -r requirements.txt
```

#### 前端依赖
```bash
cd frontend
npm install
```

## 跨域问题

后端已配置 CORS 中间件，允许所有来源的请求，因此不会出现跨域问题。

配置位置：[backend/main.py](backend/main.py#L19-L24)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 目录结构

```
codeV2/
├── start_simple.bat      # Windows 批处理启动脚本（推荐）
├── start.py              # Python 启动脚本
├── check_env.py          # 环境检查工具
├── backend/              # 后端代码
│   ├── main.py           # FastAPI 主应用
│   ├── config.py         # 配置文件
│   ├── database.py       # 数据库连接
│   └── requirements.txt  # Python 依赖
└── frontend/             # 前端代码
    ├── package.json      # Node.js 依赖配置
    ├── vite.config.ts    # Vite 配置
    └── ...
```

## 故障排除

### 端口被占用

如果端口 8000 或 5173 被占用：

**修改后端端口**：
编辑 `start_simple.bat`，将 `--port 8000` 改为其他端口

**修改前端端口**：
编辑 [frontend/vite.config.ts](frontend/vite.config.ts)，将 `port: 5173` 改为其他端口

### Python 环境问题

如果遇到 `asyncio` 或 `base_events` 相关错误：

1. **检查 Python 版本**：确保使用 Python 3.10 或更高版本
2. **重新安装 Python**：从 [python.org](https://www.python.org/downloads/) 下载最新版本
3. **使用虚拟环境**（推荐）：
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```

### 依赖安装失败

#### 后端依赖安装失败
确保已安装：
- Python 3.10+
- pip（通常随 Python 一起安装）

如果 pip 有问题，尝试：
```bash
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

#### 前端依赖安装失败
确保已安装：
- Node.js 18+
- npm（通常随 Node.js 一起安装）

如果 npm 有问题，尝试：
```bash
npm install -g npm@latest
```

### 后端启动失败

1. 检查 Python 依赖是否安装：
   ```bash
   cd backend
   python -c "import fastapi, uvicorn, sqlalchemy; print('OK')"
   ```

2. 检查数据库文件权限：
   - 确保 `backend/data/` 目录存在
   - 确保有写入权限

3. 查看详细错误信息：
   ```bash
   cd backend
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 前端启动失败

1. 检查 Node.js 依赖是否安装：
   ```bash
   cd frontend
   npm list
   ```

2. 检查端口是否被占用：
   ```bash
   netstat -ano | findstr :5173
   ```

3. 查看详细错误信息：
   ```bash
   cd frontend
   npm run dev
   ```

## 开发模式

### 后端热重载
后端使用 `--reload` 参数启动，修改代码后会自动重启。

### 前端热更新
前端使用 Vite 开发服务器，修改代码后会自动刷新浏览器。

## 生产部署

### 后端部署
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 前端部署
```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/` 目录，可以部署到任何静态文件服务器。

## 技术栈

### 后端
- FastAPI - Web 框架
- Uvicorn - ASGI 服务器
- SQLAlchemy - ORM
- Pydantic - 数据验证

### 前端
- React - UI 框架
- Vite - 构建工具
- TypeScript - 类型安全
- Tailwind CSS - 样式框架
- Radix UI - 组件库

## 支持

如遇到问题，请检查：
1. 环境是否正确安装
2. 依赖是否完整安装
3. 端口是否被占用
4. 防火墙是否阻止连接
