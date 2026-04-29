import { FavoriteToggle } from "@/modules/favorites/components/FavoriteToggle";
import { Link } from "@/lib/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@/lib/router";
import { useState } from "react";
import { fetchSellerPhone } from "@/modules/listings/services/listings";
import { ContactSellerModal } from "@/modules/messaging/components/ContactSellerModal";

interface PricingCardProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  priceRon: number | null;
  location: string;
  viewCount: number;
}

export function PricingCard({
  listingId,
  sellerId,
  sellerName,
  title,
  priceRon,
  location,
  viewCount,
}: PricingCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOwner = user?.id === sellerId;
  const formattedPrice =
    priceRon != null ? `${priceRon.toLocaleString("ro-RO")} RON` : "Gratuit";

  const navigate = useNavigate();
  const [phone, setPhone] = useState<string | null>(null);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleShowPhone = async () => {
    if (!user) {
      navigate("/autentificare");
      return;
    }
    if (phone) return;
    setLoadingPhone(true);
    try {
      const result = await fetchSellerPhone(listingId);
      setPhone(result);
    } catch {
      setPhone("Număr indisponibil");
    } finally {
      setLoadingPhone(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.04)] space-y-8">
      <div className="flex justify-end">
        <FavoriteToggle listingId={listingId} />
      </div>
      <div className="hidden lg:block">
        <h1
          className="text-2xl font-extrabold tracking-tight text-on-surface mb-2"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {title}
        </h1>
        <div className="text-4xl font-black text-primary">{formattedPrice}</div>
      </div>

      <div className="space-y-4">
        {isOwner ? (
          <Link
            to={`/anunturi/${listingId}/editeaza`}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all no-underline"
          >
            <span className="material-symbols-outlined">edit</span>
            {t("listing.actions.edit")}
          </Link>
        ) : (
          <>
            <button
              onClick={() => {
                if (!user) { navigate("/autentificare"); return; }
                setIsContactModalOpen(true);
              }}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">chat</span>
              Trimite Mesaj
            </button>
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all no-underline"
              >
                <span className="material-symbols-outlined">call</span>
                {phone}
              </a>
            ) : (
              <button
                onClick={handleShowPhone}
                disabled={loadingPhone}
                className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
              >
                <span className="material-symbols-outlined">call</span>
                {loadingPhone ? "Se încarcă..." : "Arată Numărul de Telefon"}
              </button>
            )}
          </>
        )}
      </div>

      <ContactSellerModal
        listingId={listingId}
        sellerName={sellerName}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
        <div className="flex items-center gap-2 text-outline text-sm">
          <span className="material-symbols-outlined text-[18px]">
            location_on
          </span>
          {location}
        </div>
        <div className="flex items-center gap-2 text-outline text-sm">
          <span className="material-symbols-outlined text-[18px]">
            visibility
          </span>
          {viewCount} vizualizări
        </div>
      </div>
    </div>
  );
}
