# Design tasks

# Part 2: from the 29.10.2026 call

The call notes are in [meeting-2026-10-29.md](meeting-2026-10-29.md). Order: **the BPMN first** (it goes to FlexSoft for review and the APIs), then the design in the order below.

## How a contract works

1. **Confirmation by the client (SMS OTP)**
   - **Client-made order:** the shop has 24 h to confirm. Then push → bottom sheet «Arizani tasdiqlang» → «Tasdiqlash» → OTP → FlexSoft → «Shartnoma yaratilmoqda».
   - **Shop-made application:** the same push → sheet → OTP → FlexSoft. A client without the app gets an SMS with the App Store / Google Play link.
   - **Not confirmed by 23:59 the same day** → «Bekor qilindi». It cancels at 00:00 when the day changes, not exactly 24 h later.
2. **Shartnoma yaratildi: one 3-day timer, counted from this status**
   - The client presses «Qabul qildim» → «Mijoz qabul qildi». The shop's «Mahsulot topshirdim» button now works.
   - The shop presses it and takes the photo → **Tasdiqlandi**, and FlexSoft makes the provodka.
   - The item comes back within the 3 days → the shop starts a cancel → the client confirms with OTP (same sheet) → **Bekor qilindi**.
   - Nobody acts → **Tasdiqlandi on its own** after 3 days, even if the client never pressed «Qabul qildim».
3. **Tasdiqlandi: the refund window starts.** Its length in days is set in the admin.
   - The shop starts a refund → the client confirms with OTP (same sheet) → **Bekor qilindi**.
   - The client doesn't confirm by 23:59 → only the refund request expires, and the contract stays Tasdiqlandi.
   - The window has ended → the shop can't pick «Bekor qilindi». A refund then goes through the call centre, by hand.

## UI scope (decided 29.10, after the call)

"Showcase only" means: draw the state in «Holatlar namunasi» as a bottom sheet or screen, with no flow logic behind it yet.

**Order to build:** C13 + M12 → C17 → C16 → M10 → the «Holatlar namunasi» showcase (C14, C15, C19, M13, M14, M15) → C2, C3, C8 (from Part 1) → admin: A9, A10, A12, A15, A16.

Also done 29.10: «Parolni tasdiqlash» in the admin's «Adminlar» create/edit dialog.

## Client app

- [x] **C13.** «Mahsulotni qabul qildim» on the contract page (with a confirm sheet), then «Mahsulot qabul qilindi» with the days left of the 3. New status `received` («Mijoz qabul qildi» for the shop)
- [x] **C14. Showcase only.** «Arizani tasdiqlang» bottom sheet in «Holatlar namunasi»:
  - contract summary, «Tasdiqlash» or «Bekor qilish», then OTP
  - "bugun 23:59 gacha", and an expired state
  - status «Tasdiqlashingiz kutilmoqda»
- [x] **C15. Showcase only.** Cancel and refund confirmation: the same sheet and OTP, in «Holatlar namunasi»
- [x] **C16.** Sign-up: remove the QR path ("registered by a merchant, who showed a QR code")
- [x] **C17.** «Yashash manzilingizni kiriting». This is where the client lives now, not the propiska.
  - every field shows at once (no step-by-step reveal); shahar / tuman is locked until a viloyat is picked
  - viloyat → then one list with **both shahar and tuman** of that viloyat
  - **multi-select:** one shahar and one tuman, or only one of them (at least one)
  - MFY (typed) → street and house
  - stored only in Birzum, not sent to FlexSoft; no comparison with the MyID propiska
  - the same block in the merchant's new-client form
- [~] **C18. No UI (29.10).** Limit gate: a card and at least 1 contact before asking for a limit; no own or fake numbers (backend rule)
- [x] **C19. Showcase only.** «Bu mijoz bloklangan» at sign-in, with no OTP sent

## Merchant app

- [x] **M12.** Status change:
  - «Mahsulot topshirdim» is disabled until the client presses «Qabul qildim», with a hint
  - the photo stays
  - **no** 3-day countdown or auto-confirm note in the UI (29.10)
- [x] **M13. Showcase only.** Shop-made application: «Mijoz ilovada tasdiqlashi kutilmoqda» until 23:59, an expired state, and «Ilovasi yo'q» → «Havola SMS bilan yuborildi»
- [x] **M14. Showcase only.** Cancel and refund: «Mijoz tasdiqlashi kutilmoqda» until the client's OTP; «Bekor qilindi» hidden after the refund window
- [x] **M10.** Staff form: update the fields only (branches are already ours, no change):
  - Login, Ism, Familiya, Email, Telefon raqami, JShShIR
  - Parol and Parolni tasdiqlash, «Vaqtinchalik parol»
  - **Rol** (Administrator / Sotuvchi)
