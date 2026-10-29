import type { Lang } from '@/shared/i18n/dictionaries'

type Name = { uz: string; ru: string }
const n = (uz: string, ru: string): Name => ({ uz, ru })

export type City = { id: string; name: Name; districts: { id: string; name: Name }[] }
export type Region = { id: string; name: Name; cities: City[] }

/**
 * Where the client lives now (yashash manzili), not the propiska. The viloyat, then a shahar, a
 * tuman or both, then the MFY and the street and house typed in. Kept in Birzum only.
 */
export type HomeAddress = {
  regionId: string
  cityId?: string
  districtId?: string
  mfy: string
  street: string
}

const city = (id: string, name: Name, districts: Name[]): City => ({
  id,
  name,
  districts: districts.map((district, i) => ({ id: `${id}-${i + 1}`, name: district })),
})

// A sample of regions, cities and districts. Replace with the full list from the API.
export const REGIONS: Region[] = [
  {
    id: 'tashkent-city',
    name: n('Toshkent shahri', 'город Ташкент'),
    cities: [
      city('tashkent', n('Toshkent', 'Ташкент'), [
        n('Bektemir tumani', 'Бектемирский район'),
        n('Chilonzor tumani', 'Чиланзарский район'),
        n('Mirobod tumani', 'Мирабадский район'),
        n('Mirzo Ulugʻbek tumani', 'Мирзо-Улугбекский район'),
        n('Olmazor tumani', 'Алмазарский район'),
        n('Sergeli tumani', 'Сергелийский район'),
        n('Shayxontohur tumani', 'Шайхантаурский район'),
        n('Uchtepa tumani', 'Учтепинский район'),
        n('Yakkasaroy tumani', 'Яккасарайский район'),
        n('Yangihayot tumani', 'Янгихаётский район'),
        n('Yashnobod tumani', 'Яшнабадский район'),
        n('Yunusobod tumani', 'Юнусабадский район'),
      ]),
    ],
  },
  {
    id: 'tashkent-region',
    name: n('Toshkent viloyati', 'Ташкентская область'),
    cities: [
      city('nurafshon', n('Nurafshon', 'Нурафшан'), [
        n('Toshkent tumani', 'Ташкентский район'),
        n('Zangiota tumani', 'Зангиатинский район'),
        n('Oʻrta Chirchiq tumani', 'Уртачирчикский район'),
      ]),
      city('chirchiq', n('Chirchiq', 'Чирчик'), [
        n('Qibray tumani', 'Кибрайский район'),
        n('Boʻstonliq tumani', 'Бостанлыкский район'),
      ]),
      city('angren', n('Angren', 'Ангрен'), [n('Ohangaron tumani', 'Ахангаранский район')]),
    ],
  },
  {
    id: 'andijan',
    name: n('Andijon viloyati', 'Андижанская область'),
    cities: [
      city('andijan', n('Andijon', 'Андижан'), [
        n('Andijon tumani', 'Андижанский район'),
        n('Asaka tumani', 'Асакинский район'),
        n('Xoʻjaobod tumani', 'Ходжаабадский район'),
      ]),
    ],
  },
  {
    id: 'bukhara',
    name: n('Buxoro viloyati', 'Бухарская область'),
    cities: [
      city('bukhara', n('Buxoro', 'Бухара'), [
        n('Buxoro tumani', 'Бухарский район'),
        n('Gʻijduvon tumani', 'Гиждуванский район'),
        n('Kogon tumani', 'Каганский район'),
      ]),
    ],
  },
  {
    id: 'fergana',
    name: n('Fargʻona viloyati', 'Ферганская область'),
    cities: [
      city('fergana', n('Fargʻona', 'Фергана'), [
        n('Fargʻona tumani', 'Ферганский район'),
        n('Oltiariq tumani', 'Алтыарыкский район'),
      ]),
      city('kokand', n('Qoʻqon', 'Коканд'), [
        n('Dangʻara tumani', 'Дангаринский район'),
        n('Uchkoʻprik tumani', 'Учкуприкский район'),
      ]),
    ],
  },
  {
    id: 'jizzakh',
    name: n('Jizzax viloyati', 'Джизакская область'),
    cities: [
      city('jizzakh', n('Jizzax', 'Джизак'), [
        n('Sharof Rashidov tumani', 'Шараф-Рашидовский район'),
        n('Zomin tumani', 'Зааминский район'),
      ]),
    ],
  },
  {
    id: 'khorezm',
    name: n('Xorazm viloyati', 'Хорезмская область'),
    cities: [
      city('urgench', n('Urganch', 'Ургенч'), [
        n('Urganch tumani', 'Ургенчский район'),
        n('Xiva tumani', 'Хивинский район'),
      ]),
    ],
  },
  {
    id: 'namangan',
    name: n('Namangan viloyati', 'Наманганская область'),
    cities: [
      city('namangan', n('Namangan', 'Наманган'), [
        n('Namangan tumani', 'Наманганский район'),
        n('Chust tumani', 'Чустский район'),
        n('Uychi tumani', 'Уйчинский район'),
      ]),
    ],
  },
  {
    id: 'navoi',
    name: n('Navoiy viloyati', 'Навоийская область'),
    cities: [
      city('navoi', n('Navoiy', 'Навои'), [
        n('Karmana tumani', 'Карманинский район'),
        n('Qiziltepa tumani', 'Кызылтепинский район'),
      ]),
    ],
  },
  {
    id: 'kashkadarya',
    name: n('Qashqadaryo viloyati', 'Кашкадарьинская область'),
    cities: [
      city('karshi', n('Qarshi', 'Карши'), [
        n('Qarshi tumani', 'Каршинский район'),
        n('Gʻuzor tumani', 'Гузарский район'),
      ]),
      city('shakhrisabz', n('Shahrisabz', 'Шахрисабз'), [
        n('Shahrisabz tumani', 'Шахрисабзский район'),
        n('Kitob tumani', 'Китабский район'),
      ]),
    ],
  },
  {
    id: 'karakalpakstan',
    name: n('Qoraqalpogʻiston Respublikasi', 'Республика Каракалпакстан'),
    cities: [
      city('nukus', n('Nukus', 'Нукус'), [
        n('Nukus tumani', 'Нукусский район'),
        n('Xoʻjayli tumani', 'Ходжейлийский район'),
      ]),
    ],
  },
  {
    id: 'samarkand',
    name: n('Samarqand viloyati', 'Самаркандская область'),
    cities: [
      city('samarkand', n('Samarqand', 'Самарканд'), [
        n('Samarqand tumani', 'Самаркандский район'),
        n('Pastdargʻom tumani', 'Пастдаргомский район'),
        n('Urgut tumani', 'Ургутский район'),
      ]),
    ],
  },
  {
    id: 'syrdarya',
    name: n('Sirdaryo viloyati', 'Сырдарьинская область'),
    cities: [
      city('gulistan', n('Guliston', 'Гулистан'), [
        n('Guliston tumani', 'Гулистанский район'),
        n('Sirdaryo tumani', 'Сырдарьинский район'),
      ]),
    ],
  },
  {
    id: 'surkhandarya',
    name: n('Surxondaryo viloyati', 'Сурхандарьинская область'),
    cities: [
      city('termez', n('Termiz', 'Термез'), [
        n('Termiz tumani', 'Термезский район'),
        n('Denov tumani', 'Денауский район'),
      ]),
    ],
  },
]

