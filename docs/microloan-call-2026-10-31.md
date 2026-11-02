# Microloan call with Bobur aka, 31.10.2026 (Saturday, 1 h 57 min)

Source: the Fathom recording, transcribed with Gemini (Fathom's own transcript was unusable). Mostly microloans; BNPL only at the start.

## BNPL

- Bobur aka checked the BNPL BPMN: correct. FlexSoft's developers still have to confirm it.
- Some BPMN logic is not in the app (e.g. signing). It is drawn in «Holatlar namunasi»; the real logic comes in development. No password in BNPL (only in microloans): agreed.

## FlexSoft, open questions (Bobur aka asks them)

- [ ] **API list (us → Bobur aka):** which APIs FlexSoft's docs already have, and which BNPL and microloan functions still need one (e.g. scoring, adding a card). Use FlexSoft's role words ("user admin", "user foydalanuvchi"). If they stall, ask for a meeting.
- [ ] When is the client's card created in FlexSoft: right after registration, or only when the first ariza is sent? (In the office today: at the ariza.)
- [ ] Can FlexSoft approve **more** than asked, or only the same or less? If more: the client picks the sum when signing.
- [ ] Signing the contract: OTP or MyID face check? MyID costs 3 000 soʻm per check; banks don't ask for it at the ariza.
- [ ] Repayment: an API that says whether this month is already paid (FlexSoft's auto-debit, Click, Payme, the cash desk), and fiscal receipts for payments made outside the app.
- [ ] SMS: Antifraud instead of PlayMobile (OTP and other SMS, e.g. "limit ajratildi"); waiting for their contract. Sender names: «Birzum Nasiya» for BNPL, «Fortuna» for microloans.

## Microloan app

**Products and calculator**
- [ ] **Products come from FlexSoft** (they are created there). The app shows them as a template, linked by FlexSoft's product code/ID, so FlexSoft knows which product the ariza is for.
- [ ] **Rate:** one standard rate per product (not by term or sum). Collateral products may show a range (e.g. Rivoj 49–54%); scoring decides.
- [ ] **Term:** FlexSoft gives only the longest term. Show steps of 3 up to it (3, 6, 9 … max). If the longest term is not a multiple of 3 (1 or 2 months), show just that.
- [ ] **Payment day, rule (b) from the admin:** by the day the client applies:
  - 1–5 → days 1–5
  - 6–10 → days 1–10
  - 11–20 → one more day for each day (11 → 1–11 … 20 → 1–20)
  - after the 20th → only the 1st of next month, with a note.

**Asosiy**
- [ ] A picture/wallpaper behind Asosiy (as in Asaka bank). Only on Asosiy. Bobur aka sends references (Kazakh microfinance apps).
- [ ] Layout: top banners (stories) explain things (what a loan is, MyID, Face ID, «Firibgarlikdan ogoh boʻling»); middle banners are products and promos; lower part is FAQ / how it works. No debt on Asosiy (agreed).
- [ ] Design feedback: brighter colours (the blue is dull); the big cards take ~50% of the screen, make them ~1/3. Full visual audit at the test phase.

**Sign-in and security**
- [ ] **«Parolni unutdingizmi?» uses MyID**, not an SMS code: face check straight away (no passport typing), then the new password, then PIN. (Changes ML19.)
- After signing out: phone → OTP → password → new PIN (as built).
- [ ] **One device at a time:** signing in on a new phone signs the other one out.
- [ ] **Phone change:** code to the old number → new number → code to it → **MyID face check** and the new number's PINFL check, then the update.
- Blocked client signs in and pays an active loan; no Kreditlar, no new arizalar (as built, ML30).

**Cards and ariza**
- Card linking is optional in Profil; if there is none at the ariza, ask to add one (as built).
- Contacts: the client adds them, at least 2 (as built).
- [ ] **Card in the ariza:** one card, the one with the highest turnover. It is used to judge turnover (income) and is bound to auto-debit. It is **not** where the money goes.
- [ ] **Payout card:** after the client accepts the contract, ask «Qaysi kartaga oʻtkazay?»: any linked card, or add a new one.
- [ ] Refused ariza: the app does not block a new one. FlexSoft holds the block (e.g. 30 days) and answers at once; show its message.

**Ariza statuses** (we keep them; FlexSoft is told)
- [ ] Koʻrib chiqilmoqda → Tasdiqlandi (the client signs) → Imzolandi → Pul oʻtkazildi (the loan goes to «Faol»).
- [ ] Also: **Rad etildi** (FlexSoft refused), **Bekor qilindi** (the client cancelled, or did not sign within **1 day**, not 3), and **Yopilgan** (paid off).
- [ ] Counter-offer: FlexSoft may approve less than asked.
- [ ] Signed, cancelled and expired are sent to FlexSoft (it also closes unsigned ones after 24 h itself).

**Payout and repayment**
- [ ] Payout order: signed → **Atmos sends the money first** → on Atmos's OK we tell FlexSoft «pul oʻtkazildi» → FlexSoft books it (provodka). Not in parallel, so no loan is booked for money that never arrived.
- [ ] Reminders: FlexSoft sends the SMS 3 days and 1 day before; the app only shows a push.
- [ ] FlexSoft's auto-debit runs from 00:00 on the payment day. Before an in-app payment, ask FlexSoft whether it is already paid. If not, take it through Atmos, then update FlexSoft. FlexSoft sends the SMS; the app shows a push.
- [ ] **Monitoring:** payments from FlexSoft, including those made outside the app, with fiscal receipts, refreshed in the background.

**Profil**
- [ ] Fewer items on the first screen: each section opens its own page.
  - Hisob → Kartalarim, Kontaktlarim
  - Sozlamalar → Xavfsizlik, Aktiv sessiyalar, Til
  - Yordam → Savol-javob, Yordam chati, Biz bilan aloqa
  - Hujjatlar → Oferta, Maxfiylik
  Microloans only, not BNPL.
- «Holatlar namunasi» is for us (design), not shown to clients.

## Microloan admin

- [ ] **Mahsulotlar:** no creating products or rate tables. A list from FlexSoft (code/ID, name, sum range, longest term, rate) with what the app shows.
- [ ] **Remove «Shartnoma va toʻlov»:** FlexSoft holds those rules.
- [ ] **Payment day setting, two modes with a switch:**
  - (a) fixed days the app shows
  - (b) the rule by the application day, as above
- [ ] **Client page:** the client's sessions (devices), as a list. Blocking stays on the client, not per session.
- The admin fills banners, pictures, onboarding, FAQ, documents and «Biz bilan aloqa».

## BPMN v2 updates

- [ ] Admin: products come from FlexSoft; no contract-rules step; payment-day modes.
- [ ] «Parolni unutdingizmi?» through MyID; one device at a time.
- [ ] Ariza: the turnover card (auto-debit); FlexSoft's block after a refusal.
- [ ] Contract: the signing method (OTP or MyID, to decide); then «Qaysi kartaga?».
- [ ] Payout: Atmos first, then FlexSoft «pul oʻtkazildi» and provodka.
- [ ] Statuses: 1-day expiry; signed, cancelled and expired sent to FlexSoft.
- [ ] Repayment: FlexSoft's auto-debit and SMS; check before an in-app payment; push in the app; Monitoring from FlexSoft.
- [ ] Phone change: MyID and the new number's PINFL check.
