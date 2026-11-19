# Design changes after the 13.11 review

The devs have already copied the earlier design. Each item says:
- **Screen:** the exact page and how to reach it in the app.
- **Before / Now:** what changed on that page.
- **Code:** the prototype files to look at.

Numbering: M = microloan app, C = BNPL client app, R = BNPL merchant app, A = admin panel.

## Microloan app (Fortuna, Vodiy)

### M1. Profil: cards and contacts get their own rows; «Hisob» is gone
- **Screen:** bottom tab «Profil» (the Profil root page).
- **Before:**
  - The page had four rows: Hisob, Sozlamalar, Yordam, Hujjatlar.
  - Hisob opened a separate page with two rows: «Kartalarim» and «Kontaktlarim».
- **Now:**
  - Under the name card there is one group of five rows, with no gap between them: «Kartalarim» (number of cards), «Kontaktlarim» (number of contacts), Sozlamalar, Yordam, Hujjatlar.
  - Each row opens its own page directly.
  - The «Hisob» row and the Hisob page are removed.
- **Unchanged:** the «Kartalarim» and «Kontaktlarim» pages themselves.
- **Code:** `src/features/profile/pages/ProfilePage.tsx`, `ProfileSectionPage.tsx`; text `profile.account` removed.

### M2. Yordam chati: voice messages
- **Screen:** «Yordam chati», opened from Asosiy → «Yordam», or Profil → Yordam → «Yordam chati».
- **Before:** text and photos only; the button on the right was always «Yuborish».
- **Now:**
  - With the message box empty, the round button on the right is a microphone. When the client types or attaches a photo, it turns back into «Yuborish».
  - Tap the microphone to start recording. The bottom bar becomes: a red delete (trash) button on the left, a pulsing red dot with the time (0:07) and «Yozilmoqda…» in the middle, and «Yuborish» on the right.
  - Delete throws the recording away. «Yuborish» sends it as a voice message.
  - A voice message bubble has a play/pause button, a waveform that fills as it plays, and the length (or the time played so far). The client's own voice messages are on the brand colour, like their text messages.
  - Only the client sends voice messages. Support answers in text (see A2).
- **Sample data:** the chat opens with an earlier exchange: a voice message from the client (0:14), support's text answer, a second voice message (0:06), then the greeting. This is only so the devs can see how voice messages look.
- **Prototype only:** the microphone is not used and there is no sound; the timer and playback just show the look.
- **Code:** `src/features/profile/pages/ChatPage.tsx`, `src/features/profile/components/VoiceMessage.tsx` (new); texts `chat.voice.*`.

### M3. Signing the contract: MyID face check instead of the SMS code
- **Screen:** «Qarz olish» → ariza → offer → «Shartnoma» → «Pul qaysi kartaga tushsin?» → «Davom etish».
- **Before:** an SMS code screen («Kod … raqamiga yuborildi»); entering the code signed the contract.
- **Now:**
  - The MyID face screen opens instead: «MyID orqali imzolash», the camera with the face oval, three tips, «Rasmga olish». Then «MyID tekshirmoqda». If the face matches, the payout starts as before.
  - If MyID doesn't confirm the face: «Yuz tasdiqlanmadi», with «Qayta urinish» (back to the camera) and «Keyinroq». No limit on retries for now (same as MyID at sign-in).
  - The MyID call is ours, not through FlexSoft.
  - The contract button now reads «Imzolashga oʻtish». The «SMS-kod bilan» texts on the contract page and in «Qanday ishlaydi» on Asosiy say «MyID orqali».
- **Sample:** the failed check is in Profil → «Holatlar namunasi» → «Imzolashda yuz tasdiqlanmadi».
- **Code:** `src/features/apply/pages/ApplicationPage.tsx`, `src/features/apply/api/mockApply.ts` (`verifySignFace`), `src/features/states/pages/*`.

### M4. Ariza: monthly income on every ariza
- **Screen:** «Qarz olish» → calculator → «Ariza», under «Ish joyi».
- **Before:** income was asked only at sign-up (and edited in Profil → Shaxsiy maʼlumotlar).
- **Now:**
  - A new required field «Oylik daromad», filled in from the profile.
  - The client can change it. The change goes only into this ariza (and to FlexSoft with it). The profile keeps its own value.
  - Hint: «Profildagi daromad olindi. Bu yerda oʻzgartirsangiz, faqat shu arizaga yoziladi.»
- **Data:** an ariza has `monthlyIncome`.
- **Code:** `src/features/apply/pages/ApplicationPage.tsx`, `src/entities/applications/applications.ts`.

### M5. Ariza: card text without auto-debit
- **Screen:** «Ariza» → «Eng koʻp aylanmali karta».
- **Before:** «Daromadni baholash va avtoyechish uchun.»
- **Now:** «Daromadni baholash uchun.» (ru «Для оценки дохода.»)
- **Code:** text `details.card.hint`.

### M6. Adding a card: the card must be in the client's name
- **Screen:** Profil → «Kartalarim» → «Karta qoʻshish» (and the same sheet from the ariza and the payout card step).
- **Before:** card number and expiry, then the card's SMS code; the card was added.
- **Now:**
  - After the code, Atmos returns the card owner's PINFL. It must match the PINFL of the registered client.
  - If it doesn't: the sheet shows «Karta sizning nomingizda emas» / «{card} boshqa shaxsga tegishli. Faqat oʻz nomingizdagi kartani ulash mumkin.» and «Boshqa karta qoʻshish». The card is not added.
- **Sample:** a card number ending in 0000 is someone else's.
- **Code:** `src/features/cards/components/AddCardSheet.tsx`, `src/entities/cards/cards.ts` (`isOwnCard`).

