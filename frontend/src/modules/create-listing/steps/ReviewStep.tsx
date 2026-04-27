import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewStepSchema, type ReviewStepInput } from "../schemas";
import type { ListingDraft } from "../services/drafts";
import { ListingGallery } from "../../listings/components/ListingGallery";
import { ListingDescription } from "../../listings/components/ListingDescription";
import { PricingCard } from "../../listings/components/PricingCard";
import { SellerCard } from "../../listings/components/SellerCard";

interface ReviewStepProps {
  draft: ListingDraft;
  onPublish: () => void;
  onBack: () => void;
  isPublishing: boolean;
}

export function ReviewStep({
  draft,
  onPublish,
  onBack,
  isPublishing,
}: ReviewStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewStepInput>({
    resolver: zodResolver(reviewStepSchema),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-black"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Verifică și publică
        </h2>
        <p className="text-on-surface-variant">
          Aruncă o ultimă privire înainte ca anunțul tău să devină public.
        </p>
      </div>

      <div className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant shadow-sm">
        <div className="p-4 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ListingGallery images={draft.images} title={draft.title} />
              <ListingDescription
                id={draft.id}
                description={draft.description}
                features={[]}
              />
            </div>
            <div className="space-y-6">
              <PricingCard
                listingId={draft.id}
                title={draft.title}
                priceRon={draft.priceRon}
                location={draft.city}
                viewCount={draft.viewCount}
              />
              <SellerCard seller={draft.seller} />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onPublish)} className="space-y-6">
        <div className="space-y-3 px-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("acceptsTerms")}
              className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low transition-colors"
            />
            <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
              Confirm că datele introduse sunt corecte și sunt de acord cu
              Termenii și Condițiile platformei.
            </span>
          </label>
          {errors.acceptsTerms && (
            <p className="text-error text-xs px-8">
              {errors.acceptsTerms.message}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isPublishing}
            className="flex-1 px-8 py-4 rounded-full font-bold border-2 border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Înapoi
          </button>
          <button
            type="submit"
            disabled={isPublishing}
            className="flex-[2] px-8 py-4 rounded-full font-bold bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                Se publică...
              </>
            ) : (
              "Publică anunțul"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
