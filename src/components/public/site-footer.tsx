'use client'

import { useAppStore, type PublicView } from '@/lib/store'
import { useSettings } from '@/hooks/use-settings'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

interface MenuItem {
  label: string
  view: PublicView
}

export function SiteFooter({
  menuItems,
  onNavigate,
}: {
  menuItems: MenuItem[]
  onNavigate: (view: PublicView, params?: Record<string, string>) => void
}) {
  const { settings } = useSettings()
  const orgName = settings.org_name || 'Persatuan Perangkat Desa Indonesia (PPDI) Kecamatan Cikampek'
  const orgShort = settings.org_short_name || 'PPDI Cikampek'
  const tagline = settings.org_tagline || ''
  const footerAbout = settings.footer_about || ''
  const copyright = settings.footer_copyright || `© ${new Date().getFullYear()} PPDI Kecamatan Cikampek. Made with ❤️ by reInkarnasi. Hak Cipta Dilindungi.`

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/logo.svg"
                  alt="Logo PPDI Cikampek"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-sm">{orgShort}</div>
                <div className="text-xs text-primary-foreground/70">Kecamatan Cikampek</div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {footerAbout || tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-gold">Tautan Cepat</h3>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.view}>
                  <button
                    onClick={() => onNavigate(item.view)}
                    className="text-sm text-primary-foreground/80 hover:text-gold transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-gold">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>{settings.org_address || 'Sekretariat PPDI, Kantor Kecamatan Cikampek'}</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <span>{settings.org_phone || '+62 267 862134'}</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <span className="break-all">{settings.org_email || 'ppdi.cikampek@gmail.com'}</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider text-gold">Media Sosial</h3>
            <div className="flex gap-3">
              {settings.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-gold hover:text-gold-foreground flex items-center justify-center transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-gold hover:text-gold-foreground flex items-center justify-center transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-gold hover:text-gold-foreground flex items-center justify-center transition-colors" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-primary-foreground/60 mt-4 leading-relaxed">
              {settings.org_description}
            </p>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-primary-foreground/70 text-center sm:text-left">{copyright}</p>
          <p className="text-xs text-primary-foreground/50">
            Dibangun dengan dedikasi untuk Perangkat Desa Cikampek
          </p>
        </div>
      </div>
    </footer>
  )
}
