# FiftyFifty — TODO

Everything that is missing, broken, half-built, or needs attention before this app can ship.

---

## 0. Temporary — Revert paywall bypass (after Lunar / Apple banking is fixed)

**Context:** Paid Apps / banking on App Store Connect was blocked (Lunar bank issues), so the App Store paywall gate is **disabled** in code. Users go: welcome → login → onboarding → app without seeing `/paywall`. New families are activated in Postgres without a RevenueCat entitlement (same path as the old “no RC” dev behavior).

**When Lunar / Apple payouts are sorted and subscriptions can be sold again, do this:**

- [ ] **Flip the master switch:** In [`src/shared/config/billingGate.ts`](src/shared/config/billingGate.ts), set **`SKIP_PAYWALL`** to **`false`**. That alone restores normal gate routing (anonymous + signed-in users without a sub are sent to `/paywall` again; owners with `families.is_active === false` go to paywall, members to sub-expired).

- [ ] **No other file edits are required** for the gate: [`useAppGate.ts`](src/application/providers/AppGateProvider/useAppGate.ts) already branches on `SKIP_PAYWALL`. Leaving the flag in place at `false` keeps the “easy plug” for future emergencies.

- [ ] **Create-family behavior:** [`CreateFamilyScreen.tsx`](src/screens/create-family/ui/CreateFamilyScreen.tsx) uses `if (!REVENUECAT_ENABLED || SKIP_PAYWALL)` to set `is_active: true` and `max_members: DEV_DEFAULT_MAX_MEMBERS`. With **`SKIP_PAYWALL === false`**, production builds with RevenueCat enabled go back to the **RC sync + `checkSubscription()`** path only—families stay inactive until purchase/webhook/client reconciliation works.

- [ ] **Ship a new build** after flipping the flag (the value is compiled into the binary).

- [ ] **Sanity-check before release:** Paid Apps agreement + banking active in ASC, **production** RevenueCat public SDK key in EAS, products/entitlements/offerings aligned, optional App Store Server Notifications URL → RevenueCat. Test **sandbox purchase** on a TestFlight build after revert.

- [ ] **App gate — `resolveUserData` owner reconciliation (bypass-only path):** In [`useAppGate.ts`](src/application/providers/AppGateProvider/useAppGate.ts), inside `resolveUserData`, after loading `family` + `family_members` for the current user:

  - **While `SKIP_PAYWALL` is `true`:** If the user is the **owner** and `families.is_active` is **`false`**, the client runs a **direct Supabase update** on that family row: `is_active: true`, `max_members: DEV_DEFAULT_MAX_MEMBERS` (same default as create-family / dev). It then **re-fetches** the family via `getFamily(userId)`. It does **not** call `syncRevenueCatSubscription()`, `checkSubscription()`, `getSubscriptionTier()`, or `resolveMaxMembersForTier()` on that path—so no edge sync and no SDK entitlement check for this reconciliation.

  - **Purpose:** Fixes **legacy or edge-case rows** that stayed inactive in Postgres during bypass (e.g. family created before the create-family patch, or owner never got a successful RC reconciliation). Without this, the gate would still let users in (other `SKIP_PAYWALL` branches), but **`family.is_active` could remain `false`** in context—bad for paywall renewal copy, consistency, and anything that reads the row later.

  - **After revert (`SKIP_PAYWALL === false`):** The bypass block is skipped. Owners with inactive families go through the **normal** branch again: `REVENUECAT_ENABLED` → `syncRevenueCatSubscription()` → refresh family → if still inactive, `checkSubscription()` and tier-based `max_members` patch. **You do not need to delete this code** when turning the bypass off; it becomes dead for the `SKIP_PAYWALL` branch only.

  - **Optional later cleanup:** If you want zero temporary branching in the gate file, you could remove the entire `if (SKIP_PAYWALL) { … owner inactive patch … }` block once bypass is permanently gone—but only after you are sure you will never ship another “emergency” bypass; otherwise keeping it behind `SKIP_PAYWALL` preserves the single-switch story.

---

## 1. RevenueCat ↔ Supabase Identity Gap (Critical)

The current "pay-first" flow has a fundamental timing problem:

1. User opens app → anonymous RevenueCat customer is created (`configureRevenueCat`).
2. User pays on the Paywall → purchase is recorded under `$RCAnonymousID:xxxx`.
3. User signs in with Supabase → `loginRevenueCat(userId)` merges anonymous → identified.
4. User creates family → `CreateFamilyScreen` does a client-side sync (`supabase.update` on `families`).

**What breaks:**

