import { useState } from 'react'
import type { Category } from '@/entities/catalog/products'
import { PhotoSwiper } from '@/entities/catalog/ui/PhotoSwiper'
import { PhotoViewer } from './PhotoViewer'

type Props = {
  images: string[]
  category: Category
  /** Used for the drawn stand-in when there are no photos. */
  color?: string
}

/** The product page's photos: swiped sideways, and opened full screen with a tap. */
export function ProductGallery({ images, category, color }: Props) {
  const [opened, setOpened] = useState<number | null>(null)

  return (
    <>
      <PhotoSwiper
        images={images}
        category={category}
        color={color}
        tileClassName="aspect-[1/0.8]! rounded-card border border-line bg-canvas!"
        onOpen={setOpened}
      />
      {opened !== null && (
        <PhotoViewer images={images} start={opened} onClose={() => setOpened(null)} />
      )}
    </>
  )
}
