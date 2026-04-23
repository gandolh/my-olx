import { useState } from 'react'

interface ListingGalleryProps {
  images: string[]
  title: string
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [favorited, setFavorited] = useState(false)

  return (
    <section className="relative group">
      <div className="aspect-[4/3] w-full bg-surface-container overflow-hidden rounded-xl">
        <img
          src={images[activeIndex]}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden transition-opacity ${
              i === activeIndex ? 'border-2 border-primary' : 'hover:opacity-80'
            }`}
            aria-label={`Imagine ${i + 1}`}
          >
            <img src={src} alt={`${title} — imagine ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-3">
        <button
          onClick={() => setFavorited((f) => !f)}
          className="bg-surface-bright/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label={favorited ? 'Elimină de la favorite' : 'Adaugă la favorite'}
        >
          <span
            className="material-symbols-outlined text-error"
            style={{
              fontVariationSettings: favorited ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }}
          >
            favorite
          </span>
        </button>
        <button
          className="bg-surface-bright/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label="Distribuie anunțul"
        >
          <span className="material-symbols-outlined text-on-surface-variant">share</span>
        </button>
      </div>
    </section>
  )
}
