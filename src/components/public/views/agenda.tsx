'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, MapPin, Clock, CheckCircle2, CalendarClock, Info } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import type { Agenda } from '@/lib/types'

export function AgendaPage() {
  const [upcoming, setUpcoming] = useState<Agenda[]>([])
  const [completed, setCompleted] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiGet<{ agenda: Agenda[] }>('/api/agenda?status=MENDATANG'),
      apiGet<{ agenda: Agenda[] }>('/api/agenda?status=SELESAI'),
    ])
      .then(([up, done]) => {
        setUpcoming(up.agenda)
        setCompleted(done.agenda)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Header */}
      <section className="gradient-navy py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <Badge className="mb-3 bg-gold text-gold-foreground hover:bg-gold">Agenda</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Agenda Kegiatan</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-sm md:text-base">
            Jadwal kegiatan dan acara PPDI Kecamatan Cikampek yang akan datang maupun yang telah selesai.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {loading ? (
            <div className="space-y-8">
              <Skeleton className="h-12 w-64" />
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-12 w-64" />
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Upcoming */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Agenda Mendatang</h2>
                    <p className="text-sm text-muted-foreground">{upcoming.length} kegiatan akan datang</p>
                  </div>
                </div>

                {upcoming.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Info className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Belum ada agenda mendatang.</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {upcoming.map((a) => (
                      <AgendaCard key={a.id} agenda={a} isUpcoming />
                    ))}
                  </div>
                )}
              </div>

              {/* Completed */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Agenda Selesai</h2>
                    <p className="text-sm text-muted-foreground">{completed.length} kegiatan terlaksana</p>
                  </div>
                </div>

                {completed.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Info className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Belum ada agenda yang selesai.</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {completed.map((a) => (
                      <AgendaCard key={a.id} agenda={a} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function AgendaCard({ agenda, isUpcoming = false }: { agenda: Agenda; isUpcoming?: boolean }) {
  const start = new Date(agenda.tanggalMulai)
  const end = agenda.tanggalSelesai ? new Date(agenda.tanggalSelesai) : null

  const sameDay = end && format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${isUpcoming ? 'border-l-4 border-l-gold' : 'opacity-90'}`}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Date badge */}
          <div
            className={`shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center text-center ${
              isUpcoming ? 'gradient-navy text-primary-foreground' : 'bg-muted text-foreground'
            }`}
          >
            <span className="text-[10px] uppercase font-medium opacity-80">
              {format(start, 'MMM', { locale: localeId })}
            </span>
            <span className="text-2xl font-bold leading-none">{format(start, 'd')}</span>
            <span className="text-[10px] opacity-80">{format(start, 'yyyy')}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-foreground line-clamp-2">{agenda.namaAgenda}</h3>
              {isUpcoming ? (
                <Badge variant="secondary" className="bg-gold/15 text-gold border-gold/30 shrink-0">
                  <Clock className="h-3 w-3 mr-1" /> Mendatang
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 shrink-0 text-primary" />
                <span>
                  {format(start, 'EEEE, d MMM yyyy', { locale: localeId })}
                  {end && !sameDay && ` - ${format(end, 'd MMM yyyy', { locale: localeId })}`}
                </span>
              </div>
              {agenda.lokasi && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0 text-gold" />
                  <span className="truncate">{agenda.lokasi}</span>
                </div>
              )}
            </div>

            {agenda.deskripsi && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {agenda.deskripsi}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