### M7. Kartalarim: each card shows its balance
- **Screen:** Profil → «Kartalarim».
- **Before:** card name, holder and expiry.
- **Now:** under the card name, the balance in bold (e.g. «2 450 000 UZS»). Atmos returns it live.
- **Only here:** not in the ariza or payment card pickers.
- **Code:** `src/features/cards/pages/CardsPage.tsx`, `src/entities/cards/cards.ts` (`balanceOf`).

### M8. Payment: SMS code from Atmos before the money is taken
- **Screen:** the «Toʻlov» sheet (Qarzlarim → a loan → «Toʻlash», or Monitoring), after «Oʻzim bajaryapman».
- **Before:** after «Oʻzim bajaryapman» the payment was taken at once.
- **Now:**
  - A step «Toʻlovni tasdiqlash»: «{sum} {card} kartasidan yechiladi. Kod kartaga ulangan telefon raqamiga yuborildi.», the code field, «Kodni qayta yuborish» with the timer, «{sum} toʻlash» and «Orqaga».
  - Atmos sends and checks the code. The right code takes the payment as before; a wrong one shows the error.
  - Automatic monthly debits don't ask for a code.
- **Code:** `src/features/payments/components/PaySheet.tsx`.

### M9. No fiscal cheque
- **Screen:** Monitoring → a payment in «Toʻlovlar tarixi» → «Toʻlov tafsilotlari».
- **Before:** the sheet had «Fiskal chekni koʻrish», which opened the cheque.
- **Now:** the button and the cheque are removed. The sheet shows only the payment details.
- **Code:** `src/features/payments/components/PaymentDetailSheet.tsx`; `src/shared/ui/FiscalReceipt.tsx` and the `receipt.*` texts are deleted.

## BNPL client app (Birzum Nasiya)

### C1. A paid installment opens its details
- **Screen:** bottom tab «Shartnomalar» → open a shartnoma → «Toʻlovlar» tab (the installment list).
- **Before:** the installment rows could not be tapped. Payment details opened only from Profil → «Toʻlovlar tarixi».
- **Now:**
  - A row with the status «Toʻlangan» can be tapped. It opens the same «Toʻlov tafsilotlari» bottom sheet as in «Toʻlovlar tarixi».
  - The sheet shows: amount, Holati, Sana va vaqt, Qaysi oy uchun, Doʻkon, Xarid raqami, Karta, and the «Fiskal chekni koʻrish» button.
  - «Kutilmoqda» and «Muddati oʻtgan» rows stay as they are.
- **Code:** `src/entities/clients/ui/PaymentSchedule.tsx` (`onPaidClick`), `src/features/customer-app/pages/PurchasePage.tsx`, `components/PaymentDetailSheet.tsx`.

### C2. «Ariza holati»: the steps of a shartnoma
- **Screen:** bottom tab «Shartnomalar» → open a shartnoma → «Maʼlumot» tab, at the top.
- **Before:** there was only the status badge and a note for the current status. The client could not see what comes next.
- **Now:** a new section «Ariza holati» lists the steps every ariza goes through, top to bottom:
  1. Ariza yuborildi
  2. Doʻkon tasdiqladi
  3. Shartnoma yaratildi
  4. Mahsulot qabul qilindi
  5. Shartnoma tasdiqlandi
  6. Shartnoma yopildi
- **How each step looks:**
  - Done: filled circle with a tick, plus the date and time.
  - Current (what the client is waiting for): outlined circle with a dot, plus a one-line hint, e.g. «Doʻkon tovar borligini 24 soat ichida tasdiqlaydi».
  - Later: grey circle, plus its hint.
- **Rejected or cancelled:** the done steps, then a red last step «Rad etildi» or «Bekor qilindi» with its date. The later steps are hidden.
- **Unchanged:** the status badge and the note under the title.
- **Code:** `src/features/customer-app/components/StatusSteps.tsx`; texts `steps.*`.

### C3. Reviews are left per product, not per shop
- **Screen 1:** bottom tab «Shartnomalar» → open a shartnoma → «Maʼlumot» tab.
  - **Before:** a «Sharh qoldirish» button opened a sheet that rated the whole shop for the shartnoma.
  - **Now:** the button is removed.
- **Screen 2:** the same shartnoma → «Mahsulotlar» tab.
  - **Before:** the products were listed with no rating.
  - **Now:**
    - Once the goods are received, a «Baholang» row with 5 stars appears under each product.
    - Tapping a star opens the review sheet, with the product name as the title. The tapped star is already chosen, there is an optional comment, and a «Yuborish» button.
    - After sending, the row shows the given stars and «Sizning bahoyingiz». Each product in a shartnoma can be rated once.
- **Data:** a review now has `productId` and `applicationId`. The shartnoma's `reviewed` flag is removed.
- **Code:** `components/ProductReviewStars.tsx`, `components/ReviewSheet.tsx`, `pages/PurchasePage.tsx`, `src/entities/clients/ui/ProductsSummary.tsx` (`lineFooter`), `src/entities/catalog/reviews.ts`.

### C4. Product card: rating and number of reviews
- **Screen:** every product card, i.e. the 2-column grid in Bosh sahifa, Katalog → product list, Qidiruv, Saralanganlar, the doʻkon page, and «Oʻxshash mahsulotlar».
- **Before:** the card showed the name, description, price, monthly payment and shop.
- **Now:**
  - Between the description and the price there is a new line: ★ average (number of reviews), e.g. «★ 4.0 (2)».
  - Products with no reviews don't show this line.
