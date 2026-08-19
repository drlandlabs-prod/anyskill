// Live AI engine — OpenAI-compatible chat completions.
// Keys are kept in sessionStorage (not localStorage) and cleared with the browser session.
// Production should proxy provider calls through a server-side API.

export interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
}

export interface AIPreset {
  name: string
  baseUrl: string
  model: string
  requiresApiKey: boolean
  supportsJsonMode: boolean
}

const META_KEY = 'anyskill.ai.meta'
const SESSION_KEY = 'anyskill.ai.key'

export const AI_PRESETS: AIPreset[] = [
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', requiresApiKey: true, supportsJsonMode: true },
  { name: 'Kimi (Moonshot)', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', requiresApiKey: true, supportsJsonMode: false },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini', requiresApiKey: true, supportsJsonMode: false },
  { name: 'Ollama (local)', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1', requiresApiKey: false, supportsJsonMode: false },
]

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/$/, '')
}

export function getPresetForConfig(cfg: Pick<AIConfig, 'baseUrl'>): AIPreset | null {
  const base = normalizeBaseUrl(cfg.baseUrl)
  return AI_PRESETS.find((p) => normalizeBaseUrl(p.baseUrl) === base) ?? null
}

function isAllowedBaseUrl(url: string) {
  const base = normalizeBaseUrl(url)
  if (AI_PRESETS.some((p) => normalizeBaseUrl(p.baseUrl) === base)) return true
  try {
    const parsed = new URL(base)
    return parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
  } catch {
    return false
  }
}

export function isAIConfigUsable(cfg: AIConfig | null): cfg is AIConfig {
  if (!cfg || !cfg.model.trim() || !isAllowedBaseUrl(cfg.baseUrl)) return false
  const preset = getPresetForConfig(cfg)
  if (preset?.requiresApiKey === false) return true
  return !!cfg.apiKey.trim()
}

export function loadAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return null
    const meta = JSON.parse(raw) as Omit<AIConfig, 'apiKey'>
    const cfg: AIConfig = {
      ...meta,
      apiKey: sessionStorage.getItem(SESSION_KEY) ?? '',
    }
    return isAIConfigUsable(cfg) ? cfg : null
  } catch {
    return null
  }
}

