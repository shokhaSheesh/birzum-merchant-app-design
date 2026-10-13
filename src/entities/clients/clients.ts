import user1Photo from '@/shared/assets/people/user-1.jpg'
import user2Photo from '@/shared/assets/people/user-2.jpg'
import user3Photo from '@/shared/assets/people/user-3.jpg'

export const MARITAL_STATUSES = ['single', 'married', 'divorced', 'widowed'] as const
export type MaritalStatus = (typeof MARITAL_STATUSES)[number]

export type IncomeSource = 'salary' | 'business' | 'pension' | 'other'
/** `pending` is an application a shopper sent from the client app, waiting for the merchant. */
export type ApplicationStatus =
  'pending' | 'processing' | 'handed' | 'rejected' | 'closed' | 'cancelled'

export const TERMS = [3, 6, 9, 12, 18, 24] as const
/** Installment length in months. */
export type Term = (typeof TERMS)[number]

export const RELATIONS = ['spouse', 'parent', 'child', 'brother', 'sister', 'relative'] as const
export type Relation = (typeof RELATIONS)[number]

export type PaymentCard = {
  id: string
  first4: string
  last4: string
}

export type Contact = {
  id: string
  /** Nine digits after +998. */
  phone: string
  relation: Relation
  comment: string
}

export type ApplicationProduct = {
  name: string
  price: number
  quantity: number
  /** Set when the line came from the catalogue, so its stock can be taken. */
  productId?: string
  valueIds?: string[]
}

export const DELIVERY_METHODS = ['pickup', 'delivery'] as const
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]
/** How the client gets the goods. The address is only for `delivery`. */
export type Fulfilment = { method: DeliveryMethod; address: string }

/** What was entered when the contract was drawn up. Missing on applications rejected before that. */
export type ApplicationDetails = {
  products: ApplicationProduct[]
  downPayment: number
  /** Day of the month, 1 to 10. */
  paymentDay: number
  term: Term
  markupPercent: number
  monthlyPayment: number
  fulfilment?: Fulfilment
  /** The client's card the monthly payments are taken from. */
  cardId?: string
}

export const REJECT_REASONS = ['noStock', 'unverified', 'limit', 'clientDeclined', 'other'] as const
export type RejectReason = (typeof REJECT_REASONS)[number]
/** Why an application was turned down. The shopper reads it too. */
export type Rejection = { reason: RejectReason; comment: string }

/** The statuses an application can move to from each one. Empty means it is final. */
export const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending: ['processing', 'rejected'],
  processing: ['handed', 'rejected', 'cancelled'],
  handed: ['closed'],
  rejected: [],
  closed: [],
  cancelled: [],
}

export type Application = {
  /** Application number as shown to staff, e.g. 252401. */
  id: number
  date: Date
  /** Goods total and total with markup, in UZS. Zero until approved. */
  goodsTotal: number
  installmentTotal: number
  status: ApplicationStatus
  contractNumber?: string
  details?: ApplicationDetails
  /** The shop (merchant) the goods are bought from. Missing means the signed-in merchant's. */
  storeId?: string
  /** The merchant's filial the sale belongs to; for pickup, where the goods are collected. */
  locationId?: string
  /** Payments the shopper has made in the app on top of the ones already settled. */
  extraPaid?: number
  /** When each of those was made, in order. */
  paidDates?: Date[]
  /** True once the shopper has left a review for this purchase. */
  reviewed?: boolean
  /** Set when the status is `rejected`. */
  rejection?: Rejection
}

export type Client = {
  id: string
  lastName: string
  firstName: string
  /** Patronymic (otasining ismi). */
  middleName: string
  photoUrl?: string
  /** Nine digits after +998. */
  phone: string
  /** JSHSHIR: 14 digits. */
  pinfl: string
  /** Series and number without a space, e.g. "AB1234567". */
  passport: string
  passportIssuedOn: Date
  passportExpiresOn: Date
  birthDate: Date
  maritalStatus: MaritalStatus
  /** In UZS. */
  monthlyIncome: number
  incomeSource?: IncomeSource
  /** Credit limit in UZS for each term; null until it has been calculated. */
  limits: Record<Term, number> | null
  cards: PaymentCard[]
  contacts: Contact[]
  applications: Application[]
}