- **Code:** `components/ProductRating.tsx`, `components/ProductCard.tsx`.

### C5. Product page: a «Sharhlar» box that opens a new reviews page
- **Screen 1:** product page («Mahsulot»), section «Sharhlar», above «Oʻxshash mahsulotlar».
  - **Before:** no reviews on the product page.
  - **Now:** one box with:
    - the average (e.g. 4.0), the stars, and «N ta sharh»
    - the newest review's author and the first two lines of its text
    - an arrow; tapping the box opens Screen 2
  - With no reviews, the box shows only «Hali sharh yoʻq» and does not open anything.
- **Screen 2 (new page):** «Sharhlar», at `/customer/product/:id/reviews`.
  - The product name under the title.
  - Then every review of this product, newest first: avatar, name, stars, date, text. There is no summary box or star breakdown on this page.
  - If the shop answered, its reply is shown under the review in a grey box, with the shop name and the date (see R1).
- **Shop rating:** still the average of all reviews of that shop's products.
- **Code:** `components/ProductReviews.tsx`, `pages/ProductReviewsPage.tsx` (new), `pages/ProductPage.tsx`, `src/app/router.tsx`, `src/shared/config/routes.ts`.

### C6. Checkout: the delivery address moves to its own page
- **Screen 1:** «Savat» → «Rasmiylashtirish» (checkout) → under the shop, «Qabul qilish usuli» = «Yetkazib berish».
  - **Before:** the address field and the other delivery fields were right on the checkout page.
  - **Now:**
    - With no address yet, there is one big light-green button «Manzilni koʻrsatish» with a pin icon. It opens Screen 2.
    - Once saved, the button becomes a card: «Yetkazib berish manzili», the address, then house / apartment / entrance / floor in one line (e.g. «12-uy, 45-xonadon, 2-podyezd, 3-qavat»), the note, and «Oʻzgartirish ›». Tapping the card opens Screen 2 with everything filled in.
    - If the client taps «Buyurtma berish» with no address, the button gets a red outline and «Yetkazib berish manzilini koʻrsating» under it.
  - «Doʻkondan olib ketish» is unchanged.
- **Screen 2 (new page):** «Yetkazib berish manzili», opened from that button.
  - Fields (the same ones we already ask, nothing new): Manzil (typed or picked on the map, required), Uy raqami, Xonadon, Podyezd, Qavat (two per row), «Moʻljal yoki kuryerga izoh» (up to 200 characters, counter on the right).
  - «Saqlash» at the bottom: checks the address, then goes back to checkout. The back arrow goes back without saving.
  - Whatever was chosen on checkout (terms, boshlangʻich toʻlov, card) stays as it was.
- **Where these fields also show:**
  - Client app, a shartnoma's «Maʼlumot» tab: the address row includes house / apartment / entrance / floor, and there is a row for the note.
  - Merchant app, ariza detail page: the same address row and note row (it uses the same block).
  - The contract PDF («Shartnomani yuklab olish»): «Qabul qilish: yetkazib berish, <address>, 12-uy, 45-xonadon, 2-podyezd, 3-qavat».
- **Code:** `components/DeliveryAddressButton.tsx` (new), `components/DeliveryAddressPage.tsx` (new), `pages/CheckoutPage.tsx`, `src/entities/clients/ui/FulfilmentFields.tsx` (`deliverySlot`), `ui/FulfilmentRows.tsx`, `src/entities/clients/contractPdf.ts`, `src/entities/clients/clients.ts` (`Fulfilment`: `house`, `apartment`, `entrance`, `floor`, `note`), `src/entities/clients/fulfilment.ts`.

### C7. Bosh sahifa: «Mening QR kodim» button at the top
- **Screen:** bottom tab «Bosh sahifa», the top bar (avatar, «Salom, …», buttons on the right).
- **Before:** the only button on the right was notifications (bell). «Mening QR kodim» opened only from Profil.
- **Now:**
  - A round QR-code button sits to the left of the bell, the same size and style.
  - It opens the same «Mening QR kodim» page.
  - The «Mening QR kodim» row in Profil stays.
- **Code:** `src/features/customer-app/pages/CustomerHomePage.tsx`.

### C8. Yordam chati: voice messages
- **Screen:** bottom tab «Profil» → «Yordam chati».
- **Before:** text and photos only; the button on the right was always «Yuborish».
- **Now:**
  - With the message box empty, the round button on the right is a microphone. When the client types or attaches a photo, it turns back into «Yuborish».
  - Tap the microphone to start recording. The bottom bar becomes: a red delete (trash) button on the left, a pulsing red dot with the time (0:07) and «Yozilmoqda…» in the middle, and «Yuborish» on the right.
  - Delete throws the recording away. «Yuborish» sends it as a voice message.
  - A voice message bubble has a play/pause button, a waveform that fills as it plays, and the length (or the time played so far). The client's own voice messages are on the brand colour, like their text messages.
  - Only the client sends voice messages. Support answers in text (see A2).
- **Sample data:** the chat opens with an earlier exchange: a voice message from the client (0:14), support's text answer, a second voice message (0:06), then the greeting. This is only so the devs can see how voice messages look.
- **Prototype only:** the microphone is not used and there is no sound; the timer and playback just show the look.
- **Code:** `src/features/customer-app/pages/ChatPage.tsx`, `components/VoiceMessage.tsx` (new); texts `chat.voice.*`.

## BNPL merchant app

