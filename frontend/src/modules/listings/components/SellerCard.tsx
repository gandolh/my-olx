import type { SellerSummary } from '../types'

interface SellerCardProps {
  seller: SellerSummary
}

export function SellerCard({ seller }: SellerCardProps) {
  return (
    <div className="bg-surface-container-low p-8 rounded-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0">
            <img src={seller.avatarUrl} alt={seller.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-on-surface">{seller.name}</h3>
            {seller.verified && (
              <div className="flex items-center gap-1.5 bg-tertiary-container/10 text-tertiary px-2 py-0.5 rounded-full w-fit mt-1">
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  verified
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Vânzător Verificat</span>
              </div>
            )}
          </div>
        </div>
        <button className="text-primary hover:underline font-bold text-sm">Profil</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-outline uppercase tracking-widest font-bold">Membru din</span>
          <div className="font-semibold text-on-surface">{seller.memberSince}</div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-outline uppercase tracking-widest font-bold">Anunțuri active</span>
          <div className="font-semibold text-on-surface">{seller.activeListings} anunțuri</div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-secondary"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            star
          </span>
          <span className="font-bold text-on-surface">
            {seller.rating.toFixed(1)} / 5.0
          </span>
        </div>
        <span className="text-xs text-outline">{seller.reviewCount} recenzii</span>
      </div>
    </div>
  )
}