const regionOf = (id: string | null) => REGIONS.find((region) => region.id === id)
export const citiesOf = (regionId: string | null) => regionOf(regionId)?.cities ?? []
/** Every tuman of a viloyat, whichever shahar it sits under in the list. */
export const districtsOf = (regionId: string | null) =>
  citiesOf(regionId).flatMap((item) => item.districts)

/** True when the viloyat, at least one of shahar or tuman, the MFY and the street are all in. */
export const addressComplete = (address: Partial<HomeAddress>): address is HomeAddress =>
  !!address.regionId &&
  (!!address.cityId || !!address.districtId) &&
  !!address.mfy?.trim() &&
  !!address.street?.trim()

/** "Toshkent, Chilonzor tumani": the shahar and tuman picked, for the field and the client page. */
export function formatPlace(address: Partial<HomeAddress>, lang: Lang) {
  const city = citiesOf(address.regionId ?? null).find((item) => item.id === address.cityId)
  const district = districtsOf(address.regionId ?? null).find(
    (item) => item.id === address.districtId,
  )
  return [city?.name[lang], district?.name[lang]].filter(Boolean).join(', ')
}

/** "Toshkent shahri, Toshkent, Chilonzor tumani, Bunyodkor MFY, 9-kvartal, 21-uy" */
export function formatAddress(address: HomeAddress, lang: Lang) {
  return [
    regionOf(address.regionId)?.name[lang],
    formatPlace(address, lang),
    address.mfy.trim(),
    address.street.trim(),
  ]
    .filter(Boolean)
    .join(', ')
}