- [ ] **Webhook receives anonymous ID for the initial purchase.** RevenueCat fires `INITIAL_PURCHASE` *immediately* after payment. At that point `app_user_id` is the anonymous RC ID, not the Supabase user ID. The webhook looks up `family_members` by this anonymous ID → finds nothing → silently returns `{ status: "no_family" }`. The webhook never fires again for that event.
- [ ] **No family exists yet at time of purchase.** Even if the webhook had the right user ID, there's no family row to update because family creation happens *after* payment and auth. The webhook does nothing.
- [ ] **Client-side sync in `CreateFamilyScreen` is the only thing that works right now.** If this call fails (network issue, app crash), `is_active` stays `false` and `max_members` stays at default. There's no retry or reconciliation.
- [ ] **If user pays, closes app before signing in, and reopens** — the anonymous purchase is orphaned. `checkSubscription()` will still work on that device (RevenueCat SDK remembers the anonymous ID locally), but if they switch devices or reinstall, the purchase is lost because it was never linked to their Supabase ID.
- [ ] **Restore Purchases on a new device** won't work for initial anonymous purchases that were never merged.

**Proposed fix:** Either (a) flip to sign-in-first / pay-second so the webhook always has a real user ID, or (b) add a server-side reconciliation step: after family creation, call a Supabase Edge Function that fetches the user's RevenueCat customer info by Supabase user ID and syncs `is_active` + `max_members`. This makes the client-side sync a best-effort optimization and the server a reliable fallback.

---

## 2. Auth / Pay / Invite Flow Edge Cases

### Invite flow gaps

- [ ] **Invitee already has a family.** `joinFamily` will insert into `family_members` and succeed — the user now has two family memberships. `getFamily` returns whichever one comes first. There's no constraint preventing multi-family membership and no UI to choose between families.
- [ ] **Invitee accepts invite, joins family, then the owner deletes the family.** The invitee's `getFamily` returns `null`. The gate sends them to `create-family`. But they're not a subscriber — they never paid. Gate should detect "has no family AND has no subscription" and decide: paywall or something else?
- [ ] **Invite link opened on a device where app isn't installed.** Deep link goes nowhere. No Universal Links / App Links configured for production. Need a web landing page or App Clip / Instant App.
- [ ] **Invite code is already used.** `joinFamily` filters `is('used_by', null)` so it throws "Invite is invalid or expired". The error message doesn't distinguish between used/expired/nonexistent.
- [ ] **Invitee denies invite.** Currently clears `fiftyfifty:pending_invite` and calls `refresh()`. But `refresh` re-evaluates the gate — the user has no subscription and no family, so they go to paywall. Is that correct? They might just want to browse or they might already be in another family.
- [ ] **What if invitee is already signed in when they tap the link?** The `InviteScreen` checks `user` and calls `joinFamily` directly. But what if the signed-in user is already in a different family? No check for that.
- [ ] **Invite used_at timestamp.** The `family_invites` table has no `used_at` column — only `used_by`. `joinFamily` only sets `used_by`, not when it was used. Minor data gap.
- [ ] **Expired invite cleanup.** Old invites are never deleted. No cron/scheduled function to clean them up.
- [ ] **Invite link format.** Currently `fiftyfifty://invite/${code}` (custom scheme). For production, Universal Links need `https://yourdomain.com/invite/${code}` with an `apple-app-site-association` file and Android `assetlinks.json`.

### Owner actions

- [ ] **Kick member.** Owner can delete the family or leave it, but there's no way to remove a specific member. The RLS allows it (`is_family_owner(family_id)` in the USING clause of `family_members_write`), but no UI or lib function exists.
- [ ] **Transfer ownership.** If the owner wants to leave without deleting the family, there's no transfer mechanism. The owner is hardcoded via `families.owner_id` and `family_members.role = 'owner'`.
- [ ] **Owner deletes family cascading effects.** `families` has `ON DELETE CASCADE` on `family_members`, `family_invites`, `periods`, `purchases`. The cascade works at DB level, but no client-side notification goes to members. They'll just see errors or get routed to `create-family` on next app open.
- [ ] **Owner downgrades subscription.** If `max_members` drops below current member count, no one gets kicked. The `enforce_family_member_limit` trigger prevents new adds but doesn't eject existing members. Need a policy for this (options: block downgrade, notify owner to remove members, or grandfather existing members).

### Subscription edge cases

