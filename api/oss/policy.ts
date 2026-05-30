import crypto from 'node:crypto'

type Json = Record<string, any>

const json = (res: any, status: number, body: Json) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

const safeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'Method Not Allowed' })

  const region = String(process.env.OSS_REGION || '').trim()
  const bucket = String(process.env.OSS_BUCKET || '').trim()
  const accessKeyId = String(process.env.OSS_ACCESS_KEY_ID || '').trim()
  const accessKeySecret = String(process.env.OSS_ACCESS_KEY_SECRET || '').trim()
  const publicHost = String(process.env.OSS_PUBLIC_HOST || '').trim()
  const dirPrefix = String(process.env.OSS_DIR_PREFIX || 'rubato/').trim()

  if (!region || !bucket || !accessKeyId || !accessKeySecret) {
    return json(res, 500, { error: 'OSS env missing' })
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : null) as null | { filename?: string }
  const filename = safeName(String(body?.filename || 'file'))
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : ''
  const rand = crypto.randomBytes(8).toString('hex')
  const key = `${dirPrefix}${Date.now()}-${rand}${ext || ''}`

  const host = publicHost || `https://${bucket}.${region}.aliyuncs.com`

  const expiration = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const policy = {
    expiration,
    conditions: [
      ['content-length-range', 0, 10 * 1024 * 1024],
      ['starts-with', '$key', dirPrefix],
    ],
  }

  const policyBase64 = Buffer.from(JSON.stringify(policy)).toString('base64')
  const signature = crypto.createHmac('sha1', accessKeySecret).update(policyBase64).digest('base64')

  return json(res, 200, {
    host,
    key,
    url: `${host}/${key}`,
    form: {
      key,
      policy: policyBase64,
      OSSAccessKeyId: accessKeyId,
      signature,
      success_action_status: '200',
    },
  })
}

