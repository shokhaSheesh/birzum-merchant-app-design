# Birzum Merchant App: Design Rules

These rules keep every screen looking and behaving like the same app. If a screen needs something the rules do not cover, add it here and to `src/shared/ui` first, then use it.

Open `/kit` in the running app to see every shared control.

## The one rule

**Never build a control inside a feature.** Buttons, inputs, dropdowns, the calendar, sheets and the tab bar live in `src/shared/ui`. A feature composes them. If two screens show the same kind of thing, they use the same component, so they cannot drift apart.

## Colors

All colors are tokens in `src/shared/styles/index.css`. No hex values in components.

| Role | Token | Value | Used for |
| --- | --- | --- | --- |
| Screen background | `canvas` | `#FFFFFF` | Every screen, sheets, the tab bar, input fill |
| Card background | `surface` | `#F2F5F6` | Cards, list groups, secondary buttons, chips |
| Divider | `line` | `#DFE6E9` | Input borders, list dividers |
| Text | `ink` | `#072A3C` | Titles and body text |
| Secondary text | `ink-muted` | `#56707F` | Labels, subtitles, descriptions |
| Placeholder text | `ink-subtle` | `#8499A4` | Placeholders, inactive tabs, decorative icons |
| Primary | `primary` / `on-primary` | `#0B3D57` / white | Fill and text of primary buttons, selected tiles, chips, dates and checkboxes |
| Brand ink | `brand` | `#0B3D57` | Navy text and icons: links, secondary button labels, the active tab |
| Card tile | `tile` / `on-tile` | `#0B3D57` / white | Bank card tiles |
| Brand green | `green-500` | `#85C905` | Accents only (see below) |
| Green tint | `green-200` | `#E7F4CD` | Selected option, focus ring, icon badges |
| Approved | `success` | `#1E8E4A` | Approved status, passed checks |
| Pending | `warning` | `#B26A00` | Pending status |
| Rejected / error | `danger` | `#C93B3B` | Rejected status, field errors, destructive buttons |

Components use the role tokens above (`bg-primary`, `text-brand`), never `navy-900` directly. That is what lets the dark theme swap them.

### Dark theme
- **Every setting in Sozlamalar is a row that opens its own screen,** showing the current value on the right: Mavzu and Til. Both screens are a list with a tick on the current option; tapping one applies it at once and goes back.

The user picks Yorugʻ, Qorongʻi or Tizim in Profile. `ThemeProvider` sets `data-theme` on `<html>` and the dark block in `index.css` gives every token a dark value. Components need no dark-specific classes.

| Role | Light | Dark |
| --- | --- | --- |
| `canvas` | `#FFFFFF` | `#0C1E28` |
| `surface` | `#F2F5F6` | `#14303D` |
| `ink` | `#072A3C` | `#EAF1F4` |
| `primary` / `on-primary` | navy / white | green `#85C905` / navy |
| `brand` | navy | pale blue-grey `#D3E4EC` |
| Green tint (`green-200`) | `#E7F4CD` | `#223F14` |

- In the dark theme the primary button is green with navy text, because navy would disappear on the dark background. The rule "one action color per theme, the same on every screen" still holds.
- Use `logo.svg` on light and `logo-on-dark.svg` (white wordmark) on dark, switched with `dark:hidden` / `hidden dark:block`.
- A QR code always stays navy on white, in both themes, so phone cameras can read it.
- Check every new screen in both themes before opening a merge request.

### Navy acts, green highlights

These three rules describe the light theme; the dark theme swaps the action color as described above.

- **Navy is the action color.** Every main button on every screen is navy with white text. "Create", "Save", "Continue" and "Log in" all look the same.
- **Green is never a button color and never text.** It is too light to read on white. Use it as a fill behind navy content: selected states, the focus ring, badges, today's date outline.
- **Status colors mean status only.** Do not use `success` green as decoration or `danger` red for emphasis.

## Typography

One family: Source Sans 3, standing in for the brandbook's Myriad. Titles are upright, never italic.

| Style | Classes | Used for |
| --- | --- | --- |
| Title | `text-2xl font-bold` | One per screen, at the top |
| Heading | `text-lg font-bold` | Sheet titles, section headings |
| Body | `text-base` | Body text, input text, button text (`font-semibold`) |
| Label | `text-sm font-medium text-ink-muted` | Field labels, helper and error text |
| Caption | `text-xs` | Tab labels, calendar weekdays, overlines |

- Input text is never smaller than 16px (`text-base`). Smaller text makes iOS zoom the page on focus.
- Numbers use tabular figures (set globally) so amounts line up in columns.

## Spacing and shape

- Screen side padding: 20px (`px-5`).
- Gap between fields: 16px. Gap between sections: 24px.
- Controls (buttons, inputs, option rows): 52px tall (`h-13`), 14px radius (`rounded-control`).
- Cards: 20px radius (`rounded-card`). Sheets: 28px top corners.
- Tap targets are at least 40px, including icon-only buttons.
- No drop shadows on cards. Separate with the `surface` fill or a `line` divider.

## Buttons

Use `Button` from `@/shared/ui/Button`. Four variants, each with one job:

| Variant | Look | Use for |
| --- | --- | --- |
| `primary` | Navy fill, white text | The main action of the screen. One per screen. |
| `secondary` | Grey fill, navy text | An alternative next to a primary action |
| `ghost` | No fill, navy text | Low-priority actions such as "Cancel" or "Skip" |
| `danger` | Red fill, white text | Destructive actions only, after a confirmation |

- Use `loading` while a request is running. It shows the spinner and blocks double taps.
- Button labels are verbs that say what happens: "Parolni saqlash", not "OK".

## Placement

