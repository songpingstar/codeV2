import os
import sys
import time
import signal
import logging
import threading
import subprocess
import json
import asyncio
import websockets
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
import yaml
import requests

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("Agent")


class Config:
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
        
        with open(config_path, 'r', encoding='utf-8') as f:
            self.data = yaml.safe_load(f)
        
        self.server_url = self.data.get('server', {}).get('url', 'http://localhost:8000')
        self.api_prefix = self.data.get('server', {}).get('api_prefix', '/api/v1')
        self.timeout = self.data.get('server', {}).get('timeout', 30)
        
        self.ws_url = self.server_url.replace('http', 'ws') + self.api_prefix + '/ws/agent'
        
        self.node_name = self.data.get('agent', {}).get('node_name', '')
        self.ip = self.data.get('agent', {}).get('ip', '')
        self.environment = self.data.get('agent', {}).get('environment', 'prod')
        self.tags = self.data.get('agent', {}).get('tags', [])
        self.token = self.data.get('agent', {}).get('token', '')
        
        self.heartbeat_interval = self.data.get('heartbeat', {}).get('interval', 300)
        
        self.script_dir = self.data.get('task', {}).get('script_dir', '/tmp/agent_scripts')
        self.log_dir = self.data.get('task', {}).get('log_dir', '/tmp/agent_logs')
        self.max_concurrent = self.data.get('task', {}).get('max_concurrent', 3)
    
    @property
    def base_url(self) -> str:
        return f"{self.server_url}{self.api_prefix}"


class AgentState:
    def __init__(self):
        self.node_id: Optional[int] = None
        self.node_token: Optional[str] = None
        self.registered: bool = False
        self.running: bool = False
        self.ws_connected: bool = False
        self.current_tasks: Dict[str, Any] = {}
        self.websocket = None


