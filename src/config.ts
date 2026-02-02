/**
 * Host app config — exposed to remotes via federation.
 * Remotes import: import { appConfig } from 'host/config'
 */

export const appConfig = {
  appName: 'Host App',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  features: {
    darkMode: true,
    analytics: false,
  },
} as const

export type AppConfig = typeof appConfig
