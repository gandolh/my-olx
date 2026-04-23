import { Link, useParams } from "react-router-dom";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useListingDetail } from "../hooks/useListingDetail";
import { useRelatedListings } from "../hooks/useRelatedListings";
import { ListingGallery } from "../components/ListingGallery";
import { ListingDescription } from "../components/ListingDescription";
import { PricingCard } from "../components/PricingCard";
import { SellerCard } from "../components/SellerCard";
import { RelatedListings } from "../components/RelatedListings";

function PageLoader() {
  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-[4/3] w-full bg-surface-container rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 bg-surface-container rounded-2xl animate-pulse" />
          <div className="h-48 bg-surface-container rounded-2xl animate-pulse" />
        </div>
      </div>
    </main>
  );
}

export function ListingDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { data, isFetching, isError, refetch } = useListingDetail(id);
  const relatedListings = useRelatedListings(id);

  if (isFetching) return <PageLoader />;

  if (isError || !data) {
    return (
      <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto flex items-center justify-center min-h-[50vh]">
        <ErrorCard
          message="Nu am putut încărca anunțul."
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  const formattedPrice =
    data.priceRon != null
      ? `${data.priceRon.toLocaleString("ro-RO")} RON`
      : "Gratuit";

  return (
    <main className="pt-28 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto">
      {/* Breadcrumbs */}
      <nav
        className="flex items-center gap-2 mb-8 text-xs font-medium tracking-widest text-outline uppercase"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-primary transition-colors">
          Acasă
        </Link>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <Link
          to={`/categorii/${data.category}`}
          className="hover:text-primary transition-colors"
        >
          {data.categoryLabel}
        </Link>
        <span className="material-symbols-outlined text-[14px]">
          chevron_right
        </span>
        <span className="text-on-surface normal-case">{data.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-12">
          <ListingGallery images={data.images} title={data.title} />

          {/* Mobile-only title + price */}
          <div className="lg:hidden">
            <h1
              className="text-3xl font-extrabold tracking-tight text-on-surface mb-2"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {data.title}
            </h1>
            <div className="text-4xl font-black text-primary mb-6">
              {formattedPrice}
            </div>
          </div>

          <ListingDescription
            id={data.id}
            description={data.description}
            features={[]}
          />
        </div>

        {/* Right column — sticky */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <PricingCard
            listingId={data.id}
            title={data.title}
            priceRon={data.priceRon}
            location={data.city}
            viewCount={data.viewCount}
          />

          <SellerCard seller={data.seller} />

          {/* Safety tip */}
          <div className="flex items-start gap-4 px-4">
            <span className="material-symbols-outlined text-error mt-1">
              shield
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Sfaturi de siguranță:</strong> Evită plata în avans.
              Întâlnește-te cu vânzătorul într-un loc public și verifică
              produsul înainte de achiziție.
            </p>
          </div>

          {/* Report button */}
          <div className="flex justify-center pt-4">
            <button className="flex items-center gap-2 text-outline hover:text-error transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">
                report
              </span>
              Raportează Anunțul
            </button>
          </div>
        </div>
      </div>

      <RelatedListings listings={relatedListings.data ?? []} />
    </main>
  );
}
