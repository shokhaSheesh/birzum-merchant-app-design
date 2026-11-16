# FlexSoft comments on the client BPMN, 02.11.2026

FS numbers follow FlexSoft's points. Decisions from 03.11 (Shohruz).

## Answers to FlexSoft

1. **OTP.** Через FlexSoft: регистрация, вход и смена номера телефона. Остальные SMS — на нашей стороне (вход с нового устройства, подписание договора, возврат товара).
2. **Блокировка.** Когда клиент вводит номер телефона, мы проверяем, есть ли он в базе FlexSoft. Просим возвращать в этом ответе статус блокировки: заблокированного клиента мы не пускаем в приложение (или ограничиваем функции).
3. **Адрес.** Основной — адрес из MyID. Если MyID его не вернул, отправляем адрес, введённый клиентом, как резервный. Можем отправлять оба — для этого нужно ещё одно поле в вашем API.
4. **MyID.** Согласны на синхронный процесс: результат идентификации возвращается в ответе на тот же запрос с кодом MyID. Номер телефона клиента уже подтверждён вашим OTP при регистрации (п. 1) — его передаём вместе с кодом MyID. Если под «идентификационным номером телефона» имеется в виду другое, уточните. Семейное положение и доход клиент вводит при регистрации — передаём их вам.
5. **Номер ↔ ПИНФЛ.** PlayMobile этого не делает. Проверку делает Antifraud — интегрируемся с ним отдельно.
6. **Карточка клиента.** Да, создаём её сразу после успешной идентификации через MyID.
7. **Привязка карт.** Переносим на вашу сторону. Вопрос: если номер телефона карты не совпадает с номером при регистрации, вы возвращаете ошибку?
8. **Контакты.** Принято: минимум два дополнительных контакта.
9. **Смена номера без доступа к старому.** Оставляем как в Низоме.
10. **Погашение.** Да: клиент оплачивает ежемесячный платёж или досрочно привязанной картой, автосписание тоже работает.
11. **Мурабаха.** Нет, выдача по Мурабахе в приложении не предусмотрена.

## BPMN updates (client; check merchant for the same steps)

- [x] FS1: sign-up, sign-in and phone-change OTP → «FlexSoft: OTP». New device, contract and return stay «SMS».
- [x] FS2: phone entry → «FlexSoft: поиск клиента по номеру (статус блокировки)» → «Заблокирован?» → yes: «Bu mijoz bloklangan», end.
- [x] FS3: «FlexSoft: адрес MyID; если пусто — адрес клиента».
- [x] FS4: MyID is one synchronous step; marital status and income go with the client card.
- [x] FS5: add «Antifraud: номер ↔ ПИНФЛ» after the phone check.
- [x] FS6: «FlexSoft: создать карточку клиента» right after MyID.
- [x] FS7: «Atmos: привязка карты» → «FlexSoft: привязка карты»; add the phone-mismatch branch once FlexSoft confirms the error.
- [x] FS8: the limit gate needs a card plus at least 2 contacts.
- FS9, FS10: no change.

## Design

- [ ] FS8: the contacts step requires 2 contacts (client sign-up and the merchant's new-client form).
- No change: FS4 (marital status and income are already in «Ma'lumotlaringiz»), FS2 (C19 shows the blocked screen), FS3, FS9.

## Charter, 2.3

- Atmos: card linking moves to FlexSoft. SMS row: Antifraud also checks phone ↔ PINFL.

## Microloan BPMN updates (same points; FlexSoft to confirm they apply)

- [x] FS1: sign-up, sign-in and phone-change OTP → «FlexSoft: OTP». «Parolni unutdingizmi?» stays MyID.
- [x] FS2: phone entry → «FlexSoft: поиск клиента по номеру (статус блокировки)» → blocked: end.
- [x] FS3: «FlexSoft: адрес MyID; если пусто — адрес клиента».
- [x] FS4: MyID is one synchronous step.
- [x] FS5: add «Antifraud: номер ↔ ПИНФЛ» after the phone check.
- [x] FS6: «FlexSoft: создать карточку клиента» right after MyID.
- [x] FS7: ariza card and payout card linking → «FlexSoft: привязка карты». The payout itself stays «Atmos: выплата» first (31.10); confirm with FlexSoft.
- FS8: no change, the app already asks for 2 contacts.

**Status 03.11:** client and microloan BPMN updated on Miro (FS1–FS8). FS3 not in microloan: it has no address step. Merchant BPMN not touched.
