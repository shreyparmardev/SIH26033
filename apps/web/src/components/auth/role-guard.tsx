'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { MarketplaceNavbar } from '@/components/marketplace/marketplace-navbar';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Tractor,
  ShoppingBag,
  Store,
} from 'lucide-react';

export interface RoleGuardProps {
  allowedRoles: ('BUYER' | 'FARMER' | 'FPO' | 'ADMIN')[];
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallbackTitle,
  fallbackMessage,
}: RoleGuardProps) {
  const { isAuthenticated, isLoading, user, loginAsDemoBuyer } = useAuth();
  const pathname = usePathname();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5EE] text-[#1E221B] flex flex-col">
        <MarketplaceNavbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="p-8 text-center border border-[#DFD8CB] rounded-lg bg-[#FCFAF6] max-w-sm w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7260] block mb-2">
              Security Protocol
            </span>
            <p className="text-sm font-serif font-bold text-[#1E221B]">
              Verifying credentials & trade permissions...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // 2. Unauthenticated Visitor State
  if (!isAuthenticated || !user) {
    const isFarmerRoute = allowedRoles.some((r) => r === 'FARMER' || r === 'FPO');
    const roleTarget = isFarmerRoute ? 'Farmer' : 'Buyer';
    const roleParam = isFarmerRoute ? 'FARMER' : 'BUYER';
    const returnUrl = encodeURIComponent(pathname || '/marketplace');

    return (
      <div className="min-h-screen bg-[#F7F5EE] text-[#1E221B] flex flex-col">
        <MarketplaceNavbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
          <div className="w-full max-w-[460px] rounded-lg border border-[#DFD8CB] bg-[#FFFFFF] shadow-sm p-8 sm:p-10 text-center space-y-6">
            {/* Top Security Pill & Icon */}
            <div className="space-y-3">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E2EDE2] text-[#233D22] border border-[#CCDBCB]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]"></span>
                  {isFarmerRoute ? 'Producer Gateway' : 'Verified Buyer Access'}
                </span>
              </div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E2EDE2] text-[#233D22] border border-[#CCDBCB]">
                <Lock className="h-5 w-5" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-[26px] font-serif font-bold text-[#1E221B]">
                {fallbackTitle || `${roleTarget} Sign-In Required`}
              </h1>
              <p className="text-xs text-[#616857] leading-relaxed max-w-sm mx-auto">
                {fallbackMessage ||
                  `This page is protected and requires an active ${roleTarget} account. Please sign in or register to continue.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href={`/login?returnUrl=${returnUrl}`} className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto h-10 px-5 bg-[#233D22] hover:bg-[#1C321B] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider rounded inline-flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <span>Sign In to Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
              <Link
                href={`/register?role=${roleParam}&returnUrl=${returnUrl}`}
                className="w-full sm:w-auto"
              >
                <button
                  type="button"
                  className="w-full sm:w-auto h-10 px-5 border border-[#DFD8CB] bg-[#F7F5EE] hover:bg-[#EAE4D6] text-[#233D22] text-xs font-bold uppercase tracking-wider rounded inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  Register as {roleTarget}
                </button>
              </Link>
            </div>

            {/* Quick Demo Buyer Shortcut */}
            {!isFarmerRoute && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    await loginAsDemoBuyer();
                  }}
                  className="text-[11px] font-semibold text-[#8B4513] hover:underline cursor-pointer"
                >
                  ⚡ Instant Demo Sign-In as Verified Buyer
                </button>
              </div>
            )}

            {/* Return Link */}
            <div className="pt-3 border-t border-[#ECE5D8] text-center">
              <Link
                href="/marketplace"
                className="text-xs font-medium text-[#6B7260] hover:text-[#233D22] hover:underline transition-colors inline-flex items-center gap-1.5"
              >
                &larr; Back to Public Marketplace
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. Role Authorization Check
  const hasAllowedRole = allowedRoles.includes(user.role as any);

  if (!hasAllowedRole) {
    const isFarmerTryingBuyerAction =
      (user.role === 'FARMER' || user.role === 'FPO') &&
      allowedRoles.includes('BUYER');

    const isBuyerTryingFarmerAction =
      user.role === 'BUYER' &&
      allowedRoles.some((r) => r === 'FARMER' || r === 'FPO');

    return (
      <div className="min-h-screen bg-[#F7F5EE] text-[#1E221B] flex flex-col">
        <MarketplaceNavbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
          <div className="w-full max-w-[480px] rounded-lg border border-[#DFD8CB] bg-[#FFFFFF] shadow-sm p-8 sm:p-10 text-center space-y-6">
            <div className="space-y-3">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FDF2F2] text-[#9B1C1C] border border-[#F8B4B4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]"></span>
                  Access Restricted
                </span>
              </div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF2F2] text-[#9B1C1C] border border-[#F8B4B4]">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-[26px] font-serif font-bold text-[#1E221B]">
                {isFarmerTryingBuyerAction
                  ? 'Buyer Account Required'
                  : isBuyerTryingFarmerAction
                  ? 'Farmer Account Required'
                  : 'Access Restricted'}
              </h1>

              <div className="p-4 rounded-lg bg-[#FAF8F2] border border-[#DFD8CB] text-xs text-[#52594B] leading-relaxed text-left">
                {isFarmerTryingBuyerAction ? (
                  <p>
                    You are currently signed in with a <strong>Farmer/Producer</strong> account (
                    <span className="font-mono text-[#1E221B]">{user.email}</span>).
                    Farmer accounts list produce for sale and fulfill consignments. Purchasing features
                    (Cart, Checkout, and Buyer Orders) require a <strong>Buyer</strong> account.
                  </p>
                ) : isBuyerTryingFarmerAction ? (
                  <p>
                    You are currently signed in with a <strong>Buyer</strong> account (
                    <span className="font-mono text-[#1E221B]">{user.email}</span>). Producer
                    dashboards, listing management, and carrier fulfillment actions are reserved for
                    registered <strong>Farmers and FPOs</strong>.
                  </p>
                ) : (
                  <p>
                    Your current account role (<strong>{user.role}</strong>) does not have permission to
                    access this area.
                  </p>
                )}
              </div>
            </div>

            {/* Navigation & Action Options */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              {isFarmerTryingBuyerAction ? (
                <>
                  <Link
                    href={`/login?returnUrl=${encodeURIComponent(pathname || '/cart')}`}
                    className="w-full sm:w-auto"
                  >
                    <button
                      type="button"
                      className="w-full sm:w-auto h-10 px-5 bg-[#233D22] hover:bg-[#1C321B] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider rounded inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Sign In as Buyer</span>
                    </button>
                  </Link>
                  <Link href="/seller/orders" className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto h-10 px-5 border border-[#DFD8CB] bg-[#F7F5EE] hover:bg-[#EAE4D6] text-[#233D22] text-xs font-bold uppercase tracking-wider rounded inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Tractor className="h-3.5 w-3.5" />
                      <span>Producer Orders</span>
                    </button>
                  </Link>
                </>
              ) : isBuyerTryingFarmerAction ? (
                <>
                  <Link
                    href={`/login?returnUrl=${encodeURIComponent(pathname || '/seller/orders')}`}
                    className="w-full sm:w-auto"
                  >
                    <button
                      type="button"
                      className="w-full sm:w-auto h-10 px-5 bg-[#233D22] hover:bg-[#1C321B] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider rounded inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <Tractor className="h-3.5 w-3.5" />
                      <span>Sign In as Farmer</span>
                    </button>
                  </Link>
                  <Link href="/marketplace" className="w-full sm:w-auto">
                    <button
                      type="button"
                      className="w-full sm:w-auto h-10 px-5 border border-[#DFD8CB] bg-[#F7F5EE] hover:bg-[#EAE4D6] text-[#233D22] text-xs font-bold uppercase tracking-wider rounded inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Store className="h-3.5 w-3.5" />
                      <span>Marketplace</span>
                    </button>
                  </Link>
                </>
              ) : (
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto h-10 px-5 bg-[#233D22] hover:bg-[#1C321B] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider rounded inline-flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  >
                    Return to Marketplace
                  </button>
                </Link>
              )}
            </div>

            <div className="pt-3 border-t border-[#ECE5D8] text-center">
              <Link
                href="/marketplace"
                className="text-xs font-medium text-[#6B7260] hover:text-[#233D22] hover:underline transition-colors inline-flex items-center gap-1.5"
              >
                &larr; Back to Public Marketplace
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 4. Authorized Access
  return <>{children}</>;
}