### R1. Sharhlar: the merchant can reply to a review
- **Screen:** bottom tab «Profil» → «Sharhlar».
- **Before:** each review had only a delete button.
- **Now:**
  - Each review has a «Javob berish» button next to the delete button.
  - Tapping it opens a bottom sheet «Sharhga javob». It shows the review (author and text), a «Javobingiz» text field with the hint «Javob klient ilovasida sharh ostida koʻrinadi», and «Yuborish». An empty answer is not allowed.
  - Once sent, the reply shows under the review in a grey box («Sizning javobingiz» and the date). The button becomes «Javobni tahrirlash», which opens the same sheet with the text filled in.
  - The client sees the reply on the product's «Sharhlar» page (C5) under that review, with the shop's name.
- **Data:** a review has an optional `reply: { text, date }`.
- **Code:** `src/features/manage/pages/ReviewsPage.tsx`, `src/features/manage/components/ReplySheet.tsx` (new), `src/entities/catalog/ui/ReviewItem.tsx`.

## Admin panel

### A1. Sharhlar: reviews are per product, with the merchant's reply
- **Screen:** left menu «Sharhlar».
- **Before:** reviews were per shop, one per ariza. A card showed the stars, date, text, client, shop, the ariza's first product (grey text) and the ariza number.
- **Now:**
  - Each review belongs to one product. An ariza with two products can have two reviews.
  - On each card, the product name is a link to its product page.
  - If the merchant replied, the reply shows under the review text in a grey box: «<Merchant> javobi», date and time, the text, and «Javobni oʻchirish» on the right.
  - «Javobni oʻchirish» asks first: «Merchant javobini oʻchirasizmi?» / «Javob klient ilovasidan olib tashlanadi. Sharhning oʻzi qoladi.». It is written to the audit log («Merchant javobini oʻchirdi»).
  - A new filter «Mahsulot» next to «Merchant» and «Baho». It lists only products with reviews in the period, and only the chosen merchant's products if a merchant is selected.
  - The page description now says reviews are on products and include merchant replies.
- **Unchanged:** the figures, «Baholar», «Merchantlar reytingi» (a shop's rating is the average of its products' reviews), the tabs, hide / restore / delete.
- **Data:** a review has `productId` and an optional `reply: { text, at }`. An ariza line has `productId`.
- **Code (Birzum Admin):** `src/features/reviews/pages/ReviewsPage.tsx`, `src/features/reviews/components/ReviewDialogs.tsx` (`DeleteReplyDialog`), `src/entities/reviews/reviews.ts`, `src/entities/applications/applications.ts`.

### A2. Yordam chati: the client's voice messages
- **Screen:** left menu «Yordam chati» → open a chat.
- **Now:**
  - A client's voice message shows as a bubble with play/pause, the waveform and the length, on the client's side.
  - In the chat list, when the last message is a voice message, the preview reads «Ovozli xabar · 0:17».
  - Admins can't send voice messages. The reply box is unchanged (text, photo, quick replies, internal note).
- **Sample data:** two BNPL chats have a voice message from the client, so it can be seen.
- **Code (Birzum Admin):** `src/features/support/pages/SupportPage.tsx`, `src/features/support/components/VoiceMessage.tsx` (new), `src/entities/support/chats.ts` (`voice` on a message).

### A3. Arizalar: new status «Mijoz qabul qildi»
- **Screen:** Birzum → «Arizalar» (status filter and badge) and an ariza page → «Tarix».
- **Before:** the admin had no step between «Shartnoma yaratildi» and «Shartnoma tasdiqlandi».
- **Now:** the status `received` «Mijoz qabul qildi» / «Клиент получил», the same as the client and merchant apps. It is set when the client taps «Mahsulotni qabul qildim» in the client app. It shows in the status filter, as a blue badge, and in «Tarix» as «Klient: <name>». It counts as an open ariza.
- **Code (Birzum Admin):** `src/entities/applications/applications.ts`, `src/entities/applications/applicationStatus.ts`, `src/shared/i18n/dictionaries.ts`.

### A4. Ariza page: full delivery address
- **Screen:** Birzum → «Arizalar» → an ariza → «Olish usuli».
- **Before:** one «Manzil» line.
- **Now:** under «Manzil», the same parts the client enters in checkout: «Uy», «Xonadon», «Podyezd», «Qavat», «Moʻljal / kuryerga izoh». Only the filled ones show.
- **Code (Birzum Admin):** `src/features/applications/pages/ApplicationDetailPage.tsx`, `src/entities/applications/applications.ts` (`Fulfilment`).

### A5. Product page: «Sharhlar» block
- **Screen:** Birzum → «Mahsulotlar» → a product, main column at the bottom.
- **Before:** the product page showed no reviews.
- **Now:**
  - A «Sharhlar» block shows the average rating, the stars and «N ta sharh» (published reviews only, as in the client app), plus the 3 latest reviews with the merchant's reply.
  - «Hammasi» opens «Sharhlar» already filtered to this product and its merchant, for all time.
  - With no reviews it shows «Hali sharh yoʻq».
- **Code (Birzum Admin):** `src/features/products/components/ProductReviewsCard.tsx` (new), `src/features/products/pages/ProductDetailPage.tsx`, `src/features/reviews/pages/ReviewsPage.tsx` (`?product=`).

### A6. Microloan ariza: signed with MyID, income for this ariza
- **Screen:** Fortuna / Vodiy → «Arizalar» → an ariza.
- **Now:**
  - In «Tarix», the «Imzolandi» step reads «MyID orqali yuz tekshiruvi bilan imzolandi» (it was SMS code before).
  - The right-hand block «Mijoz aytgan» is now «Arizada koʻrsatilgan», with the note «Shu ariza uchun. Profildagi daromad oʻzgarmaydi.».
