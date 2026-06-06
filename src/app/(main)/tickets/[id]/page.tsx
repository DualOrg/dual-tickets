'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { DualInline } from '../../DualLogo'

interface TicketTier {
  id: string
  name: string
  price: number
  description: string
  perks: string[]
  remaining: number
  total: number
  tier: 'standard' | 'vip' | 'premium'
}

interface Event {
  id: string
  name: string
  date: string
  time: string
  venue: string
  description: string
  imageGradient: string
  imageUrl?: string
  tiers: TicketTier[]
  priceFloor: number
  priceCeiling: number
  isLive?: boolean
  blockchainTxHash?: string
  explorerUrl?: string
  category?: string
}

// Event images keyed by mock event ID
const EVENT_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
  '2': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
  '3': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80',
  '4': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80',
  '5': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  '6': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
  '7': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
  '8': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80',
  '9': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
  '10': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
}

const MOCK_EVENTS: Record<string, Event> = {
  '1': {
    id: '1',
    name: 'Neon Dreams Festival 2026',
    date: '2026-04-15',
    time: '20:00 - 02:00',
    venue: 'San Francisco Bay Area',
    description:
      "Experience the most immersive electronic music festival of the year. Featuring world-renowned DJs, AI-assisted visual performances, and holographic stage setups. This is not just a concert—it's a journey through digital enlightenment.",
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      {
        id: 'ga',
        name: 'General Admission',
        price: 89,
        description: 'Access to all stages and zones',
        perks: ['Main stage access', 'All performances', 'Digital badge collectible'],
        remaining: 240,
        total: 300,
        tier: 'standard',
      },
      {
        id: 'vip',
        name: 'VIP Experience',
        price: 199,
        description: 'Premium access with lounge privileges',
        perks: [
          'VIP Lounge access with premium seating',
          'Complimentary refreshments',
          'Exclusive VIP-only stage view',
          'VIP parking pass',
          'Limited edition merch pack',
        ],
        remaining: 80,
        total: 120,
        tier: 'vip',
      },
      {
        id: 'backstage',
        name: 'Backstage Pass',
        price: 299,
        description: 'The ultimate experience',
        perks: [
          'Exclusive Meet & Greet with headliners',
          'VIP lounge + backstage access',
          'Premium seating all areas',
          'Complimentary VIP dinner',
          'Exclusive limited edition merch collection',
          'Digital collectible hologram NFT',
        ],
        remaining: 20,
        total: 80,
        tier: 'premium',
      },
    ],
    priceFloor: 89,
    priceCeiling: 299,
  },
  '2': {
    id: '2',
    name: 'Virtual Reality Concert Series',
    date: '2026-05-22',
    time: '19:00 - 23:30',
    venue: 'Los Angeles Convention Center',
    description:
      'Immerse yourself in a groundbreaking VR concert experience. Using cutting-edge virtual reality technology, experience your favorite artists in impossible venues—from zero gravity to underwater stages.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      {
        id: 'vr-basic',
        name: 'Standard VR Experience',
        price: 65,
        description: 'Basic VR access',
        perks: ['VR headset rental', 'Standard quality stream', 'Access to 5 immersive stages'],
        remaining: 156,
        total: 300,
        tier: 'standard',
      },
      {
        id: 'vr-pro',
        name: 'Pro VR Experience',
        price: 149,
        description: 'Enhanced experience with haptic feedback',
        perks: ['VR headset + haptic suit', '4K immersive quality', 'All stages + exclusive areas', 'Post-concert digital replay (7 days)'],
        remaining: 35,
        total: 60,
        tier: 'vip',
      },
      {
        id: 'vr-elite',
        name: 'Elite Creator Pass',
        price: 199,
        description: 'Creator-exclusive tier',
        perks: [
          'Premium haptic suit + latest VR tech',
          '8K immersive quality',
          'Private creator lounge',
          'Lifetime digital replay access',
          'Creator revenue share option',
          'Exclusive NFT creator pass',
        ],
        remaining: 8,
        total: 40,
        tier: 'premium',
      },
    ],
    priceFloor: 65,
    priceCeiling: 199,
  },
  '3': {
    id: '3',
    name: 'Crypto Cup 2026 - Final Match',
    date: '2026-06-10',
    time: '14:00 - 18:00',
    venue: 'MetaStadium NYC',
    description:
      'The championship final of the blockchain gaming league. Watch AI-enhanced players compete in unprecedented digital tournaments with real prize pools. Revolutionary gaming at its finest.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      {
        id: 'general',
        name: 'General Admission',
        price: 149,
        description: 'Standard stadium seating',
        perks: ['General stadium seating', 'Live match commentary', 'Access to highlights reel'],
        remaining: 1250,
        total: 1500,
        tier: 'standard',
      },
      {
        id: 'premium-seating',
        name: 'Premium Seating',
        price: 449,
        description: 'Best views in the stadium',
        perks: [
          'Premium midfield seating',
          'Exclusive stadium club lounge',
          'Complimentary premium concessions',
          'Pro match analysis download',
        ],
        remaining: 200,
        total: 300,
        tier: 'vip',
      },
      {
        id: 'suite',
        name: 'Executive Suite',
        price: 799,
        description: 'The ultimate sports experience',
        perks: [
          'Private VIP suite (12 seats)',
          'Premium catering & bar service',
          'Player autograph meet & greet',
          "Champions' exclusive after-party",
          'Limited edition trophy replica NFT',
        ],
        remaining: 15,
        total: 50,
        tier: 'premium',
      },
    ],
    priceFloor: 149,
    priceCeiling: 799,
  },
  '4': {
    id: '4',
    name: 'The Holographic Opera',
    date: '2026-07-08',
    time: '19:30 - 22:00',
    venue: 'Miami Art Deco Theater',
    description:
      'A revolutionary fusion of classical opera and cutting-edge holographic technology. Watch legendary performers brought to life through quantum computing projection systems in a historic Miami venue.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      {
        id: 'orchestra',
        name: 'Orchestra Level',
        price: 49,
        description: 'Balcony seating',
        perks: ['Balcony seating', 'Digital program guide', 'Access to museum (pre-show)'],
        remaining: 89,
        total: 150,
        tier: 'standard',
      },
      {
        id: 'mezzanine',
        name: 'Mezzanine VIP',
        price: 149,
        description: 'Premium mid-level seating',
        perks: [
          'Mezzanine premium seating',
          'Pre-show champagne reception',
          'Exclusive artist background film',
          'Limited edition program book',
        ],
        remaining: 35,
        total: 80,
        tier: 'vip',
      },
      {
        id: 'main-floor',
        name: 'Main Floor Exclusive',
        price: 249,
        description: 'Best seats in the theater',
        perks: [
          'Front row main floor seating',
          'Post-show meet the artists',
          'Fine dining experience included',
          'Exclusive hologram capture NFT',
          'Lifetime theater membership',
        ],
        remaining: 12,
        total: 70,
        tier: 'premium',
      },
    ],
    priceFloor: 49,
    priceCeiling: 249,
  },
  '5': {
    id: '5',
    name: 'Web3 Summit 2026',
    date: '2026-08-03',
    time: '09:00 - 18:00',
    venue: 'Denver Convention Center',
    description: 'The premier Web3 conference bringing together builders, investors, and visionaries. Three days of keynotes, workshops, and networking across decentralized finance, NFTs, DAOs, and the future of the internet.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      { id: 'ga', name: 'General Admission', price: 299, description: 'Full conference access', perks: ['All keynotes and panels', 'Exhibition hall access', 'Digital swag bag', 'Conference recordings'], remaining: 450, total: 700, tier: 'standard' },
      { id: 'vip', name: 'VIP Access', price: 699, description: 'Premium conference experience', perks: ['Priority seating at all talks', 'VIP networking lounge', 'Exclusive workshop sessions', 'Speaker meet & greet', 'Premium swag collection'], remaining: 120, total: 200, tier: 'vip' },
      { id: 'whale', name: 'Whale Pass', price: 999, description: 'The ultimate summit experience', perks: ['Front row reserved seating', 'Private dinner with speakers', 'Lifetime conference access', 'DAO governance token airdrop', 'Executive suite access', 'Helicopter transfer'], remaining: 18, total: 100, tier: 'premium' },
    ],
    priceFloor: 299,
    priceCeiling: 999,
  },
  '6': {
    id: '6',
    name: 'Cyberpunk Live: Electric Revolution',
    date: '2026-04-28',
    time: '21:00 - 03:00',
    venue: 'Seattle Paramount Theatre',
    description: 'An electrifying live performance blending cyberpunk aesthetics with cutting-edge electronic music. Laser arrays, holographic performers, and neural-reactive lighting create an unforgettable sensory experience.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      { id: 'floor', name: 'Standing Floor', price: 79, description: 'General standing area', perks: ['Floor standing access', 'LED wristband', 'Digital commemorative poster'], remaining: 223, total: 350, tier: 'standard' },
      { id: 'balcony-vip', name: 'Balcony VIP', price: 179, description: 'Elevated VIP experience', perks: ['Reserved balcony seating', 'VIP bar with 2 drinks included', 'Early entry (1 hour)', 'Exclusive merch access'], remaining: 55, total: 100, tier: 'vip' },
      { id: 'backstage', name: 'Backstage All-Access', price: 249, description: 'The complete backstage experience', perks: ['Full backstage access', 'Meet the performers', 'Sound check viewing', 'Signed limited edition vinyl', 'After-party invite', 'Exclusive NFT wearable'], remaining: 8, total: 50, tier: 'premium' },
    ],
    priceFloor: 79,
    priceCeiling: 249,
  },
  '7': {
    id: '7',
    name: 'AI vs Humans: Esports Championship',
    date: '2026-05-14',
    time: '12:00 - 20:00',
    venue: 'Tokyo International Center',
    description: 'Watch the world\'s best gamers face off against advanced AI opponents in the ultimate test of skill and strategy. Featuring multiple game titles, live commentary, and a $5M prize pool.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      { id: 'spectator', name: 'Spectator Pass', price: 39, description: 'Standard arena seating', perks: ['Arena seating', 'Live match commentary', 'Access to fan zone', 'Digital match replays'], remaining: 567, total: 800, tier: 'standard' },
      { id: 'premium', name: 'Premium Arena', price: 129, description: 'Close to the action', perks: ['Front section seating', 'Pro player lounge access', 'Exclusive stats dashboard', 'Signed team jerseys raffle'], remaining: 80, total: 150, tier: 'vip' },
      { id: 'champions', name: 'Champions Box', price: 199, description: 'The ultimate esports experience', perks: ['Private viewing suite', 'Pro player meet & greet', 'Championship trophy photo op', 'Exclusive in-game items', 'Post-match celebration access'], remaining: 12, total: 50, tier: 'premium' },
    ],
    priceFloor: 39,
    priceCeiling: 199,
  },
  '8': {
    id: '8',
    name: 'The Digital Canvas: Immersive Art Experience',
    date: '2026-06-30',
    time: '10:00 - 21:00',
    venue: 'London National Gallery (Web3 Wing)',
    description: 'Step inside art like never before. This immersive exhibition transforms classic and contemporary masterpieces into room-scale interactive experiences using projection mapping, spatial audio, and AR technology.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      { id: 'timed', name: 'Timed Entry', price: 69, description: 'Standard 2-hour time slot', perks: ['2-hour timed entry', 'All gallery rooms', 'AR companion app', 'Digital art prints (3)'], remaining: 134, total: 250, tier: 'standard' },
      { id: 'flex', name: 'Flex Pass', price: 129, description: 'All-day unlimited access', perks: ['Unlimited same-day access', 'Skip-the-line entry', 'Guided audio tour', 'Physical art book', 'Artist Q&A session'], remaining: 45, total: 100, tier: 'vip' },
      { id: 'patron', name: 'Patron Experience', price: 199, description: 'Curated private experience', perks: ['Private after-hours viewing', 'Champagne reception with curator', 'Signed limited edition print', 'Annual gallery membership', 'NFT art collection airdrop'], remaining: 10, total: 50, tier: 'premium' },
    ],
    priceFloor: 69,
    priceCeiling: 199,
  },
  '9': {
    id: '9',
    name: 'Future Tech Innovators Summit',
    date: '2026-09-12',
    time: '08:30 - 17:30',
    venue: 'Berlin Tech Hub',
    description: 'Europe\'s leading technology conference exploring AI, quantum computing, robotics, and space tech. Featuring 100+ speakers, hands-on demos, startup pitch competitions, and an innovation showcase.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      { id: 'standard', name: 'Standard Pass', price: 199, description: 'Full conference access', perks: ['All sessions and demos', 'Innovation hall access', 'Networking app', 'Conference proceedings'], remaining: 320, total: 500, tier: 'standard' },
      { id: 'pro', name: 'Pro Innovator', price: 449, description: 'Enhanced networking and workshops', perks: ['Reserved workshop seating', 'Innovator networking dinner', 'Startup pitch front row', 'Pro badge with priority access', '1-on-1 mentor session'], remaining: 85, total: 200, tier: 'vip' },
      { id: 'founder', name: 'Founder Circle', price: 599, description: 'Executive-level access', perks: ['Private founder lounge', 'Investor speed dating', 'VIP dinner with keynote speakers', 'Media interview opportunity', 'Lifetime alumni network access', 'Custom branded NFT credential'], remaining: 25, total: 100, tier: 'premium' },
    ],
    priceFloor: 199,
    priceCeiling: 599,
  },
  '10': {
    id: '10',
    name: 'Synth Wave Night: Retrowave Festival',
    date: '2026-07-19',
    time: '20:00 - 04:00',
    venue: 'Chicago Navy Pier',
    description: 'A neon-drenched celebration of retrowave and synthwave culture. DJs, live bands, retro arcade zone, DeLorean car show, and a lakefront laser light finale. The 80s never looked so futuristic.',
    imageGradient: 'from-[#39ff14]/10 to-[#131313]',
    tiers: [
      { id: 'wave-rider', name: 'Wave Rider', price: 55, description: 'General festival access', perks: ['All stages access', 'Retro arcade zone', 'LED glow kit', 'Digital photo pack'], remaining: 412, total: 450, tier: 'standard' },
      { id: 'neon-vip', name: 'Neon VIP', price: 125, description: 'Elevated retro experience', perks: ['VIP viewing platform', 'Neon bar with 3 drinks', 'Priority arcade access', 'Exclusive vinyl sampler', 'VIP parking'], remaining: 60, total: 100, tier: 'vip' },
      { id: 'chrome', name: 'Chrome Elite', price: 175, description: 'The ultimate synth experience', perks: ['DeLorean arrival experience', 'Artist greenroom access', 'Signed band merch bundle', 'Private lakefront fireworks viewing', 'After-party DJ set access', 'Holographic collector card'], remaining: 15, total: 50, tier: 'premium' },
    ],
    priceFloor: 55,
    priceCeiling: 175,
  },
}

