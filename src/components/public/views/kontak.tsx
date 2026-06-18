'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { apiPost } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'

export function KontakPage() {
  const { settings, loading: settingsLoading } = useSettings()
  const { toast } = useToast()
  const [form, setForm] = useState({
    nama: '',
    email: '',
    telepon: '',
    subjek: '',
    pesan: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await apiPost('/api/kontak', form)
      setSubmitted(true)
      setForm({ nama: '', email: '', telepon: '', subjek: '', pesan: '' })
      toast({
        title: 'Pesan terkirim!',
        description: 'Terima kasih telah menghubungi kami. Kami akan segera merespons.',
      })
      setTimeout(() => setSubmitted(false), 4000)
    } catch (err) {
      toast({
        title: 'Gagal mengirim pesan',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      label: 'Alamat',
      value: settings.org_address || 'Sekretariat PPDI, Kantor Kecamatan Cikampek, Jl. Raya Cikampek No.1, Cikampek, Kab. Karawang, Jawa Barat 41373',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Phone,
      label: 'Telepon',
      value: settings.org_phone || '+62 267 862134',
      color: 'bg-gold/15 text-gold',
    },
    {
      icon: Mail,
      label: 'Email',
      value: settings.org_email || 'ppdi.cikampek@gmail.com',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Clock,
      label: 'Jam Operasional',
      value: 'Senin - Jumat: 08.00 - 16.00 WIB',
      color: 'bg-gold/15 text-gold',
    },
  ]

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Kontak</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Hubungi Kami</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Punya pertanyaan, saran, atau ingin berkolaborasi? Sampaikan pesan Anda melalui formulir di bawah ini.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-4">
              {settingsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              ) : (
                contactInfo.map((info) => {
                  const Icon = info.icon
                  return (
                    <Card key={info.label} className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${info.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                            {info.label}
                          </div>
                          <div className="text-sm text-foreground font-medium break-words">
                            {info.value}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}

              {/* Social media hint */}
              <Card className="p-5 bg-muted/30 border-dashed">
                <p className="text-xs text-muted-foreground text-center">
                  Anda juga dapat terhubung dengan kami melalui media sosial di footer halaman ini.
                </p>
              </Card>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="border-t-4 border-t-primary">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Kirim Pesan</h2>
                      <p className="text-xs text-muted-foreground">Isi formulir berikut dan kami akan menghubungi Anda.</p>
                    </div>
                  </div>

                  {submitted && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-200">
                          Pesan Anda berhasil dikirim!
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                          Kami akan merespons melalui email Anda dalam 1-3 hari kerja.
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="nama">
                          Nama Lengkap <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="nama"
                          placeholder="Nama Anda"
                          value={form.nama}
                          onChange={(e) => setForm({ ...form, nama: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@contoh.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="telepon">No. Telepon</Label>
                        <Input
                          id="telepon"
                          placeholder="08xx-xxxx-xxxx"
                          value={form.telepon}
                          onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="subjek">
                          Subjek <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="subjek"
                          placeholder="Subjek pesan"
                          value={form.subjek}
                          onChange={(e) => setForm({ ...form, subjek: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pesan">
                        Pesan <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="pesan"
                        placeholder="Tulis pesan Anda di sini..."
                        rows={6}
                        value={form.pesan}
                        onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                        required
                        className="resize-y"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="text-destructive">*</span> Field wajib diisi
                      </p>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Kirim Pesan
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      {settings.maps_embed && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <Badge className="mb-2 bg-primary text-primary-foreground hover:bg-primary">Lokasi Kami</Badge>
              <h2 className="text-2xl font-bold text-foreground">Temukan Kami di Peta</h2>
            </div>
            <Card className="overflow-hidden p-0">
              <div className="aspect-[16/9] md:aspect-[21/9]">
                <iframe
                  src={settings.maps_embed}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi PPDI Kecamatan Cikampek"
                />
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
