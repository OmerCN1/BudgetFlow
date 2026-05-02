import { useEffect, useState } from "react"

import { hasSupabaseConfig, supabase } from "../lib/supabase"

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState("user")
  const [banned, setBanned] = useState(false)

  // Role ve ban durumunu ayrı olarak fetch et
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) {
      setRole("user")
      setBanned(false)
      return
    }
    let cancelled = false
    supabase
      .from("profiles")
      .select("role,is_banned")
      .eq("user_id", userId)
      .single()
      .then(async ({ data, error }) => {
        if (cancelled) return
        if (!error && data?.role) setRole(data.role)
        if (!error && data?.is_banned) {
          setBanned(true)
          await supabase.auth.signOut()
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [session?.user?.id])

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false)
      return undefined
    }

    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (!error) setSession(data.session)
      setLoading(false)
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession((current) => {
        if (current?.user?.id && nextSession?.user?.id === current.user.id) return current
        return nextSession
      })
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    user: session?.user || null,
    loading,
    isAdmin: role === "admin",
    isBanned: banned,
    isConfigured: hasSupabaseConfig,
  }
}
