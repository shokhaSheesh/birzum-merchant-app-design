# ERD review: changes needed, 03.11.2026

ERD: https://dbdiagram.udevs.io/s/c71a54b5a69bb565302d8eaf48a88e66 (v3, 2026-10-28)

The core is right: tiyin money, companies as tenants, one account per app, devices and sessions per Nizom 3759, append-only audit log, FlexSoft request log, callbacks and outbox. What's below is either **missing** or **follows an older decision** that changed on the calls of 27.10, 29.10, 31.10 and 03.11 (FlexSoft answers).

Each item: **Now** (what the ERD has) → **Change to** → **Why**.

---

## 1. Statuses and timers

### 1.1 `application_status` enum
- **Now:** `draft, sent_to_flexsoft, offered, rejected, merchant_review, accepted, signed, handed_over, cancelled`.
- **Change to:** split by product, or one enum covering both:
  - BNPL: `awaiting_merchant` (shop confirms within 24 h) → `contract_creating` → `contract_created` → `client_received` → `confirmed` → `closed`; also `rejected`, `cancelled`.
  - Microloan: `under_review` → `approved` / `counter_offer` → `signed` → `money_sent`; also `rejected`, `cancelled_by_client`, `expired`.
- **Why:** these are the statuses agreed with Bobur on 27.10 and 29.10, and the apps and the admin already show them. `merchant_review` and `handed_over` don't map to them, and `client_received`, `confirmed`, `closed`, `counter_offer` and `expired` are missing.

### 1.2 Timer fields on `applications`
- **Now:** only `sent_at`, `created_at`, `updated_at`.
- **Change to:** add `merchant_deadline_at`, `merchant_confirmed_at`, `contract_created_at`, `client_received_at`, `confirmed_at`, `auto_confirmed` (bool), `cancelled_at`, `cancelled_by` (client / merchant / system), `cancel_reason`, `closed_at`.
- **Why:**
  - **Shop deadline:** the shop has 24 h to confirm.
  - **Client confirmation:** an order the client hasn't confirmed is cancelled at 00:00 when the day changes.
  - **One 3-day timer:** it starts at «Shartnoma yaratildi». The client's «Qabul qildim» lets the merchant hand over; otherwise the contract is confirmed automatically after 3 days.
  - **Return window:** it counts from `confirmed_at`.
  - None of these timers can run without the timestamps.

### 1.3 Status history
- **Now:** none. Only `audit_logs`, which is generic.
- **Change to:** an `application_status_history` table (`application_id`, `from_status`, `to_status`, `actor` = client / staff / system, `staff_id`, `comment`, `created_at`).
- **Why:**
  - The merchant app and the admin show «История изменений: кто, когда, комментарий» on each application.
  - On 29.10 we agreed each application must keep the timed proof for disputes: offer accepted, «Делаю сам», OTP. Cyber police ask for it.

### 1.4 Handover photos
- **Now:** none.
- **Change to:** an `application_photos` table (`application_id`, `url`, `uploaded_by` staff, `created_at`), with 1–3 per contract.
- **Why:** the seller attaches 1–3 photos with the goods at handover. They're shown in the admin and sent to FlexSoft, because limits are often cashed out (29.10).

---

## 2. Addresses and profile

### 2.1 `user_addresses.matches_myid`
- **Now:** `matches_myid boolean`, with the note «19.10 decision: compare with MyID».
- **Change to:** remove it. Keep two rows per user: `kind = registration` (from MyID, can be empty) and `kind = actual` (typed by the client).
- **Why:**
  - **No comparison (29.10):** MyID returns the propiska in different formats and two languages, so we don't compare the two addresses.
  - **Which goes to FlexSoft (03.11):** the MyID address is the main one; the typed one is sent to FlexSoft only as a backup when MyID returns no address.

### 2.2 City next to district
- **Now:** `region_code`, `district_code`, `mahalla_code` (not null), `address`.
- **Change to:** add `city_code`, with at least one of `city_code` / `district_code` required. Add `mahalla_name` (typed), and allow `mahalla_code` to be null when the client types it.
- **Why:** the agreed form is viloyat → shahar and/or tuman (at least one) → MFY (typed) → street and house.

