const DEV_MODE = true

const DEFAULT_PERMISSIONS = DEV_MODE ? [
  'dashboard:view',
  'script:view', 'script:create', 'script:update', 'script:delete', 'script:execute',
  'task:view', 'task:create', 'task:update', 'task:delete', 'task:toggle',
  'node:view', 'node:create', 'node:update', 'node:delete',
  'execution:view', 'execution:log:view',
  'user:view', 'user:create', 'user:update', 'user:delete', 'user:password:reset',
  'category:view', 'category:create', 'category:update', 'category:delete',
  'config:view', 'config:update'
] : []

export function hasPermission(permission: string): boolean {
  if (DEV_MODE) {
    const stored = localStorage.getItem("permissions")
    if (stored && stored !== "null" && stored !== "undefined") {
      const parsedPermissions: string[] = JSON.parse(stored)
      if (parsedPermissions.includes("*")) return true
      return parsedPermissions.includes(permission)
    }
    return DEFAULT_PERMISSIONS.includes(permission)
  }
  const permissions: string[] = JSON.parse(localStorage.getItem("permissions") || "[]")
  if (permissions.includes("*")) return true
  return permissions.includes(permission)
}

export function hasAnyPermission(permissions: string[]): boolean {
  if (DEV_MODE) {
    const stored = localStorage.getItem("permissions")
    if (stored && stored !== "null" && stored !== "undefined") {
      const parsedPermissions: string[] = JSON.parse(stored)
      if (parsedPermissions.includes("*")) return true
      return parsedPermissions.some((p: string) => permissions.includes(p))
    }
    return permissions.some((p: string) => DEFAULT_PERMISSIONS.includes(p))
  }
  const userPermissions: string[] = JSON.parse(localStorage.getItem("permissions") || "[]")
  if (userPermissions.includes("*")) return true
  return userPermissions.some((p: string) => permissions.includes(p))
}

export function setPermissions(permissions: string[]): void {
  localStorage.setItem("permissions", JSON.stringify(permissions))
}

export function clearPermissions(): void {
  localStorage.removeItem("permissions")
}

export function getUserInfo() {
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  return JSON.parse(userStr)
}

export function setUserInfo(user: any): void {
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearUserInfo(): void {
  localStorage.removeItem("user")
}

export function getToken(): string | null {
  return localStorage.getItem("token")
}

export function setToken(token: string): void {
  localStorage.setItem("token", token)
}

export function clearToken(): void {
  localStorage.removeItem("token")
}

export function clearAuth(): void {
  clearToken()
  clearUserInfo()
  clearPermissions()
}