- **Code (Birzum Admin):** `src/features/microloans/pages/LoanApplicationPage.tsx`, `src/entities/microloans/applications.ts`.

### A7. Microloan client: cards with owner check and balance
- **Screen:** Fortuna / Vodiy → «Mijozlar» → a client, right column.
- **Before:** cards were one line («Kartalar») inside the «Ilova» block.
- **Now:** a separate «Kartalar» block. Each card shows its balance from Atmos and «Karta egasi JSHSHIR boʻyicha mos (Atmos)». The note under it says another person's card can't be added.
- **Code (Birzum Admin):** `src/features/microloans/pages/LoanClientPage.tsx`, `src/entities/microloans/loans.ts` (`cardBalanceOf`).

### A8. Microloan payments: no fiscal cheque, Atmos code
- **Screen:** Fortuna / Vodiy → «Toʻlovlar», and a loan page → payments.
- **Before:** each successful payment had a «Fiskal chek» button.
- **Now:**
  - The cheque button and window are gone. A failed payment still has «Qayta yechish».
  - The method «Ilovada toʻladi» reads «Ilovada toʻladi (Atmos SMS kod)».
- **Code (Birzum Admin):** `src/features/microloans/pages/LoanPaymentsPage.tsx`, `src/features/microloans/pages/LoanPage.tsx`. Deleted: `LoanReceiptModal.tsx`, `src/shared/ui/FiscalReceipt.tsx`, the `receipt.*` texts, the STIR in `workspaces.ts`.

### A9. Yordam chati: Telegram layout
- **Screen:** «Yordam chati» in Birzum, Fortuna and Vodiy → open a chat.
- **Before:** three columns: chats, the conversation, and a client panel on the right (limit, debt, purchases / loans).
- **Now:**
  - Two columns, like Telegram: chats on the left, the conversation on the right. The right-hand client panel is gone.
  - Chat header: the client's photo, name, topic and phone. Clicking the name opens the client page (Birzum → «Klientlar», Fortuna / Vodiy → «Mijozlar»).
  - 🔍 in the header opens «Chatdan qidirish»: matches are marked in the messages, «2 / 5» counter, ↑ ↓ (or Enter / Shift+Enter) move between them, Esc closes.
  - «Operatorga oʻtkazish»: a dropdown in the header with the operators. It works for a taken chat (hand to a colleague) and for a chat in the queue (give it to someone). The chat gets the system line «… chatni …ga oʻtkazdi». «Chatni olish» stays for the queue.
  - The operator's messages show ✓✓ next to the time.
- **Code (Birzum Admin):** `src/features/support/pages/SupportPage.tsx`. Deleted: `src/features/microloans/components/LoanClientPanel.tsx`.

### A10. Merchant page: dashboard and more tabs
- **Screen:** Birzum → «Merchantlar» → a merchant.
- **Before:** four plain figures (filials, products, active nasiya, sales this month) and two tabs (Filiallar, Xodimlar).
- **Now:**
  - A dashboard with its own period filter (default: this month):
    - «Savdo hajmi»: goods handed over in the period.
    - «Arizalar», with «Qabul qilingan: N%» (accepted out of decided).
    - «Reyting» with «N ta sharh».
    - «Salbiy sharhlar» (1–2 stars).
  - Each figure shows its change against the period before (not the rating).
  - «Savdo dinamikasi»: a line chart of sales over the period.
  - Tabs: «Filiallar», «Xodimlar», «Mahsulotlar» (best sellers first, each opens the product), «Arizalar» (newest first, each opens the ariza), «Sharhlar» (published reviews with the merchant's replies). Each tab shows its count.
  - The merchant's data stays read-only (it comes from FlexSoft). Only «Koʻrinish» (the shop's look in the client app) can be changed here.
- **Code (Birzum Admin):** `src/features/merchants/pages/MerchantDetailPage.tsx`, `src/features/merchants/components/MerchantDashboard.tsx` (new), `src/features/merchants/components/MerchantLists.tsx` (new).

### A11. Client page: limit history with a chart (Birzum)
- **Screen:** Birzum → «Klientlar» → a client → «Limit tarixi» tab.
- **Before:** a list of limit changes, usually one scoring.
- **Now:**
  - A client takes a new limit about every two months (FlexSoft scores again). Each scoring is a row: the sum from → to, «FlexSoft skoringi», valid until, date and time. A manual change by an admin shows the admin's name, reason and comment.
  - Above the list, «Limit oʻzgarishi»: a line chart with one point per change, the date under each point, and the current limit in the legend. Hovering a point shows its date and sum. It shows when there are 2 or more changes.
- **Code (Birzum Admin):** `src/features/clients/pages/ClientDetailPage.tsx`, `src/entities/clients/limits.ts` (sample: several scorings per client), `src/shared/ui/charts/LineChart.tsx` (`legend="last"`), `src/shared/lib/period.ts` and `chartAxis.ts` (`event` points).

### A12. Microloan client: asked and offered sums (Fortuna / Vodiy)
- **Screen:** Fortuna / Vodiy → «Mijozlar» → a client, above «Arizalar».
- **Now:** «Soʻralgan va taklif qilingan summalar»: a line chart with one point per ariza (oldest first). «Taklif qilingan» is the sum offered (as asked or a counter-offer); «Soʻralgan» is what the client asked for. A declined ariza has no offered point. It shows when the client has 2 or more arizalar. Each workspace shows only its own brand's arizalar.
- **Code (Birzum Admin):** `src/features/microloans/pages/LoanClientPage.tsx`.

