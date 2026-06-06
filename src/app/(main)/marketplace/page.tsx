'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { DualInline } from '../DualLogo'

interface MarketplaceListing {
  id: string
  ticketName: string
  originalPrice: number
  listingPrice: number
  seller: string
  eventDate: string
  tier: string
  listed: string
  isLive?: boolean
  maxResalePrice?: number
  eventName?: string
  imageUrl?: string
  eventId?: string
}

interface PurchaseModalState {
  isOpen: boolean
  listing: MarketplaceListing | null
  step: 'confirm' | 'processing' | 'success' | 'error'
  error?: string
  transactionHash?: string
}


function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now.getTime() - then.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHrs < 1) return 'Just now'
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [liveListings, setLiveListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseModal, setPurchaseModal] = useState<PurchaseModalState>({
    isOpen: false,
    listing: null,
    step: 'confirm',
  })

  useEffect(() => {
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((data) => {
        const tickets = data.tickets || []
        const mapped: MarketplaceListing[] = tickets.map((t: any) => {
          const td = t.ticketData || {}
          const tierName = td.tier ? td.tier.charAt(0).toUpperCase() + td.tier.slice(1) : 'General'
          return {
            id: t.id,
            ticketName: (td.eventName || td.name || 'Event Ticket') + ' — ' + tierName,
            originalPrice: td.price || 0,
            listingPrice: td.listingPrice || td.price || 0,
            seller: t.blockchainTxHash ? t.blockchainTxHash.slice(0, 10) + '...' + t.blockchainTxHash.slice(-6) : 'DUAL Network',
            eventDate: td.eventDate || t.createdAt,
            tier: tierName,
            listed: t.createdAt ? getTimeAgo(t.createdAt) : 'Recently',
            isLive: !!t.blockchainTxHash,
            maxResalePrice: td.maxResalePrice,
            eventName: td.eventName || td.name || 'Event',
            imageUrl: td.imageUrl,
            eventId: t.id,
          }
        })
        setLiveListings(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleBuyClick = (listing: MarketplaceListing) => {
    setPurchaseModal({
      isOpen: true,
      listing,
      step: 'confirm',
    })
  }

  const handleExecutePurchase = async () => {
    if (!purchaseModal.listing) return

    setPurchaseModal((prev) => ({ ...prev, step: 'processing' }))

    try {
      // Simulate processing steps
      await new Promise((r) => setTimeout(r, 1000)) // Initiating
      await new Promise((r) => setTimeout(r, 1000)) // Settling
      await new Promise((r) => setTimeout(r, 1000)) // Recording
      await new Promise((r) => setTimeout(r, 1000)) // Transferring

      const txHash = '0x' + Math.random().toString(16).slice(2)

      // Call buy API
      const response = await fetch(`/api/tickets/${purchaseModal.listing.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerAddress: '0x' + Math.random().toString(16).slice(2, 42),
          listingPrice: purchaseModal.listing.listingPrice,
          sellerId: purchaseModal.listing.seller,
        }),
      })

      if (!response.ok) {
        throw new Error('Purchase failed')
      }

      const data = await response.json()

      setPurchaseModal((prev) => ({
        ...prev,
        step: 'success',
        transactionHash: data.transactionHash || txHash,
      }))
    } catch (err) {
      setPurchaseModal((prev) => ({
        ...prev,
        step: 'error',
        error: String(err),
      }))
    }
  }

  const closePurchaseModal = () => {
    setPurchaseModal({
      isOpen: false,
      listing: null,
      step: 'confirm',
    })
  }

  const uniqueTiers = Array.from(new Set(liveListings.map((l) => l.tier))).filter(Boolean)
  const tiers = ['all', ...uniqueTiers]

  const filteredListings =
    filterTier === 'all' ? liveListings : liveListings.filter((l) => l.tier === filterTier)

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price-asc') return a.listingPrice - b.listingPrice
    if (sortBy === 'price-desc') return b.listingPrice - a.listingPrice
    return 0
  })

  return (
    <div className="min-h-screen relative bg-[#131313]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-black tracking-widest mb-4 text-white font-headline">
            TICKET MARKETPLACE
          </h1>
          <p className="text-lg text-[#c7c6c6] max-w-2xl">
            Trade verified tickets with anti-scalp protection. All listings are enforced by smart contracts.
          </p>
        </div>

        {liveListings.length > 0 && (
          <div className="mb-8 flex items-center gap-4 p-4 border border-[#39ff14]/10 bg-[#39ff14]/5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#39ff14] animate-pulse" />
              <span className="text-[#39ff14] font-bold text-lg">{liveListings.length}</span>
            </div>
            <span className="text-[#c7c6c6]">
              live listing{liveListings.length !== 1 ? 's' : ''} with on-chain price
              enforcement
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-[#919191] mb-3 font-semibold font-headline uppercase tracking-widest">Filter by Tier</p>
            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`px-5 py-1.5 text-sm font-medium transition-all duration-200 font-headline uppercase tracking-widest ${
                    filterTier === tier
                      ? 'bg-white text-black font-semibold'
                      : 'text-[#919191] border border-[#474747]/20 hover:border-[#39ff14]/40 hover:text-[#c7c6c6]'
                  }`}
                >
                  {tier === 'all' ? 'All Tiers' : tier}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-[#919191] mb-3 font-semibold block font-headline uppercase tracking-widest">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-[#1b1b1b] border border-[#474747]/20 text-white text-sm focus:border-[#39ff14]/50 focus:outline-none transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-[#2a2a2a] bg-[#0e0e0e] p-6 animate-pulse"
              >
                <div className="h-6 bg-[#2a2a2a] mb-4" />
                <div className="h-4 bg-[#2a2a2a] w-3/4 mb-6" />
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-[#2a2a2a]" />
                  <div className="h-4 bg-[#2a2a2a] w-2/3" />
                </div>
                <div className="h-10 bg-[#2a2a2a]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedListings.map((listing) => {
              const priceChange = listing.listingPrice - listing.originalPrice
              const priceChangePercent = ((priceChange / listing.originalPrice) * 100).toFixed(1)
              const isViolatingCeiling =
                listing.maxResalePrice && listing.listingPrice > listing.maxResalePrice

              return (
                <div
                  key={listing.id}
                  className="group border border-[#2a2a2a] bg-[#0e0e0e] overflow-hidden hover:border-[#39ff14]/30 hover:shadow-[0_0_20px_rgba(57,255,20,0.1)] transition-all duration-300 flex flex-col"
                >
                  {listing.imageUrl && (
                    <div className="h-36 relative overflow-hidden">
                      <img src={listing.imageUrl} alt={listing.ticketName} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
                      {listing.isLive && (
                        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 bg-[#39ff14] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                          <span className="w-1.5 h-1.5 bg-black animate-pulse" />
                          <span className="text-xs font-bold">ON-CHAIN</span>
                        </div>
                      )}
                    </div>
                  )}
                  {!listing.imageUrl && listing.isLive && (
                    <div className="px-6 pt-6 mb-3">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#39ff14] text-black w-fit">
                        <span className="w-1.5 h-1.5 bg-black animate-pulse" />
                        <span className="text-xs font-bold">ON-CHAIN</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-4 px-6 pt-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-[#39ff14] transition-colors flex-1 text-white">
                        {listing.ticketName}
                      </h3>
                    </div>
                    <div className="inline-flex px-2 py-1 bg-[#39ff14]/10 border border-[#39ff14]/20">
                      <span className="text-xs font-semibold text-[#39ff14] font-headline uppercase tracking-widest">{listing.tier}</span>
                    </div>
                  </div>

                  <div className="mb-4 px-6 space-y-2 text-sm text-[#c7c6c6]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">calendar_month</span>
                      {new Date(listing.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">account_circle</span>
                      {listing.seller}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {listing.listed}
                    </div>
                  </div>

                  <div className="mb-6 mx-6 p-4 bg-[#1b1b1b] border border-[#2a2a2a]">
                    <div className="mb-2">
                      <p className="text-xs text-[#919191] mb-1">ORIGINAL PRICE</p>
                      <p className="text-sm text-[#c7c6c6] line-through">${listing.originalPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#919191] mb-1">CURRENT LISTING</p>
                      <div className="flex items-baseline justify-between">
                        <p className="text-2xl font-black text-white">
                          ${listing.listingPrice}
                        </p>
                        <span
                          className={`text-xs font-bold ${
                            isViolatingCeiling
                              ? 'text-[#d4632a]'
                              : priceChange > 0
                                ? 'text-[#d4632a]'
                                : priceChange < 0
                                  ? 'text-[#39ff14]'
                                  : 'text-[#919191]'
                          }`}
                        >
                          {priceChange > 0 ? '+' : ''}
                          {priceChangePercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {listing.isLive && listing.maxResalePrice && (
                    <div className="mb-4 mx-6 p-3 bg-[#39ff14]/5 border border-[#39ff14]/20">
                      <p className="text-xs text-[#919191] mb-1">ANTI-SCALP MAX PRICE</p>
                      <p className="font-bold text-[#39ff14]">${listing.maxResalePrice}</p>
                      {isViolatingCeiling && (
                        <p className="text-xs text-[#d4632a] mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">warning</span>
                          Above ceiling (will auto-reject on-chain)
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-auto px-6 pb-6">
                    <button
                      onClick={() => handleBuyClick(listing)}
                      className="w-full py-3 font-bold flex items-center justify-center gap-2 transition-all bg-white text-black hover:bg-[#39ff14] hover:shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                    >
                      <span className="material-symbols-outlined text-sm">swap_horiz</span>
                      BUY VIA EBUS
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && sortedListings.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-[#39ff14]/30 block mb-6">
              search
            </span>
            <h2 className="text-3xl font-bold text-white mb-4 font-headline">NO LISTINGS FOUND</h2>
            <p className="text-[#c7c6c6]">
              Try adjusting your filters to see more listings.
            </p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="border border-[#2a2a2a] p-8 bg-[#0e0e0e]">
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3 font-headline uppercase tracking-widest">
            <span className="text-[#39ff14]">shield_verified</span>
            Safe Trading with Anti-Scalp Protection
          </h3>
          <p className="text-[#c7c6c6] mb-4">
            Every transaction on <DualInline className="text-[#c7c6c6]" /> Marketplace is protected by smart contracts that enforce price
            boundaries. Sellers cannot list above the price ceiling, and buyers cannot undercut below the
            price floor.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#c7c6c6]">
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Automated price verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Transparent transaction history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Instant on-chain settlement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Real-time price enforcement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Multi-signature escrow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#39ff14] mt-1">✓</span>
              <span>Provenance verification</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Purchase Modal */}
      {purchaseModal.isOpen && purchaseModal.listing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <style>{`
            @keyframes settle-pulse {
              0%, 100% {
                opacity: 0.5;
              }
              50% {
                opacity: 1;
              }
            }

            @keyframes confetti-particle {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
              }
            }

            .settle-pulse {
              animation: settle-pulse 1.5s ease-in-out infinite;
            }

            .confetti {
              position: absolute;
              pointer-events: none;
            }

            .confetti-particle {
              animation: confetti-particle 2s ease-out forwards;
            }
          `}</style>

          <div className="max-w-2xl w-full border border-[#474747]/20 bg-[#131313] p-8 shadow-[0_0_60px_rgba(57,255,20,0.1)]">
            {purchaseModal.step === 'confirm' && (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-white mb-2 font-headline uppercase tracking-widest">Confirm Purchase</h2>
                  <p className="text-[#c7c6c6]">Review the details before purchasing</p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="p-6 border border-[#39ff14]/10 bg-[#39ff14]/5">
                    <h3 className="font-bold text-lg text-white mb-4">
                      {purchaseModal.listing.ticketName}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-[#919191] mb-1">EVENT</p>
                        <p className="font-semibold text-white">
                          {purchaseModal.listing.eventName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#919191] mb-1">DATE</p>
                        <p className="font-semibold text-white">
                          {new Date(purchaseModal.listing.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#919191] mb-1">TIER</p>
                        <p className="font-semibold text-[#d4632a]">
                          {purchaseModal.listing.tier}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#919191] mb-1">SELLER</p>
                        <p className="font-mono text-[#39ff14] text-xs">
                          {purchaseModal.listing.seller}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#1b1b1b] border border-[#2a2a2a]">
                      <p className="text-xs text-[#919191] mb-1">ORIGINAL PRICE</p>
                      <p className="text-2xl font-black text-[#c7c6c6] line-through">
                        ${purchaseModal.listing.originalPrice}
                      </p>
                    </div>

                    <div className="p-4 bg-[#39ff14]/10 border border-[#39ff14]/20">
                      <p className="text-xs text-[#919191] mb-1">PURCHASE PRICE</p>
                      <p className="text-2xl font-black text-[#39ff14]">
                        ${purchaseModal.listing.listingPrice}
                      </p>
                    </div>
                  </div>

                  {purchaseModal.listing.maxResalePrice && (
                    <div className="p-4 bg-[#39ff14]/5 border border-[#39ff14]/20">
                      <p className="text-sm text-[#c7c6c6]">
                        <span className="text-[#39ff14] font-bold">ANTI-SCALP PROTECTED:</span> Max
                        resale price is ${purchaseModal.listing.maxResalePrice}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closePurchaseModal}
                    className="flex-1 py-3 font-bold border border-white/20 text-white hover:border-white/40 transition-colors font-headline uppercase tracking-widest"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleExecutePurchase}
                    className="flex-1 py-3 font-bold bg-[#39ff14] text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all flex items-center justify-center gap-2 font-headline uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined">flash_on</span>
                    EXECUTE ON-CHAIN PURCHASE
                  </button>
                </div>
              </>
            )}

            {purchaseModal.step === 'processing' && (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-black text-white mb-2 font-headline uppercase tracking-widest">Processing Purchase</h2>
                  <p className="text-[#c7c6c6]">Your transaction is being settled on-chain</p>
                </div>

                <div className="space-y-6 mb-8">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-4 bg-[#1b1b1b] border border-[#39ff14]/20">
                    <div className="settle-pulse w-8 h-8 bg-[#39ff14]/30 border border-[#39ff14] flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-[#39ff14]/30 border-t-[#39ff14] animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Initiating transaction...</p>
                      <p className="text-sm text-[#c7c6c6]">Preparing blockchain settlement</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 p-4 bg-[#1b1b1b] border border-[#d4632a]/20">
                    <div className="settle-pulse w-8 h-8 bg-[#d4632a]/30 border border-[#d4632a] flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-[#d4632a]/30 border-t-[#d4632a] animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Settling on <DualInline className="text-white" /> Network...</p>
                      <p className="text-sm text-[#c7c6c6]">Executing smart contract</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 p-4 bg-[#1b1b1b] border border-[#39ff14]/20">
                    <div className="settle-pulse w-8 h-8 bg-[#39ff14]/20 border border-[#39ff14]/60 flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-[#39ff14]/30 border-t-[#39ff14] animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Recording on Blockscout...</p>
                      <p className="text-sm text-[#c7c6c6]">Finalizing transaction</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4 p-4 bg-[#1b1b1b] border border-[#d4632a]/20">
                    <div className="settle-pulse w-8 h-8 bg-[#d4632a]/20 border border-[#d4632a]/60 flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 border-2 border-[#d4632a]/30 border-t-[#d4632a] animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Transferring ownership...</p>
                      <p className="text-sm text-[#c7c6c6]">Updating ticket ownership</p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-[#c7c6c6]">
                  Do not refresh or close this page
                </div>
              </>
            )}

            {purchaseModal.step === 'success' && (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[#39ff14]/15 border-2 border-[#39ff14] mb-4">
                    <span className="text-5xl text-[#39ff14]">✓</span>
                  </div>
                  <h2 className="text-3xl font-black text-[#39ff14] mb-2 font-headline uppercase tracking-widest">PURCHASE COMPLETE</h2>
                  <p className="text-[#c7c6c6]">Your ticket has been transferred to your wallet</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-[#1b1b1b] border border-[#2a2a2a]">
                    <p className="text-xs text-[#919191] mb-1">TRANSACTION HASH</p>
                    <p className="font-mono text-[#39ff14] text-sm break-all">
                      {purchaseModal.transactionHash}
                    </p>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#2a2a2a]">
                    <p className="text-xs text-[#919191] mb-1">TICKET</p>
                    <p className="font-bold text-white">{purchaseModal.listing.ticketName}</p>
                  </div>

                  <div className="p-4 bg-[#39ff14]/10 border border-[#39ff14]/20">
                    <p className="text-xs text-[#919191] mb-1">PAID</p>
                    <p className="font-bold text-[#39ff14] text-lg">
                      ${purchaseModal.listing.listingPrice}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href={`https://blockscout.dual.network/tx/${purchaseModal.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 font-bold border border-[#39ff14]/50 text-[#39ff14] hover:border-[#39ff14] hover:bg-[#39ff14]/10 transition-all flex items-center justify-center gap-2 font-headline uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined">open_in_new</span>
                    View on Blockscout
                  </a>

                  <Link
                    href="/tickets/my-tickets"
                    className="flex-1 py-3 font-bold bg-[#39ff14] text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all flex items-center justify-center gap-2 font-headline uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined">card_membership</span>
                    View My Ticket
                  </Link>
                </div>
              </>
            )}

            {purchaseModal.step === 'error' && (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[#d4632a]/20 border-2 border-[#d4632a] mb-4">
                    <span className="text-5xl text-[#d4632a]">✗</span>
                  </div>
                  <h2 className="text-3xl font-black text-[#d4632a] mb-2 font-headline uppercase tracking-widest">PURCHASE FAILED</h2>
                  <p className="text-[#c7c6c6]">Something went wrong with your transaction</p>
                </div>

                <div className="mb-8 p-4 bg-[#d4632a]/10 border border-[#d4632a]/30">
                  <p className="text-sm text-[#d4632a]">{purchaseModal.error || 'Unknown error'}</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closePurchaseModal}
                    className="flex-1 py-3 font-bold border border-white/20 text-white hover:border-white/40 transition-colors font-headline uppercase tracking-widest"
                  >
                    Close
                  </button>

                  <button
                    onClick={() =>
                      setPurchaseModal((prev) => ({ ...prev, step: 'confirm', error: undefined }))
                    }
                    className="flex-1 py-3 font-bold bg-[#39ff14]/20 border border-[#39ff14]/30 text-[#39ff14] hover:bg-[#39ff14]/40 transition-all font-headline uppercase tracking-widest"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
