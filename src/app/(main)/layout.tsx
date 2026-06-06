'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { DualLogo, DualInline, DualIcon } from './DualLogo'

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/my-tickets', label: 'My Tickets' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/scan', label: 'Scan' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#131313] text-white overflow-x-hidden selection:bg-white selection:text-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131313]">
        <Link href="/" className="text-white">
          <DualLogo height={28} className="text-white" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-headline text-sm tracking-widest uppercase transition-colors ${
                isActive(link.href)
                  ? 'text-[#39ff14] border-b-2 border-[#39ff14] pb-1 font-bold'
                  : 'text-[#c7c6c6] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/admin">
            <span className="material-symbols-outlined text-white cursor-pointer" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
          </Link>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="material-symbols-outlined text-white">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-20 left-0 right-0 z-40 bg-[#131313] border-t border-[#474747]/20 md:hidden">
          <div className="flex flex-col p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-4 font-headline text-sm tracking-widest uppercase transition-colors ${
                  isActive(link.href)
                    ? 'text-[#39ff14] bg-[#39ff14]/5'
                    : 'text-[#c7c6c6] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 pb-24 md:pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#474747]/20 bg-[#0e0e0e]">
        <div className="max-w-[1440px] mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="mb-4"><DualLogo height={28} className="text-white" /></div>
              <p className="text-sm text-[#c7c6c6] leading-relaxed">
                The tokenised future of live events. On-chain. Verified. Secure.
              </p>
            </div>
            <div>
              <h4 className="font-headline text-[10px] uppercase tracking-[0.3em] text-[#919191] mb-6">Navigate</h4>
              <ul className="space-y-3 text-sm text-[#c7c6c6]">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/my-tickets" className="hover:text-white transition-colors">My Tickets</Link></li>
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/scan" className="hover:text-white transition-colors">Venue Scanner</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline text-[10px] uppercase tracking-[0.3em] text-[#919191] mb-6">Network</h4>
              <ul className="space-y-3 text-sm text-[#c7c6c6]">
                <li><a href="https://blockscout.dual.network/token/0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blockscout Explorer</a></li>
                <li><a href="https://blockscout.dual.network" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DUAL Chain</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline text-[10px] uppercase tracking-[0.3em] text-[#919191] mb-6">Contract</h4>
              <p className="text-xs text-[#c7c6c6] font-mono break-all leading-relaxed">0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06</p>
              <p className="text-xs text-[#919191] mt-2">ERC-721 on DUAL Network</p>
            </div>
          </div>
          <div className="border-t border-[#474747]/20 pt-8 flex items-center justify-between">
            <p className="text-xs text-[#474747] flex items-center gap-1">© 2026 <DualInline className="text-[#474747]" />. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="https://blockscout.dual.network/token/0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06" target="_blank" rel="noopener noreferrer" className="text-xs text-[#474747] hover:text-white transition-colors font-headline uppercase tracking-widest">Blockscout</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-[#0e0e0e] md:hidden border-t border-[#474747]/20">
        {[
          { href: '/', icon: 'home', label: 'Home' },
          { href: '/marketplace', icon: 'storefront', label: 'Market' },
          { href: '/scan', icon: 'qr_code_scanner', label: 'Scan' },
          { href: '/admin', icon: 'person', label: 'Profile' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center p-3 transition-colors ${
              isActive(item.href)
                ? 'bg-[#39ff14] text-black'
                : 'text-[#c7c6c6] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-headline text-[10px] uppercase tracking-widest mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
