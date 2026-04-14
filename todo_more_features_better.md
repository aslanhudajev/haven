# FiftyFifty — Feature Priorities

Categorized as **NEED** (ship before launch / first paying users), **SHOULD** (next sprint, makes the product sticky), and **COULD** (nice-to-have, build when capacity allows). Each item notes what it touches (UI, DB, logic) so scope is clear.

---

## NEED — Without these the app is not shippable

### N1. Purchase categories (pre-filled)

**Why:** Every purchase is currently a bare amount + optional description. Without categories there is nothing to budget against, no insights to show, and the app feels like a shared notepad. This is table-stakes for any expense tracker.

**What it touches:**

- DB: `categories` table (id, family_id nullable for system defaults, name, icon, color, sort_order) + `purchases.category_id` FK.
- UI: Category picker in add-purchase and edit-purchase; colored category pill in PurchaseListWidget; category filter on ledger.
- Logic: Seed system-default rows (Mat, Transport, Noje, Hem, Ovrigt); family can add custom ones.

**Complexity:** Low-medium. Schema + picker + display. No new algorithmic work.

---

### N2. Edit and delete purchases

**Why:** Users make mistakes. Without edit/delete the only option is asking a developer. `PurchaseEditScreen` exists but is limited; `deletePurchase` entity lib exists but has no UI trigger.

**What it touches:**

- UI: Swipe-to-delete on PurchaseListWidget rows; edit form in PurchaseEditScreen (amount, description, category, receipt); confirmation dialog before delete.
- Logic: Entity libs already exist (`updatePurchase`, `deletePurchase`). Wire them up.

**Complexity:** Low. Mostly UI wiring.

---

### N3. Category budgets (sub-budgets)

**Why:** A single household budget number is too blunt. "Mat 5000 kr, Noje 2000 kr" is the core of knowing where money goes. This is the foundation that budget alerts, insights, and the income-based split all build on.

**What it touches:**

- DB: `category_budgets` table (id, family_id, category_id, amount_cents, period_cadence — or just per-period). FK to categories.
- UI: Budget setup screen (or section in family-settings); per-category progress bars on dashboard; over-budget indicator.
- Logic: Sum purchases by category per period; compare to budget; surface delta.

**Depends on:** N1 (categories).

**Complexity:** Medium. Schema design matters (per-family, per-category, per-cadence).

---

### N4. Recurring / fixed household costs

**Why:** Rent, el, Spotify, Netflix — costs that repeat every period. Without these the budget is always wrong because the biggest expenses are missing until someone manually logs them.

**What it touches:**

- DB: `recurring_costs` table (id, family_id, category_id, description, amount_cents, assigned_to user_id nullable, active boolean). Auto-logged at period start.
- UI: Manage recurring costs in family-settings or a dedicated screen; show as "auto" entries in purchase list with a distinct badge; toggle active/inactive.
- Logic: When `ensureActivePeriodForDashboard` creates a new period, insert purchases from active `recurring_costs` rows. Mark them so they aren't editable as normal purchases (or allow override).

**Depends on:** N1 (categories).

**Complexity:** Medium. The auto-insert on period rotation is the tricky part (idempotency, race conditions).

---

### N5. Income-based split (simple v1)

**Why:** This is the single biggest differentiator vs Buddy and every other shared-expense app. "Fair" does not mean 50/50 when one person earns twice as much. Even a simple version (each person enters monthly income, app computes ratio, settlement uses that ratio instead of even split) is a killer feature.

**What it touches:**

- DB: `family_members.income_cents` (nullable; null = even split). Or a separate `member_incomes` table if you want history.
- UI: Income input in family-settings per member; dashboard settlement shows the income-weighted result; explain the math clearly ("Based on your incomes, a fair split is 62/38").
- Logic: Extend `calculateSettlements` to accept a weight map instead of even share. `fairShareForMember = totalCents * (memberIncome / sumOfIncomes)`.

**Complexity:** Low for v1 (single ratio). Medium if per-category ratios are wanted later.

---

### N6. Month-end reconciliation screen

**Why:** The period report exists but is just a summary + "resolve" button. A proper reconciliation screen shows: total household spend, per-category breakdown, each person's contribution vs fair share, and the net settlement amount. This is the "aha" moment that makes the app worth paying for.

**What it touches:**

