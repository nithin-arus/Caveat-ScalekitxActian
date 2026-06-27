import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { listCasesForSession } from "@/lib/server-store";
import { ApprovalsQueue } from "@/components/ApprovalsQueue";

export default async function ApprovalsPage() {
  const session = await getSession();
  const canApprove = hasPermission(session, "act:redline");
  const cases = listCasesForSession(session).filter((item) => item.status === "awaiting_approval");

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 40px 90px", display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 340px", alignItems: "end", paddingBottom: 24, borderBottom: "1px solid #DCD7CB" }} className="case-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.2em", color: "#7A1F2B", textTransform: "uppercase", margin: 0 }}>
            Scalekit approval chain
          </p>
          <h1 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 40, letterSpacing: "-0.015em", margin: "0 0 8px", color: "#17150F" }}>
            Attorney approvals
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#5C574C", maxWidth: 640, lineHeight: 1.55 }}>
            Routed cases for {session.tenant.name}. Reviewers can prepare the packet, but only an
            Approver or Supervisor with <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>act:redline</span> can send a
            redline as the organization.
          </p>
        </div>
        
        <div style={{ border: "1px solid #DCD7CB", background: "#FBFAF6", padding: 20, borderRadius: 2 }}>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.15em", color: "#9A9384", textTransform: "uppercase", margin: "0 0 6px" }}>
            Current identity
          </p>
          <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 600, color: "#17150F" }}>{session.name}</p>
          <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#79746A" }}>{session.roles.join(", ") || "reviewer"}</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "center" }}>
            <div style={{ background: "#F3F1EB", padding: "8px 12px", borderRadius: 2 }}>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 600, margin: "0 0 2px", color: "#7A1F2B" }}>{cases.length}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#9A9384", textTransform: "uppercase", letterSpacing: "0.05em" }}>queued</p>
            </div>
            <div style={{ background: "#F3F1EB", padding: "8px 12px", borderRadius: 2 }}>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 600, margin: "0 0 2px", color: canApprove ? "#2E6B3E" : "#7A1F2B" }}>{canApprove ? "ON" : "NO"}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#9A9384", textTransform: "uppercase", letterSpacing: "0.05em" }}>send scope</p>
            </div>
          </div>
        </div>
      </div>

      <ApprovalsQueue initialCases={cases} session={session} canApprove={canApprove} />
    </div>
  );
}
