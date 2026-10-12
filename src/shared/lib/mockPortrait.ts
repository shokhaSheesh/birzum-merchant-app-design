// Drawn stand-in portraits for mock people, so sample data needs no photos of real people.
// The real app shows the client's photo from MyID in the same place.

type Hair = 'short' | 'side' | 'long' | 'bun' | 'scarf'

export type PortraitOptions = {
  hair: Hair
  /** Hair or headscarf color. */
  hairColor: string
  skin: string
  shirt: string
  background: string
  /** Adds a moustache. */
  moustache?: boolean
}

const BEHIND_HEAD: Partial<Record<Hair, string>> = {
  long: 'M25 46c0-19 10-31 23-31s23 12 23 31v26H25Z',
  bun: 'M39 10a9 9 0 0 1 18 0v8H39ZM27 44c0-17 9-28 21-28s21 11 21 28v6H27Z',
  scarf: 'M24 46c0-19 10-32 24-32s24 13 24 32c0 14-5 25-11 31H35c-6-6-11-17-11-31Z',
}

const OVER_HEAD: Record<Hair, string> = {
  short: 'M30 40c-1-15 7-24 18-24s19 9 18 24c-3-8-8-12-18-12s-15 4-18 12Z',
  side: 'M30 41c-2-16 6-25 18-25 13 0 20 9 18 25-2-7-5-11-10-13-8 4-18 4-22 1-2 3-3 7-4 12Z',
  long: 'M30 42c0-15 7-24 18-24s18 9 18 24c-4-8-10-12-18-12s-14 4-18 12Z',
  bun: 'M30 42c0-15 7-24 18-24s18 9 18 24c-5-9-11-13-21-11-7 1-12 5-15 11Z',
  scarf: 'M29 42c0-15 8-25 19-25s19 10 19 25c-4-9-10-14-19-14s-15 5-19 14Z',
}

/** Returns an SVG data URI that can be used anywhere an image URL is expected. */
export function mockPortrait({
  hair,
  hairColor,
  skin,
  shirt,
  background,
  moustache,
}: PortraitOptions) {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">',
    `<rect width="96" height="96" fill="${background}"/>`,
    BEHIND_HEAD[hair] ? `<path d="${BEHIND_HEAD[hair]}" fill="${hairColor}"/>` : '',
    // shoulders, neck, head
    `<path d="M12 96c0-18 15-28 36-28s36 10 36 28Z" fill="${shirt}"/>`,
    `<path d="M40 56h16v12a8 8 0 0 1-16 0Z" fill="${skin}"/>`,
    '<path d="M40 60c5 3 11 3 16 0v3c-5 4-11 4-16 0Z" fill="#000" opacity=".12"/>',
    `<ellipse cx="48" cy="42" rx="17" ry="20" fill="${skin}"/>`,
    `<path d="${OVER_HEAD[hair]}" fill="${hairColor}"/>`,
    // face
    '<g fill="#22313a"><circle cx="41" cy="43" r="1.9"/><circle cx="55" cy="43" r="1.9"/></g>',
    '<path d="M42 51c3.500 3 8.500 3 12 0" fill="none" stroke="#22313a" stroke-width="1.8" stroke-linecap="round"/>',
    moustache
      ? `<path d="M41 49c3-2.500 5-2.500 7-.500 2-2 4-2 7 .500-3 1.500-5 1.500-7 .500-2 1-4 1-7-.500Z" fill="${hairColor}"/>`
      : '',
    '</svg>',
  ].join('')

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
