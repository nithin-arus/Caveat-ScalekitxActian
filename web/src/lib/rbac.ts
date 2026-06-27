import type { Permission, SessionIdentity } from "@shared/contracts";

export function hasPermission(session: SessionIdentity, permission: Permission) {
  return session.permissions.includes(permission);
}

export function requirePermission(session: SessionIdentity, permission: Permission) {
  if (!hasPermission(session, permission)) {
    const error = new Error(
      permission === "act:redline" ? "Requires Attorney Approval" : "Permission denied"
    );
    error.name = "ForbiddenError";
    throw error;
  }
}
