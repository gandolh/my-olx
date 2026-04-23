import { useRef, useState } from "react";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploaderProps {
  existingCount: number;
  onUploadFiles: (files: File[]) => Promise<void>;
}

export function ImageUploader({ existingCount, onUploadFiles }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const remainingSlots = Math.max(0, 10 - existingCount);

  async function handleFiles(input: FileList | null) {
    if (!input || input.length === 0) {
      return;
    }

    const selected = Array.from(input).slice(0, remainingSlots);
    const mimeError = selected.find((file) => !ALLOWED_MIME_TYPES.includes(file.type));
    if (mimeError) {
      setError("Formatul fișierului nu este suportat. Acceptăm JPG, PNG, WebP.");
      return;
    }

    const sizeError = selected.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (sizeError) {
      setError("Un fișier depășește 10MB. Redu dimensiunea și încearcă din nou.");
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      await onUploadFiles(selected);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="space-y-3">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (remainingSlots === 0 || isUploading) {
            return;
          }
          handleFiles(event.dataTransfer.files);
        }}
        className="border-2 border-dashed border-outline rounded-2xl p-6 text-center bg-surface-container"
      >
        <p className="font-semibold text-on-surface">Trage poze aici sau selectează din telefon</p>
        <p className="text-sm text-on-surface-variant mt-1">
          JPG, PNG, WebP. Maxim 10MB per fișier. {remainingSlots} sloturi rămase.
        </p>
        <button
          type="button"
          disabled={remainingSlots === 0 || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-5 py-2.5 rounded-full bg-primary text-on-primary font-semibold disabled:opacity-50"
        >
          {remainingSlots === 0 ? "Ai atins limita de 10 poze" : "Alege poze"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error ? <p className="text-sm text-error">{error}</p> : null}
    </section>
  );
}
