import type { LocalizedText } from '@/shared/i18n/dictionaries'

export const LEGAL_DOCUMENTS = ['terms', 'privacy', 'offer'] as const
export type LegalDocument = (typeof LEGAL_DOCUMENTS)[number]

type Section = { heading: LocalizedText; body: LocalizedText }

// Placeholder wording so the screens have something real-looking to show. The lawyers'
// texts will come from the backend, with their version and date.
export const legalSections: Record<LegalDocument, Section[]> = {
  terms: [
    {
      heading: { uz: '1. Umumiy qoidalar', ru: '1. Общие положения' },
      body: {
        uz: 'Ushbu shartlar Birzum nasiya ilovasidan foydalanish tartibini belgilaydi. Ilovadan foydalanib, siz ularga rozilik bildirasiz.',
        ru: 'Эти условия определяют порядок использования приложения Birzum nasiya. Пользуясь приложением, вы соглашаетесь с ними.',
      },
    },
    {
      heading: { uz: '2. Hisob va xavfsizlik', ru: '2. Аккаунт и безопасность' },
      body: {
        uz: 'Hisobingizga kirish kodi va PIN-kodni boshqalarga bermang. Telefon raqamingiz oʻzgarsa, bizga xabar bering.',
        ru: 'Не передавайте код входа и PIN-код другим людям. Если ваш номер телефона изменился, сообщите нам.',
      },
    },
    {
      heading: { uz: '3. Nasiya va toʻlovlar', ru: '3. Рассрочка и платежи' },
      body: {
        uz: 'Har bir xarid alohida shartnoma bilan rasmiylashtiriladi. Oylik toʻlovlar tanlangan kartadan belgilangan kunda yechiladi.',
        ru: 'Каждая покупка оформляется отдельным договором. Ежемесячные платежи списываются с выбранной карты в установленный день.',
      },
    },
  ],
  privacy: [
    {
      heading: { uz: '1. Qanday maʼlumotlar yigʻiladi', ru: '1. Какие данные собираются' },
      body: {
        uz: 'Telefon raqami, pasport maʼlumotlari, tugʻilgan sana, daromad va MyID orqali olingan surat.',
        ru: 'Номер телефона, паспортные данные, дата рождения, доход и фото, полученное через MyID.',
      },
    },
    {
      heading: { uz: '2. Nima uchun kerak', ru: '2. Зачем они нужны' },
      body: {
        uz: 'Shaxsingizni tasdiqlash, limitni hisoblash va shartnomalarni rasmiylashtirish uchun.',
        ru: 'Чтобы подтвердить вашу личность, рассчитать лимит и оформить договоры.',
      },
    },
    {
      heading: { uz: '3. Kimga beriladi', ru: '3. Кому передаются' },
      body: {
        uz: 'Faqat siz xarid qilgan doʻkonga va qonun talab qilgan hollarda tegishli idoralarga.',
        ru: 'Только магазину, в котором вы покупаете, и, если требует закон, соответствующим органам.',
      },
    },
  ],
  offer: [
    {
      heading: { uz: '1. Shartnoma predmeti', ru: '1. Предмет договора' },
      body: {
        uz: 'Doʻkon sizga tovarni beradi, siz esa uning narxini tanlangan muddat davomida oylik toʻlovlar bilan toʻlaysiz.',
        ru: 'Магазин передаёт вам товар, а вы оплачиваете его стоимость ежемесячными платежами в течение выбранного срока.',
      },
    },
    {
      heading: { uz: '2. Toʻlovlar', ru: '2. Платежи' },
      body: {
        uz: 'Toʻlov jadvali shartnomada koʻrsatiladi. Muddatidan oldin toʻlash mumkin, qoʻshimcha haq olinmaydi.',
        ru: 'График платежей указан в договоре. Досрочное погашение возможно без дополнительной платы.',
      },
    },
    {
      heading: { uz: '3. Kechikish', ru: '3. Просрочка' },
      body: {
        uz: 'Toʻlov kechiksa, sizga xabar yuboriladi va limitingiz vaqtincha toʻxtatilishi mumkin.',
        ru: 'При просрочке платежа вы получите уведомление, а лимит может быть временно приостановлен.',
      },
    },
  ],
}
