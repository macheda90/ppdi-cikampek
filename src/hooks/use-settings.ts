'use client'

import { useEffect, useState } from 'react'
import { apiGet, settingsToMap } from '@/lib/api-client'

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<{ settings: { key: string; value: string | null }[] }>('/api/settings')
      .then((data) => {
        setSettings(settingsToMap(data.settings))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}
