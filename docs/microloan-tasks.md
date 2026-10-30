# Microloans (Fortuna Biznes, Vodiy Taraqqiyot): BPMN and design tasks

Decided 30.10.2026. Sources: the old «BPMN (Микрозаймы)» on Miro with Bobur's 3 comments, and the Nizom decisions in [design-todo-bpmn-nizom.md](design-todo-bpmn-nizom.md).

## Decisions

- **Password:** set right after the MyID face check, before the PIN. Two fields (password, repeat) with the rules listed under them. «Bu sizmi?» is removed.
- **Integrations:** FlexSoft for the credit history and the core system (it creates the contract), Atmos for cards, payout and debits, MyID, PlayMobile (SMS and the phone ↔ PINFL check).
- **Card:** linked once, after registration. The application only picks one of the linked cards for the payout and repayments.
- **Nizom:** the same rules as BNPL. OTP of 6 characters (letters and digits), resend after 59 s, 3 wrong → 15 min block; the phone belongs to the client's PINFL; the card's SMS phone equals the client's phone; new device; 3 min idle lock; «Oʻzim bajaryapman» before signing and paying; phone change SMS to both numbers.
- **Admin:** stays a lane in the same BPMN (about 15 steps), not a separate frame.

## BPMN (new frame; the old one stays)