- **The primary button is pinned to the bottom of the screen**, full width, 20px from the edges. It does not move between screens.
- When a secondary button sits with it, the secondary goes above the primary, both full width.
- **On list screens the create action sits at the top right, on the same line as the screen title.** It is a small navy pill (`<Button size="sm">`) with a `Plus` icon and the label "Qoʻshish". Same place, same look on every list. No floating round buttons and no full-width create bars over the list.
- The small button size exists only for this. Everything else uses the full-size button.
- Back is a left arrow at the top left. Close is an X at the top right of a sheet.
- The screen title is left aligned under the top bar.
- The language switcher sits at the top right of the auth screens and in Profile after login.

### Forms and step-by-step flows

Every form uses `FormScreen`: back arrow at the top left, scrolling body, primary button pinned to the bottom.

- A flow with more than one step shows a segmented progress bar in the top bar: green for the current and completed steps, grey for the rest.
- Each step opens with an icon badge (`IconBadge`), a title and one supporting line (`ScreenIntro`).
- One question group per step. The button label says what happens next ("Kodni olish", "Tasdiqlash", "Klientni saqlash").
- Back goes to the previous step. From the first step it leaves the flow.
- Validation runs when the button is tapped, not while typing. Errors appear under the field.
- An error about the form as a whole (total too small, over the limit, wrong login) is an `Alert`: a red-tint box with a `CircleAlert` icon.
- On a long form the `Alert` sits directly above the pinned button, so it stays on screen while the fields above are edited.
- Limits that depend on amounts are the exception to "validate on tap": going over the limit shows the `Alert` immediately, while typing, and names the limit.
- A calculated result (the installment terms) appears as a new section at the end of the form after the first tap on the button, and the screen scrolls to it. Changing any number it was based on removes it until it is calculated again.
- The last step before something is created is a review screen: read-only sections of what was entered, a ghost "Bekor qilish" above, and a primary button that names the result ("Arizani yaratish").
- Long forms are split into `Section`s with a title and a one-line hint. Repeating groups such as products are each a `surface` card with a numbered heading, a red `Trash2` button at its top right when more than one exists, and a `secondary` "add" button under the last card.
- A form that works with totals ends with a summary `InfoList` (limit, total, financed amount) just above the bottom button.
- When a step offers different ways to continue instead of a form, show them as `ActionCard`s (icon, title, one-line description, chevron) and leave out the bottom button. The MyID step does this for "on this device" and "by QR code".
- Camera views (`CameraView`) sit in a rounded dark frame with a green guide: an oval for a face, a square for a code. QR codes are navy on white inside a bordered card, with a "waiting" line and spinner below.

### Tab bar

Five tabs, always in this order, on every main screen: **Asosiy**, **Klientlar**, **Kalkulyator**, **Arizalar**, **Menyu**. Five is the maximum; anything else is reached from inside a tab. Auth screens and step-by-step flows have no tab bar.

- **Liquid glass.** The bar is a floating pill, 16px from the screen edges: translucent, blurred, with a bright rim (the `.glass` class). Content scrolls underneath it. This is the only glass surface in the app; do not use the effect on cards, sheets or buttons.
- **Kalkulyator is the middle item**, a raised round button in the primary color with the icon only. It gets a green ring while it is the current tab.
- The other four are an icon over an 11px label. The active one sits in a soft tinted capsule in the brand color; the rest are `ink-muted`.
- Every tab screen ends its scrolling area with `pb-tabbar`, so the last item can scroll clear of the bar.
- Destructive actions are never the bottom primary button without a confirmation sheet first.

## Icons

- One set only: `lucide-react`. Do not mix in other icon sets, emoji or custom SVGs.
- Sizes: 20px inside controls, 24px in the tab bar and top bar, 16px inline with small text.
- Stroke width 2. Icons take the color of the text beside them (`currentColor`).
- The same meaning always uses the same icon:

| Meaning | Icon |
| --- | --- |
| Show / hide password | `Eye` / `EyeOff` |
| Dropdown | `ChevronDown` |
| Calendar | `CalendarDays` |
| Previous / next | `ChevronLeft` / `ChevronRight` |
| Back | `ArrowLeft` |
| Close | `X` |
| Selected, passed | `Check` |
| Error | `CircleAlert` |
| Language | `Globe` |
| Home tab | `House` |
| Clients tab | `Users` |
| Applications tab | `FileText` |
| Calculator tab | `Calculator` |
| Profile tab | `UserRound` |
| Phone number | `Smartphone` |
| Passport / client details | `IdCard` |
| Face check (MyID) | `ScanFace` |
| QR code | `QrCode` |
| Bank card | `CreditCard` |
| Step completed | `CircleCheck` |
| Calculate limit | `Calculator` |
| Start a contract | `FileSignature` |
| Remove an item | `Trash2` |
| Download a document | `Download` |
| Notifications | `Bell` |
| Rejected / cancelled notice | `CircleX` / `Ban` |
| Change a value or status | `PencilLine` |
| Decrease / increase | `Minus` / `Plus` |
| Log out | `LogOut` |
| SMS code | `MessageSquareText` |
| Search | `Search` |
| Add / create | `Plus` |
| No results | `SearchX` |

## Form controls

Every control is built from the same box (`controlClass` in `src/shared/ui/control.ts`): 52px tall, white fill, 1.5px `line` border, 14px radius. The label sits above it; a hint or error sits below.

States are the same for all of them:

| State | Look |
| --- | --- |
| Default | `line` border |
| Focused | Navy border with a green-tint ring |
| Error | `danger` border and a red message below. The message says what to fix. |
| Disabled | 45% opacity |

Placeholders are never used as labels. Every field has a visible label.

### Text input: `TextField`
Plain text. Pass `autoComplete` and, for logins and codes, `autoCapitalize="none"`.

### Password input: `PasswordField`
Always has the show/hide eye button on the right. Never build a password field without it.

### Number input: `NumberField`
- For amounts and counts. Whole numbers only.
- Groups digits in thousands with spaces as the user types: `12 480 000`.
- Opens the numeric keypad (`inputMode="numeric"`). Do not use `type="number"`, which adds browser spinners and breaks grouping.
- The unit goes in `suffix` at the right edge (`UZS`, `oy`), not inside the value or the label.
- Money is always labelled `UZS`, in both languages. Never "soʻm" or "сум".
- Display amounts elsewhere with `formatSum` from `@/shared/lib/format`.

