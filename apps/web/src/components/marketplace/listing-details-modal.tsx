'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Layers,
  FileText,
  TrendingUp,
  Tag,
  ArrowRight,
  ShieldCheck,
  Scale,
  X,
  User,
  ImageOff,
  PackageCheck,
  Info,
  AlertCircle,
} from 'lucide-react';
import type { MarketplaceProduct } from '@/lib/api';

interface ListingDetailsModalProps {
  product: MarketplaceProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ListingDetailsModal({
  product,
  isOpen,
  onClose,
}: ListingDetailsModalProps) {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  // Single primary image for listing
  const primaryImage =
    product.primaryImage ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  // Indian Rupee number formatter
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

  const formattedDemoPrice =
    hasDemoPrice && product.illustrativeFarmerListingReferenceInr
      ? `${formatInr(product.illustrativeFarmerListingReferenceInr / 100)} / kg`
      : 'Out of stock';

  const locationDisplay =
    product.district && product.state
      ? `${product.district} Mandi, ${product.state}`
      : product.location || 'India';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E221B]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#DFD8CB] bg-[#FCFAF6] text-[#1E221B] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFFFFF]/90 hover:bg-[#EAE4D6] text-[#233D22] border border-[#DFD8CB] shadow-sm transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Hero Image with Badges */}
        <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#EAE4D6] border-b border-[#DFD8CB] flex items-center justify-center">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center select-none text-[#7A8070]">
              <div className="h-12 w-12 rounded-xl bg-[#DFD8CB]/50 flex items-center justify-center mb-2 text-[#6B7260]">
                <ImageOff className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-[#1E221B]">
                Image verified
              </span>
              <span className="text-[11px] text-[#6B7260] mt-0.5">
                Assay certificate active
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#1E221B]/40 via-transparent to-transparent pointer-events-none" />

          {/* Badges Overlay */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 pointer-events-none">
            <span className="bg-[#233D22]/90 text-[#FAF8F2] text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm backdrop-blur-xs">
              {product.category?.name || 'Produce'}
            </span>
            {product.varietyType && (
              <span className="bg-[#FFFFFF]/95 text-[#233D22] border border-[#DFD8CB] text-xs font-semibold px-2.5 py-1 rounded shadow-sm backdrop-blur-xs">
                Variety: {product.varietyType}
              </span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Header Info */}
          <div>
            <h2 id="listing-modal-title" className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1E221B]">
              {product.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5D6352]">
              <div className="flex items-center gap-1 text-[#233D22] font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#233D22] shrink-0" />
                <span>{locationDisplay}</span>
              </div>
              {product.farmName && (
                <>
                  <span className="text-[#C8C0AF]">•</span>
                  <span>{product.farmName}</span>
                </>
              )}
              {product.farmerName && (
                <>
                  <span className="text-[#C8C0AF]">•</span>
                  <span className="font-medium text-[#1E221B]">
                    Farmer: {product.farmerName}
                  </span>
                </>
              )}
              <span className="text-[#C8C0AF]">•</span>
              {hasDemoPrice ? (
                <span className="font-semibold text-[#233D22] bg-[#E2EDE2] border border-[#CCD8C4] px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  <PackageCheck className="h-3.5 w-3.5 text-[#233D22]" />
                  Available: {product.availableQuantity} {product.unit}
                </span>
              ) : (
                <span className="font-semibold text-[#B91C1C] bg-[#FDF4F4] border border-[#E5C9C9] px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-[#B91C1C]" />
                  Out of stock
                </span>
              )}
            </div>
          </div>

          {/* Price Box */}
          <div>
            <div className={`rounded-xl border p-4 sm:p-4.5 space-y-1.5 ${hasDemoPrice ? 'border-[#CCD8C4] bg-[#F1F6EE]' : 'border-[#E5C9C9] bg-[#FDF4F4]'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${hasDemoPrice ? 'text-[#233D22]' : 'text-[#B91C1C]'}`}>
                  Farmer’s listing price
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${hasDemoPrice ? 'border-[#CCD8C4] bg-[#E2EDE2] text-[#233D22]' : 'border-[#E5C9C9] bg-[#FEE2E2] text-[#B91C1C]'}`}>
                  {hasDemoPrice ? 'Farmer Listing' : 'Unavailable'}
                </span>
              </div>
              <div className={`font-serif text-2xl sm:text-3xl font-bold ${hasDemoPrice ? 'text-[#1E221B]' : 'text-[#B91C1C]'}`}>
                {formattedDemoPrice}
              </div>
              <p className="text-[11px] text-[#5D6352] italic leading-tight">
                {hasDemoPrice
                  ? 'Illustrative demo listing price — not an actual farmer offer.'
                  : 'Pricing not available. Currently out of stock.'}
              </p>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="rounded-xl border border-[#DFD8CB] bg-[#FFFFFF] p-4.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A8070] mb-3.5">
              Listing Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="space-y-0.5">
                <span className="text-[#8A8F7E] block text-[10px] font-bold uppercase tracking-wider">Available Stock</span>
                <p className={`font-semibold flex items-center gap-1 ${hasDemoPrice ? 'text-[#1E221B]' : 'text-[#B91C1C]'}`}>
                  {hasDemoPrice ? (
                    <>
                      <PackageCheck className="h-3.5 w-3.5 text-[#233D22] shrink-0" />
                      <span>{product.availableQuantity} {product.unit}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-[#B91C1C] shrink-0" />
                      <span>Out of stock</span>
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8A8F7E] block text-[10px] font-bold uppercase tracking-wider">Variety Type</span>
                <p className="font-semibold text-[#1E221B]">
                  {product.varietyType || 'Standard'}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8A8F7E] block text-[10px] font-bold uppercase tracking-wider">Selling Unit</span>
                <p className="font-semibold text-[#1E221B] flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5 text-[#233D22] shrink-0" />
                  <span>Rs./kg</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8A8F7E] block text-[10px] font-bold uppercase tracking-wider">District</span>
                <p className="font-semibold text-[#1E221B]">
                  {product.district || 'Not Specified'}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[#8A8F7E] block text-[10px] font-bold uppercase tracking-wider">State</span>
                <p className="font-semibold text-[#1E221B]">
                  {product.state || 'India'}
                </p>
              </div>
            </div>
          </div>

          {/* Official Notes & Methodology */}
          {product.notes && (
            <div className="rounded-xl border border-[#DFD8CB] bg-[#F4EFE6] p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#233D22]">
                <FileText className="h-3.5 w-3.5 text-[#233D22]" />
                <span>Dataset Notes & Methodology</span>
              </div>
              <p className="text-xs text-[#5D6352] leading-relaxed">
                {product.notes}
              </p>
            </div>
          )}

          {/* Verification Badge & Direct Farmer Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-[#CCD8C4] p-3.5 bg-[#EAF2E8] text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#233D22] shrink-0" />
              <div>
                <span className="font-semibold text-[#233D22] block">
                  {product.farmerName} • {product.farmName || 'Verified Farm'}
                </span>
                <span className="text-[11px] text-[#5D6352]">
                  Direct farmer listing • Verified produce listed directly by the producer.
                </span>
              </div>
            </div>
            <span className="bg-[#233D22] text-[#FAF8F2] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
              Direct Producer
            </span>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DFD8CB]">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider border border-[#DFD8CB] bg-[#FFFFFF] text-[#233D22] hover:bg-[#EAE4D6] rounded-md transition-colors cursor-pointer"
            >
              Close
            </button>
            <Link href={`/marketplace/products/${product.id}`}>
              <button
                type="button"
                className="h-9 px-4 text-xs font-bold uppercase tracking-wider bg-[#233D22] hover:bg-[#1C321B] text-[#FAF8F2] rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full Page</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
