# CardHub v2 — Phased Implementation & Migration Plan

**Date:** October 2026  
**Document:** `docs/implementation-plan.md`  
**Target:** Upgrade CardHub to a financial card-intelligence and exposure-control platform (CardHub v2).

---

## 1. Screen & Navigation Mapping

The navigation will be structured to present the 8 primary target screens while preserving all existing capabilities:

| Target Screen (v2) | Purpose & Core Features | Legacy / Existing Component Mapping | Changes & Additions |
| :--- | :--- | :--- | :--- |
| **1. Overview** | Dashboard summary, cards health, alerts panel, budget progress, recent activity, quick actions. | `OverviewTab.jsx` | Redesign with Linear/Vercel restraint, card health indicators, freshness stamps, demo alerts, and direct CTA to create virtual card. |
| **2. My Cards** | Comprehensive inventory of cards owned by user: Linked Bank Cards, CardHub-Issued Cards, Demo Cards. | Extends `CardsTab.jsx` + `CardDetailsDrawer.jsx` | Add explicit source badge (`Linked Bank`, `CardHub Issuer`, `Demo`), connection health, provider capabilities, and disabled bank freeze with explanation. |
| **3. Virtual Cards** | Purpose-specific cards (Netflix, Shopping, Travel, Free Trial) with budget caps, merchant locks, and lifecycle status. | `CardsTab.jsx` (virtual view), `BurnerCardModal.jsx`, `NewCardModal.jsx` | Refactor into dedicated Virtual Cards view + structured 6-step creation flow; clear Demo vs. Issuer distinction; prevent full PAN/CVV display. |
| **4. Activity** | Normalized transaction history, filters (card, merchant, status, date), export, dispute, and freshness indicator. | `TransactionsTab.jsx`, `TransactionDetailModal.jsx` | Add card source filter, pending/completed/declined states, pagination/infinite scroll, data freshness indicator. |
| **5. Alerts** | Priority triage of security & risk events (over-limit, velocity, unusual charge, stale connection) with actionable next steps. | New `AlertsTab.jsx` (integrating high-severity items from `ActivityTab` & `SecurityTab`) | Structured alert cards with: What happened, Why flagged, Affected card, Severity, Recommended action (Acknowledge, Review, Freeze virtual card). |
| **6. Rules & Limits** | Deterministic rule definitions, enforcement mode, and interactive transaction simulation playground. | New `RulesTab.jsx` + domain `src/domain/rules/` | List rules with enforcement badge: *Enforced by provider*, *Monitoring only*, *Demo only*, *Unavailable*. Built-in "Simulate Transaction" engine. |
| **7. Connections** | Financial provider health, linked institution permissions, sync timestamps, re-auth, demo provider toggle. | New `ConnectionsTab.jsx` | Real vs. Demo connection indicator, last sync timestamp, capability matrix, safe disconnect. |
| **8. Settings** | Security preferences, profile, notifications, data export, account reset. | `SettingsTab.jsx` + `SecurityTab.jsx` | Unified settings with sub-sections for Profile, Security/Sessions, Notifications, and Privacy/Data export. Card Studio accessible as a customizer utility. |

---

## 2. Design System & Token Strategy

### Linear / Vercel Minimalist Palette
- **Backgrounds:**
  - App Canvas (Dark): `#090A0D` / Elevated Main: `#0F1216` / Card Surface: `#161B22` / Border: `#232936`
  - Text: Primary `#F3F4F6`, Secondary `#9CA3AF`, Muted `#6B7280`
  - Accent: Restrained Indigo `#6366F1` / Violet `#7C8CFF`
  - Semantic Status:
    - Success / Active: `#10B981` (Emerald)
    - Warning / Needs Review / Delayed: `#F59E0B` (Amber)
    - Danger / Frozen / Declined: `#EF4444` (Rose/Red)
    - Demo / Simulated: `#8B5CF6` (Purple badge)