### Search: `SearchField`
- The same control box with a `Search` icon on the left and a clear `X` on the right once there is text.
- Sits directly under the screen title and stays in place while the list scrolls.
- The placeholder lists what can be searched ("Telefon, JSHSHIR yoki pasport"). It filters as the user types; there is no search button.
- Spaces, `+` and letter case in the query are ignored, so `90 123` and `90123` find the same thing.

### View tabs: `SegmentedTabs`
- Two or three equal segments in a grey track, directly under the top bar. The selected segment is white (the canvas color) with dark text.
- Tabs switch between different content on the same screen ("Arizalar" and "Yangiliklar" in notifications). To narrow one list, use `FilterChips` instead.
- Each tab has its own empty state.

### List filter: `FilterChips`
- A single row of pills under the search field for filtering a list by one property, such as status. Scrolls sideways when it does not fit.
- The first chip is always "Hammasi". The selected chip is navy with white text; the rest are grey.
- One filter row per list. Tapping a chip filters immediately.

### Date range filter: `DateRangeChip`
- A chip with a `CalendarDays` icon that goes first in the `FilterChips` row, labelled "Sana".
- Opens a sheet with two `DatePicker`s, "Dan" and "Gacha", a ghost "Tozalash" and a primary "Qoʻllash". Either date may be left empty.
- Once a range is set the chip turns into the selected style and shows the dates, `01.08.2026 – 05.08.2026`.

### Pick-one filter chip: `SelectChip`
A chip with an icon and a small chevron that opens the option sheet with an "all" option first. It turns navy while something is chosen. `LocationChip` (filial) and the shop chip in Toʻlovlar tarixi are built on it.

### Filial filter: `LocationChip`
A chip with a pin icon and a small chevron, first in the chip row on Arizalar and above the period picker on Asosiy. It opens the option sheet with "Barcha filiallar" and the seller's filials, and turns navy while one is chosen. It is hidden for a seller with a single filial.

### Phone input: `PhoneField`
- `+998` is fixed at the left and cannot be edited. The user types the nine remaining digits.
- Digits are grouped as `90 123 45 67` while typing. Show a full number elsewhere with `formatPhone`.
- Opens the numeric keypad.

### Passport input: `PassportField`
- Two letters, then seven digits, shown as `AB 1234567`. Letters are uppercased automatically and anything else is ignored.
- Used wherever a passport or ID card series and number is asked for.

### Bank card: `CardNumberField` and `CardExpiryField`
- Card number: 16 digits shown in groups of four, `8600 1234 5678 9012`.
- Expiry: `OO/YY`, with the slash added automatically. A month outside 01 to 12 or a past date is an error.
- Both open the numeric keypad and support the browser's saved-card autofill.

### Code input: `OtpField`
- Six boxes, one digit each, 56px tall. Used for every SMS or confirmation code.
- Supports paste and SMS autofill. The code is checked as soon as the last digit is entered; the bottom button stays as a fallback.
- A wrong code clears the boxes, turns them red and shows the error below.
- Under it: a countdown ("Qayta yuborish: 0:59"), replaced by a ghost "Kodni qayta yuborish" button when it reaches zero.
- Do not assemble this by hand. Every code step is the `OtpScreen` component, so login, client phone and card confirmation look and behave the same.

### Checkbox: `Checkbox`
- 24px box. Checked is a navy fill with a white check mark.
- The label sits to the right, with an optional one-line description under it. The whole row is tappable.
- Use for independent yes/no options inside a form. For picking one of several, use `Select`.

### Choice grid: `ChoiceGrid`
- A few short options that all stay visible: payment day, theme, how goods are received.
- **The chosen option is light:** a navy border on pale green (`bg-green-200`) with dark text. The others have a grey border and muted text. Never a solid navy block; solid navy is for buttons.
- An option may carry an icon above its label (pickup and delivery do) and a small description under it.
- Errors and hints sit under the grid like any field.

### Quantity: `QuantityField`
- The control box with a minus on the left, the number in the middle and a plus on the right. The number can also be typed.
- For small counts such as product quantity. Minimum 1. For amounts of money use `NumberField`.

### Dropdown: `Select`
- Looks like an input with a `ChevronDown` on the right.
- Opens a bottom sheet titled with the field label. Never a native `<select>` and never a floating menu.
- Options are 52px rows. The selected one has a green-tint fill and a check mark.
- Picking an option closes the sheet. There is no separate confirm button.
- For more than about eight options, add search at the top of the sheet (not built yet).

### Calendar: `DatePicker`
- A date can be typed or picked. Typing fills the `KK.OO.YYYY` mask and adds the dots automatically.
- The navy `CalendarDays` icon on the right opens the calendar in the same bottom sheet. Tapping the field itself only focuses it for typing.
- A typed date that does not exist or is outside the allowed range shows "Sanani toʻgʻri kiriting" under the field.
- This is the only calendar in the app; never use the native date input.
- Weeks start on Monday. Month and weekday names follow the selected language.
- Selected day: navy circle with white text. Today: green outline. Unavailable days: greyed out and not tappable (use `min` / `max`).
- Picking a day closes the sheet.
- Tapping the month and year at the top switches to a year grid, then a month grid, then back to days. This is how distant dates such as a birth date are reached; nobody should tap the arrow hundreds of times.
- Dates are shown as `DD.MM.YYYY` everywhere, through `formatDate`.

## Lists and empty states