- UI: Enhance PeriodReportScreen (or new ReconciliationScreen): category breakdown bars, per-member contribution chart, settlement card with clear "Person A owes Person B X kr" and action button.
- Logic: Group purchases by category; compare to category budgets; feed into settlement calc.

**Depends on:** N1 (categories), N5 (income split for weighted settlement).

**Complexity:** Medium. Mostly UI + aggregation. Settlement logic already exists; needs the weight extension.

---

### N7. Edit profile after onboarding

**Why:** Users cannot change their display name after initial setup. This is a basic usability gap.

**What it touches:**

- UI: Profile section in SettingsScreen with name field (and later avatar).
- Logic: `updateProfile` already exists.

**Complexity:** Very low.

---

### N8. Dynamic currency in purchase labels

**Why:** The add-purchase label says "Amount (SEK)" regardless of family currency. Small but it looks broken for non-SEK families.

**What it touches:**

- UI: Read `family.currency` from gate context in add-purchase and edit-purchase; use it in labels and formatMoney calls.

**Complexity:** Trivial.

---

### N9. Shared goals and projects

**Why:** "Resa till Japan," "Ny soffa," "Handpenning till lägenhet." Both partners contribute, both track progress. This is deeply emotional — couples planning a future together. It covers what Splitwise does but with a shared savings feel, not a debt-tracking feel. Crucially, goals have **zero dependency on categories or budgets**, so they can be built in parallel with the category chain.

**What it touches:**

- DB: `goals` table (id, family_id, name, target_cents, icon, color, created_by, created_at, completed_at). `goal_contributions` table (id, goal_id, user_id, amount_cents, note, created_at).
- UI: Goals tab or section accessible from dashboard; goal list with progress rings; goal detail screen with contribution history per member; "Add contribution" form; goal creation form (name, target amount, icon).
- Logic: Progress = sum of contributions vs target. Dashboard summary card showing top active goals. Completed goals move to an archive.

**Complexity:** Medium. Clean schema + focused UI. Self-contained domain — no dependency on categories, budgets, or income split.

---

### N10. Account deletion

**Why:** Required by App Store and GDPR. Cannot ship without it.

**What it touches:**

- DB: Supabase Edge Function or RPC that deletes `auth.users` row (cascades to profiles, family_members, purchases). If user is owner, either transfer ownership or delete family.
- UI: "Delete my account" in Settings with confirmation dialog and explanation of consequences.

**Complexity:** Medium. The owner-of-family edge case needs a clear policy.

---

## SHOULD — Makes the product sticky and worth paying for

### S1. Budget alerts (push notifications)

**Why:** "You've used 90% of your food budget" is the kind of proactive nudge that makes the app feel alive. Notifications infrastructure is half-built (token sync exists, scheduling stubs exist).

**What it touches:**

- DB: Push tokens already stored. Need a check on purchase insert (trigger or edge function) or client-side check after adding a purchase.
- UI: Notification permission prompt (after onboarding); in-app banner or toast when threshold hit.
- Logic: After addPurchase, sum category spend for period, compare to category budget, fire local notification if threshold crossed.

**Depends on:** N1 + N3 (categories + category budgets).

**Complexity:** Medium. Local notifications are simpler than server-side; start there.

---

### S2. History and insights (v1)

**Why:** "You spent 800 kr more on food in March vs February." Simple trend lines per category across periods. Makes the data feel valuable over time.

**What it touches:**

- UI: New insights tab or section on the History/Ledger screen. Per-category spend bars across last N periods; delta callouts.
- Logic: Query purchases grouped by category + period. Compute deltas.

**Depends on:** N1 (categories).

**Complexity:** Medium. Queries are straightforward; the UI needs to be clean and not chart-heavy (no heavy charting lib needed — simple bars with `View` widths).

---

### S3. Supabase Realtime for purchases

**Why:** When one partner adds a purchase, the other sees it without pull-to-refresh. Makes the app feel like a shared live workspace.

**What it touches:**

- Logic: Subscribe to `purchases` table changes for current family_id on dashboard mount; update Zustand store on INSERT/UPDATE/DELETE.
- UI: No new screens; existing dashboard + ledger auto-update.

**Complexity:** Low-medium. Supabase Realtime is well-documented; main work is managing subscription lifecycle.

---

### S4. Haptic feedback + toast notifications

**Why:** Polish that makes the app feel premium. Every successful action (add purchase, resolve period, save settings) should have tactile + visual confirmation.