### 2.3 `user_profiles.marital_status`
- **Now:** missing. `monthly_income` and `employment_place` are there.
- **Change to:** add `marital_status` (enum: `single, married, divorced, widowed`).
- **Why:** FlexSoft asked for marital status and income with the MyID code (their point 4, answered 03.11). Both apps now ask for them at sign-up, and the client can edit them in the profile.

### 2.4 `applications.monthly_income`
- **Now:** stored on every application.
- **Change to:** keep it only as a snapshot copied from `user_profiles`, or remove it.
- **Why:** since 03.11 the microloan application no longer asks for income; it comes from sign-up and the profile.

---

## 3. Limits

### 3.1 Limit per term
- **Now:** `limits.amount`, `max_term_months`, one amount for every term.
- **Change to:** a `limit_terms` table (`limit_id`, `term_months` ∈ 3, 6, 9, 12, 18, 24, `amount`, `used_amount`), or a jsonb field if the team prefers.
- **Why:** FlexSoft returns a separate limit for each term (27.10). The client app and the merchant app show and check the limit per term.

### 3.2 Refusal and repeat request
- **Now:** no refusal state.
- **Change to:** add `rejected` to `limit_status`, plus `rejection_reason` and `next_request_at`.
- **Why:** after a refusal the client can ask again only after 30 days. The app shows the reason when FlexSoft gives one.

---

## 4. Returns

### 4.1 `return_requests`
- **Now:** `status = awaiting_client_confirm → awaiting_admin → approved / rejected`, with `decided_by` a Birzum admin.
- **Change to:** remove the admin step. The flow becomes: the merchant starts the return (reason, comment) → the client confirms with an SMS code → the contract is cancelled in FlexSoft. Add `otp_attempt_id` for the client's confirmation.
- **Why:**
  - **Who confirms (29.10):** the client confirms a return with an OTP; there's no admin approval.
  - **Return window:** it's a number of days set in the admin, counted from «Tasdiqlandi». After it, the merchant can't pick «Bekor qilindi», and refunds go through the call centre by hand.

### 4.2 Return window setting
- **Now:** none.
- **Change to:** a settings table (see 9.1) with `return_window_days`.
- **Why:** it's set in the admin (29.10).

---

## 5. Payments and payouts

### 5.1 `merchant_payouts`, `merchant_payout_items`
- **Now:** payouts to merchants are created and paid in our system.
- **Change to:** remove both, or make them a read-only mirror of FlexSoft.
- **Why:** on 27.10 we agreed that FlexSoft owns merchant creation, payouts and ustama editing; our admin only reads them.

### 5.2 `payment_method`
- **Now:** `auto_debit, app, admin_charge, cash, bank_transfer`, plus `payments.document_number` («cash / bank transfer receipt»).
- **Change to:** `auto_debit, app, admin_retry`. Drop `cash`, `bank_transfer` and `document_number` for loan payments.
- **Why:**
  - **Online only (29.10):** «Qo'lda to'lov» was removed, so cash and bank transfer go.
  - **The admin action:** the admin keeps only «списать снова» for a failed auto-debit.
  - **Down payment:** it's cash at the shop, taken by the merchant. If it's stored at all, keep it as information on the application (`down_payment`), not as a payment row.

### 5.3 Microloan payouts
- **Now:** no table. The payout isn't tracked.
- **Change to:** a `loan_payouts` table (`loan_id` / `application_id`, `card_id`, `amount`, `status`, `attempt`, `provider_ref`, `bank_error`, `sent_at`, `credited_at`).
- **Why:**
  - **Order (31.10):** Atmos pays out first, then FlexSoft records «pul oʻtkazildi».
  - **Failures:** the admin shows «Неудачные выплаты: причина банка, попытки, отправить снова». If the money doesn't arrive, it's sent again, and the client gets an SMS when it's credited.

### 5.4 Pay day and payment type
- **Now:** missing on `applications`.
- **Change to:** add `pay_day` (smallint) and `payment_type` (`annuity, differentiated`).
- **Why:**
  - **Pay day:** BNPL lets you pick a payment day from 1 to 10, and the microloan calculator offers a day too.
  - **Payment type:** the microloan calculator offers standard (annuity) or decreasing (differentiated) payments.

### 5.5 Microloan payout card
- **Now:** one `applications.card_id`.
- **Change to:** keep `card_id` for the analysis and auto-debit card, and add `payout_card_id`.
- **Why:** the application card is the highest-turnover one, used for analysis and auto-debit. The payout card is asked for after the contract is accepted and can be a different card (31.10).

