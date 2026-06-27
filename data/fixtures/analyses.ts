import type { Analysis, AuditEntry, WatchEvent } from "../../shared/contracts";

export const sampleAnalyses: Analysis[] = [
  {
    id: "lease-sketchy",
    title: "88 Mission Alley - Residential Lease",
    summary:
      "This lease has several landlord-favorable traps: deposit deductions for ordinary wear, rent and fee increases during the term, tenant responsibility for core repairs, unrestricted landlord entry, and a harsh early-termination penalty.",
    riskScore: 82,
    createdAt: "2026-06-26T16:30:00Z",
    flags: [
      {
        id: "sketchy-deposit-wear",
        clause: {
          id: "lease-sketchy-clause-04",
          section: "Section 4 - Security Deposit",
          text: "Landlord may retain all or part of the security deposit for cleaning, repainting, carpet wear, general wear and tear, administrative costs, or any other condition Landlord deems necessary.",
        },
        reason:
          "This lets the landlord charge you for ordinary wear and vague administrative costs. Security deposit deductions should be limited to unpaid rent, documented damage beyond ordinary wear, and other lawful itemized charges.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Security deposit deductions are limited to unpaid rent and itemized damage beyond ordinary wear and tear, with receipts provided within the legally required return window.\"",
      },
      {
        id: "sketchy-rent-increase",
        clause: {
          id: "lease-sketchy-clause-03",
          section: "Section 3 - Rent",
          text: "Landlord may increase rent, fees, utility charges, or other amounts at any time upon written notice.",
        },
        reason:
          "A fixed-term lease should not allow unilateral price changes during the term. This makes the real monthly cost unpredictable even after signing.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Rent and recurring fees are fixed during the lease term unless both parties agree in writing or a specific lawful pass-through is listed in this lease.\"",
      },
      {
        id: "sketchy-maintenance-shift",
        clause: {
          id: "lease-sketchy-clause-06",
          section: "Section 6 - Repairs and Maintenance",
          text: "Tenant is responsible for all repairs, replacements, maintenance, pest control, appliance failures, plumbing issues, electrical issues, and habitability-related expenses during the lease term.",
        },
        reason:
          "This shifts core landlord duties onto the tenant, including building systems and habitability expenses that are usually the landlord's responsibility.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Tenant is responsible only for damage caused by Tenant or guests. Landlord remains responsible for habitability, building systems, included appliances, and structural repairs.\"",
      },
      {
        id: "sketchy-entry-any-time",
        clause: {
          id: "lease-sketchy-clause-07",
          section: "Section 7 - Entry",
          text: "Landlord may enter the premises at any time for inspection, repairs, showings, maintenance, emergencies, or any business purpose.",
        },
        reason:
          "This removes meaningful notice and privacy protections. Entry should require reasonable notice except for emergencies.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Landlord may enter only with at least 24 hours' notice during reasonable hours, except in emergencies or as otherwise required by law.\"",
      },
      {
        id: "sketchy-early-termination",
        clause: {
          id: "lease-sketchy-clause-10",
          section: "Section 10 - Early Termination",
          text: "If Tenant terminates early, Tenant remains liable for all rent through the end of the lease term, regardless of whether Landlord re-rents the premises.",
        },
        reason:
          "This ignores the landlord's duty to mitigate by trying to re-rent the unit and could force you to pay even after a replacement tenant moves in.",
        severity: "med",
        suggestedRedline:
          "Replace with: \"If Tenant terminates early, Landlord must make commercially reasonable efforts to re-rent, and Tenant liability ends when a replacement tenancy begins.\"",
      },
    ],
  },
  {
    id: "lease-gotcha",
    title: "500 Valencia St - Gotcha Lease",
    summary:
      "This is the high-drama demo lease. It combines a nonrefundable deposit, no rent relief during construction, unilateral relocation, essential-service disclaimers, one-way attorney fees, and mold/bedbug risk shifted to the tenant.",
    riskScore: 94,
    createdAt: "2026-06-26T17:10:00Z",
    flags: [
      {
        id: "gotcha-nonrefundable-deposit",
        clause: {
          id: "lease-gotcha-clause-03",
          section: "Section 3 - Nonrefundable Deposit",
          text: "The security deposit is nonrefundable and may be applied by Landlord in Landlord's sole discretion. Landlord may retain deposit amounts for general wear and tear, odor, paint touch-up, carpet cleaning, or administrative review.",
        },
        reason:
          "Calling a security deposit nonrefundable is a major red flag. It also lets the landlord keep money for ordinary wear and subjective administrative review.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"The security deposit is refundable except for lawful, itemized deductions for unpaid rent, damage beyond ordinary wear, or other charges allowed by law.\"",
      },
      {
        id: "gotcha-relocation",
        clause: {
          id: "lease-gotcha-clause-05",
          section: "Section 5 - Relocation",
          text: "Landlord may relocate Tenant to another unit at any time for any reason upon 5 days' notice.",
        },
        reason:
          "This undermines the bargain for the specific unit you rented. Relocation should be limited to emergencies or comparable mutually agreed substitutions.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Tenant may be relocated only for emergency, legal, or habitability reasons, to a comparable or better unit, with reasonable notice and landlord-paid moving costs.\"",
      },
      {
        id: "gotcha-services",
        clause: {
          id: "lease-gotcha-clause-06",
          section: "Section 6 - Essential Services",
          text: "Landlord is not responsible for interruption of water, heat, gas, electricity, internet, elevator, trash, or other services for any reason.",
        },
        reason:
          "Essential service interruptions can create habitability problems. The landlord should not disclaim responsibility for services and building systems within landlord control.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Landlord remains responsible for essential services and building systems within Landlord's control, subject to applicable habitability laws.\"",
      },
      {
        id: "gotcha-attorney-fees",
        clause: {
          id: "lease-gotcha-clause-08",
          section: "Section 8 - Attorney Fees",
          text: "Tenant shall pay Landlord's attorney fees and costs in any dispute, regardless of outcome.",
        },
        reason:
          "One-way fee clauses discourage tenants from asserting valid rights and can make you pay the landlord's lawyer even if you win.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Attorney fees may be awarded only to the prevailing party where allowed by law, and the provision applies equally to both parties.\"",
      },
      {
        id: "gotcha-mold-bedbugs",
        clause: {
          id: "lease-gotcha-clause-10",
          section: "Section 10 - Mold and Pests",
          text: "Tenant acknowledges the premises may contain mold and releases Landlord from all mold-related claims. Tenant is responsible for all bedbug inspection, treatment, relocation, laundry, disposal, and extermination costs.",
        },
        reason:
          "This pushes health, remediation, and building-wide pest risk onto the tenant. Responsibility should follow applicable law and documented cause.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Landlord must disclose known mold conditions and remediate moisture, mold, pest, and bedbug issues as required by law. Tenant is responsible only where Tenant caused the issue.\"",
      },
    ],
  },
  {
    id: "lease-clean",
    title: "123 Maple Street - Clean Lease",
    summary:
      "This lease mostly tracks tenant-friendly market terms: fixed rent, refundable deposit, reasonable late fee, repair duties preserved, 24-hour entry notice, and reasonable sublet language.",
    riskScore: 16,
    createdAt: "2026-06-26T15:45:00Z",
    flags: [
      {
        id: "clean-sublet-standard",
        clause: {
          id: "lease-clean-clause-10",
          section: "Section 10 - Assignment and Subletting",
          text: "Tenant may request assignment or sublet approval. Landlord consent may not be unreasonably withheld, conditioned, or delayed.",
        },
        reason:
          "This is balanced language. It protects the landlord's approval right while preventing arbitrary refusal.",
        severity: "low",
        suggestedRedline: "No redline needed. This clause is market-standard and tenant-friendly.",
      },
      {
        id: "clean-entry-standard",
        clause: {
          id: "lease-clean-clause-07",
          section: "Section 7 - Entry",
          text: "Landlord may enter the premises with at least 24 hours' notice during reasonable hours for inspections, repairs, or showings, except in emergencies or as otherwise allowed by law.",
        },
        reason:
          "This preserves reasonable notice and emergency access. It is the kind of clause Caveat should mark as acceptable rather than over-warning.",
        severity: "low",
        suggestedRedline: "No redline needed. Keep as written.",
      },
    ],
  },
  {
    id: "offer-startup",
    title: "Founding Product Engineer - Offer Letter",
    summary:
      "The salary is clear, but the equity economics are under-specified and several startup-specific terms need negotiation: no acceleration, a 30-day exercise window, broad IP assignment, outside-work approval, non-compete language, and no severance.",
    riskScore: 76,
    createdAt: "2026-06-26T17:00:00Z",
    flags: [
      {
        id: "offer-exercise-window",
        clause: {
          id: "offer-startup-clause-04",
          section: "Section 4 - Exercise Window",
          text: "Vested options must be exercised within 30 days after termination of employment.",
        },
        reason:
          "A short exercise window can force you to spend cash quickly or lose vested equity. This is one of the highest-leverage founder/startup offer asks.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Vested options may be exercised for at least 12 months after termination, and preferably through the full option term where permitted by the plan.\"",
      },
      {
        id: "offer-ip-assignment",
        clause: {
          id: "offer-startup-clause-05",
          section: "Section 5 - Intellectual Property",
          text: "Employee assigns to company all inventions, discoveries, works, ideas, code, designs, and intellectual property created before, during, or after employment that relate in any way to company business.",
        },
        reason:
          "This can capture pre-existing side projects and future work outside the job. IP assignment should be limited to work created during employment using company resources or related to assigned duties.",
        severity: "high",
        suggestedRedline:
          "Replace with: \"Assignment applies only to IP created during employment that relates to company business or uses company resources, and excluded prior inventions are listed in an exhibit.\"",
      },
      {
        id: "offer-noncompete",
        clause: {
          id: "offer-startup-clause-07",
          section: "Section 7 - Restrictive Covenants",
          text: "For 12 months after employment, employee may not work for, advise, invest in, or assist any business that competes with company.",
        },
        reason:
          "Broad non-competes can block your next job and may be unenforceable or restricted depending on state law. The safer replacement is confidentiality plus narrow lawful non-solicit terms.",
        severity: "high",
        suggestedRedline:
          "Delete the non-compete. Replace with a confidentiality covenant and any lawful, narrowly tailored non-solicitation obligations.",
      },
      {
        id: "offer-no-acceleration",
        clause: {
          id: "offer-startup-clause-03",
          section: "Section 3 - Equity",
          text: "No vesting acceleration will apply upon a change in control, termination, or any other event.",
        },
        reason:
          "No acceleration can leave you exposed if the company is sold or your role is eliminated after acquisition.",
        severity: "med",
        suggestedRedline:
          "Ask for double-trigger acceleration for 50% to 100% of unvested equity if employment is terminated without cause or for good reason within 12 months after a change in control.",
      },
      {
        id: "offer-share-count-only",
        clause: {
          id: "offer-startup-clause-03b",
          section: "Section 3 - Equity",
          text: "Subject to board approval, you will receive an option to purchase 50,000 shares of common stock.",
        },
        reason:
          "Share count alone does not tell you ownership percentage. You need fully diluted percentage and total shares outstanding to understand the actual value.",
        severity: "med",
        suggestedRedline:
          "Ask the company to provide the approximate fully diluted ownership percentage represented by the grant and the current total shares outstanding.",
      },
    ],
  },
];

