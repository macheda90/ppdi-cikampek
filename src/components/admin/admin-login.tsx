'use client'

import { useState } from 'react'
import { useAppStore, type SessionUserClient } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Loader2, Lock, User, ArrowLeft, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

interface AdminLoginProps {
  onLogin: (user: SessionUserClient) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const { goToPublic } = useAppStore()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Username dan password wajib diisi')
      return
    }
    setLoading(true)
    try {
      const user = await login(username, password)
      toast.success(`Selamat datang, ${user.name}!`)
      onLogin(user)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login gagal'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0F4C81] via-[#0a3a64] to-[#06243f] relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#0F4C81]/40 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-3 text-center pt-8 pb-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#0a3a64] flex items-center justify-center shadow-lg ring-2 ring-[#D4AF37]/30">
                <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Back Office</h1>
              <p className="text-sm text-muted-foreground mt-1">PPDI Cikampek</p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Persatuan Perangkat Desa Indonesia
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="pl-9"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="pl-9 pr-16"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk ke Dashboard'
                )}
              </Button>
            </form>

            {/* <div className="mt-4 rounded-md bg-muted/50 border border-border p-3 text-xs text-muted-foreground">
              <p className="font-semibold mb-1 text-foreground">Demo Credentials:</p>
              <p>Username: <code className="bg-background px-1 rounded">admin</code></p>
              <p>Password: <code className="bg-background px-1 rounded">password123</code></p>
            </div> */}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pb-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToPublic('beranda')}
              className="w-full text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-white/60 mt-6">
          &copy; {new Date().getFullYear()} PPDI Kecamatan Cikampek. Made with ❤️ by reInkarnasi. All rights reserved.
        </p>
      </div>
    </div>
  )
}