- A list is a group of rows inside one `surface` card, separated by `line` dividers. Rows are at least 64px tall.
- Row layout: initials avatar on the left, name in `font-semibold`, details under it in `text-sm text-ink-muted`.
- Above the list, a small count line ("8 ta klient") in `text-sm text-ink-muted`.
- A row that opens a detail screen ends with a `ChevronRight`; the whole row is the tap target.
- The same kind of item uses the same row everywhere. An application looks identical in the Arizalar tab and on a client's screen (`ApplicationRow`), apart from the client name line.
- When a list, search or tab has nothing to show, use `EmptyState`: the illustration, a short title and one line on what happens next. Never leave a blank screen.
- **There is one empty-state picture for the whole app**, `EmptyIllustration`: a blank card on a soft green ground. It shows no particular object, so it fits clients, applications, notifications and search alike. Do not draw a different picture per screen and do not swap it for an icon.
- The illustration is drawn with theme tokens, so it follows the light and dark themes. Only the title and hint change from screen to screen.
- A small empty block inside a detail screen (no contacts, no contract) stays a single muted line; the illustration is for a whole empty list or view.

## Detail screens

A detail screen (a client, later an application) is read top to bottom, so it is built from stacked sections instead of a form.

- Top bar: back arrow and a short screen name ("Klient"). No tab bar.
- Hero: `Avatar` (photo, or initials when there is none), the full name, and one key line under it.
- People are always shown with `Avatar`, a circle, in lists and on detail screens. A person without a photo gets their initials on a grey circle; never a drawn or cartoon face. Sample photos live in `src/shared/assets/people`, cropped square around the face.
- Each block is a `Section` with a `text-lg font-bold` title. 28px between sections.
- Read-only facts go in an `InfoList`: label on the left in `text-sm text-ink-muted`, value on the right in `font-semibold`. Group related facts into one list; do not mix unrelated ones.
- Statuses use `StatusBadge`: red for rejected, amber for pending, green for approved, grey for closed or cancelled. The badge text is the status name, never just a color.
- Bank cards are navy tiles in a sideways-scrolling row showing the first and last four digits. The row ends with a dashed "Yangi karta" tile.
- **The screen's one primary button sits inside the section it belongs to**, in a green-tint card so it stands out (the limit card on the client screen). It is not pinned to the bottom, because the screen scrolls and the other sections have their own actions.
- Other section actions ("Kontakt kiritish") are `secondary` buttons, full width, under their list.
- Short add forms with two or three fields open in a `Sheet`, with their own primary button inside it. Longer ones are a `FormScreen`.
- An empty section says so in one muted line ("Hali kontakt kiritilmagan."). It is never hidden.
- A link to another screen from a settings-like page (Profile to notifications) is an `ActionCard`, with the count or state as its description.
- Notification rows: a tinted round icon for the kind of event, a bold title, one line of detail, the date and time in small text, and a green dot on the right while unread.

## Menyu and management screens

Menyu is the merchant's last tab. It holds the signed-in user, then everything that is managed rather than done daily.

- Two groups of rows (`MenuList` / `MenuRow`: icon, label, chevron): **Katalog** with Mahsulotlar and Ombor, and **Doʻkon** with Filiallar, Xodimlar, Rollar va ruxsatlar. Settings follow below them.
- **A row only shows if the user's role allows it** (`usePermissions().can(...)`). A group with no visible rows is hidden.
- Every management list uses `ListScreen`: back arrow, title, the small "Qoʻshish" button at the top right, then rows in one `surface` card. A row (`ListRow`) is a title, up to two muted lines, and a chevron; it opens the record's form.
- **Switching off and deleting are different things.** A form has a checkbox to switch a record off ("Filial ishlayapti", "Hisob faol", "Klient ilovasida koʻrsatish"); a switched-off record shows a grey badge in its list.
- **Filiallar, Xodimlar and Rollar can also be deleted.** The edit form ends with a quiet red "Oʻchirish" (`DeleteRecord`), which opens a `ConfirmSheet`: a ghost "Bekor qilish" above a red "Oʻchirish". No delete happens without that sheet. Products are hidden, never deleted.
- When a record cannot be deleted, the button is replaced by an `Alert` saying why: a role that staff still hold, or your own account.
- One form serves create and edit; its title changes ("Yangi filial" / "Filial"). The button is always "Saqlash".
- Picking several of something (a staff member's shops, a role's permissions) is a list of `Checkbox`es, with a red line under it if none is chosen.
- **Categories and brands are never created here.** They come from the Birzum admin panel, so in the product form they are `Select`s.

### Text in two languages
Only what shoppers read and what really differs by language is stored once per language (`LocalizedText`): product photos, names and descriptions, characteristic names and values, variant types and their values, a shop's name and address. Text is shown with `tl()`, which falls back to the other language if one is empty; photos fall back the same way.