- [ ] **Subscription expires (member perspective).** Members see `SubExpiredScreen`. But they can't do anything useful — just refresh or sign out. No option to leave the family and start their own.
- [ ] **Subscription expires (owner perspective).** Owner sees Paywall for renewal. But if they choose not to renew, they're stuck on the paywall with no way to delete their family or change anything.
- [ ] **Grace period / billing retry.** RevenueCat sends `BILLING_ISSUE` before `EXPIRATION`. The webhook correctly deactivates on `BILLING_ISSUE`, but there's no UI for "your payment failed, please update your card" — the user just sees the subscription expired screen.
- [ ] **`CANCELLATION` event not handled in webhook.** `deactivatingEvents` list has `EXPIRATION`, `BILLING_ISSUE`, `SUBSCRIPTION_PAUSED` but not `CANCELLATION`. A cancelled-but-not-yet-expired subscription should remain active until expiry.
- [ ] **`PRODUCT_CHANGE` (downgrade) not checked for member overflow.** If someone downgrades from **Family** (5) to **Duo** (2) while 3+ people are in the family, `max_members` can drop but nobody is removed automatically.

---

## 3. Notifications (Unfinished)

- [ ] **Push notifications are never actually triggered.** `schedulePeriodEndNotification` exists in `@shared/lib/notifications` but is never called anywhere — not in dashboard, not in period creation, not in auto-rotation.
- [ ] **Push token not stored.** `registerForPushNotifications` returns the Expo push token but nothing saves it to a `push_tokens` table in Supabase. Server-side notifications are impossible without this.
- [ ] **No server-side push.** The plan mentions "period end report ready" notifications. This requires a server-side cron (Supabase `pg_cron` or Edge Function on a schedule) that checks which periods ended and sends pushes. None of this exists.
- [ ] **Permission request timing.** `registerForPushNotifications` is never called, so the user is never asked for notification permission. Need to integrate this into onboarding or first period creation.
- [ ] **Notification tap handling.** No listener for when a user taps a notification to deep-link into the period report.

---

## 4. Missing Features

### Purchases

- [ ] **No edit purchase.** Once added, a purchase can't be edited. No UI, no lib function.
- [ ] **No delete purchase.** Same — no way to remove a mistake. RLS allows it (`purchases_own_manage` uses `FOR ALL`), but no UI.
- [ ] **Currency hardcoded in Add Purchase.** Label says "Amount (SEK)" regardless of the family's actual currency setting.
- [ ] **No purchase categories / tags.** Planned for later but worth tracking.
- [ ] **Receipt viewing.** Receipt images are uploaded and `receipt_url` is stored, but there's no way to tap a purchase and view the receipt image. No detail screen for individual purchases.
- [ ] **AI receipt parsing.** Mentioned in the original spec as a future feature. No groundwork laid.

### Profile

- [ ] **No profile picture upload.** `avatar_url` column exists but nothing lets the user set it. No camera/gallery picker on the profile screen.
- [ ] **No edit profile after onboarding.** Once `onboarding_completed` is true, there's no way to change your display name or avatar. Need a profile section in Settings.

### Family

- [ ] **No family avatar/icon.**
- [ ] **Can't change family currency after creation** without going to family settings (this works, but the purchase display still hardcodes "SEK" in the amount label).
- [ ] **Budget cycle label says "Monthly" in `CreateFamilyScreen` even when cadence is weekly.** Line: `label="Monthly budget (SEK, optional)"`.

### Realtime

- [ ] **No Supabase Realtime.** When one family member adds a purchase, the other member has to pull-to-refresh to see it. Supabase Realtime subscriptions on `purchases` and `periods` would give live updates.

### TanStack Query

- [ ] **Installed but completely unused.** The app manually manages loading/error/data states in every screen with `useState` + `useEffect`. TanStack Query would eliminate all of that boilerplate and give caching, background refetch, and optimistic updates for free.

---

## 5. Database & Backend Issues

### Missing bucket

- [ ] **`receipts` storage bucket not created.** The migration creates RLS policies for `storage.objects` where `bucket_id = 'receipts'`, but no migration creates the bucket itself. It works locally because `uploadReceipt` creates it on the fly, but on a fresh Supabase project or `db reset`, the bucket doesn't exist. Need to create it in `supabase/seed.sql` or via a function.

### Missing constraints

- [ ] **No unique constraint on "one family per user".** A user can theoretically be a member of multiple families. `getFamily` just returns the first one. Either add a partial unique index on `family_members(user_id)` or handle multi-family in the UI.
- [ ] **No constraint that a family has exactly one owner.** Nothing prevents zero owners or two owners in `family_members`.

### Missing indexes

- [ ] **No indexes beyond primary keys and the UNIQUE on `family_members(family_id, user_id)`.** Queries that filter by `user_id` on `family_members`, `purchases`, and `periods` by `family_id` + `status` should have indexes for performance at scale.

### RLS concern

- [ ] **`family_invites_authenticated_read` allows any authenticated user to SELECT all invites.** `USING (true)` means any logged-in user can enumerate all invite codes. This is a security risk — they could brute-force valid codes. Should restrict to `created_by = auth.uid()` or `public.is_family_owner(family_id)` for listing, and use a server-side function for code redemption.