**What it touches:**

- UI: Lightweight toast component (or use a small lib); `expo-haptics` for button presses and confirmations.
- Logic: Wrap success paths in screens with toast + haptic calls.

**Complexity:** Low.

---

### S5. TanStack Query migration

**Why:** Already installed, completely unused. Would eliminate all manual `useState`/`useEffect` fetch patterns, give caching, background refetch, and optimistic updates. Makes every future feature faster to build.

**What it touches:**

- Logic: Replace manual fetch patterns in dashboard, ledger, settings, period-report with `useQuery` / `useMutation`. One screen at a time.

**Complexity:** Medium (volume of screens to migrate, not difficulty per screen).

---

### S6. Free vs premium gating

**Why:** Can't monetize without it. Need to decide: free tier = basic purchase logging with ads (or limited history); premium = income split, category budgets, insights, goals.

**What it touches:**

- Logic: Subscription entity already has RevenueCat integration. Add a `useIsPremium()` hook. Gate premium screens/features with a soft paywall ("Upgrade to unlock").
- UI: Lock icons on premium features; upgrade prompt modals.

**Complexity:** Low-medium (mostly product decisions + conditional rendering).

---

## COULD — Build when capacity allows, or as growth levers

### C1. Shared shopping list with budget logging

Items with estimated prices. Check off → auto-log as purchase in the right category. Nice synergy but not core for launch.

### C2. Chores tracker

Shared household chores, assignments, completion tracking. Broadens the app beyond finances into "household management." Different domain — risk of losing focus.

### C3. Shared household calendar

Bills, chores, due dates, events. Big scope. Could start with just period dates + goal milestones on a simple timeline view.

### C4. Swish payment requests

Requires Swish API partnership or deep-link integration. Sweden-only. High value for Swedish users but not buildable in-app without external dependency. Could start with a deep-link to Swish app with pre-filled amount.

### C5. Open Banking / automatic transaction logging

Tink or similar. Removes the biggest friction (manual entry). Justifies a higher price tier. Requires business agreements, compliance, and significant backend work. Plan for it but don't build it now.

### C6. Contextual partner offers

Mortgage suggestions when creating a "Handpenning" goal, cheaper electricity when adding "El" as recurring cost. Revenue opportunity but needs partners and careful UX to not feel spammy. Design the hooks (events/triggers) but don't fill them yet.

### C7. Receipt viewing and AI parsing

Receipt images are uploaded but can't be viewed. AI parsing (OCR → amount + category) would reduce manual entry. Nice-to-have; the manual flow works.

### C8. Skeleton loading screens

Replace ActivityIndicator with content-shaped placeholder animations. Pure polish.

### C9. Illustrated empty states

Custom illustrations for "no purchases yet," "no periods," etc. Branding opportunity.

---

## Suggested build order (NEED tier)


Two parallel tracks: the **budget chain** (categories → budgets → recurring → split → reconciliation) and the **goals track** (independent, can be built alongside any budget-chain item).

| Order | Feature | Why this order |
|-------|---------|----------------|
| 1 | N7 — Edit profile | Trivial, immediate quality-of-life |
| 2 | N8 — Dynamic currency | Trivial, fixes a visible bug |
| 3 | N2 — Edit/delete purchases | Low effort, high usability impact |
| 4 | N1 — Purchase categories | Foundation for N3, N4, N6, S1, S2 |
| 5a | N3 — Category budgets | Core budgeting feature, builds on N1 |
| 5b | N9 — Shared goals & projects | No dependencies — can be built in parallel with N3 |
| 6 | N4 — Recurring costs | Completes the budget picture, builds on N1 |
| 7 | N5 — Income-based split (v1) | The differentiator, unlocks N6 |
| 8 | N6 — Reconciliation screen | The "aha" moment, builds on N1 + N5 |
| 9 | N10 — Account deletion | Required for App Store submission |


---

## Notes

- **Reference app** (`reference_app/`) is the guide for code style, FSD structure, entity patterns, screen decomposition, and widget conventions. Always check it before building.
- **No new dependencies** unless on the approved list. StyleSheet.create only. No NativeWind.
- Every new table needs RLS policies, generated types update (`npm run db:types`), and entity libs + barrel exports.
- Every new screen needs a thin route file in `src/app/`, a screen barrel in `src/screens/`, and registration in the appropriate layout.