### A13. Faoliyat jurnali: every app and integration step, in each workspace
- **Screen:** «Faoliyat jurnali»: Birzum → «Tizim» group, and a new menu item in Fortuna and Vodiy (new «Tizim» group at the bottom).
- **Before:** one log for the whole panel, admin actions only.
- **Now:** each workspace has its own log with two tabs under one period filter.
  - **«Ilova va integratsiyalar»:** every step by a client, a seller or the system in that workspace's apps:
    - Kirish: SMS code sent / confirmed / wrong, sign-up, sign-in, new device, PIN reset, PIN and Face ID set, sign-out, phone changed.
    - MyID: passport check, face check (also failed tries).
    - Kartalar: card added through Atmos (also «Karta sizning nomingizga emas» when the JSHSHIR doesn't match), card removed.
    - Skoring (Birzum): the FlexSoft request, limit given / refused.
    - Arizalar, Birzum: created, accepted / rejected by the shop, 24-hour timeout, sent to FlexSoft, contract created, «Mahsulotni qabul qildim», handed over, cancelled, returned.
    - Arizalar, Fortuna / Vodiy: sent, FlexSoft approved / counter-offer / declined, offer refused / expired, signed with MyID, payout to the card (also failed tries).
    - Toʻlovlar: in the app with the Atmos code, auto-debit, at a filial or bank, overdue started, loan closed.
    - Yordam: wrote to support, review left, merchant replied.
  - Columns: time (with seconds), step (with its stage and the ariza / loan), who (client / seller / system), client (link), service (SMS, MyID, FlexSoft, Atmos), result (✓ or ✗ with the error code).
  - Filters: search (client, step, ariza, error code), stage, who, service, result. «N ta xato» next to the count shows only the errors.
  - A row opens the details: on failure a red box with the error code, the message and what the client saw, then app, who, stage, result, service, response time, client, ariza / loan, device, IP, and the request and response JSON (personal data masked).
  - **«Admin amallari»:** the earlier log, now only that workspace's actions (Fortuna and Vodiy see their own microloan actions; Birzum sees the rest).
- **Roles:** new page «Mikroqarz faoliyat jurnali» (read) in the microloan page set.
- **Code (Birzum Admin):** `src/entities/audit/events.ts` (new: steps, entries, sample built from the other sample data), `src/features/audit/pages/AuditLogPage.tsx`, `src/features/audit/components/EventsLog.tsx` (new), `EventModal.tsx` (new), `AdminActionsLog.tsx` (the old table, moved), `src/app/nav.ts`, `src/app/router.tsx`, `src/entities/admins/roles.ts`.

### A14. Qarzdorlar: a CRM for late nasiyalar (Birzum)
- **Screen:** new menu item «Qarzdorlar» in «Savdo», under «Toʻlovlar va qarzlar». Each late nasiya also has its own page, «Qarzdorlar» → a card.
- **Before:** «Toʻlovlar va qarzlar» → «Qarzdorlar» tab: one row per client, with a call result (4 results), a reminder and a card charge. There was no status, no next call and no person in charge.
- **Now:** one file (card) per late **nasiya**, not per client. The list of what to build comes from Ayva's «Задолженности».
  - **Statuses (columns):** Yangi qarz, Birinchi qoʻngʻiroq, Qayta qoʻngʻiroq, Toʻlashga vaʼda berdi, Javob bermayapti, Toʻlashdan bosh tortdi, Sudga berildi, Telefon oʻchiq, Yopildi / toʻlandi.
  - **Set by the system only:** «Yangi qarz» and «Yopildi».
    - A nasiya that goes late opens as Yangi qarz.
    - It closes when its late amount reaches 0.
    - A closed one reopens as Yangi qarz if it goes late again.
    - These changes are written as done by «Tizim». Nobody can pick these two statuses or drop a card on them.
  - **Kanban is the main view, Jadval the second.**
    - On the kanban you drag a card to another column. A modal then asks for the reason (required) and saves the change.
    - Each column shows its count and sum, and scrolls on its own.
    - A card shows: name and phone, days late (red from 8 days), the late sum, the nasiya number, the product and shop, the next call (red when missed), the last note, and the operator.
    - The table has the same data, with pagination. Its row icon is the call result.
  - **Figures:** open debts and their late sum, calls due today (and how many missed), promised to pay, closed this month. Below them, the late sum as a bar by age (1–7, 8–14, 15–30, 30+ days); clicking a part filters.
  - **Quick chips:** Hammasi, Kritik 8+, Bugun qoʻngʻiroq, Javob bermayapti, Vaʼda berdi, Mening qarzlarim, Biriktirilmagan, Yopilgan.
  - **Filters:** search (name, phone, nasiya number), status (table only), days late, sum (1 mln gacha, 1–3, 3–5, 5 mln+), next call (missed, today, later, not set), shop, operator (or Biriktirilmagan), date opened. «Tozalash» resets them.
  - **The debt page:**
    - Header actions: «Holatni oʻzgartirish» and «Qoʻngʻiroq natijasi» (no reminder or card charge, see A15).
    - Figures: late sum, days late and since when, what is left of the nasiya, the next call.
    - Left: calls and reminders, status history (from → to, reason, who, when), the payment schedule.
    - Right:
      - Masʼul («Oʻzgartirish»)
      - Keyingi qoʻngʻiroq (set, move, remove; day, half-hour slot, note)
      - the client with their Kontaktlar
      - the nasiya (number, goods, shop, sum, monthly payment, term, date opened)
      - the client's other late nasiyalar
  - **Call form** (modal; also used from the client page):
    - 8 results: Toʻlashga vaʼda berdi, Muhlat soʻradi, Javob berdi, Toʻlaganini aytdi, Javob bermadi, Raqam oʻchiq, Toʻlashdan bosh tortdi, Boshqa.
    - Call time.
    - The promised day, or the delay day for «Muhlat soʻradi».
    - «Mijoz javobi» and «Operator izohi».
    - The next call.
    - «Qoʻngʻiroqdan keyingi holat», picked from the result and changeable.
    - When the client has other late nasiyalar: «Mijozning boshqa N ta kechikkan nasiyasiga ham yozish» saves the same call on all of them.
    - No call recording.
  - **Operators:** an admin assigns them by hand on the debt page. Only active admins whose Birzum role can edit «Qarzdorlar» are listed.
  - Every change goes to «Faoliyat jurnali» (section Qarzdorlar): call, status (before → after), next call, operator.
- **«Toʻlovlar va qarzlar» changes:**
  - The «Qarzdorlar» tab is gone; the page now has «Toʻlovlar» and a new «Hisobot» tab.
  - The «Kechikish muddati» rows open Qarzdorlar filtered by that age.
  - «Hisobot» follows the page's period and has two tables:
    - **«Vaʼdalar»:** per month: calls, reached, reach %, promises given, promises due, kept, kept %. A promise is kept when money came in for that nasiya between the call and the promised day.
    - **«Operatorlar»:** per operator: calls, debts called, reached, reach %, promises, kept, kept %, money collected on the debts assigned to them. There is a total row and a «Biriktirilmagan» row.
- **Roles:** new page «Qarzdorlar» (read, edit) in Birzum's «Savdo» set. The «Moliya» and «Undiruvchi» roles get it in full.
- **Fortuna / Vodiy:** not yet. Their Kechikkanlar keep the 4 old call results and will get their own version later.
- **Code (Birzum Admin):**
  - New: `src/entities/collections/debtCases.ts` (files, statuses, the system's open / close / reopen), `src/features/debts/` (`pages/DebtsPage.tsx`, `pages/DebtPage.tsx`, `components/DebtBoard.tsx`, `components/DebtDialogs.tsx`, `lib/rows.ts`), `src/features/collections/components/CollectionReports.tsx`.
  - Changed: `src/entities/collections/contacts.ts` (8 results, nasiya, client's answer, next call, status after), `src/features/collections/components/ContactLog.tsx`, `ContactDialogs.tsx` (the old call modal removed), `src/features/collections/pages/CollectionsPage.tsx`, `src/features/clients/pages/ClientDetailPage.tsx`, `src/entities/admins/roles.ts`, `src/app/nav.ts`, `src/app/router.tsx`, `src/shared/config/routes.ts`, `src/shared/i18n/dictionaries.ts`.

### A15. Birzum: no reminder or card charge by an admin; «Toʻlovlar»; Plan/fakt
- **Reminder and card charge removed (Birzum only):**
  - «Eslatma yuborish» and «Kartadan yechish» are gone from the debt page (Qarzdorlar → a card), from the Qarzdorlar table's row icons, and from the late-client banner on the client page (Klientlar → a client). Only «Qoʻngʻiroq natijasi» stays.
  - The role permission «Kartadan pul yechish» is removed. «Moliya» and «Undiruvchi» no longer have it, and the payment method «Kartadan yechildi (admin)» is gone from the Toʻlovlar filter.
  - The automatic reminders the system sends still show in the call log.
  - Fortuna and Vodiy keep their own reminder and «Qayta yechish» on Kechikkanlar for now.
- **Sidebar:** «Toʻlovlar va qarzlar» is now **«Toʻlovlar»** (ru «Платежи»). It holds only payments and Hisobot; debtors live on «Qarzdorlar», plan/fakt on «Plan/fakt».
- **Roles:** new page «Plan/fakt» (read): «Moliya» has it in full, «Undiruvchi» can view it.
- **Plan/fakt (its own page):** new sidebar item «Plan/fakt» under «Toʻlovlar» (`/plan-fact`), with its own period filter (opens on «Butun davr») and «Yuklab olish». One row per nasiya.
  - Columns: client and nasiya (both links, with the shop), hand-over date, nasiya sum, down payment, what is left. Then for each month: **Plan**, **Fakt**, **Farq**. Then «Davr boʻyicha jami» (plan, fakt, farq) and «Bugungi qarz» (what is late today).
  - **Plan** of a month = what is still unpaid of that month's instalment on the 1st of the month. A month already paid ahead plans 0.
  - **Fakt** = money that came in during the month.
  - **Farq** = plan − fakt: red when less came in, green when more.
  - Money paid ahead goes to the **last** instalment (the existing schedule rule, confirmed 18.11). So a double payment in June shows June plan 600 / fakt 1 200, July still plans 600, and the nasiya ends a month early.
  - The «Jami» row on top sums the filtered rows. There is a search (client, phone, nasiya number) and a shop filter. **No pagination:** every row is on the page; the header row and the client column stay in place while the table scrolls.
  - Columns start at the first hand-over, so a year view has no empty months before it.
- **Backend:** a plan/fakt report by nasiya and month (or the schedule as of a date plus payments, to compute it), and the export. The swagger has neither today.
- **Code (Birzum Admin):** `src/features/collections/components/PlanFact.tsx` (new), `src/features/collections/pages/PlanFactPage.tsx` (new), `src/features/collections/pages/CollectionsPage.tsx`, `src/app/nav.ts`, `src/app/router.tsx`, `src/shared/config/routes.ts`, `src/features/debts/pages/DebtPage.tsx`, `DebtsPage.tsx`, `src/features/clients/pages/ClientDetailPage.tsx`, `src/entities/admins/roles.ts`, `src/entities/collections/payments.ts`, `src/entities/audit/audit.ts`. Deleted: `src/features/collections/components/ContactDialogs.tsx`, `PaymentDialogs.tsx`.

### A16. Fortuna / Vodiy: Qarzdorlar and Plan/fakt; no reminder or re-charge
- **Qarzdorlar (replaces «Kechikkanlar»):** menu «Qarzlar» → «Qarzdorlar» (`/{brand}/debts`; the old `/{brand}/overdue` opens it). It's the same board as Birzum's (A14), built from the same shared parts:
  - One card per late **loan**, the same 9 statuses (Yangi qarz and Yopildi set by the system: opens when a monthly payment is missed, closes when nothing is late, reopens on the same file).
  - Kanban (drag a card, a modal asks the reason) and Jadval; figures, the age bar, the 8 chips (incl. «Mening qarzlarim», «Biriktirilmagan»), filters (search by name / phone / contract, days late, sum, next call, **product**, operator, date opened).
  - The card shows the borrower, days late, the late sum (all monthly payments due and unpaid), the contract number, product and term, next call, last note, operator.
  - **The loan's page** (`/{brand}/debts/:id`):
    - Header actions: «Holatni oʻzgartirish», «Qoʻngʻiroq natijasi».
    - Figures: late sum and how many monthly payments, days late and since when, what is left, next call.
    - Left: calls, status history, the loan's schedule (paid / late / waiting).
    - Right: Masʼul, Keyingi qoʻngʻiroq, the borrower with their Kontaktlar, the loan (contract, product, sum, yearly rate, term, monthly payment, card, pay-out day), the borrower's other late loans.
  - **Call form:** the same 8 results, client's answer, operator comment, next call, status after the call, and «write on the borrower's other late loans too». **New for microloans: «Kim bilan gaplashildi»** — the borrower or one of their contacts (name and relation from Kontaktlarim). A call with a contact shows «Gaplashildi: <name> (<relation>)» in the log.
  - Operators: active admins whose role in that brand can edit Qarzdorlar. **New role «Undiruvchi (mikroqarz)»** (Fortuna, Vodiy): Qarzdorlar and Plan/fakt in full, view of Qarzlar, Toʻlovlar, Mijozlar. The role page «Mikroqarz kechikkanlari» is now «Mikroqarz qarzdorlari».
  - Every change goes to the brand's Faoliyat jurnali (section mikroqarz qarzdorlari).
- **Removed (user, 19.11):** «Eslatma yuborish» and the call modal on the loan page (it now has «Qarzdorlar faylini ochish» while the loan is late), and «Qayta yechish» on «Toʻlovlar» (refused automatic charges are listed, not retried from the panel). The automatic reminders the app sends still show in the call log.
- **Hisobot:** a new tab «Hisobot» on the brand's «Toʻlovlar» (after Hammasi, Tushgan, Yechib boʻlmadi), the same reports as Birzum's and following the page's period:
  - «Vaʼdalar» by month: calls, reached, reach %, promises given, due, kept, kept %. A promise is kept when money came in for that loan between the call and the promised day.
  - «Operatorlar»: per operator (the brand's collectors and anyone who called): calls, loans called, reached, reach %, promises, kept, kept %, money in on the loans assigned to them; a «Jami» row and «Biriktirilmagan».
  - Birzum's note now says «shu qarzga» (this debt) instead of «shu nasiyaga», so it reads right in every workspace.
- **Plan/fakt:** new menu item «Plan/fakt» under «Toʻlovlar» (`/{brand}/plan-fact`), the same table as Birzum's (A15):
  - One row per **loan**: borrower and contract (links), pay-out day, loan sum, what is left; Plan / Fakt / Farq per month; the period's total; today's debt. Filter by product; search by name, phone, contract. No pagination.
  - **Plan** of a month = the monthly payments due that month that were still unpaid on its 1st, using the schedule as it stood then: a partial early repayment made before that day has already lowered the later payments (the app's annuity rule, the end stays). **Fakt** = money in that month (monthly payments and early repayments).
  - New role page «Plan/fakt (mikroqarz)» (read).
- **Backend:** the same as A14 and A15 for each brand: debt cases per loan with statuses, calls (with who was called), next call, operator, history; and a plan / fakt report per loan and month. Nothing in the swagger yet; today's `/admin/apps/{app}/overdue-loans`, `…/loans/{id}/calls` and `…/reminders` are mocks and the reminder one is no longer needed.
- **Code (Birzum Admin):** shared now: `src/features/collections/components/CollectionReports.tsx` (`ReportsView` + Birzum's adapter), `src/features/microloans/debts/LoanReports.tsx` (new, the brands' adapter), `src/features/debts/components/DebtsView.tsx` (new: the board page for any workspace), `DebtBoard.tsx`, `DebtDialogs.tsx` (call form with optional «Kim bilan gaplashildi»), `src/features/debts/lib/board.ts` (new); `src/features/collections/components/PlanFactView.tsx` (new: the table), `src/features/collections/lib/planFact.ts`. Brands: `src/entities/microloans/loanDebts.ts` (new), `loanContacts.ts` (8 results, whom), `src/features/microloans/debts/` (new: `LoanDebtsPage.tsx`, `LoanDebtPage.tsx`, `rows.ts`), `src/features/microloans/pages/LoanPlanFactPage.tsx` (new), `LoanPage.tsx`, `LoanPaymentsPage.tsx`, `LoanDashboardPage.tsx`; `src/entities/admins/roles.ts`, `admins.ts`; `src/app/nav.ts`, `router.tsx`. Deleted: `LoanOverduePage.tsx`, `LoanContactDialogs.tsx`.