- [~] **M11. Dropped (29.10).** FlexSoft's validation errors under the field
- [x] **M15. Showcase only.** «Holatlar namunasi» → a **Nizom** section with the security error states. This replaces C1's separate page. Each state has an icon, a title, text and a button:
  - the phone number isn't registered to the client's PINFL ("Номер не на ваше имя")
  - the card's phone number doesn't match the sign-up number
  - a wrong SMS code; 3 wrong codes → blocked for 15 min, with a timer
  - sign-in from a new device not confirmed (MyID failed)
  - a new device: "Kartalaringiz bu qurilmadan o'chirildi, qayta bog'lang"
  - the account is blocked → contact support (C19)
  - the app is blocked during a phone call
  - the session ended after 3 min → PIN / Face ID

## Admin

- [ ] **A9.** Forgot password: email → OTP from the email → new password, entered twice
- [ ] **A10.** Remove «Qo'lda to'lov» (Undiruv)
- [ ] **A12.** Analytics:
  - downloads by day and time
  - active users
  - the most-viewed products and merchants
  - the sign-up funnel: what % finish, and at which step and after how long the others stop
- [~] **A11. No UI (29.10).** «Qaytarish muddati», the refund window in days
- [~] **A14. No UI (29.10).** Application proof (offer, history with times, handover photos)
- [~] **A13. Dropped (29.10).** The «Support» role
- [ ] **A15.** Undo A8: blocking a client applies only in Birzum, not the FlexSoft blacklist. Remove the FlexSoft text.
- [ ] **A16.** The client's page shows both the MyID propiska and the «Yashash manzili» the client typed: in the admin and in the merchant app
- Merchant branches stay as they are.

## Not design
- SMTP for the admin emails
- the server Excel file (requirements, providers such as Servercore and Uztelecom, prices; hosted in Uzbekistan)
- the Atmos IP whitelist
- MyID through FlexSoft; Atmos and PlayMobile connect to us directly

## BPMN changes
- **Client:**
  - the OTP sheet after the shop confirms, and the 23:59 cancel
  - «Qabul qildim» and the 3-day timer
  - refund via OTP and the refund window
  - limit gate: card + contact
  - address: shahar or tuman, then MFY
  - blocked → no OTP
- **Merchant:**
  - the shop-made application waits for the client's OTP
  - «Topshirdim» is enabled only after «Qabul qildim»
  - the 4 cases
  - cancel and refund via the client's OTP; hidden after the window
  - staff form validated by FlexSoft
- **Admin:**
  - forgot password (SMTP)
  - no manual payment
  - refund window setting
  - application proof logs
  - blocking only in Birzum
  - analytics

---

# Part 1: from the BPMN (28.10.2026)

The background is in [design-todo-bpmn-nizom.md](design-todo-bpmn-nizom.md).

**Rule for security errors:** we don't draw separate screens and wire them into flows. Every security state goes on **one showcase page in Profile**, like "Holatlar namunasi" in the merchant app, so the mobile devs can find them in one place. The logic behind them (timers, checks, the 3-minute lock and so on) is backend and mobile work, not design.

## Client app (BNPL)

- [~] **C1. Moved to M15 (29.10):** "Xavfsizlik holatlari" (a showcase page, not linked to any flow). It shows these states:
  - SMS code: "Kod noto'g'ri"
  - 3 wrong codes: blocked for 15 min, with a timer
  - the number isn't in your name (phone ≠ PINFL)
  - the card is linked to another number
  - sign-in from a new device not confirmed (MyID)
  - "Kartalaringiz bu qurilmadan o'chirildi, qayta bog'lang" (new device)
  - the account is blocked → contact support
  - the app is blocked during a call
  - the lock screen after 3 min (the existing PIN / Face ID screen)
- [x] **C2. SMS code field:** 6 characters, digits and letters (keyboard with letters), with a 59 s timer before "Qayta yuborish"
- [x] **C3. Profile → "Aktiv sessiyalar":**
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
- [x] **C8. "Masofadan mumkin emas":** shown when the shop hasn't used the app for 30 days. Confirmed 30 days on 29.10, with "Do'konga boring" and "Boshqa do'kon"
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
