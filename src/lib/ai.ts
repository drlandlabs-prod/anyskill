// Live AI engine — OpenAI-compatible chat completions.
// Works with OpenAI, Moonshot/Kimi, OpenRouter, Ollama (any /v1/chat/completions).
// Key is stored locally in the browser only.

export interface AIConfig {
  apiKey: string
  baseUrl: string   // e.g. https://api.openai.com/v1  |  https://api.moonshot.cn/v1
  model: string     // e.g. gpt-4o-mini  |  moonshot-v1-8k
}

const KEY = 'anyskill.ai'

export const AI_PRESETS = [
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: 'Kimi (Moonshot)', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  { name: 'Ollama (local)', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1' },
]

export function loadAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const cfg = JSON.parse(raw) as AIConfig
    return cfg.apiKey ? cfg : null
  } catch {
    return null
  }
}

export function saveAIConfig(cfg: AIConfig | null) {
  if (cfg) localStorage.setItem(KEY, JSON.stringify(cfg))
  else localStorage.removeItem(KEY)
}

async function chat(cfg: AIConfig, system: string, user: string): Promise<string> {
  const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system + '\nRespond with valid JSON only.' },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// --- graph decomposition ---

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
- mark "transfer": true on nodes that transfer to other disciplines (mental models, transferable procedures)
- the final node is a real-world capstone artifact
- ids: short snake_case`,
    `Skill: "${skill}". The learner's prior level: ${priorLevel}. Return JSON: {"skill": "...", "nodes": [{"id","label","kind","tier","hours","prereqs","transfer"}]}`,
  )
  const parsed = JSON.parse(raw) as AIGraph
  if (!Array.isArray(parsed.nodes) || parsed.nodes.length < 4) throw new Error('bad graph')
  // sanitize: enforce tier ordering on prereqs
  const byId = new Map(parsed.nodes.map((n) => [n.id, n]))
  parsed.nodes.forEach((n) => {
    n.prereqs = (n.prereqs ?? []).filter((p) => {
      const pn = byId.get(p)
      return pn && pn.tier < n.tier
    })
  })
  return parsed
}

// --- drill generation ---

export interface AIDrill {
  prompt: string
  hint: string
  goodSignals: string[]
}

export async function generateDrillAI(cfg: AIConfig, nodeLabel: string, kind: string, skill: string): Promise<AIDrill> {
  const raw = await chat(
    cfg,
    `You are a deliberate-practice coach. Write ONE realistic practice scenario for a specific node of a skill.
- The scenario must be concrete (names, numbers, stakes), doable in 20–30 minutes, and require applying the node — not recalling trivia
- hint: one sentence describing what strong answers do
- goodSignals: 6–10 short lowercase strings that a strong answer would likely contain (keywords/phrases for fallback scoring)`,
    `Skill: "${skill}". Node: "${nodeLabel}" (a ${kind}). Return JSON: {"prompt","hint","goodSignals":[...]}`,
  )
  const parsed = JSON.parse(raw) as AIDrill
  if (!parsed.prompt) throw new Error('bad drill')
  return parsed
}

// --- answer evaluation ---

export interface AIEvaluation {
  good: boolean
  feedback: string
  masteryDelta: number // 0..0.25
}

export async function evaluateAnswerAI(
  cfg: AIConfig,
  nodeLabel: string,
  drillPrompt: string,
  answer: string,
): Promise<AIEvaluation> {
  const raw = await chat(
    cfg,
    `You are a precise practice coach using Bayesian knowledge tracing. Evaluate a learner's drill answer.
- judge whether they applied the underlying principle (not just keywords)
- feedback: 2–4 sentences — what was strong, what was missing, one concrete improvement. Direct, warm, specific.
- good: true if a competent practitioner would pass this attempt
- masteryDelta: 0.02–0.2 based on demonstrated understanding`,
    `Node: "${nodeLabel}". Drill: "${drillPrompt}". Learner's answer: "${answer}". Return JSON: {"good": bool, "feedback": "...", "masteryDelta": number}`,
  )
  const parsed = JSON.parse(raw) as AIEvaluation
  if (typeof parsed.good !== 'boolean' || !parsed.feedback) throw new Error('bad evaluation')
  parsed.masteryDelta = Math.min(0.25, Math.max(0.02, Number(parsed.masteryDelta) || 0.05))
  return parsed
}

/** Cheap connectivity check for the settings panel. */
export async function pingAI(cfg: AIConfig): Promise<string> {
  const raw = await chat(cfg, 'Reply with JSON: {"ok": true}', 'ping')
  return raw.includes('ok') ? 'connected' : raw.slice(0, 60)
}
