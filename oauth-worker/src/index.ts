type Env = {
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  ORIGINS: string
  SCOPES?: string
  OAUTH_PROVIDER?: string
  GIT_HOSTNAME?: string
  REDIRECT_URL?: string
}

const REQUIRED_ORIGIN_PATTERN =
  /^((\*|([\w_-]{2,}))\.)*(([\w_-]{2,})\.)+(\w{2,})(\,((\*|([\w_-]{2,}))\.)*(([\w_-]{2,})\.)+(\w{2,}))*$/

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init?.headers ?? {}) },
  })

const html = (data: string, init?: ResponseInit) =>
  new Response(data, {
    ...init,
    headers: { 'content-type': 'text/html; charset=utf-8', ...(init?.headers ?? {}) },
  })

const notFound = () => new Response('Not Found', { status: 404 })

const randomState = () => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

const getCookie = (cookieHeader: string | null, key: string) => {
  if (!cookieHeader) return null
  const cookies = cookieHeader.split(';').map(s => s.trim())
  for (const c of cookies) {
    if (!c.startsWith(`${key}=`)) continue
    return decodeURIComponent(c.slice(key.length + 1))
  }
  return null
}

const buildLoginScript = (oauthProvider: string, message: 'success' | 'error', content: unknown, origins: string[]) => {
  return `
<script>
(function() {
  function contains(arr, elem) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].indexOf('*') >= 0) {
        var regex = new RegExp(arr[i].replaceAll('.', '\\\\.').replaceAll('*', '[\\\\w_-]+'));
        if (elem.match(regex) !== null) {
          return true;
        }
      } else {
        if (arr[i] === elem) {
          return true;
        }
      }
    }
    return false;
  }
  function recieveMessage(e) {
    if (!contains(${JSON.stringify(origins)}, e.origin.replace('https://', 'http://').replace('http://', ''))) {
      return;
    }
    window.opener.postMessage(
      'authorization:${oauthProvider}:${message}:${JSON.stringify(content)}',
      e.origin
    );
    window.close();
  }
  window.addEventListener("message", recieveMessage, false);
  window.opener.postMessage("authorizing:${oauthProvider}", "*");
})()
</script>`
}

const getTokenHost = (env: Env) => (env.GIT_HOSTNAME?.trim() ? env.GIT_HOSTNAME.trim() : 'https://github.com')

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname.replace(/\/+$/, '') || '/'

    const oauthProvider = (env.OAUTH_PROVIDER || 'github').toLowerCase()
    if (oauthProvider !== 'github') {
      return json({ error: 'Only github provider is supported in this worker.' }, { status: 400 })
    }

    const originsRaw = (env.ORIGINS || '').trim()
    if (!originsRaw || !REQUIRED_ORIGIN_PATTERN.test(originsRaw)) {
      return json(
        {
          error:
            'ORIGINS must be a comma separated list of allowed origins without scheme (example: rubato.app,localhost:5173,*.vercel.app).',
        },
        { status: 500 },
      )
    }
    const origins = originsRaw.split(',').map(s => s.trim()).filter(Boolean)

    const tokenHost = getTokenHost(env)
    const authorizePath = '/login/oauth/authorize'
    const tokenPath = '/login/oauth/access_token'
    const scopes = (env.SCOPES || 'repo').trim()

    const redirectUrl = (env.REDIRECT_URL && env.REDIRECT_URL.trim())
      ? env.REDIRECT_URL.trim()
      : `${url.origin}/callback`

    if (pathname === '/') {
      return json({ ok: true, provider: oauthProvider, routes: ['/auth', '/callback'] })
    }

    if (pathname === '/auth') {
      const state = randomState()
      const authorizeUrl = new URL(tokenHost)
      authorizeUrl.pathname = authorizePath
      authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
      authorizeUrl.searchParams.set('redirect_uri', redirectUrl)
      authorizeUrl.searchParams.set('scope', scopes)
      authorizeUrl.searchParams.set('state', state)

      const cookie = [
        `rubato_oauth_state=${encodeURIComponent(state)}`,
        'Path=/',
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        'Max-Age=600',
      ].join('; ')

      return new Response(null, {
        status: 302,
        headers: {
          location: authorizeUrl.toString(),
          'set-cookie': cookie,
          'cache-control': 'no-store',
        },
      })
    }

    if (pathname === '/callback') {
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')

      if (!code) {
        const script = buildLoginScript(oauthProvider, 'error', { error: 'Missing code' }, origins)
        return html(script, { status: 400, headers: { 'cache-control': 'no-store' } })
      }

      const cookieState = getCookie(request.headers.get('cookie'), 'rubato_oauth_state')
      if (!state || !cookieState || state !== cookieState) {
        const script = buildLoginScript(oauthProvider, 'error', { error: 'Invalid state' }, origins)
        return html(script, { status: 400, headers: { 'cache-control': 'no-store' } })
      }

      const tokenUrl = new URL(tokenHost)
      tokenUrl.pathname = tokenPath

      const body = new URLSearchParams()
      body.set('client_id', env.GITHUB_CLIENT_ID)
      body.set('client_secret', env.GITHUB_CLIENT_SECRET)
      body.set('code', code)
      body.set('redirect_uri', redirectUrl)
      body.set('state', state)

      const tokenRes = await fetch(tokenUrl.toString(), {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body,
      })

      const tokenJson = (await tokenRes.json().catch(() => null)) as
        | null
        | { access_token?: string; token_type?: string; scope?: string; error?: string; error_description?: string }

      if (!tokenRes.ok || !tokenJson?.access_token) {
        const script = buildLoginScript(
          oauthProvider,
          'error',
          {
            error: tokenJson?.error || 'token_exchange_failed',
            error_description: tokenJson?.error_description || `GitHub token exchange failed (${tokenRes.status}).`,
          },
          origins,
        )
        return html(script, { status: 400, headers: { 'cache-control': 'no-store' } })
      }

      const script = buildLoginScript(
        oauthProvider,
        'success',
        { token: tokenJson.access_token, provider: oauthProvider },
        origins,
      )
      return html(script, { headers: { 'cache-control': 'no-store' } })
    }

    return notFound()
  },
}

