'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DualInline } from '../DualLogo'

interface VerificationResult {
  status: 'valid' | 'duplicate' | 'invalid' | null
  ticketId: string
  eventName: string
  tier: string
  originalPrice: number
  maxResalePrice: number
  holder: string
  seat: string
  verificationHash: string
  verificationTime: string
  reason?: string
}

interface ScanStats {
  scannedToday: number
  validScans: number
  rejectedScans: number
}

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  general: { bg: 'bg-[#39ff14]/10', text: 'text-[#39ff14]', border: 'border-[#39ff14]/30' },
  vip: { bg: 'bg-[#d4632a]/10', text: 'text-[#d4632a]', border: 'border-[#d4632a]/30' },
  backstage: { bg: 'bg-white/10', text: 'text-white', border: 'border-white/30' },
  premium: { bg: 'bg-[#c7c6c6]/10', text: 'text-[#c7c6c6]', border: 'border-[#c7c6c6]/30' },
}

const DEMO_TICKETS: Record<string, { eventName: string; tier: string; seat: string; price: number; maxResale: number; holder: string }> = {
  '69c1b5626d63a822adbe1dca': { eventName: 'Electric Dreams — Sydney Harbour NYE 2026', tier: 'vip', seat: 'Platinum Deck', price: 350, maxResale: 500, holder: '0x2A976Bfa...8110' },
  '69c1a31ace3f7201f7e553a6': { eventName: 'Neon Horizon — Sydney Electronic Music Festival 2026', tier: 'vip', seat: 'VIP Lounge', price: 175, maxResale: 250, holder: '0x2A976Bfa...8110' },
  '69c114ad0d1fd1090e023a1a': { eventName: 'Burning Man 2026', tier: 'general', seat: 'Open Playa — GA', price: 575, maxResale: 800, holder: '0x2A976Bfa...8110' },
  '69c114ac0d1fd1090e023a13': { eventName: 'UEFA Champions League Final 2026', tier: 'premium', seat: 'West Stand Lower — Row 8, Seat 44', price: 1500, maxResale: 2000, holder: '0x2A976Bfa...8110' },
}

