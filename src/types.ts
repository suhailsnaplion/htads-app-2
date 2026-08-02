export type Screen = 'login' | 'dashboard' | 'wizard' | 'advanced' | 'admin' | 'help'

export type Channel = 'Echo' | 'DSP' | 'WhatsApp' | 'Voice AI' | 'Meta'

export interface CampaignFormData {
  // Step 1 — Identity
  campaignName: string
  businessUnit: string
  dealType: string
  agencyCode: string

  // Objective
  objective: string
  actionType: string
  goalLayer: string
  attributionMethod: string
  unitPrice: string
  targetVolume: string
  totalBudget: string
  goCutomFork: string
  autoBudgetAllocation: boolean

  // Timing
  startDate: string
  endDate: string
  state: string
  city: string
  zone: string
  pincode: string
  drrCap: string

  // Tracking
  utmSource: string
  utmCampaign: string
  utmMedium: string
  utmTerm: string
  utmContent: string
  autoExportSheets: boolean

  // HTAuto branch
  htAutoClient: string
  vehicleType: string
  modelVisibility: string
  selectedModels: string[]
  competitorMapping: string[]
  duplicacyKeys: string[]
  leadQualityGrid: Record<string, boolean>
  samplingEnabled: boolean

  // Affiliates branch
  marketplace: string
  productModel: string

  // Education branch
  eduCampaignType: string
  eduProductName: string
  eduProductId: string
  eduBrand: string
  eduCustomFields: { key: string; value: string }[]
  eduCallVerified: boolean
  eduOtpVerified: boolean

  // Step 2 — Channels
  selectedChannels: Channel[]
  channelRoles: Record<Channel, string>
  channelBudgets: Record<Channel, string>

  // Step 3 — Echo
  echoProperty: string
  echoPlatform: string
  echoPosition: string
  echoCohort: string
  echoCreativeType: string
  echoScheduleEnabled: boolean
  echoDaySchedule: string[]
  echoTimeStart: string
  echoTimeEnd: string
  echoFreqCapEnabled: boolean
  echoFreqSession: string
  echoFreqDaily: string
  echoFreqWeekly: string
  echoExperimentEnabled: boolean
  echoAbSplit: string
  echoAbVariantA: string
  echoAbVariantB: string
  echoFormFields: string[]
  echoUtmSource: string
  echoUtmMedium: string

  // Step 3 — DSP
  dspAudienceType: string
  dspCohort: string
  dspMediaType: string
  dspBiddingType: string
  dspBidCap: string
  dspOptimizationGoal: string
  dspAttributionMethod: string
  dspBrandSafety: string
  dspViewability: string
  dspFreqCap: string
  dspGeoOverride: boolean
  dspGeoInclude: string[]
  dspGeoExclude: string[]

  // Step 3 — WhatsApp
  waChannelId: string
  waTemplateId: string
  waValueMethod: string
  waRecipients: string
  waVar1: string
  waVar2: string
  waVar3: string
  waTimeStart: string
  waTimeEnd: string
  waDailyLimit: string

  // Step 3 — Voice AI
  voiceCohort: string
  voiceScriptId: string
  voiceOutcomeMapping: string
  voiceCallStart: string
  voiceCallEnd: string
  voiceMaxRetries: string
  voiceRetryDelay: string
  voiceDtmf1: string
  voiceDtmf2: string
  voiceDtmf9: string
  voiceLeadDispositions: string[]

  // Step 3 — Meta
  metaChannelRole: string

  // Step 4 — Preflight
  preflightChecked: string[]
}

