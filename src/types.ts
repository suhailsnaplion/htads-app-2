export type Screen = 'login' | 'dashboard' | 'wizard' | 'advanced' | 'admin' | 'help' | 'intelligence'

export type Channel = 'Echo' | 'DSP' | 'WhatsApp' | 'Voice AI' | 'Meta'

// A single Echo placement/inventory. A campaign can run several of these on
// Echo at once (e.g. Top Banner on Web + Interstitial on App), each with its
// own delivery mechanics, while audience/tracking/form fields stay shared
// across all of them at the channel level.
export interface EchoInventory {
  id: string
  property: string
  platform: string
  position: string
  inventoryType: string
  pages: string
  specificPages: string[]
  creativeType: string
  scheduleEnabled: boolean
  daySchedule: string[]
  timeStart: string
  timeEnd: string
  freqCapEnabled: boolean
  freqSession: string
  freqDaily: string
  freqWeekly: string
}

// A single DSP buy — its own media type, bidding, and creative — while
// audience/optimization/attribution/brand-safety stay shared across all of
// them for this campaign.
export interface DspInventory {
  id: string
  mediaType: string
  biddingType: string
  bidCap: string
  creativeFileName: string
}

// A single WhatsApp message/template send, optionally to its own cohort —
// while the send window and daily rate limit stay shared across all
// messages sent on this campaign.
export interface WaMessage {
  id: string
  waChannelId: string
  cohort: string
  templateId: string
  var1: string
  var2: string
  var3: string
  valueMethod: string
  recipients: string
}

export interface CampaignFormData {
  // Step 1 — Identity
  campaignName: string
  businessUnit: string
  dealType: string
  agencyCode: string

  // Objective
  objective: string
  goalLayer: string
  attributionMethod: string
  unitPrice: string
  targetVolume: string
  dailyTarget: string
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
  defaultBqInclude: string[]
  defaultRealtimeInclude: string
  defaultBqExclude: string[]
  defaultRealtimeExclude: string
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
  echoInventories: EchoInventory[]
  echoCohort: string
  echoExperimentEnabled: boolean
  echoAbSplit: string
  echoAbVariantA: string
  echoAbVariantB: string
  echoFormFields: string[]
  echoUtmSource: string
  echoUtmMedium: string
  echoUserState: string
  echoUserSource: string
  echoAdditionalSettingsEnabled: boolean
  echoPriority: string
  echoCountry: string

  // Step 3 — DSP
  dspAudienceType: string
  dspCohort: string
  dspInventories: DspInventory[]
  dspOptimizationGoal: string
  dspAttributionMethod: string
  dspBrandSafety: string
  dspViewability: string
  dspFreqCap: string
  dspGeoOverride: boolean
  dspGeoInclude: string[]
  dspGeoExclude: string[]

  // Step 3 — WhatsApp
  waMessages: WaMessage[]
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
  metaCohort: string
  metaGeoOverride: boolean
  metaGeoInclude: string[]
  metaGeoExclude: string[]
  metaObjective: string
  metaConversionLocation: string
  metaOptimizationGoal: string
  metaAdvantageAudience: boolean
  metaDetailedTargeting: string[]
  metaAgeMin: string
  metaAgeMax: string
  metaGender: string
  metaPlacementsMode: string
  metaManualPlacements: string[]
  metaAttributionSetting: string
  metaBidStrategy: string
  metaBidAmount: string
  metaIdentityPage: string
  metaAdFormat: string
  metaPrimaryText: string
  metaHeadline: string
  metaDescription: string
  metaCta: string
  metaDestinationUrl: string
  metaInstantFormFields: string[]
  metaPrivacyPolicyUrl: string
  metaUtmParams: string

  // Step 4 — Preflight
  preflightChecked: string[]
}

