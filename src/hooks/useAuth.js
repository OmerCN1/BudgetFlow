import { useEffect, useState } from "react"

import { hasSupabaseConfig, supabase } from "../lib/supabase"

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false)
      return undefined
    }

    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (mounted) {
        if (!error) setSession(data.session)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession((currentSession) => {
        if (currentSession?.user?.id && nextSession?.user?.id === currentSession.user.id) {
          return currentSession
        }
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
    isConfigured: hasSupabaseConfig,
  }
}
