'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { apiGet, apiPut } from '@/lib/api-client'
import type { Setting } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Save, Loader2, Settings as SettingsIcon, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'url'
  placeholder?: string
  description?: string
  rows?: number
}

const TAB_FIELDS: Record<string, { title: string; description: string; fields: FieldDef[] }> = {
  general: {
    title: 'Umum',
    description: 'Informasi dasar organisasi',
    fields: [
      { key: 'org_name', label: 'Nama Organisasi', placeholder: 'PPDI Kecamatan Cikampek' },
      { key: 'org_short_name', label: 'Nama Singkat', placeholder: 'PPDI Cikampek' },
      { key: 'org_tagline', label: 'Tagline', placeholder: 'Bersatu Mengabdi untuk Desa' },
      { key: 'org_description', label: 'Deskripsi', type: 'textarea', rows: 4 },
      { key: 'org_address', label: 'Alamat', type: 'textarea', rows: 2 },
      { key: 'org_email', label: 'Email', type: 'url' },
      { key: 'org_phone', label: 'Telepon' },
      { key: 'org_logo', label: 'URL Logo', type: 'url' },
      { key: 'org_favicon', label: 'URL Favicon', type: 'url' },
    ],
  },
  homepage: {
    title: 'Beranda',
    description: 'Konten halaman utama',
    fields: [
      { key: 'hero_title', label: 'Judul Hero' },
      { key: 'hero_subtitle', label: 'Subjudul Hero' },
      { key: 'hero_description', label: 'Deskripsi Hero', type: 'textarea', rows: 3 },
      { key: 'hero_image', label: 'URL Gambar Hero', type: 'url' },
      { key: 'ketua_nama', label: 'Nama Ketua' },
      { key: 'ketua_foto', label: 'URL Foto Ketua', type: 'url' },
      { key: 'ketua_sambutan', label: 'Sambutan Ketua', type: 'textarea', rows: 6 },
    ],
  },
  seo: {
    title: 'SEO',
    description: 'Pengaturan mesin pencari',
    fields: [
      { key: 'seo_title', label: 'SEO Title', description: 'Judul halaman untuk mesin pencari' },
      { key: 'seo_description', label: 'SEO Description', type: 'textarea', rows: 3, description: 'Deskripsi singkat (max 160 karakter)' },
      { key: 'seo_keywords', label: 'SEO Keywords', description: 'Pisahkan dengan koma' },
    ],
  },
  social: {
    title: 'Media Sosial',
    description: 'Tautan media sosial',
    fields: [
      { key: 'social_facebook', label: 'Facebook', type: 'url' },
      { key: 'social_instagram', label: 'Instagram', type: 'url' },
      { key: 'social_youtube', label: 'YouTube', type: 'url' },
      { key: 'social_tiktok', label: 'TikTok', type: 'url' },
      { key: 'social_x', label: 'X (Twitter)', type: 'url' },
    ],
  },
  footer: {
    title: 'Footer',
    description: 'Konten footer situs',
    fields: [
      { key: 'footer_copyright', label: 'Teks Copyright' },
      { key: 'footer_about', label: 'Tentang (di footer)', type: 'textarea', rows: 3 },
    ],
  },
  profil: {
    title: 'Profil',
    description: 'Konten halaman profil organisasi',
    fields: [
      { key: 'profil_sejarah', label: 'Sejarah', type: 'textarea', rows: 8 },
      { key: 'profil_visi', label: 'Visi', type: 'textarea', rows: 4 },
      { key: 'profil_misi', label: 'Misi', type: 'textarea', rows: 6 },
      { key: 'profil_tujuan', label: 'Tujuan', type: 'textarea', rows: 4 },
      { key: 'profil_adart', label: 'AD/ART', type: 'textarea', rows: 8 },
    ],
  },
}

export function AdminSetting() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [original, setOriginal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{ settings: Setting[] }>('/api/settings')
      const map: Record<string, string> = {}
      for (const s of data.settings) {
        if (s.value) map[s.key] = s.value
      }
      setSettings(map)
      setOriginal(map)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat pengaturan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const changedKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const k of Object.keys(settings)) {
      if (settings[k] !== (original[k] || '')) keys.add(k)
    }
    for (const k of Object.keys(original)) {
      if (settings[k] !== (original[k] || '')) keys.add(k)
    }
    return Array.from(keys)
  }, [settings, original])

  const handleSave = async () => {
    if (changedKeys.length === 0) {
      toast.info('Tidak ada perubahan untuk disimpan')
      return
    }
    setSaving(true)
    try {
      const payload = changedKeys.map((k) => ({ key: k, value: settings[k] || '' }))
      await apiPut('/api/settings', { settings: payload })
      toast.success(`${payload.length} pengaturan berhasil disimpan`)
      setOriginal({ ...settings })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (field: FieldDef) => {
    const value = settings[field.key] || ''
    const onChange = (v: string) => setSettings((s) => ({ ...s, [field.key]: v }))
    const isChanged = value !== (original[field.key] || '')

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <Label className="flex items-center gap-2">
            {field.label}
            {isChanged && <span className="text-[10px] text-gold">• (diubah)</span>}
          </Label>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={isChanged ? 'border-gold/50' : ''}
          />
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      )
    }
    return (
      <div key={field.key} className="space-y-2">
        <Label className="flex items-center gap-2">
          {field.label}
          {isChanged && <span className="text-[10px] text-gold">• (diubah)</span>}
        </Label>
        <Input
          type={field.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={isChanged ? 'border-gold/50' : ''}
        />
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pengaturan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola pengaturan situs dan konten dinamis
          </p>
        </div>
        <div className="flex items-center gap-3">
          {changedKeys.length > 0 && (
            <span className="text-sm text-gold">
              {changedKeys.length} perubahan belum disimpan
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || changedKeys.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan ({changedKeys.length})
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto">
          {Object.entries(TAB_FIELDS).map(([key, tab]) => (
            <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(TAB_FIELDS).map(([key, tab]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  {tab.title}
                </CardTitle>
                <CardDescription>{tab.description}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-5">
                {tab.fields.map((field) => renderField(field))}

                {/* Preview for image fields */}
                {tab.fields.some((f) => f.type === 'url' && (f.key.includes('logo') || f.key.includes('foto') || f.key.includes('image'))) && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Preview gambar:</p>
                    <div className="flex flex-wrap gap-3">
                      {tab.fields
                        .filter((f) => f.type === 'url' && (f.key.includes('logo') || f.key.includes('foto') || f.key.includes('image')))
                        .map((f) => {
                          const v = settings[f.key]
                          if (!v) return null
                          return (
                            <div key={f.key} className="text-center">
                              <div className="w-24 h-24 rounded-md border bg-muted overflow-hidden flex items-center justify-center">
                                <img src={v} alt={f.label} className="max-w-full max-h-full object-contain" />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">{f.label}</p>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
