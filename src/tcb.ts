import cloudbase from '@cloudbase/js-sdk'

const ENV_ID = (import.meta as any)?.env?.VITE_TCB_ENV || 'egg-1gref12ic79f5efc'

export const app = cloudbase.init({ env: ENV_ID })
export const auth = app.auth({ persistence: 'local' })

export async function ensureLogin() {
  try {
    const cur = await auth.getCurrentUser()
    if (!cur) {
      const a: any = auth as any
      if (a.anonymousAuthProvider) {
        await a.anonymousAuthProvider().signIn()
      } else if (a.signInAnonymously) {
        await a.signInAnonymously()
      }
    }
  } catch (e) {
    console.warn('anonymous sign-in failed', e)
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export async function callFunction<T=any>(name: string, data?: any, retries = 1, timeoutMs = 10000): Promise<T> {
  await ensureLogin()
  let lastErr: any
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await Promise.race([
        app.callFunction({ name, data }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), timeoutMs))
      ]) as any
      return res.result as T
    } catch (e) {
      lastErr = e
      if (i < retries) await sleep(500 * Math.pow(2, i))
    }
  }
  throw lastErr
}

export async function callPersonas(action: string = 'list', payload?: any) {
  return callFunction('personas', { action, ...payload }, 1)
}

export async function callPlugins(action: string, payload?: any) {
  return callFunction('plugins', { action, ...payload }, 1)
}
