# Razorpay + RazorpayX Integration — Approach (AWS Lambda backend)

> **Status:** PLAN ONLY. Amounts in **paise**. Money math unchanged from `enrollment-payout-workflow.md`.
> **Server side = AWS Lambda** (behind API Gateway). No Supabase Edge Functions. Lambdas talk to Supabase with the **service-role key**; all Razorpay/X secrets live in Lambda env / AWS Secrets Manager — never in the Vite client (`VITE_*`).

---

## 1. Architecture

```
STUDENT (learner app)                        ADMIN (this dashboard)
─────────────────────                        ──────────────────────
POST /payments/create-order ─► Razorpay      POST /payouts/process (admin JWT)
        │                      Orders API            │
        ▼                                            ├─► RPC process_all_payouts
Razorpay Checkout (frontend)                         │   (PENDING rows, computes amounts)
        │                                            ▼
POST /payments/verify ─► HMAC check          RazorpayX Payouts API (per faculty)
        │                                            │
        ▼                                            ▼
enrollment created                           pout_ id → faculty_transactions.payment_id
(payment_id, payment_status='SUCCESS')       status PENDING → SUCCESS/FAILED
        ▲                                            ▲
POST /webhooks/razorpay (safety net)         POST /webhooks/razorpayx
```

| Leg | Product | Trigger | Consumer |
|---|---|---|---|
| Collection | Razorpay PG | Student checkout | Learner app → Lambda |
| Disbursal | RazorpayX | Admin "Process Payouts" | This dashboard → Lambda |

---

## 2. Razorpay — Student Purchase

1. **`POST /payments/create-order`** (student JWT): Lambda re-reads `courses.final_price` from DB (ignore client amount), adds GST (18%), creates Razorpay Order, inserts `payment_orders` row (`CREATED`). Returns `razorpay_order_id` + public `key_id`.
2. **Checkout** opens in learner app with that order id.
3. **`POST /payments/verify`**: Lambda verifies `HMAC-SHA256(order_id|payment_id, key_secret)` → marks order `PAID` → creates `enrollments` / `bundle_enrollments` row with `payment_id`, `payment_status='SUCCESS'`, `amount_paid`, `gst_amount`, `course_price`. Existing admin/commission/payout logic works unchanged.
4. **`POST /webhooks/razorpay`** (verify `X-Razorpay-Signature`): `payment.captured` → create enrollment if step 3 never ran (idempotent on unique `razorpay_payment_id`); `payment.failed` → order `FAILED`; `refund.processed` → mark enrollment refunded + `REFUND` ledger row.

Verify **and** webhook both exist because the browser callback can be lost and webhooks can be delayed — idempotency guarantees exactly one enrollment per payment.

**New table `payment_orders`:** `id, student_id, course_id|bundle_id, amount, gst_amount, razorpay_order_id (unique), razorpay_payment_id (unique, nullable), status CREATED|PAID|FAILED|REFUNDED, created_at, paid_at`. RLS: students read own rows; only service role writes. Also add unique constraint on `enrollments(payment_id)`.

**Dashboard impact:** show real payment id in `FinancialTransactionsTable` (link to Razorpay dashboard), add FAILED/REFUNDED filter.

---

## 3. RazorpayX — Faculty Payouts

### 3.1 Beneficiary onboarding (nothing exists today)

**New table `faculty_payout_accounts`:** `id, faculty_id (unique), account_type bank_account|vpa, account_holder_name, account_number_last4, ifsc, vpa, razorpay_contact_id, razorpay_fund_account_id, verification_status PENDING|VERIFIED|FAILED, is_active`.

- **`POST /payouts/account`** (admin/faculty JWT): creates RazorpayX Contact + Fund Account, optional penny-drop validation, stores ids. Full account number never stored in our DB (last-4 only).
- Admin UI: payout-account status per faculty (badge in `CommissionFacultiesTable` or a section under `src/features/financial/`). Process Payouts **skips faculty without a VERIFIED account** and reports them.

### 3.2 Payout run

Current: `financial.api.ts:processAllPayouts()` → RPC `process_all_payouts` (writes DEMO `payment_id`). Change: keep computation in the RPC, move money movement to Lambda.