export const sampleAuditLog: AuditEntry[] = [
  {
    auditId: "audit-001",
    action: "fetchContract",
    actor: "tejas@example.com",
    detail: "Fetched '88 Mission Alley - Residential Lease' from Gmail using read-only scope (mock).",
    timestamp: "2026-06-26T16:30:00Z",
    ok: true,
  },
  {
    auditId: "audit-002",
    action: "sendRedline",
    actor: "tejas@example.com",
    detail: "Blocked send attempt: read-only persona cannot send the redline email.",
    timestamp: "2026-06-26T16:35:00Z",
    ok: false,
  },
  {
    auditId: "audit-003",
    action: "sendRedline",
    actor: "tejas@example.com",
    detail: "Sent redline for deposit, rent increase, maintenance, and entry clauses to leasing@mission-alley.example.",
    timestamp: "2026-06-26T16:37:00Z",
    ok: true,
  },
  {
    auditId: "audit-004",
    action: "revokeAccess",
    actor: "tejas@example.com",
    detail: "Gmail send scope revoked. Next external action failed closed while local analysis stayed available.",
    timestamp: "2026-06-26T16:39:00Z",
    ok: true,
  },
];

export const sampleWatchEvents: WatchEvent[] = [
  {
    id: "watch-lease-sketchy",
    detectedAt: "2026-06-26T16:30:00Z",
    source: "gmail",
    title: "Lease agreement ready for review",
    status: "flagged",
  },
  {
    id: "watch-offer-letter",
    detectedAt: "2026-06-26T17:00:00Z",
    source: "gmail",
    title: "Founding Product Engineer offer letter",
    status: "flagged",
  },
  {
    id: "watch-clean-lease",
    detectedAt: "2026-06-26T15:45:00Z",
    source: "drive",
    title: "123 Maple Street clean lease fixture",
    status: "new",
  },
];