export function saveAIConfig(cfg: AIConfig | null) {
  if (!cfg) {
    localStorage.removeItem(META_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  if (!isAllowedBaseUrl(cfg.baseUrl)) throw new Error('Unsupported AI base URL. Use a preset or localhost.')
  const preset = getPresetForConfig(cfg)
  if (preset?.requiresApiKey !== false && !cfg.apiKey.trim()) throw new Error('API key required for this provider.')
  localStorage.setItem(META_KEY, JSON.stringify({ baseUrl: normalizeBaseUrl(cfg.baseUrl), model: cfg.model.trim() }))
  if (cfg.apiKey.trim()) sessionStorage.setItem(SESSION_KEY, cfg.apiKey.trim())
  else sessionStorage.removeItem(SESSION_KEY)
}

async function chat(cfg: AIConfig, system: string, user: string): Promise<string> {
  if (!isAIConfigUsable(cfg)) throw new Error('AI configuration is incomplete or unsafe')
  const preset = getPresetForConfig(cfg)
  const body: Record<string, unknown> = {
    model: cfg.model,
    temperature: 0.4,
    messages: [
      { role: 'system', content: system + '\nRespond with valid JSON only.' },
      { role: 'user', content: user },
    ],
  }
  if (preset?.supportsJsonMode) body.response_format = { type: 'json_object' }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`

  const res = await fetch(`${normalizeBaseUrl(cfg.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export interface AIGraphNode {
  id: string
  label: string
  kind: 'concept' | 'procedure' | 'fact'
  tier: number
  hours: number
  prereqs: string[]
  transfer: boolean
}

export interface AIGraph {
  skill: string
  nodes: AIGraphNode[]
}

export async function decomposeSkillAI(cfg: AIConfig, skill: string, priorLevel: string): Promise<AIGraph> {
  const raw = await chat(
    cfg,
    `You are a curriculum architect for a rapid skill-acquisition app (10–20 hours to basic competence).
Decompose a skill into a DAG of 10–16 trainable nodes. Rules:
- nodes are concepts, procedures, or facts; each takes 0.5–2.5 hours
- tier = depth level (0 = foundations, no prereqs; capstone at the highest tier, label starts with "CAPSTONE ·")
- prereqs reference node ids from LOWER tiers only
- mark "transfer": true on nodes that transfer to other disciplines
- the final node is a real-world capstone artifact
- ids: short snake_case`,
    `Skill: "${skill}". The learner's prior level: ${priorLevel}. Return JSON: {"skill":"...","nodes":[{"id":"...","label":"...","kind":"concept","tier":0,"hours":1,"prereqs":[],"transfer":true}]}`,
  )
  const parsed = JSON.parse(raw) as AIGraph
  if (!Array.isArray(parsed.nodes) || parsed.nodes.length < 4) throw new Error('bad graph')
  const byId = new Map(parsed.nodes.map((n) => [n.id, n]))
  parsed.nodes.forEach((n) => {
    n.prereqs = (n.prereqs ?? []).filter((p) => {
      const pn = byId.get(p)
      return pn && pn.tier < n.tier
    })
  })
  return parsed
}

export interface AIDrill {
  prompt: string
  hint: string
  goodSignals: string[]
}

export async function generateDrillAI(cfg: AIConfig, nodeLabel: string, kind: string, skill: string): Promise<AIDrill> {
  const raw = await chat(
    cfg,
    `You are a deliberate-practice coach. Write ONE realistic practice scenario for a specific node of a skill.
- concrete names, numbers, and stakes
- doable in 20–30 minutes
- requires applying the node, not recalling trivia
- hint: one sentence describing what strong answers do
- goodSignals: 6–10 short lowercase strings for fallback scoring`,
    `Skill: "${skill}". Node: "${nodeLabel}" (a ${kind}). Return JSON: {"prompt":"...","hint":"...","goodSignals":["..."]}`,
  )
  const parsed = JSON.parse(raw) as AIDrill
  if (!parsed.prompt || !Array.isArray(parsed.goodSignals)) throw new Error('bad drill')
  return parsed
}

export interface AIEvaluation {
  good: boolean
  feedback: string
  masteryDelta: number
  score?: number
}

export async function evaluateAnswerAI(
  cfg: AIConfig,
  nodeLabel: string,
  drillPrompt: string,
  answer: string,
): Promise<AIEvaluation> {
  const raw = await chat(
    cfg,
    `You are a precise deliberate-practice evaluator.
- judge whether the learner applied the underlying principle, not just keywords
- feedback: 2–4 sentences: what was strong, what was missing, one concrete improvement
- good: true if a competent practitioner would pass
- score: 0..1
- masteryDelta: 0.02..0.20 based on demonstrated understanding`,
    `Node: "${nodeLabel}". Drill: "${drillPrompt}". Learner's answer: "${answer}". Return JSON: {"good":true,"feedback":"...","score":0.8,"masteryDelta":0.12}`,
  )
  const parsed = JSON.parse(raw) as AIEvaluation
  if (typeof parsed.good !== 'boolean' || !parsed.feedback) throw new Error('bad evaluation')
  parsed.masteryDelta = Math.min(0.2, Math.max(0.02, Number(parsed.masteryDelta) || 0.05))
  parsed.score = Math.min(1, Math.max(0, Number(parsed.score) || (parsed.good ? 0.75 : 0.35)))
  return parsed
}

export async function evaluateReflectionAI(
  cfg: AIConfig,
  nodeLabel: string,
  reflection: string,
): Promise<AIEvaluation> {
  const raw = await chat(
    cfg,
    `Evaluate a Feynman-style explanation of a skill concept.
Score four things: correctness, causal understanding, compression/clarity, and misconceptions.
A long answer is not automatically good.
- good: true only if the explanation is materially correct and shows understanding
- score: 0..1
- masteryDelta: 0..0.10; use 0 for incorrect or empty explanations
- feedback: 2–3 specific sentences`,
    `Concept: "${nodeLabel}". Learner explanation: "${reflection}". Return JSON: {"good":true,"feedback":"...","score":0.8,"masteryDelta":0.07}`,
  )
  const parsed = JSON.parse(raw) as AIEvaluation
  if (typeof parsed.good !== 'boolean' || !parsed.feedback) throw new Error('bad reflection evaluation')
  parsed.masteryDelta = Math.min(0.1, Math.max(0, Number(parsed.masteryDelta) || 0))
  parsed.score = Math.min(1, Math.max(0, Number(parsed.score) || (parsed.good ? 0.75 : 0.25)))
  return parsed
}

export async function pingAI(cfg: AIConfig): Promise<string> {
  const raw = await chat(cfg, 'Reply with JSON: {"ok": true}', 'ping')
  return raw.includes('ok') ? 'connected' : raw.slice(0, 60)
}