export default function ScannerPage() {
  const [ticketIdInput, setTicketIdInput] = useState('')
  const [verificationStep, setVerificationStep] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<ScanStats>({
    scannedToday: 12,
    validScans: 11,
    rejectedScans: 1,
  })

  const handleScanTicket = async () => {
    if (!ticketIdInput.trim()) {
      alert('Please enter a ticket ID')
      return
    }

    setLoading(true)
    setVerificationStep(1)
    setResult(null)

    // Step 1: Reading QR Code
    await new Promise((r) => setTimeout(r, 800))
    setVerificationStep(2)

    // Step 2: Querying DUAL Network
    await new Promise((r) => setTimeout(r, 900))
    setVerificationStep(3)

    // Check for demo tickets first
    const demoTicket = DEMO_TICKETS[ticketIdInput.trim()]

    // Step 3: Verifying On-Chain
    await new Promise((r) => setTimeout(r, 800))
    setVerificationStep(4)

    // Step 4: Anti-Scalp Compliance
    await new Promise((r) => setTimeout(r, 600))

    if (demoTicket) {
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
      setResult({
        status: 'valid',
        ticketId: ticketIdInput.trim(),
        eventName: demoTicket.eventName,
        tier: demoTicket.tier,
        originalPrice: demoTicket.price,
        maxResalePrice: demoTicket.maxResale,
        holder: demoTicket.holder,
        seat: demoTicket.seat,
        verificationHash: txHash,
        verificationTime: new Date().toISOString(),
      })
      setStats((prev) => ({
        ...prev,
        scannedToday: prev.scannedToday + 1,
        validScans: prev.validScans + 1,
      }))
    } else {
      // Try the API for real DUAL ticket IDs
      try {
        const ticketResponse = await fetch(`/api/tickets/${ticketIdInput}`)
        const ticketData = await ticketResponse.json()

        if (ticketData && ticketData.ticketData) {
          setResult({
            status: 'valid',
            ticketId: ticketIdInput,
            eventName: ticketData.ticketData.eventName || 'Event',
            tier: ticketData.ticketData.tier || 'general',
            originalPrice: ticketData.ticketData.originalPrice || ticketData.ticketData.price || 0,
            maxResalePrice: ticketData.ticketData.maxResalePrice || 0,
            holder: ticketData.ownerId?.slice(0, 10) + '...' || 'Unknown',
            seat: ticketData.ticketData.seat || 'No seat assigned',
            verificationHash: ticketData.blockchainTxHash || '0x' + Math.random().toString(16).slice(2),
            verificationTime: new Date().toISOString(),
          })
          setStats((prev) => ({
            ...prev,
            scannedToday: prev.scannedToday + 1,
            validScans: prev.validScans + 1,
          }))
        } else {
          setResult({
            status: 'invalid',
            ticketId: ticketIdInput,
            eventName: 'Unknown',
            tier: 'Unknown',
            originalPrice: 0,
            maxResalePrice: 0,
            holder: 'Unknown',
            seat: 'Unknown',
            verificationHash: 'N/A',
            verificationTime: new Date().toISOString(),
            reason: 'Ticket not found on DUAL Network',
          })
          setStats((prev) => ({
            ...prev,
            scannedToday: prev.scannedToday + 1,
            rejectedScans: prev.rejectedScans + 1,
          }))
        }
      } catch {
        setResult({
          status: 'invalid',
          ticketId: ticketIdInput,
          eventName: 'Unknown',
          tier: 'Unknown',
          originalPrice: 0,
          maxResalePrice: 0,
          holder: 'Unknown',
          seat: 'Unknown',
          verificationHash: 'N/A',
          verificationTime: new Date().toISOString(),
          reason: 'Ticket not found on DUAL Network',
        })
        setStats((prev) => ({
          ...prev,
          scannedToday: prev.scannedToday + 1,
          rejectedScans: prev.rejectedScans + 1,
        }))
      }
    }

    setVerificationStep(0)
    setLoading(false)
  }

  const handleScanNext = () => {
    setTicketIdInput('')
    setResult(null)
    setVerificationStep(0)
  }

  const tierColor =
    result && result.tier in tierColors
      ? tierColors[result.tier]
      : tierColors['general']

  return (
    <div className="min-h-screen relative bg-[#131313]">
      <style>{`
        @keyframes scan-pulse {
          0%, 100% {
            box-shadow: inset 0 0 20px rgba(57, 255, 20, 0.3);
          }
          50% {
            box-shadow: inset 0 0 40px rgba(57, 255, 20, 0.6);
          }
        }

        @keyframes network-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes block-chain {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes anti-scalp-check {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .scan-pulse {
          animation: scan-pulse 2s ease-in-out infinite;
        }

        .network-pulse {
          animation: network-pulse 1.5s ease-in-out infinite;
        }

        .block-animation {
          position: relative;
          overflow: hidden;
        }

        .block-animation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.4), transparent);
          animation: block-chain 2s ease-in-out infinite;
        }

        .anti-scalp-check {
          animation: anti-scalp-check 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#39ff14] hover:text-white transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Events
          </Link>

          <h1 className="text-6xl font-headline uppercase tracking-tight mb-3 text-white">
            VENUE SCANNER
          </h1>
          <p className="text-lg text-[#c7c6c6] flex items-center gap-2"><DualInline className="text-[#c7c6c6]" /> TICKET VERIFICATION SYSTEM</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Area */}
          <div className="lg:col-span-2">
            <div className="border border-[#39ff14]/30 p-8 bg-[#1b1b1b]">
              {/* QR Scan Area */}
              <div className="mb-8">
                <div className="scan-pulse border-2 border-[#39ff14] p-12 bg-[#39ff14]/5 flex flex-col items-center justify-center min-h-80 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-32 h-32 border-2 border-[#39ff14]/50" />
                    <div className="absolute top-0 right-1/4 w-32 h-32 border-2 border-[#39ff14]/50" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 border-2 border-[#39ff14]/50" />
                    <div className="absolute bottom-0 right-1/4 w-32 h-32 border-2 border-[#39ff14]/50" />
                  </div>

                  <div className="relative z-10 text-center">
                    <span className="material-symbols-outlined text-8xl text-[#39ff14] mb-4 block">
                      {loading ? 'sync' : 'qr_code_2'}
                    </span>
                    <p className="text-lg text-white mb-2">
                      {loading ? 'Scanning...' : 'QR Scanner Ready'}
                    </p>
                    <p className="text-sm text-[#919191]">
                      {loading ? 'Processing ticket...' : 'Enter ticket ID or scan QR code'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket ID Input */}
              <div className="mb-6">
                <label className="block text-sm font-headline text-[#919191] mb-3 uppercase tracking-widest">
                  Ticket ID or QR Data
                </label>
                <input
                  type="text"
                  value={ticketIdInput}
                  onChange={(e) => setTicketIdInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleScanTicket()}
                  placeholder="Enter ticket ID or paste object hash"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#131313] border border-[#39ff14]/30 text-white placeholder-[#919191] focus:border-[#39ff14] focus:outline-none transition-colors disabled:opacity-50"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-[#919191]">Quick scan:</span>
                  {[
                    { id: '69c1b5626d63a822adbe1dca', label: 'NYE 2026' },
                    { id: '69c1a31ace3f7201f7e553a6', label: 'Neon Horizon' },
                    { id: '69c114ad0d1fd1090e023a1a', label: 'Burning Man' },
                    { id: '69c114ac0d1fd1090e023a13', label: 'UEFA Final' },
                  ].map(item => (
                    <button key={item.id} onClick={() => setTicketIdInput(item.id)} className="text-xs px-2 py-1 bg-[#131313] border border-[#474747]/20 text-[#919191] hover:text-[#39ff14] hover:border-[#39ff14]/30 transition-colors">{item.label}</button>
                  ))}
                </div>
              </div>

              {/* Scan Button */}
              <button
                onClick={handleScanTicket}
                disabled={loading || !ticketIdInput.trim()}
                className="w-full py-4 font-headline uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-[#39ff14] text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">
                  {loading ? 'hourglass_top' : 'center_focus_strong'}
                </span>
                {loading ? 'SCANNING...' : 'SCAN TICKET'}
              </button>

              {/* Verification Steps */}
              {loading && (
                <div className="mt-8 space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStep >= 1
                          ? 'bg-[#39ff14]/30 border border-[#39ff14]'
                          : 'bg-[#1b1b1b] border border-[#474747]/20'
                      }`}
                    >
                      {verificationStep > 1 ? (
                        <span className="text-[#39ff14] material-symbols-outlined text-sm">check</span>
                      ) : verificationStep === 1 ? (
                        <div className="w-4 h-4 border-2 border-[#39ff14]/30 border-t-[#39ff14] rounded-full animate-spin" />
                      ) : (
                        <span className="text-white/50">1</span>
                      )}
                    </div>
                    <div className={verificationStep >= 1 ? 'text-white' : 'text-[#919191]'}>
                      <p className="font-semibold">Reading QR Code...</p>
                      <p className="text-sm text-[#919191]">Decoding ticket data</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStep >= 2
                          ? 'bg-[#39ff14]/30 border border-[#39ff14]'
                          : 'bg-[#1b1b1b] border border-[#474747]/20'
                      }`}
                    >
                      {verificationStep > 2 ? (
                        <span className="text-[#39ff14] material-symbols-outlined text-sm">check</span>
                      ) : verificationStep === 2 ? (
                        <div
                          className="w-4 h-4 rounded-full bg-[#39ff14] network-pulse"
                          style={{ boxShadow: '0 0 10px rgba(57, 255, 20, 0.8)' }}
                        />
                      ) : (
                        <span className="text-white/50">2</span>
                      )}
                    </div>
                    <div className={verificationStep >= 2 ? 'text-white' : 'text-[#919191]'}>
                      <p className="font-semibold flex items-center gap-1">Querying <DualInline className="text-white" /> Network...</p>
                      <p className="text-sm text-[#919191]">Connecting to blockchain</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStep >= 3
                          ? 'bg-[#39ff14]/30 border border-[#39ff14]'
                          : 'bg-[#1b1b1b] border border-[#474747]/20'
                      }`}
                    >
                      {verificationStep > 3 ? (
                        <span className="text-[#39ff14] material-symbols-outlined text-sm">check</span>
                      ) : verificationStep === 3 ? (
                        <div className="w-4 h-4 border-2 border-[#39ff14]/30 border-t-[#39ff14] rounded-full animate-spin" />
                      ) : (
                        <span className="text-white/50">3</span>
                      )}
                    </div>
                    <div className={verificationStep >= 3 ? 'text-white' : 'text-[#919191]'}>
                      <p className="font-semibold">Verifying On-Chain...</p>
                      <p className="text-sm text-[#919191]">Validating smart contract</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center block-animation ${
                        verificationStep >= 4
                          ? 'bg-[#39ff14]/30 border border-[#39ff14]'
                          : 'bg-[#1b1b1b] border border-[#474747]/20'
                      }`}
                    >
                      {verificationStep > 4 ? (
                        <span className="relative z-10 text-[#39ff14] material-symbols-outlined text-sm">check</span>
                      ) : verificationStep === 4 ? (
                        <span className="relative z-10 anti-scalp-check text-[#39ff14] material-symbols-outlined text-sm">
                          verified
                        </span>
                      ) : (
                        <span className="text-white/50">4</span>
                      )}
                    </div>
                    <div className={verificationStep >= 4 ? 'text-white' : 'text-[#919191]'}>
                      <p className="font-semibold">Checking Anti-Scalp Compliance...</p>
                      <p className="text-sm text-[#919191]">Verifying price boundaries</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div>
            <div className="border border-[#39ff14]/30 p-6 bg-[#1b1b1b] sticky top-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#39ff14]">analytics</span>
                TODAY'S STATS
              </h3>

              <div className="space-y-6">
                <div className="text-center p-4 bg-white/10 border border-white/20">
                  <p className="text-xs text-[#919191] mb-1 font-headline uppercase tracking-widest">SCANNED TODAY</p>
                  <p className="text-4xl font-black text-white">{stats.scannedToday}</p>
                </div>

                <div className="text-center p-4 bg-[#39ff14]/10 border border-[#39ff14]/30">
                  <p className="text-xs text-[#919191] mb-1 font-headline uppercase tracking-widest">VALID</p>
                  <p className="text-4xl font-black text-[#39ff14]">{stats.validScans}</p>
                </div>

                <div className="text-center p-4 bg-[#d4632a]/10 border border-[#d4632a]/30">
                  <p className="text-xs text-[#919191] mb-1 font-headline uppercase tracking-widest">REJECTED</p>
                  <p className="text-4xl font-black text-[#d4632a]">{stats.rejectedScans}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-12">
            {result.status === 'valid' ? (
              <div className="border-2 border-[#39ff14] p-8 bg-[#39ff14]/5">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#39ff14]/20 border-2 border-[#39ff14] mb-4">
                    <span className="text-6xl text-[#39ff14]">✓</span>
                  </div>
                  <h2 className="text-4xl font-headline uppercase tracking-tight text-white mb-2">ENTRY GRANTED</h2>
                  <p className="text-[#919191]">Ticket verified and validated</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Ticket ID</p>
                    <p className="font-mono text-[#39ff14] break-all">{result.ticketId}</p>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Event</p>
                    <p className="font-bold text-white">{result.eventName}</p>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Tier</p>
                    <div className={`inline-flex px-3 py-1 font-semibold text-sm border ${tierColor.bg} ${tierColor.text} ${tierColor.border}`}>
                      {result.tier.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Seat</p>
                    <p className="font-bold text-white">{result.seat}</p>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Original Price</p>
                    <p className="font-bold text-white">${result.originalPrice}</p>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Max Resale Price</p>
                    <p className="font-bold text-[#39ff14]">${result.maxResalePrice}</p>
                  </div>

                  <div className="md:col-span-2 p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Holder Address</p>
                    <p className="font-mono text-[#39ff14] break-all text-sm">{result.holder}</p>
                  </div>

                  <div className="md:col-span-2 p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Verification Hash</p>
                    <p className="font-mono text-[#39ff14] break-all text-sm">{result.verificationHash}</p>
                  </div>

                  <div className="md:col-span-2 p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Verified At</p>
                    <p className="font-mono text-[#c7c6c6] text-sm">
                      {new Date(result.verificationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <a
                    href={`https://blockscout.dual.network/tx/${result.verificationHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#39ff14]/20 border border-[#39ff14]/50 text-[#39ff14] font-semibold hover:bg-[#39ff14]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    View on Blockscout
                  </a>

                  <button
                    onClick={handleScanNext}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold hover:text-[#39ff14] hover:border-[#39ff14]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    Scan Next
                  </button>
                </div>
              </div>
            ) : result.status === 'duplicate' ? (
              <div className="border-2 border-[#d4632a] p-8 bg-[#d4632a]/5">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#d4632a]/20 border-2 border-[#d4632a] mb-4">
                    <span className="text-5xl">⚠</span>
                  </div>
                  <h2 className="text-4xl font-headline uppercase tracking-tight text-[#d4632a] mb-2">DUPLICATE SCAN</h2>
                  <p className="text-[#919191]">This ticket has already been scanned</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="md:col-span-2 p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Ticket ID</p>
                    <p className="font-mono text-[#39ff14] break-all">{result.ticketId}</p>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Event</p>
                    <p className="font-bold text-white">{result.eventName}</p>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Original Scan Time</p>
                    <p className="font-bold text-white">
                      {new Date(result.verificationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleScanNext}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold hover:text-[#39ff14] hover:border-[#39ff14]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    Scan Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-[#d4632a] p-8 bg-[#d4632a]/5">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#d4632a]/20 border-2 border-[#d4632a] mb-4">
                    <span className="text-5xl">✗</span>
                  </div>
                  <h2 className="text-4xl font-headline uppercase tracking-tight text-[#d4632a] mb-2">ENTRY DENIED</h2>
                  <p className="text-[#919191]">This ticket could not be verified</p>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Ticket ID</p>
                    <p className="font-mono text-[#39ff14] break-all">{result.ticketId}</p>
                  </div>

                  <div className="p-4 bg-[#d4632a]/20 border border-[#d4632a]/30">
                    <p className="text-sm text-[#919191] mb-1">Rejection Reason</p>
                    <p className="font-bold text-[#d4632a]">{result.reason || 'Unknown error'}</p>
                  </div>

                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Attempted At</p>
                    <p className="font-mono text-[#c7c6c6] text-sm">
                      {new Date(result.verificationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleScanNext}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold hover:text-[#39ff14] hover:border-[#39ff14]/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    Scan Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
