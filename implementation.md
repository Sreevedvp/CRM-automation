# CRM Automation — Implementation Plan

## 1. Overview

This system automates the full lead lifecycle: intake → scoring → routing (Hot/Warm/Cold) → multi-channel engagement (WhatsApp + Email) → sales handoff → conversion or nurture. It is modeled as a **state machine** driving an **automation/rules engine**, backed by a CRM data store and integrated with WhatsApp Business API and an email provider.

**Core principle:** every lead has exactly one current state at any time, and every automated action (message, task, notification) is a side effect of a state transition — never fired from scattered ad-hoc logic. This keeps the system debuggable and auditable.

---

## 2. System Architecture

```
┌────────────────────┐
│  Lead Sources        │  (website forms, ads, WhatsApp inbound, manual entry, imports)
└──────────┬──────────┘
           ▼
┌────────────────────┐
│  Intake API / Webhook│
└──────────┬──────────┘
           ▼
┌────────────────────┐      ┌──────────────────────┐
│  Validation Service   │───▶│  Deduplication Service │
└──────────┬──────────┘      └──────────┬────────────┘
           ▼                             ▼
┌────────────────────┐      ┌──────────────────────┐
│  Scoring Engine       │◀───│  Lead Store (DB)         │
└──────────┬──────────┘      └──────────────────────┘
           ▼
┌─────────────────────────────────────────────┐
│         Workflow / Automation Engine            │
│  (state machine + rule triggers + scheduler)   │
└──────────┬───────────────────┬────────────────┘
           ▼                   ▼
┌──────────────────┐  ┌──────────────────────┐
│  WhatsApp Business  │  │  Email Service (SMTP/  │
│  API (templates)    │  │  SES/SendGrid)          │
└──────────────────┘  └──────────────────────┘
           ▼
┌────────────────────┐
│  Sales Rep UI/App     │  (task inbox, lead detail, status actions)
└────────────────────┘
```

**Key components**

| Component | Responsibility |
|---|---|
| Intake API / Webhook | Receives leads from all sources, normalizes payload |
| Validation Service | Checks required fields, phone/email format, junk filtering |
| Deduplication Service | Fuzzy-matches phone/email/name against existing leads |
| Scoring Engine | Rule-based (or ML) scoring → Hot/Warm/Cold classification |
| Workflow/Automation Engine | State machine; owns all transition logic and side effects |
| Integration Layer | WhatsApp Business API, Email provider, SMS (optional) |
| CRM Data Layer | Leads, Customers, Tasks, Message logs, Activity audit trail |
| Sales Rep UI | Task inbox, lead detail view, status update actions |
| Scheduler/Queue | Delayed jobs for follow-up sequences, nurture campaigns |

---

## 3. Data Model

### Lead
- `id`, `name`, `phone`, `email`, `source`, `raw_payload`
- `status`: `new | validated | duplicate | hot | warm | cold | replied | interested | converted | not_interested | nurture`
- `score` (numeric), `score_breakdown` (json)
- `assigned_to` (sales_exec_id, nullable)
- `created_at`, `updated_at`, `last_contacted_at`
- `not_interested_reason` (nullable)

### Customer (post-conversion)
- `linked_lead_id`, full customer profile fields, `converted_at`

### Task
- `lead_id`, `type` (`follow_up | call | site_visit`), `due_date`, `status`, `assigned_to`

### MessageLog
- `lead_id`, `channel` (`whatsapp | email`), `template_used`, `status` (sent/delivered/read/failed), `direction` (outbound/inbound), `timestamp`

### AutomationRun (audit trail)
- `lead_id`, `trigger`, `actions_executed`, `timestamp`, `success/failure`

---

## 4. Workflow / State Machine

### 4.1 Intake & Routing

```
New lead
  → Validate
  → Check duplicate
  → Score lead
  → Add to CRM
  → Route based on score: HOT | WARM | COLD
```

- **Validate**: required fields present, phone/email format valid, source whitelisted. Invalid leads are logged and discarded (or flagged for manual review) — never enter the scoring pipeline.
- **Check duplicate**: match on phone (primary key), fallback to email/name fuzzy match. If duplicate → merge activity history into the existing lead record instead of creating a new one; do not restart automations that are already in progress.
- **Score lead**: rule-based scoring (budget, intent signals, source quality, engagement recency, company size, etc.) or a pluggable ML model behind the same interface. Store `score_breakdown` for transparency/debugging.
- **Add to CRM**: persist lead with computed status.

### 4.2 HOT path

```
HOT
  → Assign to sales executive (round-robin / territory / workload-based)
  → Send approved WhatsApp template
  → Send email
  → Create follow-up task (due in N hours)
```

Assignment should be atomic — use a locking/queue mechanism so two leads aren't double-assigned to the same rep in a race condition. WhatsApp templates must be pre-approved (Meta Business Manager) since this is outside the 24-hour session window for a brand-new contact.

### 4.3 WARM path

```
WARM
  → WhatsApp message
  → Email
  → Automated follow-up sequence (day 1, day 3, day 7 — configurable cadence)
```

