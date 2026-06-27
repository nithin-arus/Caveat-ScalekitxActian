"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "reviewer" | "approver";

export interface Tenant {
  id: string;
  name: string;
  accent: string; // tailwind color token suffix, e.g. "seal" or "blue-700"
}

export const TENANTS: Tenant[] = [
  { id: "sf-tenants-union", name: "SF Tenants Union", accent: "seal" },
  { id: "oakland-legal-aid", name: "Oakland Legal Aid", accent: "blue-700" },
];

export interface SessionUser {
  name: string;
  role: Role;
}

const USERS: Record<Role, SessionUser> = {
  reviewer: { name: "Jordan — Case Worker", role: "reviewer" },
  approver: { name: "Avery Chen — Lead Attorney", role: "approver" },
};

interface SessionState {
  tenant: Tenant;
  user: SessionUser;
  setTenantId: (id: string) => void;
  setRole: (role: Role) => void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState(TENANTS[0].id);
  const [role, setRole] = useState<Role>("reviewer");

  useEffect(() => {
    const storedTenant = window.localStorage.getItem("fineprint:tenant");
    const storedRole = window.localStorage.getItem("fineprint:role") as Role | null;
    if (storedTenant) setTenantId(storedTenant);
    if (storedRole) setRole(storedRole);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fineprint:tenant", tenantId);
  }, [tenantId]);

  useEffect(() => {
    window.localStorage.setItem("fineprint:role", role);
  }, [role]);

  const tenant = TENANTS.find((t) => t.id === tenantId) ?? TENANTS[0];
  const user = USERS[role];

  return (
    <SessionContext.Provider value={{ tenant, user, setTenantId, setRole }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
