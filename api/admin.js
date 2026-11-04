import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto'

// Git-backed portfolio CMS. No database; writes are GitHub commits.
// Required Vercel env: GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET,
// ADMIN_SESSION_SECRET (32+ random characters), ADMIN_SITE_URL (https://...).
const OWNER = 'mcartv'
const REPO = 'mcartv/cav-portfolio'
const BRANCH = 'main'
const CONTENT = { profile: 'src/data/profile.json', projects: 'src/data/projects.json' }
const TTL = 4 * 60 * 60
const response = (res, code, data) => res.status(code).json(data)
const site = () => (process.env.ADMIN_SITE_URL || '').replace(/\/$/, '')
const configured = () => Boolean(process.env.GITHUB_OAUTH_CLIENT_ID && process.env.GITHUB_OAUTH_CLIENT_SECRET && process.env.ADMIN_SESSION_SECRET?.length >= 32 && /^https:\/\/[^/]+$/.test(site()))
const key = () => createHash('sha256').update(process.env.ADMIN_SESSION_SECRET).digest()
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(s => s.trim().split(/=(.*)/s).slice(0,2).map(decodeURIComponent)).filter(x => x.length === 2))
function cookie(name, value, age) {
  return name + '=' + encodeURIComponent(value) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + age
}
function seal(object) {
  const nonce = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key(), nonce)
  const payload = Buffer.concat([cipher.update(JSON.stringify(object)), cipher.final()])
  return Buffer.concat([nonce, cipher.getAuthTag(), payload]).toString('base64url')
}
function unseal(value) {
  try {
    const all = Buffer.from(value, 'base64url')
    const decipher = createDecipheriv('aes-256-gcm', key(), all.subarray(0,12))
    decipher.setAuthTag(all.subarray(12,28))
    return JSON.parse(Buffer.concat([decipher.update(all.subarray(28)), decipher.final()]).toString())
  } catch { return null }
}
function validateOrigin(req) {
  return req.headers.origin === site()
}
async function github(token, path, options = {}) {
  const r = await fetch('https://api.github.com/' + path, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: 'Bearer ' + token,
      ...(options.headers || {}),
    },
  })
  const result = await r.json().catch(() => ({}))
  if (!r.ok) {
    const error = new Error(result.message || 'GitHub request failed')
    error.status = r.status
    throw error
  }
  return result
}
function validData(name, data) {
  if (name === 'profile') {
    return data && typeof data === 'object' && !Array.isArray(data)
      && typeof data.displayName === 'string' && typeof data.introduction === 'string'
      && Array.isArray(data.focus) && Array.isArray(data.education)
      && Array.isArray(data.experience) && Array.isArray(data.learning)
      && data.learning.length <= 100
      && data.learning.every(item => item && typeof item.title === 'string' && typeof item.issuer === 'string' && typeof item.date === 'string' && (!item.image || typeof item.image === 'string'))
  }
  return Array.isArray(data) && data.length >= 1 && data.length <= 30
    && data.every(item => item && typeof item.id === 'string' && typeof item.slug === 'string'
      && typeof item.title === 'string' && typeof item.summary === 'string'
      && Array.isArray(item.stack) && typeof item.color === 'string' && typeof item.mark === 'string')
}
function validImage(file) {
  if (!file || typeof file.content !== 'string' || typeof file.name !== 'string') return false
  if (!/\.(png|jpe?g|webp)$/i.test(file.name) || !/^[A-Za-z0-9._-]{1,80}$/.test(file.name)) return false
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(file.content) || file.content.length > 2_600_000) return false
  const bytes = Buffer.from(file.content, 'base64')
  if (bytes.length < 16 || bytes.length > 1_900_000) return false
  const extension = file.name.split('.').pop().toLowerCase()
  if (extension === 'png') return bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))
  if (extension === 'jpg' || extension === 'jpeg') return bytes.subarray(0,3).equals(Buffer.from('ffd8ff','hex'))
  if (extension === 'webp') return bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP'
  return false
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  const action = typeof req.query.action === 'string' ? req.query.action : 'status'
  if (!configured()) return response(res, 503, {error:'Admin editor is not configured. Set the four Vercel environment variables.'})
  try {
    if (req.method === 'GET' && action === 'login') {
      const state = randomBytes(24).toString('hex')
      const nonce = seal({state, exp:Date.now() + 10*60*1000})
      res.setHeader('Set-Cookie', cookie('portfolio_oauth', nonce, 600))
      const url = new URL('https://github.com/login/oauth/authorize')
      url.searchParams.set('client_id', process.env.GITHUB_OAUTH_CLIENT_ID)
      url.searchParams.set('redirect_uri', site() + '/api/admin?action=callback')
      url.searchParams.set('state', state)
      url.searchParams.set('scope', 'public_repo')
      return res.redirect(302, url.toString())
    }
    if (req.method === 'GET' && action === 'callback') {
      const state = unseal(cookies(req).portfolio_oauth || '')
      res.setHeader('Set-Cookie', cookie('portfolio_oauth','',0))
      const given = typeof req.query.state === 'string' ? req.query.state : ''
      if (!state || state.exp < Date.now() || given.length !== state.state.length ||
          !timingSafeEqual(Buffer.from(state.state), Buffer.from(given))) {
        return response(res,403,{error:'Invalid authorization state'})
      }
      if (!req.query.code || req.query.error) return response(res,403,{error:'GitHub authorization cancelled'})
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},
        body: JSON.stringify({client_id:process.env.GITHUB_OAUTH_CLIENT_ID,client_secret:process.env.GITHUB_OAUTH_CLIENT_SECRET,code:req.query.code,redirect_uri:site() + '/api/admin?action=callback'}),
      })
      const token = await tokenResponse.json()
      if (!tokenResponse.ok || !token.access_token) return response(res,401,{error:'GitHub login failed'})
      const user = await github(token.access_token, 'user')
      if (user.login?.toLowerCase() !== OWNER) return response(res,403,{error:'This editor is restricted to the repository owner'})
      res.setHeader('Set-Cookie',cookie('portfolio_session',seal({token:token.access_token,login:user.login,exp:Date.now() + TTL*1000}),TTL))
      return res.redirect(302,site() + '/?admin=1')
    }
    const session = unseal(cookies(req).portfolio_session || '')
    if (!session || session.exp < Date.now() || session.login.toLowerCase() !== OWNER) {
      return response(res,401,{error:'Sign in with the owner GitHub account'})
    }
    if (req.method === 'GET' && action === 'status') return response(res,200,{authenticated:true,login:session.login})
    if (req.method === 'GET' && action === 'content') {
      const path = CONTENT[req.query.name]
      if (!path) return response(res,400,{error:'Unknown content type'})
      const file = await github(session.token,'repos/' + REPO + '/contents/' + path + '?ref=' + BRANCH)
      return response(res,200,{sha:file.sha,data:JSON.parse(Buffer.from(file.content.replace(/\s/g,''),'base64').toString('utf8'))})
    }
    if (req.method === 'POST' && !validateOrigin(req)) return response(res,403,{error:'Invalid request origin'})
    if (req.method === 'POST' && action === 'logout') {
      res.setHeader('Set-Cookie',cookie('portfolio_session','',0))
      return response(res,200,{ok:true})
    }
    if (req.method === 'POST' && action === 'save') {
      const {name,sha,data} = req.body || {}
      if (!CONTENT[name] || typeof sha !== 'string' || !/^[a-f0-9]{40}$/.test(sha)
        || !validData(name,data) || JSON.stringify(data).length > 100_000) {
        return response(res,400,{error:'Invalid content or revision'})
      }
      const file = await github(session.token,'repos/' + REPO + '/contents/' + CONTENT[name], {
        method:'PUT',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:'content: update ' + name + ' via portfolio editor',
          content:Buffer.from(JSON.stringify(data,null,2) + '\n').toString('base64'),sha,branch:BRANCH}),
      })
      return response(res,200,{ok:true,sha:file.content.sha,commit:file.commit.sha})
    }
    if (req.method === 'POST' && action === 'upload') {
      const file = req.body || {}
      if (!validImage(file)) return response(res,400,{error:'Upload a PNG, JPG or WebP image under 1.9MB'})
      const name = file.name.toLowerCase().replace(/[^a-z0-9._-]/g,'-')
      const path = 'public/certificates/' + Date.now().toString(36) + '-' + randomBytes(4).toString('hex') + '-' + name
      await github(session.token,'repos/' + REPO + '/contents/' + path, {
        method:'PUT',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:'content: upload certificate image',content:file.content,branch:BRANCH}),
      })
      return response(res,200,{ok:true,url:'/' + path.slice('public/'.length)})
    }
    return response(res,405,{error:'Unsupported operation'})
  } catch (error) {
    const status = error.status === 409 || error.status === 422 ? 409
      : error.status === 401 || error.status === 403 ? error.status : 502
    return response(res,status,{error:status===409?'The file changed on GitHub. Reload and try again.':status===502?'GitHub service error. Try again.':error.message})
  }
}