No immediate human assignment — this runs fully automated until the lead replies or is manually escalated. Sequence steps are scheduled jobs; each step checks the lead's current status before firing (so a reply or manual override stops it — see §4.4).

### 4.4 COLD path

```
COLD
  → Enter marketing/nurture campaign (longer-cycle content: newsletters, retargeting, drip email)
```

Cold leads are batched into the marketing automation tool/list rather than handled by the sales-triggered engine.

### 4.5 Reply handling (cuts across all paths)

```
Customer replies (WhatsApp or email)
  → STOP all pending automated messages/sequence steps for this lead
  → Notify assigned salesperson (or auto-assign if none yet)
  → Set status → "replied"
```

This is the most safety-critical rule in the system: **any inbound message must immediately cancel all queued automation jobs for that lead** before anything else happens. Implement this as a hard interrupt on the scheduler, not a "best effort" check, to avoid a bot message going out after a human already replied.

### 4.6 Sales rep actions

```
Salesperson marks "Interested"
  → Create call / site-visit task

Salesperson marks "Converted"
  → Stop all lead campaigns/automations
  → Move lead → Customer record

Salesperson marks "Not Interested"
  → Capture reason (dropdown + free text)
  → Move lead → nurture (cold/marketing track, not deleted)
```

These are manual state transitions triggered from the rep UI. Each should be idempotent (marking "Converted" twice shouldn't double-fire the conversion side effects) and fully logged in `AutomationRun`/activity history for reporting.

---

## 5. Integrations

| Integration | Purpose | Notes |
|---|---|---|
| WhatsApp Business API (via Meta Cloud API or a BSP like Gupshup/Twilio/Interakt) | Template messages, session replies | Requires pre-approved message templates for the Hot/Warm outbound steps; free-form replies only allowed within 24h session window |
| Email provider (SES, SendGrid, Postmark) | Transactional + sequence emails | Track opens/bounces to feed back into scoring |
| CRM database | Source of truth for leads/customers | Postgres recommended for relational integrity + JSON columns for flexible fields |
| Job queue/scheduler | Follow-up sequences, delayed tasks | Redis + BullMQ, or Celery, or a cron-based scheduler depending on stack |
| Sales rep notification channel | Instant alerts on reply/hot lead | Push notification, in-app, or Slack/WhatsApp internal alert |

---

## 6. Recommended Tech Stack

- **Backend**: Node.js (NestJS) or a framework you're already comfortable with; workflow engine as a dedicated service/module rather than mixed into request handlers
- **Database**: PostgreSQL (leads, tasks, customers, logs)
- **Queue**: Redis + BullMQ for scheduled/delayed jobs (follow-up sequences, retries)
- **Frontend (rep console)**: Angular (matches your existing stack) with a task inbox and lead detail view
- **WhatsApp**: Meta Cloud API directly, or a BSP for easier template management and multi-agent inboxes
- **Hosting**: Kubernetes (fits your existing `atai-infra` setup) — the automation engine and integration workers as separate deployable services so WhatsApp/email retries don't block the API

---

## 7. Implementation Phases

**Phase 1 — Foundation (1–2 weeks)**
- Data model + migrations (Lead, Customer, Task, MessageLog)
- Intake API + validation service
- Basic CRM UI (list, detail view)

**Phase 2 — Scoring & Deduplication (1 week)**
- Duplicate detection logic
- Rule-based scoring engine with configurable weights
- Hot/Warm/Cold classification

**Phase 3 — Automation Engine (2 weeks)**
- State machine implementation
- WhatsApp Business API integration (template sending)
- Email integration
- Task creation logic (follow-up, call, site-visit)

**Phase 4 — Reply Handling & Sales Actions (1 week)**
- Inbound message webhook → automation-stop interrupt
- Salesperson notification pipeline
- Rep UI actions: Interested / Converted / Not Interested

**Phase 5 — Nurture & Sequences (1 week)**
- Warm follow-up sequence scheduler
- Cold marketing/nurture campaign handoff
- Not-interested reason capture → nurture track

**Phase 6 — Reporting & Hardening (1 week)**
- Automation audit trail / activity log UI
- Conversion funnel reporting (New → Hot/Warm/Cold → Converted)
- Load testing WhatsApp/email rate limits, retry/backoff logic

---

## 8. Edge Cases & Operational Considerations

- **Race condition on reply vs. scheduled send**: use a lock or status check immediately before every automated send — if status has changed to `replied`/`interested`/`converted` since the job was queued, skip the send.
- **Duplicate leads across sources**: define a clear merge policy (which fields win, whether score recalculates).
- **WhatsApp template rejection/expiry**: monitor template approval status; have a fallback (email-only) if WhatsApp send fails.
- **Rep reassignment/leave**: leads assigned to an inactive rep need a reassignment rule (round-robin fallback).
- **Not Interested → re-engagement**: define how long a lead stays in nurture before being eligible for re-scoring (e.g., re-enter pipeline after 90 days if they re-engage).
- **Compliance**: WhatsApp opt-in/opt-out handling, email unsubscribe links, data retention policy for lead records.