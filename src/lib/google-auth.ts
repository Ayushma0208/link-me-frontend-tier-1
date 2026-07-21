'use client'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

type CredentialResponse = {
  credential?: string
  select_by?: string
}

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string
    callback: (response: CredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
    context?: 'signin' | 'signup' | 'use'
  }) => void
  prompt: (
    momentListener?: (notification: {
      isNotDisplayed: () => boolean
      isSkippedMoment: () => boolean
      isDismissedMoment: () => boolean
    }) => void
  ) => void
  renderButton: (
    parent: HTMLElement,
    options: Record<string, string | number>
  ) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is browser-only'))
  }
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Google Identity Services'))
      )
      if (window.google?.accounts?.id) resolve()
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

export function getGoogleClientId() {
  return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '').trim()
}

export function isGoogleOAuthConfigured() {
  return getGoogleClientId().length > 0
}

/**
 * Opens Google sign-in and resolves with a JWT ID token for POST /auth/google.
 */
export async function requestGoogleIdToken(
  context: 'signin' | 'signup' = 'signin'
): Promise<string> {
  const clientId = getGoogleClientId()
  if (!clientId) {
    throw new Error(
      'Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in apps/web/.env (same value as auth-service GOOGLE_CLIENT_ID).'
    )
  }

  await loadGoogleScript()
  const googleId = window.google?.accounts?.id
  if (!googleId) {
    throw new Error('Google Identity Services failed to initialize')
  }

  return new Promise<string>((resolve, reject) => {
    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      host.remove()
      fn()
    }

    const timer = window.setTimeout(() => {
      finish(() =>
        reject(new Error('Google sign-in timed out or was cancelled'))
      )
    }, 120_000)

    const host = document.createElement('div')
    host.setAttribute('aria-hidden', 'true')
    host.style.cssText =
      'position:fixed;left:-10000px;top:0;width:1px;height:1px;overflow:hidden'
    document.body.appendChild(host)

    googleId.initialize({
      client_id: clientId,
      context,
      cancel_on_tap_outside: true,
      callback: (response) => {
        if (response.credential) {
          finish(() => resolve(response.credential!))
        } else {
          finish(() =>
            reject(new Error('Google did not return a sign-in credential'))
          )
        }
      },
    })

    googleId.renderButton(host, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: context === 'signup' ? 'signup_with' : 'continue_with',
      shape: 'pill',
      width: 320,
    })

    window.requestAnimationFrame(() => {
      const btn = host.querySelector<HTMLElement>('div[role="button"]')
      if (btn) {
        btn.click()
        return
      }

      googleId.prompt((notification) => {
        if (
          notification.isNotDisplayed() ||
          notification.isSkippedMoment() ||
          notification.isDismissedMoment()
        ) {
          finish(() =>
            reject(
              new Error(
                'Google sign-in was blocked or dismissed. Allow popups for localhost and try again.'
              )
            )
          )
        }
      })
    })
  })
}
