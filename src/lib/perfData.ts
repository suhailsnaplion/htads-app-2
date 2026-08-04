// Seeded RNG so numbers are stable across re-renders (not Math.random on every paint).
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0 }
  return h
}

export interface DailyPoint {
  date: string
  [metric: string]: number | string
}

export interface AudienceRow {
  name: string
  isLookalike?: boolean
  reach?: number
  targeted?: number
  delivered?: number
  deliveryRate?: number
  impressions?: number
  viewability?: number
  clicks: number
  ctr: number
  conversions: number
  cost: number
  revenue: number
  roi: number
}

export interface CreativeRow {
  name: string
  format?: string
  impressions?: number
  sent?: number
  deliveryRate?: number
  readRate?: number
  clicks: number
  ctr: number
  conversions: number
  cost: number
  revenue: number
}

export interface PostClickFunnelStage { label: string; value: number }

export interface ChannelPerf {
  channel: string
  outcomeLabel: string
  daily: DailyPoint[]
  primaryMetrics: string[] // which keys in `daily` to plot as lines
  audienceRows: AudienceRow[]
  creativeRows: CreativeRow[]
  creativeTableTitle: string
  postClick: { stages: PostClickFunnelStage[]; avgTicketSize: number; revenue: number }
  totalCost: number
  totalRevenue: number
  roiPct: number
  takeaways: string[]
}

const DAYS = 21

function dateLabels(): string[] {
  const labels: string[] = []
  const start = new Date('2026-07-15')
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    labels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }))
  }
  return labels
}

function rampSeries(rnd: () => number, base: number, growth: number, noise: number): number[] {
  const out: number[] = []
  let v = base
  for (let i = 0; i < DAYS; i++) {
    v = v * (1 + growth) + (rnd() - 0.5) * noise * base
    out.push(Math.max(0, Math.round(v)))
  }
  return out
}

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0) }
function round(n: number) { return Math.round(n) }
function pct(n: number, d: number) { return d > 0 ? round((n / d) * 1000) / 10 : 0 }

