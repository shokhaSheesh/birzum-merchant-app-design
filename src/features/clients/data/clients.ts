export type Client = {
  id: string
  fullName: string
  /** Nine digits after +998. */
  phone: string
  /** JSHSHIR: 14 digits. */
  pinfl: string
  /** Series and number without a space, e.g. "AB1234567". */
  passport: string
}

// Invented sample people. Replace with the API once the client fields are agreed.
export const mockClients: Client[] = [
  {
    id: '1',
    fullName: 'Dilnoza Karimova',
    phone: '901234567',
    pinfl: '41205950230018',
    passport: 'AB1234567',
  },
  {
    id: '2',
    fullName: 'Jasur Toshpoʻlatov',
    phone: '935557788',
    pinfl: '31807881450027',
    passport: 'AC4502118',
  },
  {
    id: '3',
    fullName: 'Malika Yusupova',
    phone: '977410203',
    pinfl: '42311990670035',
    passport: 'AD7781240',
  },
  {
    id: '4',
    fullName: 'Bobur Rahimov',
    phone: '998906512',
    pinfl: '30102850120043',
    passport: 'AA3310975',
  },
  {
    id: '5',
    fullName: 'Sevara Nazarova',
    phone: '911402266',
    pinfl: '41409970890051',
    passport: 'AB9054362',
  },
  {
    id: '6',
    fullName: 'Otabek Ergashev',
    phone: '946783310',
    pinfl: '32706920340069',
    passport: 'AC1187403',
  },
  {
    id: '7',
    fullName: 'Gulnora Abdullayeva',
    phone: '883015544',
    pinfl: '40503780560076',
    passport: 'AD2260819',
  },
  {
    id: '8',
    fullName: 'Sardor Qodirov',
    phone: '900098877',
    pinfl: '31910000780084',
    passport: 'AE6642051',
  },
]
