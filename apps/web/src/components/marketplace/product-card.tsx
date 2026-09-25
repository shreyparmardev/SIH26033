'use client';

import Link from 'next/link';
import { Eye, ArrowRight, Truck } from 'lucide-react';
import type { MarketplaceProduct, ProductLandedCostItem } from '@/lib/api';

interface ProductCardProps {
  product: MarketplaceProduct;
  onQuickView?: (product: MarketplaceProduct) => void;
  landedCost?: ProductLandedCostItem;
}

export function ProductCard({ product, onQuickView, landedCost }: ProductCardProps) {
  const primaryImage =
    product.primaryImage ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  const formatInr = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount) || amount === 0) return null;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: amount < 10 ? 2 : 0,
    }).format(amount);
  };

  const hasDemoPrice =
    product.illustrativeFarmerListingReferenceInr !== null &&
    product.illustrativeFarmerListingReferenceInr !== undefined &&
    !isNaN(product.illustrativeFarmerListingReferenceInr) &&
    product.illustrativeFarmerListingReferenceInr > 0;

  const isOutOfStock =
    product.availableQuantity <= 0 ||
    product.status === 'OUT_OF_STOCK' ||
    product.status === 'SOLD_OUT' ||
    product.status === 'ARCHIVED' ||
    (!hasDemoPrice && !landedCost && (!product.price || product.price <= 0));

  const calcPricePerKg = () => {
    if (landedCost) {
      return product.unit === 'KG'
        ? landedCost.totalLandedCostPerQuintal / 10000
        : landedCost.totalLandedCostPerQuintal / 100;
    }
    if (hasDemoPrice && product.illustrativeFarmerListingReferenceInr) {
      return product.illustrativeFarmerListingReferenceInr / 100;
    }
    if (product.price && product.price > 0) {
      return product.unit === 'KG' ? Number(product.price) : Number(product.price) / 100;
    }
    return null;
  };

  const pricePerKg = calcPricePerKg();
  const displayPrice = pricePerKg !== null
    ? formatInr(pricePerKg)
    : isOutOfStock
    ? 'Out of Stock'
    : 'Inquire';

  const locationDisplay =
    product.district && product.state
      ? `${product.district} Mandi, ${product.state}`
      : product.location || 'India';

  const badgeText = product.seller?.sellerType === 'FPO' ? 'VERIFIED FPO' : 'QUALITY INSPECTED';

  return (
    <div className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-all duration-200 ${
      isOutOfStock
        ? 'border-[#E5DDD0] bg-[#FAF8F5]'
        : 'border-[#DFD8CB] bg-[#FCFAF6] hover:border-[#C8BFB0] hover:shadow-sm'
    }`}>
      <div>
        {/* Crop Photo Frame */}
        <div className="relative aspect-16/10 w-full bg-[#EAE4D6] border-b border-[#DFD8CB] overflow-hidden">
          <Link href={`/marketplace/products/${product.id}`} className="block h-full w-full group">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryImage}
                alt={product.name}
                className={`h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-103 ${
                  isOutOfStock ? 'grayscale-35 opacity-85' : ''
                }`}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center select-none text-[#7A8070]">
                <span className="text-xs font-semibold">Image verified</span>
                <span className="text-[10px] text-[#8C9382] mt-0.5">Assay certificate active</span>
              </div>
            )}
          </Link>

          {/* Out of Stock Overlay Ribbon */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#000000]/25 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none z-10">
              <span className="bg-[#B91C1C] text-[#FAF8F2] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded shadow-md">
                Out of Stock
              </span>
            </div>
          )}

          {/* Verification Badge */}
          <span className={`absolute top-2.5 right-2.5 text-[10px] font-sans font-bold px-2.5 py-0.5 rounded uppercase tracking-wider pointer-events-none z-20 shadow-xs ${
            landedCost?.isEconomicallyRecommended && !isOutOfStock
              ? 'bg-[#1B4D20] text-[#FAF8F2] ring-1 ring-emerald-300/40'
              : 'bg-[#2E4221] text-[#FAF8F2]'
          }`}>
            {landedCost?.isEconomicallyRecommended && !isOutOfStock ? '★ BEST VALUE ROUTE' : badgeText}
          </span>
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-5">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link href={`/marketplace/products/${product.id}`}>
                <h3 className={`font-serif font-bold text-lg leading-snug transition-colors line-clamp-1 ${
                  isOutOfStock
                    ? 'text-[#505746] hover:text-[#1E221B]'
                    : 'text-[#1E221B] hover:text-[#233D22]'
                }`}>
                  {product.name}
                </h3>
              </Link>
              <span className="text-xs text-[#5D6352] block mt-0.5 truncate">
                {product.varietyType || product.category?.name || 'Standard Agricultural Lot'}
              </span>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="mt-3.5 space-y-2 text-xs pt-3 border-t border-[#ECE5D8]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[#7A8070] shrink-0 font-normal">Location / Mandi:</span>
              <span
                className="font-medium text-[#1E221B] text-right truncate"
                title={locationDisplay}
              >
                {locationDisplay}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#7A8070] shrink-0 font-normal">Available Quantity:</span>
              {isOutOfStock ? (
                <span className="font-semibold text-[#B91C1C] flex items-center gap-1.5 shrink-0">
                  <span>0 {product.unit ? product.unit.toLowerCase() : 'quintals'}</span>
                  <span className="text-[9px] uppercase font-bold bg-[#FEE2E2] text-[#991B1B] px-1.5 py-0.5 rounded">
                    Depleted
                  </span>
                </span>
              ) : (
                <span className="font-semibold text-[#1E221B] shrink-0">
                  {product.availableQuantity} {product.unit.toLowerCase()}
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[#7A8070] shrink-0 font-normal">Producer Organization:</span>
              <span
                className="font-medium text-[#2E4221] text-right truncate"
                title={product.farmerName || product.seller.businessName || 'Verified Collective'}
              >
                {product.farmerName || product.seller.businessName || 'Verified Collective'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Procure Action Section */}
      <div className="p-4 sm:p-5 pt-0">
        <div className={`p-3.5 rounded-lg border transition-colors ${
          isOutOfStock
            ? 'bg-[#FDF4F4] border-[#F5C6C6]'
            : 'bg-[#F4F0E6] border-[#DFD8CB]'
        }`}>
          {/* Price Header & Value Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] text-[#7A8070] uppercase tracking-wider font-bold">
                {isOutOfStock ? 'Availability' : landedCost ? 'Total Landed Cost' : 'Offer Price'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-serif font-bold tracking-tight whitespace-nowrap ${
                  isOutOfStock ? 'text-[#B91C1C]' : 'text-[#1E221B]'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : displayPrice || 'Price on request'}
                </span>
                {!isOutOfStock && displayPrice && (
                  <span className="text-xs text-[#5D6352] font-sans font-medium whitespace-nowrap">
                    / kg
                  </span>
                )}
              </div>
            </div>

            {landedCost?.isEconomicallyRecommended && !isOutOfStock && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#E2EDE2] text-[#233D22] border border-[#CCD8C4] px-1.5 py-0.5 rounded shrink-0 self-center">
                Best Route
              </span>
            )}
          </div>

          {/* Logistics Freight Breakdown */}
          {landedCost && !isOutOfStock && landedCost.logisticsCostPerQuintal > 0 && (
            <div className="mt-2 pt-2 border-t border-[#DFD8CB]/70 flex items-center gap-1.5 text-[11px] text-[#4A6B32] font-medium">
              <Truck className="h-3 w-3 shrink-0 text-[#4A6B32]" />
              <span className="truncate">
                Incl. ₹{(landedCost.logisticsCostPerQuintal / 100).toFixed(1)}/kg freight ({landedCost.roadDistanceKm} km)
              </span>
            </div>
          )}

          {/* Action Buttons Tier */}
          <div className="mt-3 flex items-center gap-2">
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                className="h-9 px-3 text-xs font-bold uppercase tracking-wider text-[#233D22] bg-[#FFFFFF] border border-[#DFD8CB] hover:bg-[#EAE4D6] hover:border-[#CCD8C4] rounded-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                title="Quick View Details"
              >
                <Eye className="h-3.5 w-3.5 text-[#233D22]" />
                <span>View</span>
              </button>
            )}
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="flex-1 h-9 px-3 text-xs font-bold uppercase tracking-wider bg-[#E8E2D5] text-[#7A8070] border border-[#D5CEBF] rounded-md cursor-not-allowed select-none flex items-center justify-center"
              >
                Out of Stock
              </button>
            ) : (
              <Link href={`/marketplace/products/${product.id}`} className="flex-1">
                <button className="w-full h-9 px-3 text-xs font-bold uppercase tracking-wider bg-[#233D22] hover:bg-[#1A2E19] text-[#FAF8F2] rounded-md transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Procure Lot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
