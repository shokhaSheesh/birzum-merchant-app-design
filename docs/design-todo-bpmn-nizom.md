# Design to-do: what changed in the BPMN (28.10.2026)

The design has to catch up with the three BPMNs on Miro: Клиент (BNPL), Мерчант (BNPL) and Админ (BNPL). The changes come from the call with Bobur (see [meeting-2026-10-27-bnpl-flow.md](meeting-2026-10-27-bnpl-flow.md)), from the user's comments on Miro, and from the Central Bank's Nizom AV 3759.

## Decisions on the Nizom

| Point | What we do |
|---|---|
| OTP (5) | 6 characters (digits and letters), valid 59 s, dies after 3 wrong attempts |
| 3 wrong OTPs (5) | Block for 15 min and send an SMS (PlayMobile). The app shows the "Xavfsizlik" screen with a timer. |
| New device (10, 12) | MyID face check, then an SMS to the owner with the device, model, OS and IP, and "if it wasn't you, change your password". The SMS is required. |
| Cards on a new device (11) | Unlinked, and the operation history on that device is hidden. The client links the cards again. |
| Phone ↔ PINFL (5) | Check through PlayMobile. On a mismatch, show it **in the app only**, with no SMS. |
| Card's SMS phone ≠ client's phone (5) | Stop linking, show a PUSH and the "Xavfsizlik" screen |
| Session (13) | After 3 min without activity, lock the screen: **PIN or Face ID**, not a full sign-in |
| Before a financial action (17) | A warning with a checkbox, "Делаю сам, без мошенников". It appears at checkout (signing) and before a payment. |
| Changing the phone (70) | An SMS to the old number ("service switched off") and to the new one ("switched on"). No face check. |
| Active sessions (16) | A section in the profile |
| Fraud report (27) | A form in the profile |
| Fraud education (65–66) | A section with fraud schemes and protection tips |
| Card owner's name (41) | Shown as "Имя Ф." |
| Blocking during calls (15) | Native code. Mark it in the design for the mobile devs. |

**Skipped on purpose:**
- the face check when linking a card, and signing in again after registration (5)
- admin MFA and PAM (48)
- fraud cases (chapter 5)
- the merchant app doesn't follow the Nizom rules

## Client app (BNPL)

- **Sign-in:**
  - OTP rules
  - a block after 3 wrong attempts
  - check whether the client exists in FlexSoft
  - check whether the device is new
- **Sign-in from a new device:** MyID → cards unlinked → SMS to the owner → PIN / Face ID → link the cards again
- **Registration:** after MyID, the phone ↔ PINFL check. If it fails: "Номер не на ваше имя" (the "Xavfsizlik" screen).
- **Card:** Atmos (not Viya) returns the card's SMS phone, and we compare it with the client's. If they differ: a PUSH and the "Xavfsizlik" screen.
- **Catalogue:** the shop's markup comes from what the system saved when the merchant signed in, not straight from FlexSoft
- **Checkout:** the warning "Делаю сам, без мошенников" before "Отправить"
- **Payment:** the same warning before paying
- **Session:** after 3 min the screen locks (PIN / Face ID)
- **Changing the phone:** a code to the new number → change → FlexSoft updated → SMS to the old and the new number
- **Profile:**
  - "Aktiv sessiyalar" (device, OS, IP, start time, current session, "Sessiyani tugatish")
  - "Firibgarlik haqida xabar berish"
  - the section on fraud schemes
- **Contract statuses** (Russian on Miro, in the app as before):
  - Ожидает подтверждения магазина
  - Отклонён
  - Договор создаётся
  - Договор создан
  - Договор подтверждён
  - Закрыт
  - Отменён (возврат)

## "Xavfsizlik" screen (one screen for all security cases)

One screen with states, so the mobile devs find them all in one place. Each state has an icon, a title, text and a button.

1. Blocked for 15 min after 3 wrong codes, with a countdown timer
2. The number isn't registered to your PINFL
3. The card is linked to another number
4. Sign-in from a new device wasn't confirmed (MyID failed)
5. The account is blocked because of suspicious activity → contact support
6. The session ended (3 min) → PIN / Face ID

## Merchant app

- **Sign-in:**
  - FlexSoft returns the role, the merchant and its tariff
  - we save them, and the role decides which pages are visible
- **Staff:** the owner sets the name, phone, branches, login, password and a role (administrator or seller). We create the user in FlexSoft.
- **New client:**
  - the seller enters the card
  - the client reads out the card's SMS code
  - the card goes to FlexSoft for autopay
- **Limit for a client:** a separate process, started from the client's card
- **Catalogue:**
  - the merchant creates the variant types (colour, memory) and their values
  - product → moderation → after approval, the merchant fills in the stock
  - changing stock doesn't go through moderation again
- **Contract:**
  - send to FlexSoft → "Договор создаётся" → FlexSoft OK → "Договор создан"
  - if there's no answer, retry
- **Sale in the shop:** the markup comes from the saved tariff

## Admin

- **Removed:**
  - Merchant creation. The list comes from FlexSoft and is read-only.
  - Merchantlarga oʻtkazmalar
  - Editing Ustama. It's read-only from FlexSoft.
  - The tariff selector
  - The variant types (the merchant makes these)
- **New:**
  - product moderation
  - mapping roles to pages
- **Blocking a client:** also update the status in FlexSoft ("FlexSoft: заблокировать клиента")

## Open questions

- PlayMobile: does it have a phone ↔ PINFL check?
- Atmos: does it return the card's SMS phone when a card is linked?
- Do we show contract statuses in the app in Uzbek, as they are now, or rename them?
