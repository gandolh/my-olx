import { useState } from "react";
import type { ListingImage } from "@/types/listing";

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex]?.url;

  return (
    <section className="relative group">
      <div className="aspect-[4/3] w-full bg-surface-container overflow-hidden rounded-xl">
        {activeImage ? (
          <img
            src={activeImage}
            alt={title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "48px" }}
            >
              image
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
        {images.map((image, i) => (
          <button
            key={image.id}
            onClick={() => setActiveIndex(i)}
            className={`w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden transition-opacity ${
              i === activeIndex ? "border-2 border-primary" : "hover:opacity-80"
            }`}
            aria-label={`Imagine ${i + 1}`}
          >
            <img
              src={image.url}
              alt={`${title} — imagine ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-3">
        <button
          className="bg-surface-bright/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label="Distribuie anunțul"
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            share
          </span>
        </button>
      </div>
    </section>
  );
}
