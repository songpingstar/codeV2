from .dashboard import router
from .scripts import router
from .tasks import router
from .executions import router
from .nodes import router
from .users import router
from .script_categories import router
from .system_configs import router
from .auth import router
from .agent import router

__all__ = [
    "dashboard",
    "scripts",
    "tasks",
    "executions",
    "nodes",
    "users",
    "script_categories",
    "system_configs",
    "auth",
    "agent"
]