type Seed = Pick<
  Client,
  'id' | 'photoUrl' | 'lastName' | 'firstName' | 'middleName' | 'phone' | 'pinfl' | 'passport'
> & {
  born: [number, number, number]
  issued: [number, number, number]
  maritalStatus: MaritalStatus
  monthlyIncome: number
  incomeSource: IncomeSource
  cards?: [string, string][]
  applications?: Application[]
}

const date = ([year, month, day]: [number, number, number]) => new Date(year, month - 1, day)

function fromSeed({ born, issued, cards = [], applications = [], ...rest }: Seed): Client {
  const issuedOn = date(issued)
  return {
    ...rest,
    birthDate: date(born),
    passportIssuedOn: issuedOn,
    passportExpiresOn: new Date(
      issuedOn.getFullYear() + 10,
      issuedOn.getMonth(),
      issuedOn.getDate(),
    ),
    limits: null,
    cards: cards.map(([first4, last4], i) => ({ id: `${rest.id}-${i}`, first4, last4 })),
    contacts: [],
    applications,
  }
}

// Invented sample people. Replace with the API once it is available.
export const seedClients: Client[] = [
  fromSeed({
    id: '1',
    photoUrl: user1Photo,
    lastName: 'Karimova',
    firstName: 'Dilnoza',
    middleName: 'Rustam qizi',
    phone: '901234567',
    pinfl: '41205950230018',
    passport: 'AB1234567',
    born: [1995, 5, 12],
    issued: [2019, 3, 14],
    maritalStatus: 'married',
    monthlyIncome: 5_000_000,
    incomeSource: 'other',
    cards: [
      ['9860', '1671'],
      ['9860', '8859'],
    ],
    applications: [
      {
        id: 252416,
        date: date([2026, 8, 6]),
        goodsTotal: 0,
        installmentTotal: 0,
        status: 'rejected',
      },
      {
        id: 231050,
        date: date([2026, 5, 20]),
        goodsTotal: 4_200_000,
        installmentTotal: 5_796_000,
        status: 'handed',
        contractNumber: 'B-33410/26',
        details: {
          products: [{ name: 'Televizor 43', price: 4_200_000, quantity: 1, productId: 'p2' }],
          downPayment: 0,
          paymentDay: 5,
          term: 12,
          markupPercent: 38,
          monthlyPayment: 483_000,
        },
      },
      {
        id: 252401,
        date: date([2026, 8, 6]),
        goodsTotal: 11_500_000,
        installmentTotal: 15_870_000,
        status: 'closed',
        contractNumber: 'B-37067/26',
        details: {
          products: [
            {
              name: 'Samsung Galaxy A55 (Koʻk, 256 GB)',
              price: 5_500_000,
              quantity: 1,
              productId: 'p1',
            },
            {
              name: 'Artel konditsioner (12 000 BTU)',
              price: 6_000_000,
              quantity: 1,
              productId: 'p7',
            },
          ],
          downPayment: 0,
          paymentDay: 5,
          term: 12,
          markupPercent: 38,
          monthlyPayment: 1_322_500,
        },
      },
      {
        id: 252394,
        date: date([2026, 8, 6]),
        goodsTotal: 0,
        installmentTotal: 0,
        status: 'rejected',
      },
      {
        id: 249263,
        date: date([2026, 8, 5]),
        goodsTotal: 0,
        installmentTotal: 0,
        status: 'rejected',
      },
      {
        id: 218461,
        date: date([2026, 7, 22]),
        goodsTotal: 0,
        installmentTotal: 0,
        status: 'cancelled',
      },
    ],
  }),
  fromSeed({
    id: '2',
    photoUrl: user2Photo,
    lastName: 'Toshpoʻlatov',
    firstName: 'Jasur',
    middleName: 'Anvar oʻgʻli',
    phone: '935557788',
    pinfl: '31807881450027',
    passport: 'AC4502118',
    born: [1988, 7, 18],
    issued: [2021, 9, 2],
    maritalStatus: 'married',
    monthlyIncome: 8_400_000,
    incomeSource: 'salary',
    cards: [['8600', '4410']],
    applications: [
      {
        id: 240118,
        date: date([2026, 6, 30]),
        goodsTotal: 6_900_000,
        installmentTotal: 8_625_000,
        status: 'closed',
        contractNumber: 'B-35502/26',
        details: {
          products: [
            {
              name: 'Artel konditsioner (18 000 BTU)',
              price: 6_900_000,
              quantity: 1,
              productId: 'p7',
            },
          ],
          downPayment: 0,
          paymentDay: 10,
          term: 6,
          markupPercent: 25,
          monthlyPayment: 1_437_500,
        },
      },
    ],
  }),
  fromSeed({
    id: '3',
    lastName: 'Yusupova',
    firstName: 'Malika',
    middleName: 'Baxtiyor qizi',
    phone: '977410203',
    pinfl: '42311990670035',
    passport: 'AD7781240',
    born: [1999, 11, 23],
    issued: [2022, 1, 20],
    maritalStatus: 'single',
    monthlyIncome: 3_200_000,
    incomeSource: 'salary',
    cards: [['9860', '3027']],
  }),
  fromSeed({
    id: '4',
    photoUrl: user3Photo,
    lastName: 'Rahimov',
    firstName: 'Bobur',
    middleName: 'Shavkat oʻgʻli',
    phone: '998906512',
    pinfl: '30102850120043',
    passport: 'AA3310975',
    born: [1985, 2, 1],
    issued: [2018, 6, 11],
    maritalStatus: 'divorced',
    monthlyIncome: 12_000_000,
    incomeSource: 'business',
    cards: [['8600', '7754']],
    applications: [
      {
        id: 251870,
        date: date([2026, 8, 3]),
        goodsTotal: 0,
        installmentTotal: 0,
        status: 'cancelled',
      },
    ],
  }),
  fromSeed({
    id: '5',
    lastName: 'Nazarova',
    firstName: 'Sevara',
    middleName: 'Ilhom qizi',
    phone: '911402266',
    pinfl: '41409970890051',
    passport: 'AB9054362',
    born: [1997, 9, 14],
    issued: [2020, 10, 5],
    maritalStatus: 'single',
    monthlyIncome: 4_500_000,
    incomeSource: 'salary',
  }),
  fromSeed({
    id: '6',
    lastName: 'Ergashev',
    firstName: 'Otabek',
    middleName: 'Murod oʻgʻli',
    phone: '946783310',
    pinfl: '32706920340069',
    passport: 'AC1187403',
    born: [1992, 6, 27],
    issued: [2023, 2, 17],
    maritalStatus: 'married',
    monthlyIncome: 7_000_000,
    incomeSource: 'business',
    cards: [['9860', '5506']],
  }),
  fromSeed({
    id: '7',
    lastName: 'Abdullayeva',
    firstName: 'Gulnora',
    middleName: 'Hamid qizi',
    phone: '883015544',
    pinfl: '40503780560076',
    passport: 'AD2260819',
    born: [1978, 3, 5],
    issued: [2017, 12, 8],
    maritalStatus: 'widowed',
    monthlyIncome: 2_800_000,
    incomeSource: 'pension',
    cards: [['8600', '9132']],
  }),
  fromSeed({
    id: '8',
    lastName: 'Qodirov',
    firstName: 'Sardor',
    middleName: 'Olim oʻgʻli',
    phone: '900098877',
    pinfl: '31910000780084',
    passport: 'AE6642051',
    born: [2000, 10, 19],
    issued: [2024, 4, 29],
    maritalStatus: 'single',
    monthlyIncome: 3_900_000,
    incomeSource: 'salary',
  }),
]

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'pending',
  'processing',
  'handed',
  'closed',
  'rejected',
  'cancelled',
]