export function generateWhatsAppPerf(seedKey: string, outcomeLabel: string, messages: { label: string; templateId: string; cohort: string }[]): ChannelPerf {
  const rnd = mulberry32(hashSeed(seedKey))
  const dates = dateLabels()

  const sent = rampSeries(rnd, 2400, 0.01, 0.15)
  const delivered = sent.map(s => round(s * (0.93 + rnd() * 0.05)))
  const read = delivered.map(d => round(d * (0.6 + rnd() * 0.15)))
  const clicked = read.map(r => round(r * (0.12 + rnd() * 0.08)))
  const conversions = clicked.map(c => round(c * (0.1 + rnd() * 0.1)))
  const cost = sent.map(s => round(s * 2.1))
  const revenue = conversions.map(c => round(c * (2400 + rnd() * 800)))

  const daily: DailyPoint[] = dates.map((date, i) => ({
    date, Sent: sent[i], Delivered: delivered[i], Read: read[i], Clicked: clicked[i], Conversions: conversions[i],
    Cost: cost[i], Revenue: revenue[i],
  }))

  const totalSent = sum(sent), totalDelivered = sum(delivered), totalRead = sum(read), totalClicked = sum(clicked)
  const totalConv = sum(conversions), totalCost = sum(cost), totalRevenue = sum(revenue)

  // Split totals across the messages (cohorts/templates) proportionally with variation.
  // Volume weights and performance weights are independent, so CTR/rates genuinely
  // differ per instance instead of just scaling the same ratio down.
  const volWeights = messages.map(() => 0.6 + rnd() * 0.8)
  const volWSum = sum(volWeights.map(w => w * 100)) / 100
  const perfWeights = messages.map(() => 0.55 + rnd() * 0.9)
  const audienceRows: AudienceRow[] = messages.map((m, i) => {
    const volShare = volWeights[i] / volWSum
    const perfMult = perfWeights[i]
    const sentShare = round(totalSent * volShare)
    const d = round(totalDelivered * volShare)
    const r = round(totalRead * volShare * Math.min(1.15, perfMult))
    const c = round(Math.min(r, totalClicked * volShare * perfMult))
    const conv = round(Math.min(c, totalConv * volShare * perfMult))
    const cst = round(totalCost * volShare)
    const rev = round(totalRevenue * volShare * perfMult)
    return {
      name: m.cohort || 'Manual list', targeted: sentShare, delivered: d,
      deliveryRate: pct(d, sentShare), clicks: c, ctr: pct(c, d), conversions: conv,
      cost: cst, revenue: rev, roi: cst > 0 ? round(((rev - cst) / cst) * 100) : 0,
    }
  })

  const creativeRows: CreativeRow[] = messages.map((m, i) => {
    const volShare = volWeights[i] / volWSum
    const perfMult = perfWeights[i]
    const s = round(totalSent * volShare)
    const d = round(totalDelivered * volShare)
    const r = round(Math.min(d, totalRead * volShare * Math.min(1.15, perfMult)))
    const c = round(Math.min(r, totalClicked * volShare * perfMult))
    const conv = round(Math.min(c, totalConv * volShare * perfMult))
    return {
      name: m.templateId, sent: s, deliveryRate: pct(d, s), readRate: pct(r, d), clicks: c, ctr: pct(c, d),
      conversions: conv, cost: round(totalCost * volShare), revenue: round(totalRevenue * volShare * perfMult),
    }
  })

  const landed = round(totalClicked * 0.82)
  const addedToCart = round(landed * 0.35)
  const transacted = round(addedToCart * 0.42)
  const avgTicket = 3200 + Math.round(rnd() * 900)
  const revenueFromFunnel = transacted * avgTicket

  const bestCreative = [...creativeRows].sort((a, b) => b.ctr - a.ctr)[0]
  const bestAudience = [...audienceRows].sort((a, b) => b.roi - a.roi)[0]
  const roiPct = totalCost > 0 ? round(((totalRevenue - totalCost) / totalCost) * 100) : 0
  const deliveryRate = pct(totalDelivered, totalSent)
  const readRate = pct(totalRead, totalDelivered)

  return {
    channel: 'WhatsApp', outcomeLabel, daily, primaryMetrics: ['Sent', 'Delivered', 'Read', 'Clicked'],
    audienceRows, creativeRows, creativeTableTitle: 'Template performance',
    postClick: { stages: [{ label: 'Landed on site', value: landed }, { label: 'Added to Cart', value: addedToCart }, { label: 'Transacted', value: transacted }], avgTicketSize: avgTicket, revenue: revenueFromFunnel },
    totalCost, totalRevenue, roiPct,
    takeaways: [
      `Delivery rate held at ${deliveryRate}% and read rate at ${readRate}% across the flight — both within healthy WhatsApp Business API benchmarks.`,
      `"${bestCreative.name}" is the strongest template at ${bestCreative.ctr}% CTR — consider shifting more sends toward it.`,
      `${bestAudience.name} is the most efficient cohort at ${bestAudience.roi}% ROI; overall channel ROI is ${roiPct}%.`,
    ],
  }
}