### Period management

- [ ] **Only the dashboard auto-rotates periods.** If no one opens the app for a week, periods don't advance. A server-side cron would be more reliable. Currently, if a user opens the History tab before the Dashboard after a period expired, the old period is still "active".
- [ ] **`periods_member_manage` policy lets any member do anything to periods.** A member could delete or archive the active period. Consider restricting write operations to the owner.

---

## 6. UX / Polish

- [ ] **No loading skeleton screens.** Every screen shows a plain `ActivityIndicator`. Skeleton loaders would feel more polished.
- [ ] **No error boundary.** If a screen crashes (e.g. bad data shape), the entire app goes white. A React error boundary with a "Something went wrong" fallback is needed.
- [ ] **No haptic feedback.** Taps on buttons, FAB, or segmented controls have no tactile response.
- [ ] **No toast/snackbar for success actions.** After adding a purchase, resolving a period, or saving settings, there's only an `Alert.alert`. A non-blocking toast would be better UX.
- [ ] **No empty states with illustrations.** Dashboard with no purchases, History with no periods — both show plain text. Would benefit from illustrated empty states.
- [ ] **No swipe-to-delete on purchases.**
- [ ] **No pull-to-refresh on History tab when it's empty** (the empty state doesn't have a ScrollView wrapper).
- [ ] **Dark mode not fully tested.** Colors are themed, but some hardcoded colors exist (e.g. `#208AEF` for accent in PaywallScreen, `#FF3B30` for destructive text).
- [ ] **No app icon.** `app.json` points to placeholder icon files.
- [ ] **No onboarding for invited members.** When an invited member joins, they go straight to the main app. There's no explanation of what the app does or how it works for them.
- [ ] **Budget progress bar.** The dashboard shows a balance card but doesn't visualize how close the family is to their budget limit.
- [ ] **Period name is auto-generated but not editable.** Users might want custom period names.

---

## 7. Testing & DevX

- [ ] **No tests at all.** No unit tests for settlement calculation, period date computation, or any business logic. No integration tests for the gate logic. No E2E tests.
- [ ] **No ESLint / Prettier config.** Code formatting is inconsistent across files (some use trailing commas, some don't; mixed quote styles possible).
- [ ] **TypeScript errors not checked in CI.** No GitHub Actions or CI pipeline.
- [ ] **Seed data is minimal.** `seed.sql` exists but doesn't create realistic test data (multiple families, members, periods, purchases) for development.
- [ ] **No Storybook or component catalog** for shared UI components.

---

## 8. Production Readiness

- [ ] **Deep linking for production.** Universal Links (iOS) and App Links (Android) need domain verification files served from a web domain. Currently only custom scheme `fiftyfifty://` works.
- [ ] **RevenueCat webhook URL not configured.** The edge function exists but needs to be deployed and the URL registered in RevenueCat dashboard with an auth token.
- [ ] **No Sentry / error tracking.**
- [ ] **No analytics.** No way to know how many users complete onboarding, how many create families, purchase frequency, etc.
- [ ] **No rate limiting on invite creation.** An owner could spam-create thousands of invites.
- [ ] **No Terms of Service / Privacy Policy** screens or links.
- [ ] **No account deletion flow.** Required by App Store and GDPR. Need a "Delete my account" button that removes the user from `auth.users` (cascades to profiles, family_members) and handles the family if they're the owner.
- [ ] **No versioning strategy.** `version: "1.0.0"` with no OTA update configuration (EAS Update).
- [ ] **`expo-sqlite` plugin in app.json** but SQLite isn't used anywhere. Dead dependency.

---

## Priority Order (suggested)

0. **Revert `SKIP_PAYWALL`** (section 0) — as soon as Lunar / Apple banking allows real IAP; until then keep bypass for TestFlight/production testers.
1. **RevenueCat ↔ Supabase identity reconciliation** — the subscription model is broken without this
2. **Multi-family membership guard** — data integrity issue
3. **Invite flow edge cases** (already-in-family, expired, used, signed-in user)
4. **Notifications** — core feature that's completely unfinished
5. **Edit/delete purchases** — basic CRUD missing
6. **Account deletion** — App Store requirement
7. **RLS tightening** (invites enumeration, period write restriction)
8. **Deep linking for production** — invites don't work without this
9. **Profile editing** — name/avatar changes after onboarding
10. **Tests** — settlement calc and period date math are the highest-value targets
11. **TanStack Query migration** — big quality-of-life improvement, reduces boilerplate
12. **Supabase Realtime** — live purchase updates between family members
13. **Everything else** — polish, analytics, AI receipt parsing, etc.
