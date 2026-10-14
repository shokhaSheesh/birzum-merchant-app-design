import { useI18n } from '@/shared/i18n/useI18n'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'
import { legalSections, type LegalDocument } from '../documents'

type Props = { document: LegalDocument | null; onClose: () => void }

/** One legal document to read without leaving the screen. */
export function LegalSheet({ document, onClose }: Props) {
  const { t, tl } = useI18n()

  return (
    <Sheet
      open={document !== null}
      onClose={onClose}
      title={document ? t(`legal.${document}.title`) : ''}
    >
      {document && (
        <div className="flex flex-col gap-4 pt-1 pb-1">
          <p className="text-sm text-ink-muted">{t('legal.updated')}</p>
          {legalSections[document].map((section) => (
            <section key={section.heading.uz} className="flex flex-col gap-1">
              <h3 className="font-semibold">{tl(section.heading)}</h3>
              <p className="text-ink-muted">{tl(section.body)}</p>
            </section>
          ))}
          <Button block className="mt-2" onClick={onClose}>
            {t('legal.read')}
          </Button>
        </div>
      )}
    </Sheet>
  )
}