export function generateDspPerf(seedKey: string, outcomeLabel: string, inventories: { label: string; mediaType: string }[], cohortName: string, hasLookalike: boolean): ChannelPerf {
  const rnd = mulberry32(hashSeed(seedKey))
  const dates = dateLabels()

  const impressions = rampSeries(rnd, 28000, 0.015, 0.18)
  const reach = impressions.map(v => round(v * (0.55 + rnd() * 0.1)))
  const viewable = impressions.map(v => round(v * (0.68 + rnd() * 0.15)))
  const clicks = viewable.map(v => round(v * (0.0012 + rnd() * 0.001)))
  const conversions = clicks.map(c => round(c * (0.2 + rnd() * 0.15)))
  const cost = impressions.map(v => round((v / 1000) * 85))
  const revenue = conversions.map(c => round(c * (2600 + rnd() * 900)))

  const daily: DailyPoint[] = dates.map((date, i) => ({
    date, Impressions: impressions[i], 'Viewable Impressions': viewable[i], Clicks: clicks[i], Conversions: conversions[i],
    Cost: cost[i], Revenue: revenue[i],
  }))

  const totalImpr = sum(impressions), totalReach = sum(reach), totalViewable = sum(viewable)
  const totalClicks = sum(clicks), totalConv = sum(conversions), totalCost = sum(cost), totalRevenue = sum(revenue)

  const audienceNames = hasLookalike ? [cohortName || 'HTAuto_HighIntent_Apr26', `Lookalike of ${cohortName || 'HTAuto_HighIntent_Apr26'}`] : [cohortName || 'HTAuto_HighIntent_Apr26']
  const volWeights = audienceNames.map((_, i) => (hasLookalike && i === 1 ? 0.55 : 0.45) + rnd() * 0.1)
  const volWSum = sum(volWeights.map(w => w * 100)) / 100
  const perfWeights = audienceNames.map((_, i) => (hasLookalike && i === 1 ? 1.1 : 0.85) + rnd() * 0.5)
  const audienceRows: AudienceRow[] = audienceNames.map((name, i) => {
    const volShare = volWeights[i] / volWSum
    const perfMult = perfWeights[i]
    const impr = round(totalImpr * volShare)
    const c = round(Math.min(impr, totalClicks * volShare * perfMult))
    const conv = round(Math.min(c, totalConv * volShare * perfMult))
    const cst = round(totalCost * volShare)
    const rev = round(totalRevenue * volShare * perfMult)
    return {
      name, isLookalike: name.startsWith('Lookalike'), reach: round(totalReach * volShare), impressions: impr,
      viewability: pct(round(totalViewable * volShare), impr), clicks: c, ctr: pct(c, impr), conversions: conv,
      cost: cst, revenue: rev, roi: cst > 0 ? round(((rev - cst) / cst) * 100) : 0,
    }
  })

  const invVolWeights = inventories.map(() => 0.6 + rnd() * 0.8)
  const invVolWSum = sum(invVolWeights.map(w => w * 100)) / 100
  const invPerfWeights = inventories.map(() => 0.55 + rnd() * 0.9)
  const creativeRows: CreativeRow[] = inventories.map((inv, i) => {
    const volShare = invVolWeights[i] / invVolWSum
    const perfMult = invPerfWeights[i]
    const impr = round(totalImpr * volShare)
    const c = round(Math.min(impr, totalClicks * volShare * perfMult))
    const conv = round(Math.min(c, totalConv * volShare * perfMult))
    return {
      name: inv.label, format: inv.mediaType, impressions: impr, clicks: c, ctr: pct(c, impr),
      conversions: conv, cost: round(totalCost * volShare), revenue: round(totalRevenue * volShare * perfMult),
    }
  })

  const landed = round(totalClicks * 0.75)
  const addedToCart = round(landed * 0.3)
  const transacted = round(addedToCart * 0.38)
  const avgTicket = 3400 + Math.round(rnd() * 1000)
  const revenueFromFunnel = transacted * avgTicket

  const bestInv = [...creativeRows].sort((a, b) => b.ctr - a.ctr)[0]
  const bestAudience = [...audienceRows].sort((a, b) => b.roi - a.roi)[0]
  const roiPct = totalCost > 0 ? round(((totalRevenue - totalCost) / totalCost) * 100) : 0
  const viewabilityPct = pct(totalViewable, totalImpr)

  const takeaways = [
    `Average viewability was ${viewabilityPct}% across ${totalImpr.toLocaleString('en-IN')} impressions — ${viewabilityPct >= 70 ? 'above' : 'below'} the 70% industry benchmark.`,
    `"${bestInv.name}" is the best-performing inventory at ${bestInv.ctr}% CTR.`,
  ]
  if (hasLookalike) takeaways.push(`The Lookalike audience is ${audienceRows[1].roi > audienceRows[0].roi ? 'outperforming' : 'underperforming vs.'} the seed cohort (${audienceRows[1].roi}% vs ${audienceRows[0].roi}% ROI).`)
  else takeaways.push(`Channel ROI stands at ${roiPct}% — consider testing a lookalike of ${cohortName || 'the current cohort'} to expand reach.`)

  return {
    channel: 'DSP', outcomeLabel, daily, primaryMetrics: ['Impressions', 'Viewable Impressions', 'Clicks'],
    audienceRows, creativeRows, creativeTableTitle: 'Inventory / Creative performance',
    postClick: { stages: [{ label: 'Landed on site', value: landed }, { label: 'Added to Cart', value: addedToCart }, { label: 'Transacted', value: transacted }], avgTicketSize: avgTicket, revenue: revenueFromFunnel },
    totalCost, totalRevenue, roiPct, takeaways,
  }
}