- v1 (with the client for review): https://miro.com/app/board/uXjVEY8aY54=/?moveToWidget=3458764688908353798
- **v2 (30.10, with the user's comments):** https://miro.com/app/board/uXjVEY8aY54=/?moveToWidget=3458764688910631978
  - «Вход»: phone → OTP → **password** → known device? yes: home; no: MyID → SMS to the owner → cards unlinked → PIN / Face ID
  - «Забыли пароль» (30.10): from «Пароль», SMS code and the new password twice → saved → the same known-device check
  - Calculator: payment day (1–10) and payment type; new step «Batafsil shartlar»; admin products carry the payment types
  - «Погашение»: no payment entered by hand. Overdue → SMS → call, promise → the client pays the overdue in the app
- The phone ↔ PINFL check runs after MyID, because the PINFL is only known then.

Frame «BPMN · Микрозаймы (Fortuna / Vodiy)» below the BNPL frames. Lanes: Клиент · Система · Интеграции (MyID · PlayMobile · FlexSoft · Atmos) · Админ (Fortuna / Vodiy).

1. **Настройка бренда (admin):** products, decision rules, contract rules, documents / FAQ / welcome slides → shown in the app
2. **Регистрация:** welcome → phone + offer consent → PlayMobile phone ↔ PINFL (mismatch: push + «Xavfsizlik») → OTP (6 characters, 59 s, 3 wrong → 15 min block + SMS) → blocked client? («Bu mijoz bloklangan», no OTP) → passport / ID + birth date → MyID face → **password ×2** → PIN → Face ID
3. **Вход:** PIN / Face ID; new device → MyID → SMS to the owner (device, OS, IP) → cards unlinked, history hidden; 3 min idle → lock
4. **Карта:** add card → Atmos SMS code → card's SMS phone ≠ client's phone → push + «Xavfsizlik»; owner shown as «Ism F.»
5. **Заявка и решение:** calculator → income, work, ≥2 contacts, pick a linked card → credit check consent → «Oʻzim bajaryapman» → FlexSoft credit history + rules → approved (offer 3 days) / counter-offer / declined (30 days); refused with a reason; expired
6. **Договор и выдача:** contract PDF + schedule → warning → OTP signature → FlexSoft creates the contract → Atmos payout (fails: retry, admin sees it) → loan opened, SMS
7. **Погашение:** reminder SMS → auto-debit on the payment day; pay in the app (schedule, early partial, full) with the warning → failed: overdue → SMS, call, promise → payment at a branch entered by the admin → last payment: closed
8. **Профиль и безопасность:** phone change (code to old and new, SMS to both), active sessions, fraud report, fraud schemes, support chat

## Design: microloan app

**Sign-up and sign-in**
- [x] **ML1. Sign-up:** remove «Bu sizmi?». After the MyID face check, «Parol oʻrnating»: password + repeat, the rules under the fields (8+ characters, letters, digits) ticking green as they're met. Then PIN → Face ID.
- [x] **ML2. Sign-in:** phone → OTP → **password** (today it's phone → OTP → PIN). Wrong password state. Then, on a known device, straight home.
- [x] **ML3. New device:** after the password, MyID face → «Kartalaringiz bu qurilmadan oʻchirildi» → set PIN / Face ID. Failed MyID → «Xavfsizlik» state.
- [x] **ML19. «Parolni unutdingizmi?»** on the sign-in password screen: SMS code → new password twice (the same rules) → «Parol yangilandi». A new phone still goes through MyID after it.
- [x] **ML4. OTP:** 6 characters (letters and digits, keyboard with letters), resend after 59 s (now 60); 3 wrong → 15 min block screen with a timer.
- [x] **ML5. Blocked client:** «Bu mijoz bloklangan» at sign-in, no code sent.
- [x] **ML6. Phone ↔ PINFL mismatch** after MyID: push + «Xavfsizlik» («Raqam sizning nomingizda emas»).
- [x] **ML7. 3 min idle:** lock screen (PIN / Face ID).

**Cards, application, contract, payments**
- [x] **ML8. Cards:** linked only from Profil → Kartalar after sign-up; owner shown as «Ism F.». The «card's SMS phone ≠ client's phone» error goes to the errors page (ML16), not as live logic.
- [x] **ML17. Calculator (comment 1):** sum ✓, term ✓, plus **payment day** (1–10, a fixed list in the app for now) and **payment type**: «Standart» (equal monthly payment) or «Kamayib boruvchi» (falling payments). The type picker shows only when the product allows both. The schedule and totals update with the choice.
- [x] **ML18. «Batafsil shartlar» (comment 2):** a separate screen per product, opened from the product card on Asosiy and an «i» in the calculator: sum range, terms, rate by term, payment types with a sample schedule, early repayment rules and fee, requirements (age, documents), what happens when a payment is late, the offer PDF.
- [x] **ML9. Application:** the card step picks one of the linked cards; with none, a link to add one.
- [x] **ML10. «Oʻzim bajaryapman»** checkbox sheet: at the credit-check consent, before signing the contract, before a payment.
- [x] **ML11. Payout failed** state on the ariza: retrying, the money will come later.
- [x] **ML12. Overdue:** the loan shows the overdue sum and a «Toʻlash» button (pay the overdue in the app).

**Profile**
- [x] **ML13. Phone change:** code to the **old** number first, then the new one (today only the new one). Done screen says both numbers get an SMS.
- [x] **ML14. «Aktiv sessiyalar»** (as in BNPL C3).
- [x] **ML15. Fraud:** «Firibgarlik sxemalari» (schemes and tips) and «Firibgarlik haqida xabar berish» (a form that goes to the support chat).
- [x] **ML16. «Holatlar namunasi»** (Profil → Dizayn, UI only, as in the merchant app): one page whose rows open the screen as the client sees it.
  - Asosiy: with a credit, without a credit, payment overdue
  - Kirish va xavfsizlik: 3 wrong codes → 15 min block, «Bu mijoz bloklangan», number not in the client's name, card's SMS phone ≠ client's phone, new device MyID failed, cards unlinked
  - Ariza va toʻlovlar: payout failed, the three «Oʻzim bajaryapman» sheets
  - The demo triggers are gone from the live flow (blocked and not-owner numbers, the failing card, the overdue sample client). The handling code stays for the real API. The 3-wrong-codes block still works live (code 000000).

## Design: admin (Fortuna / Vodiy)

- [ ] **MA1. «Muvaffaqiyatsiz toʻlovlar»:** payouts that failed, with the reason and «Qayta yuborish».
- [ ] **MA2. Remove «Qoʻlda toʻlov»** from microloan Toʻlovlar and the loan page (no payment entered by hand).
- [ ] **MA4. Products:** which payment types each product allows (Standart, Kamayib boruvchi, or both).
- [ ] **MA5. Shartnoma qoidalari:** remove the payment-day setting («Qarz berilgan kun / Belgilangan kun»); the client picks 1–10 in the app.
- [ ] **MA3. Fraud reports** arrive in Yordam chati marked «Firibgarlik».