- **Typography & Components:**
  - Tight, precise tabular numbers (`font-mono font-medium tracking-tight`).
  - Subtle 1px borders with hover transitions.
  - Accessible focus rings (`focus-visible:ring-1 focus-visible:ring-indigo-500`).
  - Skeletons and transparent empty states with actionable buttons.

---

## 3. Phased Execution Roadmap

### Phase 1: Lint Fixes & Design System Foundation
- Fix 14 baseline lint errors in current files.
- Introduce centralized design tokens and reusable UI primitives (`Button`, `Badge`, `Input`, `Select`, `Card`, `Table`, `Tabs`, `Skeleton`, `EmptyState`).
- Refine app shell: Sidebar navigation (8 items), Top Bar (connection indicator, user menu, panic freeze), responsive mobile drawer.

### Phase 2: Domain Modeling & Seed Data
- Create `src/domain/` modules:
  - `cards.js`: Types, sources (`bank_connection`, `cardhub_issuer`, `demo`), capabilities.
  - `rules.js`: Deterministic evaluation engine (`evaluateTransactionRule`).
  - `alerts.js`: Alert definitions, severities, triage states (`open`, `acknowledged`, `resolved`).
  - `connections.js`: Provider status and mock sync adapters.
- Enrich seed data with realistic demo bank cards, virtual cards, rules, alerts, and connections.

### Phase 3: Overview & My Cards Screen
- Implement updated `OverviewTab`:
  - Quick health summary (Looks normal / Needs review / Delayed).
  - Spend exposure metrics.
  - "Needs Attention" alert carousel/list.
  - Cards overview with masked PAN (`•••• 4821`) and source badges.
- Implement `MyCardsTab`:
  - Group by Linked Bank Cards, Virtual Protection Cards, and Demo Cards.
  - Card detail drawer with capability inspection (shows "Freeze real bank card is not supported by provider").

### Phase 4: Virtual Cards & 6-Step Creation Flow
- Dedicated `VirtualCardsTab`:
  - List by status: Active, Paused, Frozen, Depleted.
  - Budget progress bar per card.
- New 6-Step Virtual Card Creation Flow:
  1. Purpose (e.g., "Netflix", "AWS Services")
  2. Merchant Lock (e.g., restrict to Netflix only)
  3. Spending Controls (Per-transaction cap, monthly budget)
  4. Expiration / Schedule
  5. Notification Rules
  6. Review & Issuance (summarizing what is enforced vs. monitored)

### Phase 5: Activity, Alerts & Connection Health
- Refine `ActivityTab` with filters by card source, status, date, search, and pagination.
- Implement `AlertsTab`:
  - Filter by status (`Open`, `Acknowledged`, `Resolved`).
  - Triage actions: "Acknowledge", "Freeze Virtual Card", "Dismiss".
  - Clear reasons, evidence summaries, and severity badges.
- Implement `ConnectionsTab`:
  - Provider list (e.g., "Demo Plaid / Open Banking", "Demo Stripe Issuing").
  - Freshness timestamp, connection health, and capabilities.

### Phase 6: Rules & Limits + Interactive Simulation Engine
- Implement `RulesTab`:
  - Rule inventory with clear status badges: *Enforced by provider*, *Monitoring only*, *Demo only*, *Unavailable*.
  - Built-in "Interactive Transaction Simulator":
    - Select Card, enter Merchant, Amount, Currency, and test.
    - Deterministic evaluation report: `ALLOWED`, `DECLINED (Exceeds $150 cap)`, or `FLAGGED FOR REVIEW`.
    - Real-time audit log insertion.

### Phase 7: Settings Consolidation & Admin/Auth Integration
- Harmonize Settings:
  - Profile & Account
  - Security & Active Sessions
  - Notification Rules
  - Data Export & Reset
  - Retain Card Studio tool as a dedicated sub-view or drawer.
- Preserve Firebase auth flows, Admin Dashboard, and user data isolation.

### Phase 8: Verification, Polish & Documentation
- Run `npm run lint` and `npm run build`.
- Verify full keyboard and responsive interaction.
- Document demo vs live boundaries, Pakistan-specific market considerations, and compliance readiness.