export const defaultFormData: CampaignFormData = {
  campaignName: 'Honda City — Q3 Lead Gen',
  businessUnit: 'HTAuto',
  dealType: 'Direct',
  agencyCode: '',
  objective: 'CPL – Cost per Lead',
  actionType: '',
  goalLayer: 'Acquisition',
  attributionMethod: 'Last Click',
  unitPrice: '145',
  targetVolume: '5500',
  totalBudget: '800000',
  goCutomFork: '',
  autoBudgetAllocation: false,
  startDate: '2026-08-15',
  endDate: '2026-11-15',
  state: 'Maharashtra',
  city: 'Mumbai',
  zone: 'West',
  pincode: '400001',
  drrCap: '180',
  utmSource: 'ht-ads',
  utmCampaign: 'honda-city-q3',
  utmMedium: 'multi-channel',
  utmTerm: '',
  utmContent: '',
  autoExportSheets: true,
  htAutoClient: 'Honda Cars India',
  vehicleType: 'Car',
  modelVisibility: 'Approved models only',
  selectedModels: ['City', 'Elevate'],
  competitorMapping: ['Hyundai Verna', 'Tata Nexon'],
  duplicacyKeys: ['Phone Number', 'Model', 'City'],
  leadQualityGrid: {
    'Primary_OTP-HTDS': true, 'Primary_OTP-Paid': false, 'Primary_WA': true, 'Primary_Call': false,
    'CrossSell_OTP-HTDS': false, 'CrossSell_OTP-Paid': false, 'CrossSell_WA': false, 'CrossSell_Call': true,
    'Competitor_OTP-HTDS': false, 'Competitor_OTP-Paid': false, 'Competitor_WA': false, 'Competitor_Call': false,
  },
  samplingEnabled: false,
  marketplace: 'Myntra',
  productModel: 'Myntra Fashion Sale — SKU MY-4471',
  eduCampaignType: 'CPL',
  eduProductName: 'NIIT — PG Diploma in Data Science',
  eduProductId: 'EDU-NIIT-PGDDS-04',
  eduBrand: 'NIIT',
  eduCustomFields: [{ key: 'Course duration', value: '11 months' }],
  eduCallVerified: true,
  eduOtpVerified: true,
  selectedChannels: ['Echo', 'DSP', 'WhatsApp'],
  channelRoles: { Echo: 'Primary Acquisition', DSP: 'Primary Acquisition', WhatsApp: 'Verification / Nurture', 'Voice AI': '', Meta: '' },
  channelBudgets: { Echo: '350000', DSP: '280000', WhatsApp: '120000', 'Voice AI': '', Meta: '' },
  echoProperty: 'HTAuto Web',
  echoPlatform: 'WEB',
  echoPosition: 'Top Banner',
  echoCohort: 'HTAuto_HighIntent_Apr26',
  echoCreativeType: 'Choose from templates',
  echoScheduleEnabled: false,
  echoDaySchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  echoTimeStart: '09:00',
  echoTimeEnd: '21:00',
  echoFreqCapEnabled: true,
  echoFreqSession: '1',
  echoFreqDaily: '3',
  echoFreqWeekly: '8',
  echoExperimentEnabled: false,
  echoAbSplit: '50',
  echoAbVariantA: 'Variant A — Control',
  echoAbVariantB: 'Variant B — Test',
  echoFormFields: ['Name', 'Phone', 'City'],
  echoUtmSource: 'echo-onsite',
  echoUtmMedium: 'banner',
  dspAudienceType: 'Retargeting',
  dspCohort: 'HTAuto_HighIntent_Apr26',
  dspMediaType: 'Display',
  dspBiddingType: 'CPM',
  dspBidCap: '85',
  dspOptimizationGoal: 'New Visitor',
  dspAttributionMethod: 'Last Click',
  dspBrandSafety: 'Standard',
  dspViewability: '70%',
  dspFreqCap: '3 impressions / user / day',
  dspGeoOverride: false,
  dspGeoInclude: ['Maharashtra', 'Delhi NCR'],
  dspGeoExclude: [],
  waChannelId: 'wa_htauto_primary',
  waTemplateId: 'lead_confirmation_v2',
  waValueMethod: 'manual',
  waRecipients: '+91 98200 11234',
  waVar1: 'Ravi Sharma',
  waVar2: 'Honda City',
  waVar3: '24',
  waTimeStart: '10:00',
  waTimeEnd: '20:00',
  waDailyLimit: '5000',
  voiceCohort: 'HTAuto_HighIntent_Apr26',
  voiceScriptId: 'ivr_lead_verify_v1',
  voiceOutcomeMapping: 'Feeds into Lead Quality Matrix → Call Verified',
  voiceCallStart: '09:00',
  voiceCallEnd: '18:00',
  voiceMaxRetries: '2',
  voiceRetryDelay: '120',
  voiceDtmf1: 'Interested — transfer to dealer',
  voiceDtmf2: 'Not interested — mark DNC',
  voiceDtmf9: 'Callback requested — schedule follow-up',
  voiceLeadDispositions: ['Interested', 'Call Back', 'Not Interested', 'Wrong Number'],
  metaChannelRole: 'Primary Acquisition',
  preflightChecked: [],
}