---

## 6. Cards and OTP

### 6.1 `cards.kyc_check_id`, `cards.provider`
- **Now:** a MyID check when linking a card (b.10); `provider` = «not chosen».
- **Change to:** remove `kyc_check_id`, and set `provider` = FlexSoft. Keep `sms_phone_matches`.
- **Why:**
  - **No face check:** we decided against a face check when linking a card (Nizom decisions).
  - **Who links cards:** FlexSoft asked for card linking to be fully on their side, and we agreed (point 7, 03.11). Store only their token and the masked number.

### 6.2 `kyc_purpose`
- **Now:** includes `card_binding` and `before_payout`.
- **Change to:** remove `card_binding`. Keep `before_payout` only if microloan signing goes with MyID; it's still «OTP или MyID (уточняется)».
- **Why:** same as 6.1.

### 6.3 `otp_attempts`
- **Now:** we generate and hash every code, for every purpose.
- **Change to:** keep the table for our own codes only: contract signing, return confirmation, new device. For sign-up, sign-in and phone change, store only the FlexSoft request reference and the result, with no `code_hash`. Make `purpose` an enum.
- **Why:** on 03.11 we agreed that FlexSoft sends and checks the codes for sign-up, sign-in and phone change (their point 1). The other SMS stay with us.

---

## 7. Blocking

### 7.1 FlexSoft block status
- **Now:** `customer_accounts.status = blocked` (blocked in Birzum).
- **Change to:** add `flexsoft_blocked` (bool) and `flexsoft_block_checked_at`, filled from the client lookup at phone entry.
- **Why:** FlexSoft has its own blocked clients. On 03.11 we asked them to return the block status in the phone lookup:
  - **Birzum Nasiya:** a blocked client can't get in.
  - **Microloans:** new applications are closed, but paying the current loan stays open.
  - **Two separate blocks:** the Birzum block stays separate, Birzum only (29.10).

---

## 8. Staff (merchant and admin)

### 8.1 `staff_users` fields
- **Now:** `full_name`, `phone`, `email`, `login`, `password_hash`, `mfa_secret`, `must_change_password`.
- **Change to:** split into `first_name` and `last_name`, add `pinfl` and `flexsoft_user_ref`, and remove `mfa_secret`.
- **Why:**
  - **The FlexSoft form:** the merchant staff form uses FlexSoft's fields (Login, Ism, Familiya, Email, Telefon, JShShIR, Parol ×2, Vaqtinchalik parol), plus Rol and Filial (29.10), and we create the user in FlexSoft.
  - **No admin MFA:** we decided against it (Nizom point 48).

### 8.2 Several branches per seller
- **Now:** `company_members.branch_id`, one branch («null = all»).
- **Change to:** a `member_branches` table (`member_id`, `branch_id`).
- **Why:** sellers are linked to their shop's branches (plural), and a seller sees applications from all of those branches.

### 8.3 Staff sign-in
- **Now:** customer sessions only.
- **Change to:** `staff_sessions` (device, IP, started, ended), plus a table for staff codes: the merchant's daily SMS confirmation and the admin's email reset code.
- **Why:**
  - **Merchant:** sign-in is login and password, a daily SMS confirmation, and a password change on first login that signs out other devices.
  - **Admin:** sign-in is email and password, and a reset is email → code → new password.
  - **Audit:** the audit log needs sign-in and sign-out for staff too.

### 8.4 Merchant roles
- **Now:** dynamic roles per company for merchants too.
- **Change to:** merchant roles = the two FlexSoft roles (Administrator, Seller), kept as system roles. Only admin roles stay dynamic: for which businesses, which pages, which special actions.
- **Why:** fixed FlexSoft roles mapped to our pages (27.10).

---

## 9. Missing domains

The ERD says «Catalog, content, support chat, notifications are left out on purpose». They're in the apps and in the TZ sent to CSEC, so they need tables.

### 9.1 Settings
- **Change to:** `app_settings` per company:
  - return window
  - application pause, with the text shown in the app
  - support contacts
- **Change to:** `pay_day_rules` per brand:
  - mode: fixed days or by application day
  - the lines (from–to → up to N, or up to the application day)
  - the cut-off day
  - history of changes