class Agent:
    def __init__(self, config: Config):
        self.config = config
        self.state = AgentState()
        self.stop_event = threading.Event()
        self.ws_loop: asyncio.AbstractEventLoop = None
        
        Path(self.config.script_dir).mkdir(parents=True, exist_ok=True)
        Path(self.config.log_dir).mkdir(parents=True, exist_ok=True)
    
    def api_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> Dict:
        url = f"{self.config.base_url}{endpoint}"
        try:
            if method.upper() == 'GET':
                response = requests.get(url, params=params, timeout=self.config.timeout)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, timeout=self.config.timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"API request failed: {e}")
            raise
    
    def register(self) -> bool:
        try:
            data = {
                'node_name': self.config.node_name,
                'ip': self.config.ip,
                'environment': self.config.environment,
                'tags': self.config.tags,
                'token': self.config.token
            }
            result = self.api_request('POST', '/agent/register', data=data)
            
            if result.get('code') == 0 or result.get('code') == 200:
                self.state.node_id = result['data']['node_id']
                self.state.node_token = result['data']['node_token']
                self.state.registered = True
                self._save_credentials()
                logger.info(f"Registered successfully: node_id={self.state.node_id}")
                return True
            else:
                logger.error(f"Registration failed: {result.get('message')}")
                return False
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return False
    
    def _save_credentials(self):
        creds = {
            'node_id': self.state.node_id,
            'node_token': self.state.node_token
        }
        creds_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
        with open(creds_path, 'w') as f:
            json.dump(creds, f)
    
    def _load_credentials(self) -> bool:
        creds_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
        if os.path.exists(creds_path):
            with open(creds_path, 'r') as f:
                creds = json.load(f)
                self.state.node_id = creds.get('node_id')
                self.state.node_token = creds.get('node_token')
                if self.state.node_id and self.state.node_token:
                    self.state.registered = True
                    logger.info(f"Loaded credentials: node_id={self.state.node_id}")
                    return True
        return False
    
    def heartbeat(self):
        while self.state.running and not self.stop_event.is_set():
            try:
                if self.state.ws_connected and self.state.websocket:
                    async def send_heartbeat():
                        await self.state.websocket.send(json.dumps({
                            "type": "heartbeat"
                        }))
                    
                    try:
                        asyncio.run_coroutine_threadsafe(
                            send_heartbeat(), 
                            self.ws_loop
                        ).result(timeout=5)
                        logger.debug("Heartbeat sent via WebSocket")
                    except Exception as e:
                        logger.warning(f"WebSocket heartbeat failed: {e}")
                else:
                    logger.warning("WebSocket not connected, skip heartbeat")
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
            
            time.sleep(self.config.heartbeat_interval)
    
    async def ws_connect(self):
        ws_url = f"{self.config.ws_url}?node_id={self.state.node_id}&node_token={self.state.node_token}"
        reconnect_delay = 5
        
        while self.state.running and not self.stop_event.is_set():
            try:
                async with websockets.connect(ws_url, ping_interval=30) as websocket:
                    self.state.ws_connected = True
                    self.state.websocket = websocket
                    logger.info("WebSocket connected")
                    reconnect_delay = 5
                    
                    while self.state.running and not self.stop_event.is_set():
                        try:
                            message = await asyncio.wait_for(websocket.recv(), timeout=1)
                            await self._handle_ws_message(websocket, message)
                        except asyncio.TimeoutError:
                            continue
                        except websockets.exceptions.ConnectionClosed:
                            logger.warning("WebSocket connection closed")
                            break
                        
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
            
            self.state.ws_connected = False
            self.state.websocket = None
            
            if self.state.running and not self.stop_event.is_set():
                logger.info(f"Reconnecting in {reconnect_delay} seconds...")
                await asyncio.sleep(reconnect_delay)
                reconnect_delay = min(reconnect_delay * 2, 60)
    
    async def _handle_ws_message(self, websocket, message: str):
        try:
            data = json.loads(message)
            msg_type = data.get('type')
            
            if msg_type == 'connected':
                logger.info("WebSocket connection confirmed")
            
            elif msg_type == 'task':
                task = data.get('data', {})
                logger.info(f"Received task: {task.get('execution_id')}")
                self._execute_task(task)
            
            elif msg_type == 'ping':
                await websocket.send(json.dumps({'type': 'pong'}))
            
            elif msg_type == 'result_ack':
                execution_id = data.get('execution_id')
                logger.info(f"Result acknowledged: {execution_id}")
            
            else:
                logger.warning(f"Unknown message type: {msg_type}")
        
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON message: {e}")
        except Exception as e:
            logger.error(f"Handle message error: {e}")
    
    def _execute_task(self, task: Dict):
        execution_id = task.get('execution_id')
        
        if len(self.state.current_tasks) >= self.config.max_concurrent:
            logger.warning(f"Max concurrent tasks reached, task {execution_id} queued")
            return
        
        if execution_id in self.state.current_tasks:
            logger.warning(f"Task {execution_id} already running")
            return
        
        self.state.current_tasks[execution_id] = {
            'task': task,
            'start_time': datetime.now()
        }
        
        thread = threading.Thread(target=self._run_script, args=(task,))
        thread.daemon = True
        thread.start()
    
    def _run_script(self, task: Dict):
        execution_id = task.get('execution_id')
        script_id = task.get('script_id')
        script_type = task.get('script_type', 'shell').lower()
        script_content = task.get('script_content')
        parameters = task.get('parameters') or {}
        
        logger.info(f"Executing task: {execution_id}")
        start_time = time.time()
        log_path = os.path.join(self.config.log_dir, f"{execution_id}.log")
        
        try:
            rendered_content = self._render_script(script_content, parameters)
            
            if script_type == 'python':
                script_path = os.path.join(self.config.script_dir, f"{execution_id}.py")
                with open(script_path, 'w') as f:
                    f.write(rendered_content)
                os.chmod(script_path, 0o755)
                cmd = ['python3', script_path]
            else:
                script_path = os.path.join(self.config.script_dir, f"{execution_id}.sh")
                with open(script_path, 'w') as f:
                    f.write(rendered_content)
                os.chmod(script_path, 0o755)
                cmd = ['/bin/bash', script_path]
            
            with open(log_path, 'w') as log_file:
                process = subprocess.Popen(
                    cmd,
                    stdout=log_file,
                    stderr=subprocess.STDOUT
                )
                process.wait()
                exit_code = process.returncode
            
            duration = int(time.time() - start_time)
            
            status = 'success' if exit_code == 0 else 'failed'
            
            with open(log_path, 'r') as f:
                log_content = f.read()
            
            self._report_result(execution_id, status, exit_code, log_content, None, duration)
            
        except Exception as e:
            duration = int(time.time() - start_time)
            logger.error(f"Task execution error: {e}")
            self._report_result(execution_id, 'failed', -1, None, str(e), duration)
        
        finally:
            if execution_id in self.state.current_tasks:
                del self.state.current_tasks[execution_id]
            
            for ext in ['.sh', '.py']:
                script_path = os.path.join(self.config.script_dir, f"{execution_id}{ext}")
                if os.path.exists(script_path):
                    os.remove(script_path)
    
    def _render_script(self, script_content: str, parameters: Dict) -> str:
        result = script_content
        for key, value in parameters.items():
            result = result.replace(f"${{{key}}}", str(value))
            result = result.replace(f"${key}", str(value))
        return result
    
    def _report_result(self, execution_id: str, status: str, exit_code: int, 
                       log_content: Optional[str], error_message: Optional[str], duration: int):
        try:
            if self.state.ws_connected and self.state.websocket:
                async def send_result():
                    await self.state.websocket.send(json.dumps({
                        "type": "task_result",
                        "execution_id": execution_id,
                        "status": status,
                        "exit_code": exit_code,
                        "log_content": log_content,
                        "error_message": error_message,
                        "duration": duration
                    }))
                
                asyncio.run_coroutine_threadsafe(
                    send_result(), 
                    self.ws_loop
                ).result(timeout=5)
                logger.info(f"Result reported: {execution_id}, status={status}")
            else:
                logger.warning("WebSocket not connected, result will be reported when reconnected")
        except Exception as e:
            logger.error(f"Report result error: {e}")
    
    def start(self):
        logger.info("Agent starting...")
        
        if not self.config.node_name or not self.config.ip:
            logger.error("node_name and ip must be configured")
            return
        
        if not self.config.token:
            logger.error("Token must be configured in config.yaml")
            return
        
        if not self._load_credentials():
            logger.info("No credentials found, registering...")
            if not self.register():
                logger.error("Registration failed, exiting")
                return
        
        self.state.running = True
        
        heartbeat_thread = threading.Thread(target=self.heartbeat)
        heartbeat_thread.daemon = True
        heartbeat_thread.start()
        
        self.ws_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.ws_loop)
        
        try:
            self.ws_loop.run_until_complete(self.ws_connect())
        except KeyboardInterrupt:
            logger.info("Received interrupt signal")
        finally:
            self.ws_loop.close()
        
        self.stop()
    
    def stop(self):
        logger.info("Agent stopping...")
        self.state.running = False
        
        if self.ws_loop and not self.ws_loop.is_closed():
            self.ws_loop.call_soon_threadsafe(self.ws_loop.stop)
        
        for execution_id in list(self.state.current_tasks.keys()):
            logger.warning(f"Waiting for task to complete: {execution_id}")
        
        logger.info("Agent stopped")
    
    def signal_handler(self, signum, frame):
        logger.info(f"Received signal {signum}")
        self.stop_event.set()
        self.stop()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Task Scheduling System Agent')
    parser.add_argument('-c', '--config', default=None, help='Config file path')
    parser.add_argument('-d', '--daemon', action='store_true', help='Run as daemon')
    args = parser.parse_args()
    
    config = Config(args.config)
    agent = Agent(config)
    
    signal.signal(signal.SIGINT, agent.signal_handler)
    signal.signal(signal.SIGTERM, agent.signal_handler)
    
    if args.daemon:
        import daemon
        with daemon.DaemonContext():
            agent.start()
    else:
        agent.start()


if __name__ == '__main__':
    main()
