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
- Camera views sit in a rounded dark frame with a green oval guide. QR codes are navy on white inside a bordered card, with a "waiting" line and spinner below.

### Tab bar

Four tabs, always in this order, on every main screen: **Klientlar**, **Arizalar**, **Kalkulyator**, **Profil**. The active tab is navy, the others are `ink-subtle`. Auth screens and step-by-step flows have no tab bar.
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

### List filter: `FilterChips`
- A single row of pills under the search field for filtering a list by one property, such as status. Scrolls sideways when it does not fit.
- The first chip is always "Hammasi". The selected chip is navy with white text; the rest are grey.
- One filter row per list. Tapping a chip filters immediately.

### Date range filter: `DateRangeChip`
- A chip with a `CalendarDays` icon that goes first in the `FilterChips` row, labelled "Sana".
- Opens a sheet with two `DatePicker`s, "Dan" and "Gacha", a ghost "Tozalash" and a primary "Qoʻllash". Either date may be left empty.
- Once a range is set the chip turns into the selected style and shows the dates, `01.08.2026 – 05.08.2026`.

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
- A row or grid of tiles for picking one of a few short options that should all stay visible: the term in months, the payment day.
- Each tile has a bold label and an optional small line under it ("12 oy" over the limit amount).
- The selected tile is a navy fill with white text, the same as a selected day in the calendar.
- Use it for up to about ten short options. For longer labels or longer lists use `Select`.

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
- When a list or search has no results, show `EmptyState`: an icon badge, a short title and one line on what to do next. Never leave a blank screen.

## Detail screens

A detail screen (a client, later an application) is read top to bottom, so it is built from stacked sections instead of a form.

- Top bar: back arrow and a short screen name ("Klient"). No tab bar.
- Hero: `Avatar` (photo, or initials when there is none), the full name, and one key line under it.
- Each block is a `Section` with a `text-lg font-bold` title. 28px between sections.
- Read-only facts go in an `InfoList`: label on the left in `text-sm text-ink-muted`, value on the right in `font-semibold`. Group related facts into one list; do not mix unrelated ones.
- Statuses use `StatusBadge`: red for rejected, amber for pending, green for approved, grey for closed or cancelled. The badge text is the status name, never just a color.
- Bank cards are navy tiles in a sideways-scrolling row showing the first and last four digits. The row ends with a dashed "Yangi karta" tile.
- **The screen's one primary button sits inside the section it belongs to**, in a green-tint card so it stands out (the limit card on the client screen). It is not pinned to the bottom, because the screen scrolls and the other sections have their own actions.
- Other section actions ("Kontakt kiritish") are `secondary` buttons, full width, under their list.
- Short add forms with two or three fields open in a `Sheet`, with their own primary button inside it. Longer ones are a `FormScreen`.
- An empty section says so in one muted line ("Hali kontakt kiritilmagan."). It is never hidden.

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

## Before opening a merge request

- [ ] No hex colors or one-off font sizes in the feature code
- [ ] Every control comes from `src/shared/ui`
- [ ] One primary button, pinned to the bottom
- [ ] Icons are from lucide, in the sizes above
- [ ] All strings exist in Uzbek and Russian
- [ ] Loading, error and empty states are designed
- [ ] The screen is checked in the light and dark themes