export default function EventDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const mockEvent = MOCK_EVENTS[params.id]
  const [event, setEvent] = useState<Event | null>(mockEvent || null)
  const [loading, setLoading] = useState(!mockEvent)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [liveData, setLiveData] = useState<any>(null)
  const [minting, setMinting] = useState(false)
  const [purchase, setPurchase] = useState<{
    isOpen: boolean
    tier: TicketTier | null
    step: 'confirm' | 'generating' | 'processing' | 'success' | 'error'
    error?: string
    transactionHash?: string
  }>({ isOpen: false, tier: null, step: 'confirm' })
  const [aiArt, setAiArt] = useState<{
    imageUrl?: string
    imageBase64?: string
    imageMimeType?: string
    videoUrl?: string
    generatingImage: boolean
    generatingVideo: boolean
    imageError?: string
    videoError?: string
  }>({ generatingImage: false, generatingVideo: false })

  useEffect(() => {
    // Always try the API — for mock events it enriches with live data,
    // for real DUAL ticket IDs it builds the event from ticket data
    fetch(`/api/tickets/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        const ticket = data.ticket || data;
        if (ticket && ticket.id) {
          setLiveData(ticket)
          if (mockEvent) {
            // Enrich mock event with live chain data
            setEvent((prev) =>
              prev
                ? {
                    ...prev,
                    isLive: true,
                    blockchainTxHash: ticket.blockchainTxHash,
                    explorerUrl: ticket.explorerLinks?.integrityHash || ticket.explorerLinks?.contentHash || `https://blockscout.dual.network/token/0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06`,
                  }
                : null
            )
          } else {
            // Build event from real DUAL ticket data
            const td = ticket.ticketData || {};
            setEvent({
              id: ticket.id,
              name: td.eventName || td.name || 'Event',
              date: td.eventDate || ticket.createdAt || new Date().toISOString(),
              time: td.eventTime || 'TBA',
              venue: td.venue || 'DUAL Network',
              description: td.description || 'An on-chain verified ticket on the DUAL Network.',
              imageGradient: 'from-[#39ff14]/10 to-[#131313]',
              imageUrl: td.imageUrl,
              tiers: [{
                id: 'general',
                name: td.tier ? td.tier.charAt(0).toUpperCase() + td.tier.slice(1) : 'General Admission',
                price: td.price || 0,
                description: td.description || 'On-chain verified ticket',
                perks: td.perks || ['DUAL Network verified', 'Anti-scalp protection', 'Transferable'],
                remaining: 1,
                total: 1,
                tier: (td.tier === 'vip' ? 'vip' : td.tier === 'premium' ? 'premium' : 'standard') as any,
              }],
              priceFloor: td.price || 0,
              priceCeiling: td.maxResalePrice || td.price || 0,
              isLive: true,
              blockchainTxHash: ticket.blockchainTxHash,
              explorerUrl: ticket.explorerLinks?.integrityHash || ticket.explorerLinks?.contentHash || `https://blockscout.dual.network/token/0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06`,
            })
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id, mockEvent])

  const handleMintTicket = async (tierId: string) => {
    if (!event) return
    const tier = event.tiers.find(t => t.id === tierId)
    if (!tier) return
    setPurchase({ isOpen: true, tier, step: 'confirm' })
  }

  const generateTicketArt = async () => {
    if (!event || !purchase.tier) return
    setPurchase(prev => ({ ...prev, step: 'generating' }))
    setAiArt({ generatingImage: true, generatingVideo: false })

    try {
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: event.name,
          venue: event.venue,
          date: event.date,
          tierName: purchase.tier.name,
          category: event.category || 'concert',
        }),
      })
      const imgData = await imgRes.json()
      if (!imgData.success) throw new Error(imgData.error || 'Image generation failed')

      setAiArt(prev => ({
        ...prev,
        imageUrl: imgData.imageUrl,
        imageBase64: imgData.imageBase64,
        imageMimeType: imgData.mimeType,
        generatingImage: false,
        generatingVideo: true,
      }))

      // Now generate video from the image
      const vidRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: event.name,
          venue: event.venue,
          date: event.date,
          tierName: purchase.tier.name,
          category: event.category || 'concert',
          imageBase64: imgData.imageBase64,
          imageMimeType: imgData.mimeType,
        }),
      })
      const vidData = await vidRes.json()
      if (vidData.success) {
        setAiArt(prev => ({ ...prev, videoUrl: vidData.videoUrl, generatingVideo: false }))
      } else {
        setAiArt(prev => ({ ...prev, generatingVideo: false, videoError: vidData.error }))
      }
    } catch (err: any) {
      setAiArt(prev => ({
        ...prev,
        generatingImage: false,
        generatingVideo: false,
        imageError: err.message || 'Generation failed',
      }))
    }
  }

  const regenerateArt = async () => {
    await generateTicketArt()
  }

  const executeMint = async () => {
    if (!event || !purchase.tier) return
    setPurchase(prev => ({ ...prev, step: 'processing' }))
    try {
      await new Promise(r => setTimeout(r, 1200))
      await new Promise(r => setTimeout(r, 1000))
      await new Promise(r => setTimeout(r, 1000))
      await new Promise(r => setTimeout(r, 800))
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
      setPurchase(prev => ({ ...prev, step: 'success', transactionHash: txHash }))
    } catch (err) {
      setPurchase(prev => ({ ...prev, step: 'error', error: String(err) }))
    }
  }

  const closePurchase = () => {
    setPurchase({ isOpen: false, tier: null, step: 'confirm' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313]">
        {/* Skeleton hero */}
        <div className="h-96 bg-gradient-to-b from-[#1b1b1b] to-[#131313] animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-4 w-32 bg-[#1b1b1b] mb-6 animate-pulse" />
          <div className="h-12 w-2/3 bg-[#1b1b1b] mb-6 animate-pulse" />
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="h-16 bg-[#1b1b1b] animate-pulse" />
            <div className="h-16 bg-[#1b1b1b] animate-pulse" />
            <div className="h-16 bg-[#1b1b1b] animate-pulse" />
          </div>
          <div className="h-20 w-3/4 bg-[#1b1b1b] animate-pulse" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#39ff14] mb-4">Event not found</h1>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#39ff14] text-black font-headline uppercase tracking-widest hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all"
          >
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#131313]">
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

      `}</style>

      <div className={`relative h-96 overflow-hidden ${(EVENT_IMAGES[event.id] || event.imageUrl) ? '' : `bg-gradient-to-br ${event.imageGradient}`}`}>
        {(EVENT_IMAGES[event.id] || event.imageUrl) ? (
          <img src={EVENT_IMAGES[event.id] || event.imageUrl} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-9xl text-white/20">confirmation_number</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#39ff14] hover:text-white transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Events
          </Link>

          <h1 className="text-5xl md:text-6xl font-headline uppercase tracking-tight mb-6 text-white">
            {event.name}
          </h1>

          {event.isLive && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-[#39ff14] text-black border-0">
              <span className="w-2 h-2 bg-black animate-pulse" />
              <span className="text-sm font-bold flex items-center gap-1">LIVE ON <DualInline className="text-black" /> NETWORK</span>
              {event.explorerUrl && (
                <a
                  href={event.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-black hover:opacity-70 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#39ff14]">calendar_month</span>
              <div>
                <p className="text-sm text-[#919191] mb-1">Date & Time</p>
                <p className="font-semibold text-white">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • {event.time}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#39ff14]">location_on</span>
              <div>
                <p className="text-sm text-[#919191] mb-1">Venue</p>
                <p className="font-semibold text-white">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#39ff14]">verified</span>
              <div>
                <p className="text-sm text-[#919191] mb-1">Verification</p>
                <p className="font-semibold text-[#39ff14]"><DualInline className="text-[#39ff14]" /> Verified</p>
              </div>
            </div>
          </div>

          <p className="text-lg text-[#c7c6c6] leading-relaxed max-w-3xl">{event.description}</p>
        </div>

        <div className="mb-16">
          <h2 className="font-headline text-4xl uppercase tracking-widest mb-8 text-white">Ticket Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {event.tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative group transition-all duration-300 cursor-pointer bg-[#1b1b1b] border ${
                  tier.tier === 'premium' ? 'md:scale-105 md:origin-bottom' : ''
                } ${
                  selectedTier === tier.id
                    ? 'border-[#39ff14]'
                    : 'border-[#474747]/20'
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <div className="relative p-8 flex flex-col h-full">
                  {tier.tier === 'premium' && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-[#39ff14] text-black w-fit">
                      <span className="material-symbols-outlined text-sm">crown</span>
                      <span className="text-xs font-headline uppercase tracking-widest">Premium</span>
                    </div>
                  )}

                  {tier.tier === 'vip' && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-[#39ff14]/20 text-[#39ff14] w-fit border border-[#39ff14]/30">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="text-xs font-headline uppercase tracking-widest">VIP</span>
                    </div>
                  )}

                  {tier.tier === 'standard' && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-[#353535] text-white w-fit border border-[#353535]">
                      <span className="text-xs font-headline uppercase tracking-widest">Standard</span>
                    </div>
                  )}

                  <h3 className="font-headline text-2xl uppercase tracking-tight mb-2 text-white">{tier.name}</h3>
                  <p className="text-sm text-[#919191] mb-4 flex-1">{tier.description}</p>

                  <div className="mb-6">
                    <p className="text-sm text-[#919191] mb-1">Starting at</p>
                    <p className="text-4xl font-headline text-[#39ff14]">
                      ${tier.price}
                      <span className="text-sm text-[#919191] font-normal ml-2">per ticket</span>
                    </p>
                  </div>

                  <div className="mb-6 space-y-2">
                    {tier.perks.map((perk, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-[#c7c6c6]">
                        <span className="material-symbols-outlined text-xs text-[#39ff14] mt-0.5 flex-shrink-0">
                          check_circle
                        </span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 p-3 bg-[#0e0e0e] border border-[#474747]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-headline uppercase tracking-widest text-[#919191]">Available</span>
                      <span className="text-sm font-bold text-[#39ff14]">
                        {tier.remaining} / {tier.total}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0e0e0e] overflow-hidden border border-[#474747]/20">
                      <div
                        className="h-full bg-[#39ff14]"
                        style={{
                          width: `${(tier.remaining / tier.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMintTicket(tier.id)
                    }}
                    disabled={minting}
                    className={`w-full py-3 font-headline uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                      tier.tier === 'premium'
                        ? 'bg-[#39ff14] text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]'
                        : tier.tier === 'vip'
                          ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14] hover:bg-[#39ff14]/30'
                          : 'bg-[#353535] text-white border border-[#474747]/20 hover:border-[#474747]/40'
                    } disabled:opacity-50`}
                  >
                    {minting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current/30 border-t-current animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">shopping_cart</span>
                        Mint Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="border border-[#474747]/20 p-8 bg-[#1b1b1b]">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#39ff14] text-3xl">
                verified_user
              </span>
              <div>
                <h3 className="font-headline text-xl uppercase tracking-tight mb-3 text-white">Anti-Scalp Protection</h3>
                <p className="text-[#c7c6c6] mb-4 leading-relaxed">
                  Every ticket is protected by on-chain smart contracts that enforce price boundaries:
                </p>
                <div className="space-y-2 text-sm text-[#919191]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39ff14]" />
                    <span>
                      <strong className="text-white">Price Floor:</strong> ${event.priceFloor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39ff14]" />
                    <span>
                      <strong className="text-white">Price Ceiling:</strong> ${event.priceCeiling}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39ff14]" />
                    <span>
                      <strong className="text-white">Enforcement:</strong> Automatic blockchain
                      verification
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#474747]/20 p-8 bg-[#1b1b1b]">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#39ff14] text-3xl">checklist</span>
              <div>
                <h3 className="font-headline text-xl uppercase tracking-tight mb-3 text-white">On-Chain Guarantee</h3>
                <p className="text-[#c7c6c6] mb-4 leading-relaxed">
                  Your ticket is backed by blockchain technology:
                </p>
                <div className="space-y-2 text-sm text-[#919191]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39ff14]" />
                    <span>Transparent transaction history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39ff14]" />
                    <span>Immutable ownership records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39ff14]" />
                    <span>Transferable with built-in royalties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39ff14]" />
                    <span>Collectible after event</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[#474747]/20 p-8 bg-[#1b1b1b]">
          <h3 className="font-headline text-2xl uppercase tracking-tight mb-6 text-white">Blockchain Provenance</h3>
          {event.isLive && event.blockchainTxHash && (
            <div className="mb-6 p-4 border border-[#474747]/20 bg-[#0e0e0e]">
              <p className="text-xs text-[#919191] mb-2">Transaction Hash</p>
              <p className="font-mono text-sm text-[#39ff14] break-all mb-4">{event.blockchainTxHash}</p>
              {event.explorerUrl && (
                <a
                  href={event.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] text-sm font-semibold hover:bg-[#39ff14]/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  View on Blockscout Explorer
                </a>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-2">
                <h4 className="font-headline uppercase tracking-tight text-lg mb-4 text-white">Contract Details</h4>
                <div className="space-y-3 text-[#c7c6c6] text-sm">
                  <p>
                    <strong className="text-white">Address:</strong>{' '}
                    <span className="font-mono text-[#39ff14]">0x41Cf...FF06</span>
                  </p>
                  <p>
                    <strong className="text-white">Standard:</strong>{' '}
                    <span className="font-mono text-[#39ff14]">ERC-721</span>
                  </p>
                  <p>
                    <strong className="text-white">Chain:</strong>{' '}
                    <span className="font-mono text-[#39ff14]"><DualInline className="text-[#39ff14]" /> Network</span>
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <h4 className="font-headline uppercase tracking-tight text-lg mb-4 text-white">Security Features</h4>
                <ul className="space-y-2 text-sm text-[#c7c6c6]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#39ff14] mt-1">✓</span>
                    <span>Smart contract audit verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#39ff14] mt-1">✓</span>
                    <span>Multi-signature authorization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#39ff14] mt-1">✓</span>
                    <span>Real-time price enforcement</span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <h4 className="font-headline uppercase tracking-tight text-lg mb-4 text-white">Audit Trail</h4>
                <div className="space-y-2 text-sm text-[#c7c6c6]">
                  <p>All mints, transfers, and metadata changes are permanently recorded on the <DualInline className="text-[#c7c6c6]" /> Network blockchain.</p>
                  <p className="text-xs text-[#919191]">Last updated: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {purchase.isOpen && purchase.tier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closePurchase} />
          <div className="relative w-full max-w-lg border border-[#474747]/20 bg-[#131313] p-8 shadow-[0_0_60px_rgba(57,255,20,0.15)]">
            {purchase.step === 'confirm' && (
              <>
                <h3 className="font-headline text-2xl uppercase tracking-tight mb-6 text-white">Confirm Purchase</h3>
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                    <p className="text-sm text-[#919191] mb-1">Event</p>
                    <p className="font-bold text-white">{event?.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                      <p className="text-sm text-[#919191] mb-1">Tier</p>
                      <p className="font-bold text-[#39ff14]">{purchase.tier.name}</p>
                    </div>
                    <div className="p-4 bg-[#1b1b1b] border border-[#474747]/20">
                      <p className="text-sm text-[#919191] mb-1">Price</p>
                      <p className="font-bold text-[#39ff14] text-2xl">${purchase.tier.price}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-[#39ff14]/5 border border-[#39ff14]/20 text-xs text-[#919191]">
                    <span className="material-symbols-outlined text-[#39ff14] text-sm align-middle mr-1">info</span>
                    This ticket will be minted as an ERC-721 token on the <DualInline className="text-[#919191]" /> Network and stored in your wallet.
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={closePurchase} className="flex-1 py-3 border border-[#474747]/20 text-[#919191] hover:text-white hover:border-[#474747]/40 transition-all font-bold">Cancel</button>
                  <button onClick={generateTicketArt} className="flex-1 py-3 bg-[#39ff14] text-black font-headline uppercase tracking-widest hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    GENERATE & MINT
                  </button>
                </div>
              </>
            )}

            {purchase.step === 'generating' && (
              <div className="py-2">
                <h3 className="font-headline text-2xl uppercase tracking-tight mb-6 text-white text-center">
                  {aiArt.generatingImage ? 'Generating Ticket Artwork' : aiArt.generatingVideo ? 'Creating Animation' : aiArt.imageUrl ? 'Your Unique Ticket Art' : 'Generating...'}
                </h3>

                {/* Image generation in progress */}
                {aiArt.generatingImage && (
                  <div className="text-center py-8">
                    <div className="w-32 h-32 mx-auto mb-4 bg-[#1b1b1b] border border-[#474747]/20 flex items-center justify-center overflow-hidden">
                      <div className="w-16 h-16 border-4 border-[#39ff14]/20 border-t-[#39ff14] animate-spin" />
                    </div>
                    <p className="text-sm text-[#919191]">AI is creating a unique artwork for your ticket...</p>
                    <p className="text-xs text-[#919191] mt-1">This may take 15-30 seconds</p>
                  </div>
                )}

                {/* Image generated — show preview */}
                {aiArt.imageUrl && !aiArt.generatingImage && (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden border border-[#474747]/20 bg-[#1b1b1b]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={aiArt.imageUrl} alt="AI generated ticket artwork" className="w-full aspect-square object-cover" />
                      {aiArt.generatingVideo && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-10 h-10 mx-auto mb-2 border-3 border-white/20 border-t-white animate-spin" />
                            <p className="text-xs text-white/80">Creating animation...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video preview if ready */}
                    {aiArt.videoUrl && (
                      <div className="overflow-hidden border border-[#474747]/20 bg-[#1b1b1b]">
                        <video src={aiArt.videoUrl} autoPlay loop muted playsInline className="w-full aspect-square object-cover" />
                      </div>
                    )}

                    {aiArt.videoError && (
                      <p className="text-xs text-[#919191] text-center">Video generation unavailable — your image artwork will be used</p>
                    )}

                    <div className="flex gap-3">
                      <button onClick={regenerateArt} disabled={aiArt.generatingImage || aiArt.generatingVideo} className="flex-1 py-3 border border-[#474747]/20 text-[#919191] hover:text-white hover:border-[#474747]/40 transition-all font-bold disabled:opacity-30 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Regenerate
                      </button>
                      <button onClick={executeMint} className="flex-1 py-3 bg-[#39ff14] text-black font-headline uppercase tracking-widest hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">token</span>
                        MINT ON-CHAIN
                      </button>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {aiArt.imageError && !aiArt.generatingImage && !aiArt.imageUrl && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#d4632a]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#d4632a] text-2xl">warning</span>
                    </div>
                    <p className="text-sm text-[#919191] mb-4">{aiArt.imageError}</p>
                    <div className="flex gap-3">
                      <button onClick={regenerateArt} className="flex-1 py-3 border border-[#474747]/20 text-[#919191] hover:text-white hover:border-[#474747]/40 transition-all font-bold">Try Again</button>
                      <button onClick={executeMint} className="flex-1 py-3 bg-[#39ff14] text-black font-headline uppercase tracking-widest transition-all text-sm">Mint Without Art</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {purchase.step === 'processing' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#39ff14]/20 border-t-[#39ff14] animate-spin" />
                <h3 className="font-headline text-xl uppercase tracking-tight mb-8 text-white">Minting Your Ticket</h3>
                <div className="space-y-4 text-left">
                  {[
                    'Initiating transaction...',
                    <span key="mining">Minting on <DualInline className="text-white" /> Network...</span>,
                    'Recording on Blockscout...',
                    'Finalising ownership...'
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`w-6 h-6 flex items-center justify-center ${i < 3 ? 'bg-[#39ff14]/15' : 'bg-[#2a2a2a]'}`}>
                        {i < 3 ? <span className="text-[#39ff14] text-xs">✓</span> : <span className="w-3 h-3 border-2 border-[#39ff14]/30 border-t-[#39ff14] animate-spin" />}
                      </div>
                      <span className={i < 3 ? 'text-[#919191]' : 'text-white'}>{step}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#919191] mt-6">Do not close this window</p>
              </div>
            )}

            {purchase.step === 'success' && (
              <div className="text-center py-4">
                {/* Show generated artwork in success */}
                {(aiArt.videoUrl || aiArt.imageUrl) && (
                  <div className="w-48 h-48 mx-auto mb-4 overflow-hidden border border-[#39ff14]/30 shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                    {aiArt.videoUrl ? (
                      <video src={aiArt.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={aiArt.imageUrl} alt="Ticket artwork" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                {!aiArt.videoUrl && !aiArt.imageUrl && (
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#39ff14]/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#39ff14] text-4xl">check_circle</span>
                  </div>
                )}
                <h3 className="font-headline text-2xl uppercase tracking-tight mb-2 text-[#39ff14]">TICKET MINTED</h3>
                <p className="text-[#919191] mb-6">Your ticket has been minted on the <DualInline className="text-[#919191]" /> Network</p>
                {purchase.transactionHash && (
                  <div className="p-3 bg-[#1b1b1b] border border-[#474747]/20 mb-6">
                    <p className="text-xs text-[#919191] mb-1">Transaction Hash</p>
                    <p className="text-xs text-[#39ff14] font-mono break-all">{purchase.transactionHash}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <a href={event?.explorerUrl || `https://blockscout.dual.network/token/0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06`} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 border border-[#39ff14]/30 text-[#39ff14] font-bold hover:bg-[#39ff14]/10 transition-all text-center text-sm">View on Blockscout</a>
                  <Link href="/my-tickets" className="flex-1 py-3 bg-[#39ff14] text-black font-headline uppercase tracking-widest hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all text-center text-sm">View My Tickets</Link>
                </div>
              </div>
            )}

            {purchase.step === 'error' && (
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#d4632a]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#d4632a] text-4xl">error</span>
                </div>
                <h3 className="font-headline text-2xl uppercase tracking-tight mb-2 text-[#d4632a]">MINT FAILED</h3>
                <p className="text-[#919191] mb-6">{purchase.error || 'An unexpected error occurred'}</p>
                <div className="flex gap-3">
                  <button onClick={closePurchase} className="flex-1 py-3 border border-[#474747]/20 text-[#919191] font-bold hover:text-white transition-all">Close</button>
                  <button onClick={executeMint} className="flex-1 py-3 bg-[#39ff14] text-black font-headline uppercase tracking-widest hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all">Try Again</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
