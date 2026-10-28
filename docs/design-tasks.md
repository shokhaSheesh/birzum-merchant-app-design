# Design tasks (from the BPMN, 28.10.2026)

The background is in [design-todo-bpmn-nizom.md](design-todo-bpmn-nizom.md).

**Rule for security errors:** we don't draw separate screens and wire them into flows. Every security state goes on **one showcase page in Profile**, like "Holatlar namunasi" in the merchant app, so the mobile devs can find them in one place. The logic behind them (timers, checks, the 3-minute lock and so on) is backend and mobile work, not design.

## Client app (BNPL)

- [ ] **C1. Profile → "Xavfsizlik holatlari"** (a showcase page, not linked to any flow). It shows these states:
  - SMS code: "Kod noto'g'ri"
  - 3 wrong codes: blocked for 15 min, with a timer
  - the number isn't in your name (phone ≠ PINFL)
  - the card is linked to another number
  - sign-in from a new device not confirmed (MyID)
  - "Kartalaringiz bu qurilmadan o'chirildi, qayta bog'lang" (new device)
  - the account is blocked → contact support
  - the app is blocked during a call
  - the lock screen after 3 min (the existing PIN / Face ID screen)
- [ ] **C2. SMS code field:** 6 characters, digits and letters (keyboard with letters), with a 59 s timer before "Qayta yuborish"
- [ ] **C3. Profile → "Aktiv sessiyalar":**
  - device, OS, browser, IP, start time
  - the current session is marked
  - a "Sessiyani tugatish" button for each session
- [x] **C4. Propiska address:** viloyat → shahar → tuman selectors, then street and house, in the client sign-up and the merchant's new client
- [x] **C5. Cart:** products from one shop only, with a warning when a product from another shop is added
- [x] **C6. Checkout:**
  - delivery address on a Yandex map
  - the down payment is "do'konda naqd" (no card charge)
  - the markup follows the shop's tariff
- [x] **C7. Warning before an action:** a sheet with the checkbox "O'zim bajaryapman, hech kim aralashmagan". It appears before "Yuborish" at checkout and before a payment.
- [ ] **C8. "Masofadan mumkin emas":** shown when the shop hasn't used the app for 30 days, with "Do'konga boring" and "Boshqa do'kon"
- [x] **C9. Contract statuses** (list, contract page, Bosh sahifa):
  - waiting for the shop (24 h)
  - rejected by the shop, with the reason
  - being created
  - created ("Pick up the item")
  - confirmed
  - closed
  - cancelled (return)
- [~] **C10. Skipped (28.10):** "Firibgarlik haqida xabar berish":**
  - a form: full name, passport, date of birth, phone, what happened, amount lost, date and time
  - a "Sent" screen after submitting
- [~] **C11. Skipped (28.10):** "Firibgarlik sxemalari":** a section in Profile with schemes and protection tips
- [x] **C12. Card owner's name** shown as "Ism F." wherever it appears

Nothing to draw (backend or mobile only):
- the 3-minute lock (reuses the PIN screen)
- the existing-client check in FlexSoft
- removing cards on a new device
- SMS to the old and new number when the phone changes

## Merchant app

- [x] **M1. Sign-in:** login and password (from FlexSoft) → SMS code → password change on first sign-in. Pages are shown by role (administrator / seller).
- [x] **M2. Staff:** not needed in the merchant app. The two FlexSoft roles' permissions are set in the admin («Merchant rollari», A5).
- [x] **M3. New client in the shop:**
  - MyID on the same phone, with no QR code
  - the address by propiska
  - the seller enters the card, and the client reads out the SMS code
- [x] **M4. Limit for a client:** a separate process started from the client's card ("Limit so'rash"), then the result by term or a refusal
- [x] **M5. Catalogue:**
  - variant types and their values (UZ / RU), made by the merchant
  - a product status: "Tekshiruvda" / "Rad etildi: sabab"
  - stock can only be added after approval, and changing it doesn't go through moderation again
- [x] **M6. A client's ariza within 24 h:**
  - a "Yangi arizalar" tab with a timer
  - check stock → "Tasdiqlash" / "Rad etish" with a reason
- [x] **M7. Contract statuses** (being created, created, confirmed) on the ariza page
- [x] **M8. Sale in the shop:** the markup comes from the saved tariff, and the down payment is "naqd"
- [x] **M9. Reports:** only the administrator role downloads them. Remove "O'zaro hisob-kitob".

## Admin

- [x] **A1. Merchants:**
  - a read-only list from FlexSoft (branches, tariff, status)
  - remove the create form and the tariff selector
- [x] **A2. Remove "Merchantlarga o'tkazmalar"**
- [x] **A3. Ustama:** read only (tariff × term × rate from FlexSoft)
- [x] **A4. New: product moderation:**
  - a queue with photo, name, description and price
  - "Tasdiqlash" / "Rad etish" with a reason
- [x] **A5. New: roles → pages:** for each of FlexSoft's roles, which pages and actions it gets in the merchant app
- [x] **A6. Reference lists:** remove "Variant turlari" (the merchant makes these)
- [x] **A7. Arizalar:** the new statuses and the filter for them
- [x] **A8. Blocking a client:** the note "FlexSoft'da ham bloklanadi" in the confirmation

## Open questions (we can design without them)
- PlayMobile: does it check phone ↔ PINFL?
- Atmos: does it return the card's SMS number?
- Contract statuses in the app: keep the current Uzbek labels, or rename them?
