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
| Brand navy | `navy-900` | `#0B3D57` | Primary buttons, active tab, selected date, links |
| Brand green | `green-500` | `#85C905` | Accents only (see below) |
| Green tint | `green-200` | `#E7F4CD` | Selected option, focus ring, icon badges |
| Approved | `success` | `#1E8E4A` | Approved status, passed checks |
| Pending | `warning` | `#B26A00` | Pending status |
| Rejected / error | `danger` | `#C93B3B` | Rejected status, field errors, destructive buttons |

### Navy acts, green highlights

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
- Back is a left arrow at the top left. Close is an X at the top right of a sheet.
- The screen title is left aligned under the top bar.
- The language switcher sits at the top right of the auth screens and in Profile after login.
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
| Search | `Search` |
| Add / create | `Plus` |

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
- The unit goes in `suffix` at the right edge (`soʻm`, `oy`), not inside the value or the label.
- Display amounts elsewhere with `formatSum` from `@/shared/lib/format`.

### Dropdown: `Select`
- Looks like an input with a `ChevronDown` on the right.
- Opens a bottom sheet titled with the field label. Never a native `<select>` and never a floating menu.
- Options are 52px rows. The selected one has a green-tint fill and a check mark.
- Picking an option closes the sheet. There is no separate confirm button.
- For more than about eight options, add search at the top of the sheet (not built yet).

### Calendar: `DatePicker`
- Looks like an input with a `CalendarDays` icon on the right. Empty value shows `KK.OO.YYYY`.
- Opens the same bottom sheet. This is the only calendar in the app; never use the native date input.
- Weeks start on Monday. Month and weekday names follow the selected language.
- Selected day: navy circle with white text. Today: green outline. Unavailable days: greyed out and not tappable (use `min` / `max`).
- Picking a day closes the sheet.
- Dates are shown as `DD.MM.YYYY` everywhere, through `formatDate`.

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
