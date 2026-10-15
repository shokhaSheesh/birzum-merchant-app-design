import type { LocalizedText } from '@/shared/i18n/dictionaries'

export type Faq = { question: LocalizedText; answer: LocalizedText }

// Sample questions until support writes the real ones.
export const faq: Faq[] = [
  {
    question: { uz: 'Limit qanday hisoblanadi?', ru: 'Как рассчитывается лимит?' },
    answer: {
      uz: 'MyID maʼlumotlaringiz, kredit tarixingiz va daromadingiz asosida. Har bir muddat uchun alohida limit chiqadi.',
      ru: 'По данным MyID, кредитной истории и доходу. Для каждого срока лимит свой.',
    },
  },
  {
    question: { uz: 'Limit qancha muddat amal qiladi?', ru: 'Сколько действует лимит?' },
    answer: {
      uz: 'Olti oy. Muddati tugagach, limitni qayta oling: bu bir necha soniya oladi.',
      ru: 'Шесть месяцев. Когда срок истечёт, получите лимит заново — это займёт несколько секунд.',
    },
  },
  {
    question: { uz: 'Muddatidan oldin toʻlasam boʻladimi?', ru: 'Можно ли погасить досрочно?' },
    answer: {
      uz: 'Ha. Xarid sahifasida “Toʻlash”ni bosing va “Toʻliq yopish” yoki “Boshqa summa”ni tanlang. Qoʻshimcha haq olinmaydi.',
      ru: 'Да. На странице покупки нажмите «Оплатить» и выберите «Погасить полностью» или «Другая сумма». Без доплат.',
    },
  },
  {
    question: { uz: 'Toʻlovni kechiktirsam nima boʻladi?', ru: 'Что будет при просрочке?' },
    answer: {
      uz: 'Sizga xabar yuboriladi va limitingiz vaqtincha toʻxtatilishi mumkin. Qarzni toʻlaganingizdan soʻng limit tiklanadi.',
      ru: 'Вы получите уведомление, лимит может быть временно приостановлен. После погашения он восстановится.',
    },
  },
  {
    question: { uz: 'Kartani qanday almashtiraman?', ru: 'Как сменить карту?' },
    answer: {
      uz: 'Profil → Toʻlov kartalari boʻlimida yangi karta qoʻshing. Har bir toʻlovda kartani tanlash mumkin.',
      ru: 'Добавьте новую карту в Профиль → Платёжные карты. Карту можно выбрать при каждой оплате.',
    },
  },
]