1. Dashboard calls **`POST /payouts/process`** (admin JWT; Lambda re-checks role — don't trust UI).
2. Lambda runs modified RPC: same math, but writes `payment_id = NULL`, `status = 'PENDING'`, returns `{faculty_id, payout_row_id, amount, fund_account_id}[]`.
3. Per faculty: RazorpayX **Create Payout** (`fund_account_id`, amount, `mode IMPS/NEFT`, **`reference_id = payout_row_id`** + `X-Payout-Idempotency` header → retries can't double-pay). Writes `pout_` id to the `PAYOUT` (+ linked `PLATFORM_EARNING`) rows.
4. **`POST /webhooks/razorpayx`**: `payout.processed` → status `SUCCESS`; `payout.failed`/`reversed` → `FAILED`.
5. One faculty failing doesn't block others; Lambda returns `{succeeded, failed[], skipped_no_account[]}` for `PayoutDetailsModal`. "Retry failed" re-runs only `FAILED` rows with the same `reference_id`.

**Business prerequisites:** RazorpayX needs separate activation/KYC and a funded virtual account (PG settlements land T+2; decide funding cadence into X balance).

---

## 4. Lambda Endpoints & Secrets

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /payments/create-order` | student JWT | Server-priced order + `payment_orders` row |
| `POST /payments/verify` | student JWT | HMAC verify → enrollment |
| `POST /webhooks/razorpay` | webhook signature | captured / failed / refund |
| `POST /payouts/account` | admin/faculty JWT | RazorpayX contact + fund account |
| `POST /payouts/process` | admin JWT | RPC + fire payouts |
| `POST /webhooks/razorpayx` | webhook signature | payout status → ledger |

JWT auth = verify the Supabase access token (JWT secret / JWKS) in the Lambda, then check `profiles.role`.

Secrets (Lambda env / Secrets Manager): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAYX_KEY_ID`, `RAZORPAYX_KEY_SECRET`, `RAZORPAYX_ACCOUNT_NUMBER`, `RAZORPAYX_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Only the public `RAZORPAY_KEY_ID` reaches the learner-app client.

Dashboard config: add `VITE_API_BASE_URL` route for the payouts endpoints (var already exists in `.env`).

---

## 5. Security Checklist

- [ ] Amounts computed server-side from DB prices only.
- [ ] Signature verification on checkout callback + every webhook.
- [ ] Idempotency: unique `razorpay_payment_id`; payout `reference_id` + idempotency header.
- [ ] Admin role re-checked inside `/payouts/process`.
- [ ] RLS on `payment_orders` / `faculty_payout_accounts`; service-role-only writes.
- [ ] No full bank numbers or secrets in DB or client bundle.
- [ ] Webhooks tolerate replays / out-of-order events (upsert by event/payment id).

---

## 6. Phases

| Phase | Deliverable |
|---|---|
| **0** | API Gateway + Lambda scaffolding, secrets, Razorpay **test keys**, DB migrations (`payment_orders`, `faculty_payout_accounts`) |
| **1** | Collections in test mode: create-order / verify / webhook Lambdas + learner-app checkout; enrollments verified in dashboard |
| **2** | Beneficiary onboarding: `/payouts/account` + admin account-status UI |
| **3** | Payouts in test mode: RPC modification (PENDING), `/payouts/process` + X webhook, swap `financial.api.ts` to call Lambda, results + retry UI |
| **4** | Hardening & go-live: refunds end-to-end, reconciliation report, live keys, X KYC/funding |

---

## 7. Open Questions

1. Learner-app repo: who wires Checkout + the two payment endpoints there?
2. GST: 18% added on top of `final_price` (as in workflow doc examples) — confirm.
3. Payout cadence: manual button stays; scheduled (EventBridge cron → `/payouts/process`) later?
4. Faculty payout mode: bank (IMPS/NEFT) default — UPI limits (~₹1L/txn) may be too low.
5. Refund after payout: clawback of faculty share? (`REFUND` type exists, flow undefined.)
6. Bundles: one Razorpay order per bundle purchase (matches existing fan-out trigger) — confirm.
