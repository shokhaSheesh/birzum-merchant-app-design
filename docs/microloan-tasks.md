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

- [x] **MA1. «Muvaffaqiyatsiz toʻlovlar»:** payouts that failed, with the reason and «Qayta yuborish».
- [x] **MA2. Remove «Qoʻlda toʻlov»** from microloan Toʻlovlar and the loan page (no payment entered by hand).
- [x] **MA4. Products:** which payment types each product allows (Standart, Kamayib boruvchi, or both).
- [x] **MA5. Shartnoma qoidalari:** remove the payment-day setting («Qarz berilgan kun / Belgilangan kun»); the client picks 1–10 in the app.
- ~~**MA3. Fraud reports** in Yordam chati~~: dropped, the fraud pages were removed from the app (30.10).

## Feedback 30.10: the «Asosiy oyna» sheet and Bobur aka's Miro comments

**Asosiy (from the sheet)**
- [x] **ML20. «Arizangiz koʻrib chiqilmoqda» card:** shows when the client sends an ariza, disappears when the ariza is closed. Check that every closing status hides it.
- [x] **ML21. No loan card on Asosiy:** the active-loan card and the «Sizga mikroqarz» card go. The active loan's details live in Qarzlarim. Instead, Asosiy gets a theme wallpaper and small info banners at the top, like AVO bank's story tiles.
- [x] **ML22. Quick actions:** Kreditlar, Toʻlov, Kartalar, Yordam. Order, labels and on/off come from the admin (MA6).
- [x] **ML23. Tab bar:** Toʻlovlar is monitoring: payment history and receipts. The tabs' order, labels and on/off also come from the admin (MA6).

**From the Miro comments**
- [x] **ML24. Phone ↔ PINFL antifraud:** already in BPMN v2 (user, 30.10). compare the client's PINFL with the number owner's PINFL. If they match, send the code; if not, send a push. Bobur aka puts this before the code is sent, but at sign-up the PINFL is only known after MyID. Ask where it goes for a new client.
- [x] **ML25. Password before the PIN** (ML1).
- [x] **ML26. Card in the ariza:** cards are linked after registration (done). In the ariza the chosen card is also used for its turnover («karta aylanmasi»). Say so on the card step and in the BPMN.
- [ ] **ML27 (on hold). A check before sending the ariza to FlexSoft:** which check is not stated (blocked client? antifraud? limits?). Ask.
- [x] **ML28. FlexSoft decides by the chosen product's rules:** the app only sends the ariza, and it waits in «Koʻrib chiqilmoqda» (30.10).
- [ ] **ML29 (on hold, the user talks to Bobur aka 31.10). Limit per product:** each product calculates its limit differently. Should each product have its own path? Our suggestion: one flow, because the app only sends the ariza and FlexSoft applies each product's rules. Confirm with Bobur aka.
- [x] **ML30. Blocked client:** don't refuse sign-in. Block only Kreditlar, new arizalar and personal data. With an active loan the client can still pay. Update the screen in «Holatlar namunasi» and the BPMN.
- [x] **BPMN fixes (v2), 30.10:** «Код верный?» before «FlexSoft: создать договор» and «FlexSoft: обновить номер», with «Неверный код: ввести снова, 3 ошибки — блок 15 мин»; admin «Правила решения» replaced by «Asosiy oyna»; ariza decided «в FlexSoft по правилам выбранного продукта»; card «для выплаты и оценки оборота»; blocked client per ML30. Was: «Правила решения» out of the admin lane (rules live in FlexSoft). Signing the contract: two arrows, «client enters code → code checked», and only after that «FlexSoft: create contract»; add the wrong-code branch. Same for the other code step Bobur aka marked. Blocked client per ML30. Antifraud per ML24.

**Admin**
- [x] **MA6. App menu:** the quick actions on Asosiy and the tab bar. Order (drag), label, on/off.
- [x] **MA7. Remove «Qaror qoidalari»** (decision rules): FlexSoft owns them.
- [x] **MA8. Theme and info banners for Asosiy** (ML21): the wallpaper and the small top banners.

**From the sheet: Kreditlar, Ariza, Tolov tabs**
- [x] **Kreditlar:** a separate window with every product's detailed terms (ML18).
- [x] **Ariza, calculator:** payment day and payment type (ML17).
- [x] **ML31. Calculator result** (calculator done 30.10; the question about Kreditlar and «Batafsil shartlar» is still open): show only the approximate monthly payment and the total. No rate, no interest: they change with scoring. No «Toʻlov jadvali»: the real schedule comes after the decision. Question: should the rate chips on Kreditlar and the rates in «Batafsil shartlar» also go?
- [x] **ML32. Ariza card step:** instead of «Pul qaysi kartaga», say «Kredit ajratish ehtimolini oshirish uchun eng yuqori aylanmaga ega kartangizni biriktiring» (with ML26).
- [x] **ML33. Toʻlov: three kinds of payment** in one place: by the schedule, early (partial), and paying off in full.

## Next (30.10, after the user's answers)

**App**
- [x] **ML21. Asosiy:** the active-loan card moves to Qarzlarim (on top of «Faol»), so Asosiy has no loan card. The red overdue card stays on Asosiy. The background is one fixed theme drawn in the app (not set from the admin). In the card's place: a theme header with the greeting, the bell and the top story tiles.
- [x] **ML22. Quick actions:** Kreditlar, Toʻlov, Kartalar, Yordam in both cases (done 30.10).
- [x] **ML23. Rename the Toʻlovlar tab to «Monitoring»** (ru «Мониторинг»): payment history and receipts.
- ~~**ML16b.**~~ Keep «Kredit bor» and «Kredit yoʻq» in «Holatlar namunasi» (user, 30.10).
- ML31: the rates stay on Kreditlar and «Batafsil shartlar» (user, 30.10).
- On hold: ML27 (which check before FlexSoft), ML29 (limit per product), both with Bobur aka.

**Admin**
- [ ] **MA8b. «Asosiy oyna»:** remove «Mavzu» (the background picture); the theme is fixed in the app.
- MA6 stays as it is: one list of quick actions, ordered and edited in the admin (no second list for «no loan»).
- [x] **MA9. Tab bar:** the default label of Toʻlovlar becomes «Monitoring».

**BPMN v2**
- [ ] Admin «Asosiy oyna» step: «верхние баннеры, кнопки меню», without the background.
- [ ] The active loan shown in «Qarzlarim», not on Asosiy; rename Toʻlovlar to «Monitoring» where the tab appears.
- [ ] After Bobur aka: ML27 and ML29.
