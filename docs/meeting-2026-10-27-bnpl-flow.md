# Call with Bobur, 27.10.2026: the BNPL flow step by step

A 1 h 57 min walk through BPMN (BNPL) with Bobur Sheraliyev (Birzum) and Javohir Abdusamatov. It covered merchant onboarding, the catalogue, client registration, scoring, purchase and the contract. Payments after the contract come at the next session.

The main rule: we fit FlexSoft's backend ourselves. Any change on FlexSoft's side takes 2 weeks to a month per API, so we don't wait on them.

## Admin panel

1. **Merchant creation is removed.** Shops are registered, given a login and password, and set up in FlexSoft's web admin. Our admin shows only the merchant list (FlexSoft API "get merchants"), with each shop's products and stock. The merchant form and the tariff selector (commit 7226ef5) are no longer needed.
2. **"Merchantlarga oʻtkazmalar" (payouts) is removed.** Accounting pays merchants by hand. The merchant app's reconciliation report (Hisobot / o'zaro hisob-kitob) is removed for the same reason.
3. **Ustama is read-only.** Terms and markups live in FlexSoft, and FlexSoft gives the limit for each term. No creating or editing on our side.
4. **Tariffs are per shop, and there are 5 of them.** Examples: A is 15% for 3 months, B is 10%, C is 22%. They're set in the shop's profile in FlexSoft, by how risky the trade is: phones are high, building materials are low. We read them from FlexSoft.
5. **New: product moderation.** A product the merchant creates doesn't appear in the client app until the admin approves it, as on OLX or Avtoelon. The admin can reject it with a reason. If automatic checking is possible, use it as well.

## Merchant app

6. **Sign-in:**
   1. The login and password from FlexSoft.
   2. A PlayMobile OTP confirms the phone.
   3. The password is changed on first sign-in.
7. **Roles are fixed, not built freely.** FlexSoft has two:
   - **Admin:** sees the arizalar, downloads reports, sees client data. Can't submit an ariza for a client.
   - **User (seller):** submits arizalar and draws up contracts. Gets no reports.

   How it works:
   - At sign-in, FlexSoft returns the user's role.
   - In our admin we map each role to our app's pages ahead of time. For example, role A sees 6 of 10 functions.
   - When the merchant adds a staff member, they pick one of the two FlexSoft roles, and we send it to FlexSoft.
   - The merchant app's dynamic role builder changes to match.
   - Integration step: "FlexSoft: get the user's role".
8. **Adding a client from the merchant app:**
   - The MyID QR code is removed. MyID runs only on the same device: the seller hands the phone to the client.
   - The propiska address field is added; it was missing.

## Client app

9. **Propiska address:** selectors for region → district → city, then a text field for street and house. This replaces the map picker. *To confirm.*
10. **A client who already exists in FlexSoft** (registered on the web):
    - After the phone and OTP, we ask FlexSoft whether this client exists.
    - **If yes:** skip passport, MyID and card. The limits and arizalar are already there.
    - **If no:** we register the client and send them to FlexSoft.
    - The API doesn't exist yet; Bobur will ask. Fallback: the client registers again and FlexSoft updates the data (as in BBS).
11. **The card is required before the limit.** It's linked during limit setup; at checkout the client only picks a linked card. The FlexSoft card-linking integration must be written out, since it's needed for autopay and for collectors.
12. **Scoring:**
    - We send whatever fields FlexSoft asks for (Javohir will check which). FlexSoft creates the ariza.
    - FlexSoft checks card turnover, MIB, the salary statement and KATM, then returns a limit for each term.
    - If refused, we show the reason if FlexSoft gives one.
    - In the BPMN, remove "FlexSoft: кредитная история" and keep "FlexSoft: расчёт лимита по рассрочке".
13. **Cart:** items from one merchant only. The first item added decides the shop.
14. **Delivery:** the address is picked on a Yandex map at checkout.
15. **Down payment:** paid in cash at the shop and taken by the merchant. It's not charged to the card; only the monthly payments are. On a return, the merchant gives the down payment back.
16. **Markup at the term choice:** the % follows the shop's tariff, so the monthly payment differs from shop to shop. It's read from FlexSoft.

## Contract: new flow and statuses

17. **The steps, in order:**
    1. The client submits → **"Doʻkon tasdiqlashi kutilmoqda"**. The shop confirms it has the item. This happens before FlexSoft, because a FlexSoft contract goes into the credit history and KATM straight away.
    2. No answer from the shop within **24 h**, or the shop rejects → **"Rad etildi"**. The client is offered another shop.
    3. The shop confirms → we send it to FlexSoft → **"Shartnoma yaratilmoqda"**. This takes minutes, sometimes a few hours.
    4. FlexSoft creates the contract → **"Shartnoma yaratildi"**. It can stay like this for 3–6 days, until the client collects the item.
    5. The shop confirms the handover, with a photo → **"Shartnoma tasdiqlandi"**. Payments start.
    6. **"Yopildi"** means paid off. **"Bekor qilindi"** means a return after confirmation (refund).
    - FlexSoft never rejects a contract. It only checks the amount against the limit, and the markup.
18. **Shops without our merchant app**, or inactive for 30 days: when the client tries to create a contract, show a warning: "Remote contracts aren't possible with this shop. Go to the shop or choose another one."

## BPMN

19. **Split by app.** BNPL becomes a client app BPMN and a merchant app BPMN (there are 4 mobile apps in all). Each step marks what comes from FlexSoft. Bobur reviews it, then sends it to FlexSoft to confirm. Add FlexSoft in two places: merchant sign-in (getting the role) and client registration (whether the client exists).
20. **Next session:** payments after the contract.

## Waiting on Bobur / FlexSoft

- Whether sign-in returns the role.
- An API to check whether a client already exists.
- The fields for the limit request (Javohir).
- The card-linking integration.
