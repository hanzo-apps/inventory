/**
 * The app's environment contract, in ONE place. Every value has a sensible
 * default so the starter runs against live Hanzo (hanzo.id + api.hanzo.ai) with
 * zero config; the deploy pipeline overrides them per environment.
 */

const origin = typeof window !== 'undefined' ? window.location.origin : ''

/** OIDC issuer (Hanzo IAM). */
export const IAM_URL = import.meta.env.VITE_HANZO_IAM_URL || 'https://hanzo.id'

/** IAM application (client) id, `<org>-<app>`. */
export const CLIENT_ID = import.meta.env.VITE_HANZO_CLIENT_ID || 'hanzo-app'

/** PKCE redirect URI — this origin's callback route unless overridden. */
export const REDIRECT_URI =
  import.meta.env.VITE_HANZO_REDIRECT_URI || `${origin}/auth/callback`

/** Browser-reachable Hanzo Base data plane (IAM-native). */
export const BASE_URL = import.meta.env.VITE_HANZO_BASE_URL || 'https://api.hanzo.ai'
