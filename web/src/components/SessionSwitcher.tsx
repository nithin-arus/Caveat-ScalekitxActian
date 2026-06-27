"use client";

import { TENANTS, useSession, type Role } from "@/lib/session";

export function SessionSwitcher() {
  const { tenant, user, setTenantId, setRole } = useSession();

  return (
    <div className="flex items-center gap-3 text-xs">
      <select
        value={tenant.id}
        onChange={(e) => setTenantId(e.target.value)}
        className="rounded-full border border-ink/15 bg-paper px-3 py-1.5 font-medium text-ink-muted"
        title="Switch tenant organization (mocks Scalekit multi-tenancy)"
      >
        {TENANTS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setRole(user.role === "reviewer" ? "approver" : ("reviewer" as Role))}
        title="Simulates a Scalekit SSO/SAML role swap"
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold transition-colors ${
          user.role === "approver" ? "bg-seal text-paper" : "bg-paper-muted text-ink"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
        {user.role === "approver" ? "Attorney" : "Case Worker"}
        <span className="opacity-60">↺</span>
      </button>
    </div>
  );
}
