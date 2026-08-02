const TOKEN_KEY = 'htads_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),

  listCampaigns: () => request('/campaigns'),
  campaignStats: () => request('/campaigns/stats'),
  getCampaign: (id: string) => request(`/campaigns/${id}`),
  createCampaign: (formData: unknown) =>
    request('/campaigns', { method: 'POST', body: JSON.stringify(formData) }),

  buRegistry: () => request('/registries/bu'),
  whatsappChannels: () => request('/registries/whatsapp-channels'),
  waTemplates: () => request('/registries/wa-templates'),
  cohorts: () => request('/registries/cohorts'),
  placements: () => request('/registries/placements'),

  testSendWhatsapp: (payload: { channelId: string; phone: string; templateId: string; vars: string[] }) =>
    request('/whatsapp/test-send', { method: 'POST', body: JSON.stringify(payload) }),
}
