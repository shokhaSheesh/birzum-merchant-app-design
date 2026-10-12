export const LANGS = ['uz', 'ru'] as const
export type Lang = (typeof LANGS)[number]

export const LANG_NAMES: Record<Lang, string> = {
  uz: 'Oʻzbekcha',
  ru: 'Русский',
}

const uz = {
  'common.close': 'Yopish',
  'common.select': 'Tanlang',
  'lang.title': 'Tilni tanlang',
  'nav.home': 'Asosiy',
  'nav.applications': 'Arizalar',
  'nav.profile': 'Profil',
  'field.login': 'Login',
  'field.password': 'Parol',
  'field.newPassword': 'Yangi parol',
  'field.confirmPassword': 'Yangi parolni tasdiqlang',
  'password.show': 'Parolni koʻrsatish',
  'password.hide': 'Parolni yashirish',
  'calendar.prev': 'Oldingi oy',
  'calendar.next': 'Keyingi oy',
  'auth.login.title': 'Hisobga kirish',
  'auth.login.subtitle': 'Sotuvchi kabinetiga kirish uchun login va parolingizni kiriting.',
  'auth.login.submit': 'Kirish',
  'auth.error.required': 'Maydonni toʻldiring',
  'auth.error.invalid': 'Login yoki parol notoʻgʻri',
  'auth.change.title': 'Yangi parol oʻrnating',
  'auth.change.subtitle':
    'Bu birinchi kirishingiz. Xavfsizlik uchun vaqtinchalik parolni oʻzgartiring.',
  'auth.change.submit': 'Parolni saqlash',
  'auth.rule.length': 'Kamida 8 ta belgi',
  'auth.rule.letter': 'Kamida bitta harf',
  'auth.rule.digit': 'Kamida bitta raqam',
  'auth.error.weak': 'Parol talablarga mos emas',
  'auth.error.mismatch': 'Parollar mos kelmadi',
} as const

export type TranslationKey = keyof typeof uz

const ru: Record<TranslationKey, string> = {
  'common.close': 'Закрыть',
  'common.select': 'Выберите',
  'lang.title': 'Выберите язык',
  'nav.home': 'Главная',
  'nav.applications': 'Заявки',
  'nav.profile': 'Профиль',
  'field.login': 'Логин',
  'field.password': 'Пароль',
  'field.newPassword': 'Новый пароль',
  'field.confirmPassword': 'Повторите новый пароль',
  'password.show': 'Показать пароль',
  'password.hide': 'Скрыть пароль',
  'calendar.prev': 'Предыдущий месяц',
  'calendar.next': 'Следующий месяц',
  'auth.login.title': 'Вход в кабинет',
  'auth.login.subtitle': 'Введите логин и пароль, чтобы войти в кабинет продавца.',
  'auth.login.submit': 'Войти',
  'auth.error.required': 'Заполните поле',
  'auth.error.invalid': 'Неверный логин или пароль',
  'auth.change.title': 'Задайте новый пароль',
  'auth.change.subtitle': 'Это ваш первый вход. Для безопасности смените временный пароль.',
  'auth.change.submit': 'Сохранить пароль',
  'auth.rule.length': 'Не менее 8 символов',
  'auth.rule.letter': 'Хотя бы одна буква',
  'auth.rule.digit': 'Хотя бы одна цифра',
  'auth.error.weak': 'Пароль не соответствует требованиям',
  'auth.error.mismatch': 'Пароли не совпадают',
}

export const dictionaries: Record<Lang, Record<TranslationKey, string>> = { uz, ru }

/** Weeks start on Monday. */
export const calendarNames: Record<Lang, { months: string[]; weekdays: string[] }> = {
  uz: {
    months: [
      'Yanvar',
      'Fevral',
      'Mart',
      'Aprel',
      'May',
      'Iyun',
      'Iyul',
      'Avgust',
      'Sentabr',
      'Oktabr',
      'Noyabr',
      'Dekabr',
    ],
    weekdays: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  },
  ru: {
    months: [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ],
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  },
}