export const defaultFormData: CampaignFormData = {
  campaignName: 'Honda City — Q3 Lead Gen',
  businessUnit: 'HTAuto',
  dealType: 'Direct',
  agencyCode: '',
  objective: 'CPL – Cost per Lead',
  goalLayer: 'Acquisition',
  attributionMethod: 'Last Click',
  unitPrice: '145',
  targetVolume: '5500',
  dailyTarget: '',
  totalBudget: '800000',
  goCutomFork: '',
  autoBudgetAllocation: false,
  startDate: '2026-08-15',
  endDate: '2026-11-15',
  state: 'Maharashtra',
  city: 'Mumbai',
  zone: 'West',
  pincode: '400001',
  defaultBqInclude: ['All users'],
  defaultRealtimeInclude: '',
  defaultBqExclude: [],
  defaultRealtimeExclude: '',
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
  echoInventories: [
    {
      id: 'echo-inv-1', property: 'HTAuto Web', platform: 'WEB', position: 'Top Banner',
      inventoryType: 'Standalone', pages: 'All pages', specificPages: [],
      creativeType: 'Choose from templates',
      scheduleEnabled: false, daySchedule: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timeStart: '09:00', timeEnd: '21:00',
      freqCapEnabled: true, freqSession: '1', freqDaily: '3', freqWeekly: '8',
    },
  ],
  echoCohort: '', // '' = inherit campaign default
  echoExperimentEnabled: false,
  echoAbSplit: '50',
  echoAbVariantA: 'Variant A — Control',
  echoAbVariantB: 'Variant B — Test',
  echoFormFields: ['Name', 'Phone', 'City'],
  echoUtmSource: 'echo-onsite',
  echoUtmMedium: 'banner',
  echoUserState: 'Non-Loggedin',
  echoUserSource: 'All Sources',
  echoAdditionalSettingsEnabled: false,
  echoPriority: '3',
  echoCountry: 'All',
  dspAudienceType: 'Retargeting',
  dspCohort: '', // '' = inherit campaign default
  dspInventories: [
    { id: 'dsp-inv-1', mediaType: 'Display', biddingType: 'CPM', bidCap: '85', creativeFileName: '' },
  ],
  dspOptimizationGoal: 'New Visitor',
  dspAttributionMethod: 'Last Click',
  dspBrandSafety: 'Standard',
  dspViewability: '70%',
  dspFreqCap: '3 impressions / user / day',
  dspGeoOverride: false,
  dspGeoInclude: ['Maharashtra', 'Delhi NCR'],
  dspGeoExclude: [],
  waMessages: [
    {
      id: 'wa-msg-1', waChannelId: 'wa_htauto_primary', cohort: '', templateId: 'lead_confirmation_v2',
      var1: 'Ravi Sharma', var2: 'Honda City', var3: '24', valueMethod: 'manual', recipients: '+91 98200 11234',
    },
  ],
  waTimeStart: '10:00',
  waTimeEnd: '20:00',
  waDailyLimit: '5000',
  voiceCohort: '', // '' = inherit campaign default
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
  metaCohort: '', // '' = inherit campaign default
  metaGeoOverride: false,
  metaGeoInclude: [],
  metaGeoExclude: [],
  metaObjective: 'Leads',
  metaConversionLocation: 'Instant Forms',
  metaOptimizationGoal: 'Leads',
  metaAdvantageAudience: true,
  metaDetailedTargeting: ['In-market: Automotive'],
  metaAgeMin: '25',
  metaAgeMax: '54',
  metaGender: 'All',
  metaPlacementsMode: 'advantage',
  metaManualPlacements: [],
  metaAttributionSetting: 'Standard (7-day click, 1-day view)',
  metaBidStrategy: 'Highest volume',
  metaBidAmount: '',
  metaIdentityPage: 'HT Auto — Official',
  metaAdFormat: 'Single image or video',
  metaPrimaryText: 'Looking for your next car? Explore the all-new Honda City — book a test drive today.',
  metaHeadline: 'Honda City — Book a Test Drive',
  metaDescription: 'Limited festive offers available this month.',
  metaCta: 'Sign Up',
  metaDestinationUrl: '',
  metaInstantFormFields: ['Full name', 'Phone number', 'City'],
  metaPrivacyPolicyUrl: 'https://www.hondacarindia.com/privacy-policy',
  metaUtmParams: 'utm_source=meta&utm_medium=paid_social',
  preflightChecked: [],
}
