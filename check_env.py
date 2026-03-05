import subprocess
import sys
import os
import shutil
from pathlib import Path

def check_npm():
    print("检查 npm 安装情况...")
    print("="*60)
    
    npm_path = shutil.which("npm")
    if npm_path:
        print(f"✓ npm 已找到: {npm_path}")
        try:
            result = subprocess.run([npm_path, "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ npm 版本: {result.stdout.strip()}")
            else:
                print(f"✗ 无法获取 npm 版本: {result.stderr}")
        except Exception as e:
            print(f"✗ 运行 npm --version 失败: {e}")
        return npm_path
    else:
        print("✗ npm 未在系统 PATH 中找到")
        print("\n尝试查找常见安装位置...")
        
        common_paths = [
            r"C:\Program Files\nodejs\npm.cmd",
            r"C:\Program Files (x86)\nodejs\npm.cmd",
            os.path.expanduser(r"~\AppData\Roaming\npm\npm.cmd"),
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                print(f"✓ 在常见位置找到 npm: {path}")
                try:
                    result = subprocess.run([path, "--version"], capture_output=True, text=True)
                    if result.returncode == 0:
                        print(f"✓ npm 版本: {result.stdout.strip()}")
                    else:
                        print(f"✗ 无法获取 npm 版本: {result.stderr}")
                except Exception as e:
                    print(f"✗ 运行 npm --version 失败: {e}")
                return path
        
        print("✗ 在常见位置也未找到 npm")
        return None

def check_node():
    print("\n检查 Node.js 安装情况...")
    print("="*60)
    
    node_path = shutil.which("node")
    if node_path:
        print(f"✓ Node.js 已找到: {node_path}")
        try:
            result = subprocess.run([node_path, "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ Node.js 版本: {result.stdout.strip()}")
            else:
                print(f"✗ 无法获取 Node.js 版本: {result.stderr}")
        except Exception as e:
            print(f"✗ 运行 node --version 失败: {e}")
        return node_path
    else:
        print("✗ Node.js 未在系统 PATH 中找到")
        
        common_paths = [
            r"C:\Program Files\nodejs\node.exe",
            r"C:\Program Files (x86)\nodejs\node.exe",
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                print(f"✓ 在常见位置找到 Node.js: {path}")
                try:
                    result = subprocess.run([path, "--version"], capture_output=True, text=True)
                    if result.returncode == 0:
                        print(f"✓ Node.js 版本: {result.stdout.strip()}")
                    else:
                        print(f"✗ 无法获取 Node.js 版本: {result.stderr}")
                except Exception as e:
                    print(f"✗ 运行 node --version 失败: {e}")
                return path
        
        print("✗ 在常见位置也未找到 Node.js")
        return None

def check_python():
    print("\n检查 Python 安装情况...")
    print("="*60)
    
    python_path = sys.executable
    print(f"✓ Python 已找到: {python_path}")
    print(f"✓ Python 版本: {sys.version}")
    return python_path

def main():
    print("="*60)
    print("环境检查工具")
    print("="*60)
    print()
    
    python_ok = check_python() is not None
    node_ok = check_node() is not None
    npm_ok = check_npm() is not None
    
    print("\n" + "="*60)
    print("检查结果汇总")
    print("="*60)
    print(f"Python: {'✓ 已安装' if python_ok else '✗ 未安装'}")
    print(f"Node.js: {'✓ 已安装' if node_ok else '✗ 未安装'}")
    print(f"npm: {'✓ 已安装' if npm_ok else '✗ 未安装'}")
    
    if python_ok and node_ok and npm_ok:
        print("\n✓ 所有依赖都已安装，可以启动应用")
    else:
        print("\n✗ 部分依赖缺失，请安装缺失的组件")
        if not node_ok:
            print("\n请安装 Node.js:")
            print("  下载地址: https://nodejs.org/")
            print("  建议版本: 18.x 或更高版本")
        if not npm_ok:
            print("\nnpm 通常随 Node.js 一起安装，请先安装 Node.js")

if __name__ == "__main__":
    main()
