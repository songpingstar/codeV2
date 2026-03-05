import subprocess
import sys
import os
import time
import signal
import atexit
import shutil
from pathlib import Path

class ProcessManager:
    def __init__(self):
        self.processes = []
        self.project_root = Path(__file__).parent.absolute()
        self.npm_cmd = self.find_npm()
    
    def find_npm(self):
        npm_path = shutil.which("npm")
        if npm_path:
            return npm_path
        
        common_paths = [
            r"C:\Program Files\nodejs\npm.cmd",
            r"C:\Program Files (x86)\nodejs\npm.cmd",
            os.path.expanduser(r"~\AppData\Roaming\npm\npm.cmd"),
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return path
        
        return None
        
    def start_backend(self):
        backend_dir = self.project_root / "backend"
        print(f"正在启动后端服务...")
        print(f"工作目录: {backend_dir}")
        
        backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
        
        try:
            process = subprocess.Popen(
                backend_cmd,
                cwd=str(backend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
            )
            self.processes.append(("后端", process))
            print("后端服务启动成功，监听地址: http://localhost:8000")
            print("API文档地址: http://localhost:8000/docs")
            return process
        except Exception as e:
            print(f"启动后端服务失败: {e}")
            return None
    
    def start_frontend(self):
        frontend_dir = self.project_root / "frontend"
        print(f"正在启动前端服务...")
        print(f"工作目录: {frontend_dir}")
        
        if not self.npm_cmd:
            print("错误: 未找到 npm 命令")
            print("请确保已安装 Node.js 并将其添加到系统 PATH 中")
            print("Node.js 下载地址: https://nodejs.org/")
            return None
        
        print(f"使用 npm: {self.npm_cmd}")
        
        if os.name == 'nt':
            frontend_cmd = f'"{self.npm_cmd}" run dev'
            shell = True
        else:
            frontend_cmd = [self.npm_cmd, "run", "dev"]
            shell = False
        
        try:
            process = subprocess.Popen(
                frontend_cmd,
                cwd=str(frontend_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True,
                shell=shell,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
            )
            self.processes.append(("前端", process))
            print("前端服务启动成功，监听地址: http://localhost:5173")
            return process
        except Exception as e:
            print(f"启动前端服务失败: {e}")
            return None
    
    def monitor_processes(self):
        print("\n" + "="*60)
        print("服务已启动，按 Ctrl+C 停止所有服务")
        print("="*60 + "\n")
        
        try:
            while True:
                for name, process in self.processes:
                    if process.poll() is not None:
                        print(f"{name}服务已停止，退出码: {process.returncode}")
                        self.stop_all()
                        return
                
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n收到停止信号，正在关闭所有服务...")
            self.stop_all()
    
    def stop_all(self):
        for name, process in self.processes:
            if process.poll() is None:
                print(f"正在停止{name}服务...")
                try:
                    if os.name == 'nt':
                        process.send_signal(signal.CTRL_BREAK_EVENT)
                    else:
                        process.send_signal(signal.SIGTERM)
                    
                    process.wait(timeout=5)
                    print(f"{name}服务已停止")
                except subprocess.TimeoutExpired:
                    print(f"{name}服务未响应，强制终止...")
                    process.kill()
                except Exception as e:
                    print(f"停止{name}服务时出错: {e}")
        
        print("\n所有服务已停止")
        sys.exit(0)

def check_dependencies():
    project_root = Path(__file__).parent.absolute()
    
    print("检查依赖...")
    
    backend_dir = project_root / "backend"
    requirements_file = backend_dir / "requirements.txt"
    
    if requirements_file.exists():
        print("后端依赖文件存在")
    
    frontend_dir = project_root / "frontend"
    node_modules = frontend_dir / "node_modules"
    
    if not node_modules.exists():
        print("警告: 前端依赖未安装")
        
        npm_path = shutil.which("npm")
        if not npm_path:
            common_paths = [
                r"C:\Program Files\nodejs\npm.cmd",
                r"C:\Program Files (x86)\nodejs\npm.cmd",
                os.path.expanduser(r"~\AppData\Roaming\npm\npm.cmd"),
            ]
            for path in common_paths:
                if os.path.exists(path):
                    npm_path = path
                    break
        
        if not npm_path:
            print("错误: 未找到 npm 命令，无法安装前端依赖")
            print("请确保已安装 Node.js 并将其添加到系统 PATH 中")
            print("Node.js 下载地址: https://nodejs.org/")
            return
        
        response = input("是否现在安装前端依赖？(y/n): ")
        if response.lower() == 'y':
            print("正在安装前端依赖...")
            print(f"使用 npm: {npm_path}")
            
            if os.name == 'nt':
                npm_cmd = f'"{npm_path}" install'
                shell = True
            else:
                npm_cmd = [npm_path, "install"]
                shell = False
            
            try:
                subprocess.run(npm_cmd, cwd=str(frontend_dir), check=True, shell=shell)
                print("前端依赖安装完成")
            except subprocess.CalledProcessError as e:
                print(f"前端依赖安装失败: {e}")
        else:
            print("跳过前端依赖安装，前端服务可能无法启动")

def main():
    print("="*60)
    print("运维任务调度系统 - 启动脚本")
    print("="*60)
    print()
    
    check_dependencies()
    
    manager = ProcessManager()
    
    atexit.register(manager.stop_all)
    
    backend_process = manager.start_backend()
    if not backend_process:
        print("后端服务启动失败，退出")
        return
    
    time.sleep(2)
    
    frontend_process = manager.start_frontend()
    if not frontend_process:
        print("前端服务启动失败，但后端服务仍在运行")
        print("按 Ctrl+C 停止后端服务")
    
    manager.monitor_processes()

if __name__ == "__main__":
    main()
