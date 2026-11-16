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
