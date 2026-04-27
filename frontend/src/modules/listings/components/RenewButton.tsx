import React from "react";
import { useListingMutations } from "@/modules/listings/hooks/useListingMutations";
import { useTranslation } from "react-i18next";
import { RefreshCcw } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface RenewButtonProps {
  listingId: string;
  expiresAt: string;
  className?: string;
  showIcon?: boolean;
}

export const RenewButton: React.FC<RenewButtonProps> = ({
  listingId,
  expiresAt,
  className = "",
  showIcon = true,
}) => {
  const { t } = useTranslation();
  const { renew } = useListingMutations();

  const expiryDate = parseISO(expiresAt);
  const now = new Date();
  const daysRemaining = differenceInDays(expiryDate, now);

  // Only show if it expires within 7 days or is already expired
  const shouldShow = daysRemaining <= 7;

  if (!shouldShow) return null;

  const handleRenew = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await renew.mutateAsync(listingId);
      toast.success(t("renew.success"));
    } catch (error) {
      toast.error(t("errors.generic"));
    }
  };

  const isExpired = daysRemaining < 0;

  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border-2 border-primary text-primary hover:bg-primary-container ${className}`}
      onClick={handleRenew}
      disabled={renew.isPending}
    >
      {showIcon && (
        <RefreshCcw
          className={`h-4 w-4 ${renew.isPending ? "animate-spin" : ""}`}
        />
      )}
      <span>
        {isExpired
          ? t("renew.expired")
          : t("renew.remaining", { days: daysRemaining })}
      </span>
    </button>
  );
};
