import type { IAMConfig } from '@hanzo/iam/browser'
import { IAM_URL, CLIENT_ID, REDIRECT_URI } from './env'

/**
 * Canonical Hanzo IAM config (HIP-0111): the @hanzo/iam SDK against the hanzo.id
 * OIDC issuer via discovery, PKCE S256, public client (no secret).
 *
 * `offline_access` requests a refresh token so a long session renews silently.
 * localStorage (not sessionStorage) so the PKCE verifier/state and tokens
 * survive the cross-site round-trip to hanzo.id and any reload.
 */
export const iamConfig: IAMConfig = {
  serverUrl: IAM_URL,
  clientId: CLIENT_ID,
  appName: 'inventory-stockroom',
  redirectUri: REDIRECT_URI,
  scope: 'openid profile email offline_access',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
}