- **Why:** these are admin pages, built and agreed (31.10).

### 9.2 Microloan product settings
- **Now:** `loan_products` with amounts, terms and rates.
- **Change to:** keep these as a mirror of FlexSoft (add `flexsoft_ref`), and add our display fields: `sort_order`, `audience`, `payment_types`, `show_in_app`.
- **Why:** products, rates and the longest term come from FlexSoft, and the admin no longer creates products (31.10). The admin only orders products and chooses which to show.

### 9.3 Merchants and branches
- **Now:** `merchants` has `lender_company_id`, `payout_schedule` and contract fields; `merchant_branches` has no opening hours.
- **Change to:**
  - `merchants`: add `flexsoft_ref`, `app_description` (uz/ru), `rating`, `review_count` and `last_activity_at`.
  - `merchant_branches`: add `opening_hours` and `flexsoft_ref`.
- **Why:**
  - **App description:** the logo and description in the app are edited by Birzum.
  - **Rating:** the store page shows a rating and the number of reviews.
  - **Activity:** a shop with no activity for 30 days only sells on site («Masofadan mumkin emas»).
  - **Opening hours:** the branch card shows them.

### 9.4 `merchant_tariffs`
- **Now:** `type` nasiya / murabaha, with tariffs edited here.
- **Change to:** a read-only mirror of the merchant's 5 tariffs from FlexSoft, without `murabaha`.
- **Why:** FlexSoft owns the tariffs and the ustama (27.10). Murabaha isn't offered (answer 11, 03.11).

### 9.5 Catalog
- **Change to:**
  - `categories` (tree), `brands`
  - `products` (merchant, category, brand, names, descriptions and specs in uz/ru, `moderation_status` + `rejection_reason`, `is_visible`)
  - `product_photos` (per language and colour)
  - `attribute_types` / `attribute_values` (colour with a swatch, memory…)
  - `product_variants` (combination, price)
  - `inventory` (variant × branch, quantity)
- **Why:**
  - **Merchant app:** it manages products, variants, stock and photos.
  - **Moderation (27.10):** the admin moderates each product before clients see it.
  - **Client app:** it filters by category, brand and branch stock.
  - **Application items:** `application_items` should then point to the variant instead of free text.

### 9.6 Shopping
- **Change to:** `cart_items` (one merchant per cart), `favorites`, `merchant_reviews` (rating, text, hidden by the merchant).
- **Why:**
  - **Cart:** it holds only one merchant's goods (27.10).
  - **Favourites:** the client app has a favourites list.
  - **Reviews:** the client leaves a review after a purchase, and the merchant sees and can remove it.

### 9.7 Content
- **Change to:** `banners` (app, picture per language, one target, dates), `onboarding_slides`, `faq_items`, `documents` (offer, privacy policy, per language and version), `stories` (microloan).
- **Why:** the admin «Kontent» pages for each business.

### 9.8 Support
- **Change to:** `support_chats`, `support_messages` (text, photo, sender), `quick_replies`.
- **Why:** there's a support chat in all the client apps, and the admin has a chat with quick replies.

### 9.9 Notifications
- **Change to:** `notifications` (per account, type, read_at), `broadcasts` (audience, schedule, status, texts uz/ru).
- **Why:**
  - **Clients:** they get payment, status and loan notifications.
  - **Merchants:** they get new orders and contract status.
  - **Admin:** it sends push broadcasts.

### 9.10 Collections
- **Change to:** `collection_cases` / `promises_to_pay` (account, loan, promised date and amount, staff, comment).
- **Why:** the admin «Просрочка» page has debtors, their contacts and promises to pay.

---

## 10. Minor

- **Encryption:** `users.pinfl` and phone numbers aren't encrypted, while `document_number` is. Encrypt PINFL too, or say why not. It's personal data.
- **`integration_provider`:** add `atmos`, `firebase`, `smtp` and `yandex_maps`, or keep `payment` and say that it means Atmos.
- **`user_contacts`:** add a check that the contact isn't the client's own number or a fake one (0000…, 1111…). The rule is at least 2 contacts before a limit request.
- **Header comment:** it still mentions «FlexFin» and «Nasiya API» names. Check that the FlexSoft endpoints match what FlexSoft sent.