export function generateEchoPerf(seedKey: string, outcomeLabel: string, inventories: { label: string; creativeType: string }[]): ChannelPerf {
  const rnd = mulberry32(hashSeed(seedKey))
  const dates = dateLabels()

  const impressions = rampSeries(rnd, 20000, 0.02, 0.2)
  const uniqueViewers = impressions.map(v => round(v * (0.7 + rnd() * 0.1)))
  const clicks = impressions.map(v => round(v * (0.018 + rnd() * 0.012)))
  const conversions = clicks.map(c => round(c * (0.06 + rnd() * 0.05)))
  const cost = impressions.map(v => round(v * 0.6))
  const revenue = conversions.map(c => round(c * (2200 + rnd() * 700)))

  const daily: DailyPoint[] = dates.map((date, i) => ({
    date, Impressions: impressions[i], 'Unique Viewers': uniqueViewers[i], Clicks: clicks[i], Conversions: conversions[i],
    Cost: cost[i], Revenue: revenue[i],
  }))

  const totalImpr = sum(impressions), totalClicks = sum(clicks), totalConv = sum(conversions)
  const totalCost = sum(cost), totalRevenue = sum(revenue)

  const invVolWeights = inventories.map(() => 0.6 + rnd() * 0.8)
  const invVolWSum = sum(invVolWeights.map(w => w * 100)) / 100
  const invPerfWeights = inventories.map(() => 0.55 + rnd() * 0.9)
  const creativeRows: CreativeRow[] = inventories.map((inv, i) => {
    const volShare = invVolWeights[i] / invVolWSum
    const perfMult = invPerfWeights[i]
    const impr = round(totalImpr * volShare)
    const c = round(Math.min(impr, totalClicks * volShare * perfMult))
    const conv = round(Math.min(c, totalConv * volShare * perfMult))
    return {
      name: inv.label, format: inv.creativeType, impressions: impr, clicks: c, ctr: pct(c, impr),
      conversions: conv, cost: round(totalCost * volShare), revenue: round(totalRevenue * volShare * perfMult),
    }
  })

  const audienceRows: AudienceRow[] = [{
    name: 'On-site visitors (all eligible)', impressions: totalImpr, clicks: totalClicks, ctr: pct(totalClicks, totalImpr),
    conversions: totalConv, cost: totalCost, revenue: totalRevenue, roi: totalCost > 0 ? round(((totalRevenue - totalCost) / totalCost) * 100) : 0,
  }]

  const landed = round(totalClicks * 0.9) // already on-site
  const addedToCart = round(landed * 0.32)
  const transacted = round(addedToCart * 0.4)
  const avgTicket = 3100 + Math.round(rnd() * 850)
  const revenueFromFunnel = transacted * avgTicket

  const bestInv = [...creativeRows].sort((a, b) => b.ctr - a.ctr)[0]
  const worstInv = [...creativeRows].sort((a, b) => a.ctr - b.ctr)[0]
  const roiPct = totalCost > 0 ? round(((totalRevenue - totalCost) / totalCost) * 100) : 0

  return {
    channel: 'Echo', outcomeLabel, daily, primaryMetrics: ['Impressions', 'Unique Viewers', 'Clicks'],
    audienceRows, creativeRows, creativeTableTitle: 'Inventory / Placement performance',
    postClick: { stages: [{ label: 'Added to Cart', value: addedToCart }, { label: 'Transacted', value: transacted }], avgTicketSize: avgTicket, revenue: revenueFromFunnel },
    totalCost, totalRevenue, roiPct,
    takeaways: [
      `"${bestInv.name}" is the top placement at ${bestInv.ctr}% CTR${inventories.length > 1 && worstInv.name !== bestInv.name ? `, while "${worstInv.name}" trails at ${worstInv.ctr}%` : ''}.`,
      `Channel ROI is ${roiPct}% on ₹${totalCost.toLocaleString('en-IN')} spent to date.`,
      `${totalConv.toLocaleString('en-IN')} ${outcomeLabel.toLowerCase()} generated from ${totalImpr.toLocaleString('en-IN')} impressions this flight.`,
    ],
  }
}
