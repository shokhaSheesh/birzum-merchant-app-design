import { useState, type MouseEvent } from 'react'
import type { TranslationKey } from '@/shared/i18n/dictionaries'
import { useI18n } from '@/shared/i18n/useI18n'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Interpolate } from '@/shared/ui/Interpolate'
import type { LegalDocument } from '../documents'
import { LegalSheet } from './LegalSheet'

type Props = {
  /** The sentence, with a {slot} for each document, e.g. "{terms} va {privacy} bilan tanishdim". */
  text: TranslationKey
  documents: LegalDocument[]
  checked: boolean
  onChange: (checked: boolean) => void
  /** Set after a failed submit while unticked. */
  error?: string
}

/**
 * "I have read and agree to …": a checkbox whose document names are links. A link opens the
 * document in a sheet and does not tick the box.
 */
export function LegalConsent({ text, documents, checked, onChange, error }: Props) {
  const { t } = useI18n()
  const [reading, setReading] = useState<LegalDocument | null>(null)

  const open = (e: MouseEvent, document: LegalDocument) => {
    // The link sits inside the checkbox's label: keep the tap to the link
    e.preventDefault()
    e.stopPropagation()
    setReading(document)
  }

  return (
    <>
      <Checkbox
        checked={checked}
        onChange={onChange}
        error={error}
        label={
          <span className="text-sm font-normal text-ink-muted">
            <Interpolate
              text={t(text)}
              parts={Object.fromEntries(
                documents.map((document) => [
                  document,
                  <button
                    key={document}
                    type="button"
                    onClick={(e) => open(e, document)}
                    className="font-semibold text-brand underline decoration-navy-400 underline-offset-2"
                  >
                    {t(`legal.link.${document}`)}
                  </button>,
                ]),
              )}
            />
          </span>
        }
      />
      <LegalSheet document={reading} onClose={() => setReading(null)} />
    </>
  )
}