- There is no form-wide language switch. Each two-language field carries its own small `LangToggle` (UZ / RU) at the right of its label; use `LocalizedTextField`. Switching it does not lose the other language.
- A group of rows that belong together (photos, characteristics, a variant type's values) has one toggle at the right of the section title instead of one per row.
- Everything else is entered once and has no toggle: price, working hours, phone, and anything picked from a list (category, brand, variant types). Lists already come in both languages from the backend.
- Names must be filled in both languages. After a failed save the field shows "Ikkala tilda ham kiriting" and a red dot on the language that is still empty. Optional text (description, characteristics) is copied from the other language when left empty.

### Variant types (the directory)
- Menyu → Katalog → Variant turlari lists what products can vary by (Rang, Xotira, …), each with its values. A type marked "Rang sifatida koʻrsatish" gives each value a color swatch.
- Types and values are created here, in both languages, and reused on every product. A product never has free-typed variant names.
- From the product form a missing value can be added on the spot ("Yangi qiymat" opens a sheet with one two-language name field); a whole new type is created in the directory.

### Product form
- Top to bottom: photos, name, description, category, brand, price, variants, combinations, characteristics, visibility.
- **Photos** (`PhotoTiles`) are 96px square tiles in a wrapping row, each with a small remove button; the last tile is a dashed "Rasm qoʻshish". The first photo is the cover.
- **Rang rasmlari** appears once a color type is chosen: one card per color with its own, smaller row of photo tiles. While a shopper has that color chosen, its photos replace the product's.
- **Variantlar:** one `surface` card per variant type: a `Select` of the type, then its values as outline chips that are ticked on and off (navy border when on, with the swatch for colors).
- **Kombinatsiyalar** appears once values are chosen and lists every combination of them. The merchant ticks the ones that are actually sold; a ticked row opens a price field, pre-filled with the product's price. The title counts them ("4 / 6") and "Hammasini tanlash" ticks all. With two or more types the rows are grouped under the first type's values, each group with its own count.
- A combination that is not ticked does not exist: it has no price, no stock row in Ombor, and in the client app that choice is faded and struck through.
- **Characteristics** are rows of two fields, name and value, each with a remove button.
- Stock is not in the product form. It is entered in Ombor.

### Ombor
- Shops across the top as `FilterChips`; the list below is that shop's stock.
- One card per product, with one row per combination that is sold ("Qora · 128 GB") and a compact `QuantityStepper`. A product without variations has a single "Qoldiq" row.
- Changes save as they are made; there is no save button.

### Arizalar: from order to payments
- Statuses in order: **Tasdiqlash kutilmoqda** (amber, a shopper's order) → **Rasmiylashtirilmoqda** (blue-grey) → **Topshirilgan** (green) → **Nasiya yopilgan** (grey). **Rad etilgan** is red and **Bekor qilingan** grey.
- The ariza screen's bottom button is the next step: "Rad etish" and "Tasdiqlash" while waiting, then "Mahsulot topshirildi". After that there is none.
- Stock goes down when an ariza is confirmed, whether a shopper sent it or the merchant filed it.
- **Toʻlov jadvali** appears from Topshirilgan on: a red `Alert` with the overdue amount if there is one, a progress bar with "4 / 12 toʻlangan" and the remaining sum, then every payment with its date, amount and a badge: green "Toʻlangan", grey "Kutilmoqda", red "Muddati oʻtgan".
- **In "Yangi shartnoma" products are picked, never typed:** a `Select` of the merchant's products, a second `Select` of that product's sold combinations, then quantity. The price comes from the catalogue, and the row shows how many are in stock or, in red, that there are not enough.
- **Filial.** Every ariza belongs to one filial. A seller with several picks it at the top of "Yangi shartnoma"; stock is checked and taken in that filial. The detail screen shows it as a "Filial" row.
- **Starting an ariza.** From a client's limit card, or from "+ Qoʻshish" on Arizalar, which first asks which client (a sheet with search; a client without a limit is opened to calculate it).
- **"Yangi shartnoma" top to bottom:** Qabul qilish usuli and Filial first, then the products, then Toʻlov sozlamalari (card, down payment, payment day).
- **A product card stays compact:** the two selects, then one row with the line sum and stock on the left and a small quantity stepper on the right, then the term strip with that term's limit under it. No separate quantity field or total row.
- A `TermPicker` inside a grey card takes `inset`, which draws its strip a shade darker so it does not disappear into the card.
- **Terms are per product** in "Yangi shartnoma" too: each product card has its own `TermPicker` and shows that term's limit. An ariza has one term, so products with different terms become separate arizalar; the review step says so and shows one block per term. The down payment is shared out by each block's part of the total.
- **Cancelling asks why** (`CancelSheet`), for the merchant and the shopper alike. A cancelled ariza shows `CancelNote` under its status: who cancelled and their comment.
- **Tarix** is the last tab of the merchant's ariza (`HistoryList`): every status change, newest first, with the date and time, who made it (seller by name, client, or system) and their comment.
- **Status steps.** "Holatni oʻzgartirish" lists only the next steps (`NEXT_STATUSES`): pending → Rasmiylashtirilmoqda or Rad etilgan; Rasmiylashtirilmoqda → Topshirilgan, Rad etilgan or Bekor qilingan; Topshirilgan → Nasiya yopilgan. Final statuses have no button.
- **Rejecting always asks why** (`RejectSheet`): a reason from the list and a comment, required for "Boshqa sabab". The reason is shown with `RejectionNote`, a red card under the status, in the merchant's ariza and in the shopper's Xaridlar.
- **Product lines** (`ProductsSummary`) start with the product picture, 56px.
- **Receiving and card** (`FulfilmentFields`): a two-option `ChoiceGrid` "Doʻkondan olib ketish / Yetkazib berish", an address field only for delivery, and a `Select` of the client's cards. The same block is in the merchant's "Yangi shartnoma" and the shopper's Savat. An ariza shows them as rows in "Toʻlov sozlamalari" (`FulfilmentRows`); the shopper's Xaridlar shows the method and address as one line.

### Sharhlar
- Each review has a small red trash button at its bottom right. It opens `ConfirmSheet`; a deleted review leaves the client app and the rating.
- The average in large type with five stars and the number of reviews, then each review: avatar, name, stars, date, the text, and the product it is about.
- Stars are amber when filled and grey when empty, the same as `StoreRating` in the client app.

## Two apps, one system

The repo holds the merchant app and the client (shopper) app. They share every token, control and rule in this file; nothing is restyled for one of them.

- The client app lives under `/customer`. Each app has its own tab bar set in `src/app/tabs.ts`; the bar itself is the same component.
- Client tabs: **Asosiy**, **Doʻkonlar**, **Savat** (the round middle button, with a green count badge when it holds items), **Xaridlar**, **Profil**.
- **One record, two views.** What a shopper sends from the cart is an ariza, the same record the merchant works with. There is no separate "order". It arrives in the merchant's Arizalar with the amber status "Tasdiqlash kutilmoqda"; the merchant's ariza screen then ends with a ghost "Rad etish" above the primary "Tasdiqlash". The shopper sees the same ariza and status in Xaridlar.
- The merchant's Asosiy shows a "Yangi arizalar" `ActionCard` only while some are waiting; it opens Arizalar already filtered to that status.
- **Client Asosiy, top to bottom:** greeting with three round buttons (search, Sevimlilar, notifications), the limit card, four category tiles, the product grid. Categories and products each have a "Hammasi" link.
- **Search never shows products itself.** Empty, it lists the categories, one per row with a picture (`CategoryList`). While typing it shows text suggestions: matching brands and categories (labelled as such on the right), then product names. Picking one, or pressing Enter, opens the product listing.
- **The product listing is one screen** reached from a category, a suggestion or "Hammasi". Its title says what is listed. Under it: the count on the left and a "Filtr" pill on the right, which opens a sheet with Kategoriya, Brend and the price. Price is two number fields ("Dan", "Gacha") over a `RangeSlider` with two handles; the fields and handles stay in sync. The sheet's primary button says how many products the current choice would show ("5 ta mahsulotni koʻrsatish") and is disabled at zero; "Tozalash" sits above it. With filters on, the pill turns navy and shows how many are set.
- A product is always a `ProductCard` in a two-column grid: square picture on a tinted tile, name (two lines at most), price, and a green-tint pill with the lowest monthly payment ("oyiga … dan").
- **Product screen, top to bottom:** picture, stock badge, name and price; the variations, color first; Nasiya shartlari; the seller card with its rating; description; characteristics in an `InfoList`; similar products in a sideways row. Like, then share, sit at the top right.
- **A value that is not sold with the other current choices is faded** (and struck through if it is text). Tapping it still works: the screen moves to a combination that has it.
- **Variations are light, not filled** (`VariationPicker`). A color is a 64px picture of the product in that color; any other option is a small text pill. The chosen one is marked by a navy border only, and its name is repeated beside the group label ("Rang: Koʻk"). The main picture follows the chosen color.
- **The term is always a `TermPicker`, in both apps:** one grey strip of numbers where only the chosen one turns white and spells out "oy" ("18 oy"). Where the limit depends on the term, one muted line under it gives the limit for the chosen term.
- **The client never sees "Ustama".** `InstallmentTermsCard` is used with `showMarkup={false}`: monthly payment, term and the total only.
- **Liking.** `LikeButton` is a heart: an outline in navy, filled red once liked. It sits on the top right corner of every `ProductCard` picture and in the product screen's top bar. Liked products are listed in Sevimlilar.
- **Shop rating** (`StoreRating`): an amber star, the score to one decimal and the number of reviews, wherever a shop is named.
- **Several photos** become a sideways-swiped gallery with dots under it (`ProductGallery`); one photo, or none, shows a single picture.
- **Its bottom bar changes once the product is in the cart:** "Savatga qoʻshish" becomes a `QuantityStepper` on the left and "Savatga oʻtish" on the right. Stepping down to zero removes it and brings the first button back. The same product with different options is a separate cart line.
- An out-of-stock product has a red "Tugagan" badge and a disabled button. Quantity can never exceed the stock.
- The cart is also the checkout: product rows with the chosen options, a red `Trash2`, and the price with a compact `QuantityStepper` (`size="sm"`) on the same line; the `TermPicker`; the `InstallmentTermsCard`; one line with the limit for that term; then the button. Going over the limit shows the `Alert` above the button and disables it.
- Without a limit the shopper can browse but not add to the cart; the product screen says so in an `Alert`.
- Every camera screen uses `CameraView`: an oval guide and the front camera for a face, a square guide and the back camera for a QR code.

### Client app: consent, PIN and the first run
- **Agreeing to documents** (`LegalConsent`): a checkbox above the main button whose sentence names the documents as underlined links. A link opens the document in a sheet (title, edition date, short sections, "Tushunarli") and does not tick the box. Pressing the button unticked shows "Davom etish uchun rozilik bering" in red under it.
  - Sign-in: Foydalanish shartlari and Maxfiylik siyosati. It also guards the QR route.
  - Checkout: Ommaviy oferta and Maxfiylik siyosati, above "Buyurtma berish".
- **First sign-in:** phone and code (or sign-up) → "PIN-kod oʻrnating" → "PIN-kodni takrorlang" → "Face ID bilan kirasizmi?" (enable, or "Hozir emas") → the intro slides → Asosiy.
- **Every later start** opens the lock screen, modelled on Payme: a sign-out icon at the top left ("Boshqa hisobga kirish") and "PIN-kodni unutdingizmi?" at the top right, then the logo, "PIN-kodni kiriting", four filled dots and the number pad (`PinPad`): 80px round keys with a thin outline, the Face ID key bare at the bottom left (only when Face ID is on) and delete bare at the bottom right. With Face ID on, the system prompt opens by itself.
- The real app shows the phone's own prompt and its own name for it (Face ID, Touch ID, fingerprint); the design uses "Face ID" and a face icon.
- **Profil → Xavfsizlik** is its own screen: a menu card with "PIN-kodni oʻzgartirish" and a "Face ID bilan kirish" switch (`SwitchRow`). Changing the PIN asks for the current one first, then the new one twice. The pad has no Face ID key there: a PIN is being chosen, not checked. Signing out forgets the PIN and Face ID.
- **Switch vs checkbox:** a setting that takes effect at once is a `SwitchRow` in a menu card; a choice that is saved with a form is a `Checkbox`.
- **Intro slides** (`OnboardingPage`), shown once after the first sign-in: three full screens, each a large picture in the empty-state style, a title and two lines. Swipe or "Keyingi"; "Oʻtkazib yuborish" at the top right; the last button is "Boshlash". Limit → shopping → paying.

### Client app: from cart to payments
- **Limit on Asosiy** (`LimitTile`): a soft green wash (pale green to light green, deep green in the dark theme) with one faint round shape low on the right, never over the term strip. The six terms sit in a white strip on top, the chosen one solid green and spelled "12 oy"; that term's limit is in large navy type below. Before a limit exists the tile is the pale green "Limitni olish" card. The limit is not a navy tile: navy is kept for buttons.
- **Product page stock.** The badge above the name is the total for the chosen variant. When the shop has several filials, a "Filiallarda mavjudligi" section after Sotuvchi lists each filial with its address and a badge: green "8 dona" or grey "Tugagan".
- **Shop page** (`StorePage`), top to bottom: a navy shop tile with name and rating; Filiallar (name, address, hours, then two small pills: "Xaritada koʻrish", which opens the address in a map, and the phone number, which calls it); Mahsulotlar with the count, the first four products and a "Hammasi" link to the listing filtered by that shop. Reviews are not listed here.
- **Product listing filter** has four parts: Kategoriya, Brend, Doʻkon, Narx.
- **Toʻlov kartalari** (shopper): one navy row per card with a trash button, ending in a dashed tile with "+ Yangi karta", the same add tile as the merchant's card row.
- **Toʻlovlar tarixi** opens from Profil: a chip row with the date range and "Barcha doʻkonlar" (`SelectChip`), the total paid, then one row per payment (date, shop and ariza number, card, amount), newest first. A row opens its purchase.
- **Savat only reviews the products:** grouped by shop, each with its picture, variant, quantity stepper, remove button and a small "oyiga 301 000 dan" (the lowest monthly payment, at 24 months). Under them, "Oʻxshash mahsulotlar" as a sideways row.
- **On a tab screen the main action is a bar fixed above the tab bar** (Savat, Kalkulyator): `sticky bottom-0` with a top border and `pb-tabbar`, so content scrolls under it.
- **The cart's total and "Rasmiylashtirishga oʻtish" are a bar fixed above the tab bar,** with a top border; the list scrolls under it. A screen's main action never scrolls away.
- **Rasmiylashtirish** (`CheckoutPage`, a pushed screen without the tab bar). Per shop, in this order: "Qabul qilish usuli" first (`FulfilmentFields`: pickup with an "Olib ketish filiali" select when the shop has several filials, or delivery with an address), then each product as a card with its picture, monthly payment and its own `TermPicker`. If the chosen filial does not have enough of a product, a red `Alert` names it and "Buyurtma berish" is disabled.
- Below the shops: the paying card (`CardSelect`), then "Nasiya shartlari" as an `InfoList` (goods total, installment total, first monthly payment) and how much of the limit is used. "Buyurtma berish" sits in the footer.
- **Terms are per product.** An ariza has one term, so sending files one ariza per shop and term. Mixed terms are checked against the limit as shares: each product's sum divided by the limit of its term, added up, must not pass 100%.
- **The shopper reads statuses in their own words** (`customerStatus`), the merchant keeps the shop's: Tasdiqlash kutilmoqda → **Koʻrib chiqilmoqda** (amber), Rasmiylashtirilmoqda → **Tasdiqlandi** (blue-grey), Topshirilgan → **Faol** (green), or **Muddati oʻtgan** (red) while a payment is late, Nasiya yopilgan → **Yopilgan** (grey), Rad etilgan → **Rad etildi** (red), Bekor qilingan → **Bekor qilindi** (grey). Badges and filter chips in the client app use these.
- **Xaridlar** has the same chip row as the merchant's Arizalar (date range, then statuses) and lists the shopper's arizalar as cards with the shop name; each opens the purchase screen. A rejected card shows only the red badge; the reason is on the purchase screen.
- **Purchase screen** (`PurchasePage`): status badge and number, the reject reason if any, an `InfoList` with date, shop, receiving method, card and pickup filial, then products and Nasiya shartlari (no Ustama).
- Its bottom button depends on the status: a red ghost "Buyurtmani bekor qilish" while the merchant has not answered (confirmation with "Yoʻq, qoldirish"); "Toʻlash: 483 000 UZS" from Topshirilgan on, which opens a sheet with the due date, amount and card. Paying the last installment closes the nasiya.
- From Topshirilgan on the screen also has secondary "Shartnomani yuklab olish" and "Sharh qoldirish" (five tappable stars and a text). A sent review shows in the merchant's Sharhlar; the button then becomes "Sharhingiz uchun rahmat!".
- **Profil**: photo, name and phone; Shaxsiy maʼlumotlar; a menu card with Toʻlov kartalari and Toʻlovlar tarixi, each its own screen; Sozlamalar (language, theme); back to the merchant app; sign out.
- **Card scheme logos** (`CardLogo`): Humo and Uzcard logos on a small white plate (48 × 32), so they read on navy tiles and in the dark theme. Uzcard uses only its "U" mark; its wordmark is unreadable at this size. The scheme comes from the first four digits. Text places (selects, rows, the PDF) keep the written name, "Humo •••• 1671".
- **Cards** (`PaymentCards`, both apps): a small × on each card removes it after a confirmation. The last remaining card has no ×.

## Home screen

Asosiy reports on one period: a day, a week or a month. It only shows numbers and never holds a form.

- Top row: the user's `Avatar`, a greeting with the store and branch, and a round bell button on the right with a green dot while there are unread notifications.
- `PeriodPicker` comes next. Everything below it describes the chosen period.
- One headline figure in plain large text (not on a colored tile), with a single muted line of counts under it.
- One chart in a `surface` card, then the status breakdown as a list of `StatusBadge`s with their counts.
- A period with no arizalar shows `EmptyState` in place of the chart and breakdown.

### Period picker: `PeriodPicker`
- `SegmentedTabs` for Kun, Hafta, Oy. Switching the kind keeps the same date in view.
- Under it, a row of three grey pills: a back arrow, the period label with a `CalendarDays` icon, and a forward arrow.
- The label reads `Bugun, 12.10.2026` for today, `12.10 – 18.10.2026` for a week (Monday to Sunday) and `Oktabr 2026` for a month.
- Tapping the label opens the calendar sheet: pick a day, pick any day to get its week (the whole week is marked), or pick a month from the month grid.
- The forward arrow is disabled on the current period, and future dates cannot be picked.

### Charts: `BarChart`
- One series only, as vertical bars in the primary color, rounded at the top and square on the baseline. Up to three faint gridlines; no axis lines.
- Only the tallest bar carries its number. Hovering, focusing or tapping a bar turns it green and writes its value and name on the line under the chart.
- A day is drawn in two-hour blocks, a week as seven days, a month as one bar per date with every fifth date labelled.
- Do not add a second series, a second axis or a legend. A different measure gets its own chart.

## Logo

- Use `src/shared/assets/logo.svg` (mark and wordmark) or `logo-mark.svg` (mark only). Never a PNG or a screenshot.
- Do not recolor, stretch or add effects to it. Place it on white.

## Sheets

`Sheet` is the only overlay. Dropdowns, the calendar, the language picker and confirmations all use it.

- Slides up from the bottom over a dimmed navy backdrop.
- Has a grab handle, a title on the left and an X on the right.
- Closes on backdrop tap, the X and Escape.
- No centered modal dialogs and no popovers.

## Language and copy

- Languages: Uzbek (Latin) and Russian. Every user-facing string goes through `t()` from `useI18n`; add the key to both languages in `src/shared/i18n/dictionaries.ts`.
- Uzbek uses the proper `ʻ` character (oʻ, gʻ), not an apostrophe.
- Sentence case everywhere. No all-caps buttons.
- Errors say what is wrong and how to fix it.

## How "selected" looks
Three kinds of control, three looks. Pick by what the control does, not by taste.
- **A filter that is on** (status chips, a set date range, a chosen filial or shop, an active "Filtr"): solid navy. It changes what the list shows and often scrolls sideways, so it must be seen at a glance.
- **A view switch** (`SegmentedTabs`, `TermPicker`, `LangToggle`): a white pill on a grey strip. Nothing is filtered away; the same thing is shown another way.
- **A form choice** (`ChoiceGrid`, the option sheet): a navy border on pale green.

## Long detail screens use tabs
A detail screen with more than about four sections is split with `SegmentedTabs` right under its header, so nothing important sits three screens down.
- Merchant ariza and shopper purchase: Maʼlumot · Mahsulotlar · Toʻlovlar (the last only once payments run).
- Merchant client: Maʼlumot · Karta va kontakt · Arizalar.
The status, title and reject reason stay above the tabs, and the footer button stays on every tab.

## Product photos
- Photos are square, 800px, with the product centered on its plain backdrop and a little margin. Sample ones live in `src/shared/assets/products`.
- `ProductPicture` draws a photo on a grey tile with `mix-blend-multiply`, so a white backdrop takes the tile's colour and every card keeps the same shape. In the dark theme the photo is shown as it is.
- A product without a photo falls back to the drawn stand-in for its category.
- **Several photos are always swipeable** (`PhotoSwiper`): on product cards and on the product page. It shows dots at the bottom of the picture and small round arrows at the sides for a mouse; an arrow never opens the card's link. One photo shows neither.
- The swipe order is the chosen colour's photos first, then the product's other photos (`galleryOf`).
- **Tapping a photo on the product page opens it full screen** (`PhotoViewer`): a dark screen with a counter and a close button on top, the photo in the middle, and the other photos as 64px thumbnails at the bottom, the current one with a green border. Tapping outside the photo or pressing close returns to the product.

## Category pictures
A category is shown with a photo, on the home tiles and in the category list. The photo follows the product photo rules: one typical product of the category, alone, on a plain white or transparent backdrop, square, at least 600px, no text or logo, filling about 70% of the frame. For now they borrow sample product photos (`categoryImages`); the admin panel will upload one per category.

## Shops
A shop is always shown with `StoreLogo`, a navy rounded square with the shop icon, at 44px in rows and 64px on the shop page. Its rating (`StoreRating`) is the average of its reviews with their count; a shop without reviews says "Hali sharh yoʻq".

## Loading, errors and confirmations
Open `/states` (Menyu → Dizayn → Holatlar namunasi) to see every one of these as a full screen.
- **Loading** is a skeleton in the shape of what is coming, never a spinner in the middle of the screen: `SkeletonRows` for a list card, `SkeletonGrid` for product cards, `SkeletonCards` for stacked cards, `SkeletonDetail` for a detail screen. Headers, search and filters stay real while the list loads. Buttons show their own spinner (`loading`).
- **Errors that replace a screen** use `ErrorState`: a picture, a title, one sentence, one button. The picture (`ErrorIllustration`) is the empty-state picture's sibling: the same green ground and tilted card, with the problem drawn on the card in navy lines and one red detail. Never a bare icon. Five kinds: no internet and server error ("Qayta urinish"), session expired ("Qayta kirish"), page not found ("Asosiyga qaytish"), no permission ("Orqaga"). An unknown address shows the not-found one.
- **Errors inside a form** stay where they are: under the field, or an `Alert` above the button.
- **Confirmations** are a toast (`toast()` from `shared/lib/toast`): a dark pill at the top with a green check, gone after about two seconds. "Saqlandi" after a save, "Oʻchirildi" after a delete, "Yuborildi" after a review. A failed save is the same pill in red. A toast never asks a question; that is a sheet.

## Who is reading
Shared pieces that speak about the client must know which app they are in. In the merchant app the client is "klient"; in the client app the same text says "siz" and "sizning": the card form ("Klient kartasi" becomes "Karta qoʻshish"), reject reasons, and who cancelled. These components take an `own` flag for the client app.

## One primary button per screen
A screen has at most one solid navy button: its main action, in the footer. Everything else on the page (download a contract, leave a review, change status, add a row) is `secondary`.

## Before opening a merge request

- [ ] No hex colors or one-off font sizes in the feature code
- [ ] Every control comes from `src/shared/ui`
- [ ] One primary button, pinned to the bottom
- [ ] Icons are from lucide, in the sizes above
- [ ] All strings exist in Uzbek and Russian
- [ ] Loading, error and empty states are designed
- [ ] The screen is checked in the light and dark themes
