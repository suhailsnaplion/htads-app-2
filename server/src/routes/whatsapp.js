import { Router } from 'express'
import { pool } from '../db/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Real send only fires if Meta credentials are configured for this environment
// AND the specific channel has a wa_phone_number_id set. Otherwise this
// endpoint clearly reports a simulated send — it never pretends to succeed.
router.post('/test-send', requireAuth, async (req, res) => {
  const { channelId, phone, templateId, vars } = req.body || {}
  if (!channelId || !phone || !templateId) {
    return res.status(400).json({ error: 'channelId, phone, and templateId are required' })
  }

  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 10) return res.status(400).json({ error: 'Enter a valid 10-digit phone number' })

  const channelResult = await pool.query('SELECT * FROM whatsapp_channels WHERE id = $1', [channelId])
  const channel = channelResult.rows[0]
  if (!channel) return res.status(404).json({ error: 'Unknown WhatsApp channel' })

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const canSendReal = Boolean(accessToken && channel.wa_phone_number_id)

  let simulated = true
  let status = 'simulated'
  let providerResponse = null

  if (canSendReal) {
    try {
      const templateResult = await pool.query('SELECT * FROM wa_templates WHERE id = $1', [templateId])
      const tpl = templateResult.rows[0]
      const bodyParams = (vars || []).map(v => ({ type: 'text', text: String(v) }))

      const metaRes = await fetch(`https://graph.facebook.com/v20.0/${channel.wa_phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: digits.length === 10 ? `91${digits}` : digits,
          type: 'template',
          template: {
            name: templateId,
            language: { code: 'en' },
            components: tpl ? [{ type: 'body', parameters: bodyParams }] : [],
          },
        }),
      })
      providerResponse = await metaRes.json()
      simulated = false
      status = metaRes.ok ? 'sent' : 'failed'
    } catch (err) {
      simulated = false
      status = 'failed'
      providerResponse = { error: String(err) }
    }
  }

  await pool.query(
    `INSERT INTO whatsapp_test_sends (channel_id, phone, template_id, vars, simulated, status)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [channelId, digits, templateId, JSON.stringify(vars || []), simulated, status]
  )

  res.json({
    simulated,
    status,
    message: simulated
      ? 'Simulated — no WhatsApp Business API credentials are configured for this environment yet. Add WHATSAPP_ACCESS_TOKEN and a phone_number_id for this channel to send for real.'
      : (status === 'sent' ? 'Sent via WhatsApp Business API.' : 'WhatsApp API rejected the send — check provider response.'),
    providerResponse,
  })
})

export default router
