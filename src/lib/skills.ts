// Skill graph model + decomposition engine for the prototype.

export type NodeKind = 'concept' | 'procedure' | 'fact'
export type NodeState = 'locked' | 'available' | 'active' | 'mastered' | 'known'

export interface SkillNode {
  id: string
  label: string
  kind: NodeKind
  tier: number
  hours: number
  prereqs: string[]
  state: NodeState
  mastery: number
  transfer: boolean
}

export interface SkillGraph {
  skill: string
  totalHours: number
  savedHours: number
  nodes: SkillNode[]
}

export interface LearnerProfile {
  skill: string
  goal: string
  hoursPerWeek: number
  deadline: string
  priorLevel: 'none' | 'some' | 'working'
}

export interface LearningEvidence {
  type: 'drill' | 'reflection' | 'recall' | 'capstone'
  score: number
  masteryDelta: number
  passed: boolean
  feedback?: string
  createdAt: string
}

export interface NodeProgress {
  nodeId: string
  mastery: number
  attempts: number
  successes: number
  lastAttemptAt: string
  evidence: LearningEvidence[]
}

const GRAPH_KEY = 'anyskill.graph'
const NODE_KEY = 'anyskill.activeNode'
const PROGRESS_KEY = 'anyskill.progress.v1'
const MASTERY_THRESHOLD = 0.7

export function storeGraph(g: SkillGraph) {
  localStorage.setItem(GRAPH_KEY, JSON.stringify(g))
}

export function loadStoredGraph(skill?: string): SkillGraph | null {
  try {
    const raw = localStorage.getItem(GRAPH_KEY)
    if (!raw) return null
    const g = JSON.parse(raw) as SkillGraph
    if (!skill || g.skill.toLowerCase() === skill.toLowerCase()) return g
    return null
  } catch {
    return null
  }
}

function loadProgress(): Record<string, NodeProgress> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}') as Record<string, NodeProgress>
  } catch {
    return {}
  }
}

function saveProgress(progress: Record<string, NodeProgress>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function getNodeProgress(nodeId: string): NodeProgress | null {
  return loadProgress()[nodeId] ?? null
}

function prereqSatisfied(node: SkillNode | undefined) {
  return !!node && (node.state === 'known' || node.state === 'mastered' || node.mastery >= MASTERY_THRESHOLD)
}

function recalculateGraph(graph: SkillGraph): SkillGraph {
  const nodes = graph.nodes.map((n) => ({ ...n }))

  nodes.forEach((node) => {
    if (node.state === 'known') return
    if (node.mastery >= MASTERY_THRESHOLD) node.state = 'mastered'
  })

  nodes.forEach((node) => {
    if (node.state !== 'locked') return
    const ready = node.prereqs.every((id) => prereqSatisfied(nodes.find((n) => n.id === id)))
    if (ready) node.state = 'available'
  })

  const remaining = nodes
    .filter((n) => n.state !== 'known' && n.state !== 'mastered')
    .reduce((sum, n) => sum + n.hours, 0)
  const saved = nodes
    .filter((n) => n.state === 'known' || n.state === 'mastered')
    .reduce((sum, n) => sum + n.hours, 0)

  return {
    ...graph,
    nodes,
    totalHours: Math.round(remaining * 10) / 10,
    savedHours: Math.round(saved * 10) / 10,
  }
}

/** Persist evidence and the resulting mastery estimate after every attempt. */
export function recordLearningEvidence(
  graph: SkillGraph,
  nodeId: string,
  mastery: number,
  evidence: Omit<LearningEvidence, 'createdAt'>,
): SkillGraph {
  const clampedMastery = Math.min(1, Math.max(0, mastery))
  const next = recalculateGraph({
    ...graph,
    nodes: graph.nodes.map((n) => n.id === nodeId ? { ...n, mastery: clampedMastery } : { ...n }),
  })

  const progress = loadProgress()
  const previous = progress[nodeId]
  progress[nodeId] = {
    nodeId,
    mastery: clampedMastery,
    attempts: (previous?.attempts ?? 0) + 1,
    successes: (previous?.successes ?? 0) + (evidence.passed ? 1 : 0),
    lastAttemptAt: new Date().toISOString(),
    evidence: [
      ...(previous?.evidence ?? []),
      { ...evidence, createdAt: new Date().toISOString() },
    ].slice(-50),
  }
  saveProgress(progress)
  storeGraph(next)
  return next
}

/** Mark a sprint complete, persist final mastery, and unlock any newly eligible nodes. */
export function completeNode(
  graph: SkillGraph,
  nodeId: string,
  mastery: number,
  evidence?: Omit<LearningEvidence, 'createdAt'>,
): SkillGraph {
  let next = graph
  if (evidence) {
    next = recordLearningEvidence(graph, nodeId, mastery, evidence)
  } else {
    next = recalculateGraph({
      ...graph,
      nodes: graph.nodes.map((n) => n.id === nodeId ? { ...n, mastery: Math.min(1, Math.max(0, mastery)) } : { ...n }),
    })
    storeGraph(next)
  }
  localStorage.removeItem(NODE_KEY)
  return next
}

/** The graph for the current profile. Fallback graphs are persisted immediately. */
export function currentGraph(skill: string, priorLevel: LearnerProfile['priorLevel']): SkillGraph {
  const stored = loadStoredGraph(skill)
  if (stored) return recalculateGraph(stored)
  const fresh = decomposeSkill(skill, priorLevel)
  storeGraph(fresh)
  return fresh
}

export function graphFromAI(
  ai: { skill: string; nodes: { id: string; label: string; kind: NodeKind; tier: number; hours: number; prereqs: string[]; transfer: boolean }[] },
  priorLevel: LearnerProfile['priorLevel'],
): SkillGraph {
  const nodes: SkillNode[] = ai.nodes.map((n) => ({ ...n, state: n.tier === 0 ? 'available' : 'locked', mastery: 0 }))
  if (priorLevel !== 'none') {
    const markKnown = priorLevel === 'working' ? 2 : 1
    nodes.forEach((n) => {
      if (n.tier < markKnown) {
        n.state = 'known'
        n.mastery = 0.85
      }
    })
  }
  return recalculateGraph({ skill: ai.skill, totalHours: 0, savedHours: 0, nodes })
}

const NEGOTIATION: SkillNode[] = [
  { id: 'batna', label: 'BATNA & walk-away power', kind: 'concept', tier: 0, hours: 1.5, prereqs: [], state: 'available', mastery: 0.1, transfer: true },
  { id: 'zopa', label: 'ZOPA — the bargaining zone', kind: 'concept', tier: 0, hours: 1.0, prereqs: [], state: 'available', mastery: 0.2, transfer: true },
  { id: 'anchoring', label: 'Anchoring & first offers', kind: 'procedure', tier: 0, hours: 2.0, prereqs: [], state: 'available', mastery: 0.0, transfer: true },
  { id: 'interests', label: 'Interests vs positions', kind: 'concept', tier: 1, hours: 1.5, prereqs: ['batna'], state: 'locked', mastery: 0, transfer: true },
  { id: 'value', label: 'Creating vs claiming value', kind: 'concept', tier: 1, hours: 2.0, prereqs: ['zopa'], state: 'locked', mastery: 0, transfer: false },
  { id: 'framing', label: 'Framing & loss aversion', kind: 'concept', tier: 1, hours: 1.5, prereqs: ['anchoring'], state: 'locked', mastery: 0, transfer: true },
  { id: 'questions', label: 'Calibrated questions', kind: 'procedure', tier: 2, hours: 2.0, prereqs: ['interests'], state: 'locked', mastery: 0, transfer: true },
  { id: 'silence', label: 'Tactical silence & pauses', kind: 'procedure', tier: 2, hours: 1.0, prereqs: ['framing'], state: 'locked', mastery: 0, transfer: false },
  { id: 'packages', label: 'Multi-issue packaging', kind: 'procedure', tier: 2, hours: 2.5, prereqs: ['value'], state: 'locked', mastery: 0, transfer: false },
  { id: 'emotions', label: 'Reading emotions & labeling', kind: 'procedure', tier: 3, hours: 2.0, prereqs: ['questions', 'silence'], state: 'locked', mastery: 0, transfer: true },
  { id: 'pressure', label: 'Handling pressure tactics', kind: 'procedure', tier: 3, hours: 1.5, prereqs: ['packages'], state: 'locked', mastery: 0, transfer: false },
  { id: 'capstone', label: 'CAPSTONE · live salary negotiation', kind: 'procedure', tier: 4, hours: 2.0, prereqs: ['emotions', 'pressure'], state: 'locked', mastery: 0, transfer: false },
]

function genericGraph(skill: string): SkillNode[] {
  const s = skill.trim() || 'your skill'
  return [
    { id: 'g0', label: `Mental model of ${s}`, kind: 'concept', tier: 0, hours: 2, prereqs: [], state: 'available', mastery: 0, transfer: true },
    { id: 'g1', label: 'Core vocabulary & primitives', kind: 'fact', tier: 0, hours: 2, prereqs: [], state: 'available', mastery: 0, transfer: false },
    { id: 'g2', label: 'First worked examples', kind: 'procedure', tier: 1, hours: 3, prereqs: ['g0', 'g1'], state: 'locked', mastery: 0, transfer: false },
    { id: 'g3', label: 'Guided drills (edge of ability)', kind: 'procedure', tier: 2, hours: 4, prereqs: ['g2'], state: 'locked', mastery: 0, transfer: false },
    { id: 'g4', label: 'Error patterns & debugging', kind: 'concept', tier: 2, hours: 2, prereqs: ['g2'], state: 'locked', mastery: 0, transfer: true },
    { id: 'g5', label: 'Transfer drills across contexts', kind: 'procedure', tier: 3, hours: 3, prereqs: ['g3', 'g4'], state: 'locked', mastery: 0, transfer: true },
    { id: 'g6', label: `CAPSTONE · real ${s} artifact`, kind: 'procedure', tier: 4, hours: 2, prereqs: ['g5'], state: 'locked', mastery: 0, transfer: false },
  ]
}

export function decomposeSkill(skill: string, priorLevel: LearnerProfile['priorLevel']): SkillGraph {
  const nodes = (/negoti/i.test(skill) ? NEGOTIATION : genericGraph(skill)).map((n) => ({ ...n }))
  if (priorLevel !== 'none') {
    const unlockCount = priorLevel === 'working' ? 4 : 2
    nodes.forEach((n) => {
      if (n.tier === 0 || (priorLevel === 'working' && n.tier === 1 && nodes.filter((x) => x.state === 'known').length < unlockCount)) {
        n.state = 'known'
        n.mastery = 0.85
      }
    })
  }
  return recalculateGraph({ skill: skill.trim() || 'Negotiation', totalHours: 0, savedHours: 0, nodes })
}

export interface Drill {
  prompt: string
  hint: string
  goodSignals: string[]
  feedbackGood: string
  feedbackWeak: string
}

export const ANCHORING_DRILL: Drill = {
  prompt: 'SCENARIO — You are offered a contract role. The client says: "We usually pay around $85/hr for this." You believe your market rate is $120/hr. Make your first counter-offer out loud — write exactly what you would say.',
  hint: 'Strong answers re-anchor with a specific number above target, justify it with value, and stay warm.',
  goodSignals: ['1', '$', 'value', 'scope', 'based on', 'rate'],
  feedbackGood: 'Strong re-anchor. You moved the reference point, tied it to value, and kept rapport. Your mastery estimate increased based on this evidence.',
  feedbackWeak: 'You responded, but you accepted their anchor as the frame. Try stating a specific number first (e.g. $125), justify with scope/value, then stop talking.',
}

export interface Sprint {
  n: number
  focus: string
  duration: string
  status: 'done' | 'active' | 'next' | 'locked'
}

export function buildSprints(graph: SkillGraph): Sprint[] {
  const done = graph.nodes.filter((n) => n.state === 'known' || n.state === 'mastered')
  const todo = graph.nodes
    .filter((n) => n.state !== 'known' && n.state !== 'mastered')
    .sort((a, b) => a.tier - b.tier)

  const sprints: Sprint[] = []
  if (done.length > 0) {
    sprints.push({ n: 0, focus: `${done.length} nodes demonstrated`, duration: '—', status: 'done' })
  }

  let activeAssigned = false
  todo.forEach((node) => {
    let status: Sprint['status'] = 'locked'
    if (node.state === 'available' || node.state === 'active') {
      status = activeAssigned ? 'next' : 'active'
      activeAssigned = true
    }
    const mins = Math.round(Math.min(90, Math.max(45, node.hours * 45)))
    sprints.push({ n: sprints.length, focus: node.label, duration: `${mins} min`, status })
  })
  return sprints
}

export function saveActiveNode(id: string) { localStorage.setItem(NODE_KEY, id) }

export function loadActiveNode(graph: SkillGraph): SkillNode {
  const stored = localStorage.getItem(NODE_KEY)
  const byId = stored ? graph.nodes.find((n) => n.id === stored) : undefined
  if (byId && byId.state !== 'locked' && byId.state !== 'known' && byId.state !== 'mastered') return byId
  return graph.nodes.find((n) => n.state === 'available' || n.state === 'active') ?? graph.nodes.find((n) => n.state !== 'known' && n.state !== 'mastered') ?? graph.nodes[0]
}

export function buildDrill(node: SkillNode, skill: string): Drill {
  if (node.id === 'anchoring') return ANCHORING_DRILL
  const label = node.label.replace(/^CAPSTONE · /, '')
  const isCapstone = /^CAPSTONE/.test(node.label)
  return {
    prompt: isCapstone
      ? `CAPSTONE — Produce a real artifact that proves "${label}" for ${skill}. Do the whole thing end-to-end, then describe what you made and the decisions you took.`
      : `SCENARIO — You need to apply "${label}" in a real ${skill} situation today. Describe exactly what you would do, step by step, and — most importantly — why each step works.`,
    hint: `Strong answers are specific, name the underlying principle behind "${label}", and say what a beginner would get wrong.`,
    goodSignals: ['because', 'first', 'then', 'principle', 'why', 'step'],
    feedbackGood: `Strong application — you reasoned from the principle, not from a script. Your mastery estimate increased based on this evidence.`,
    feedbackWeak: `You stayed on the surface. Anchor each step to the principle behind "${label}" and state why it works — then the skill transfers to new situations.`,
  }
}

export function resetProgress(includeHabits = false) {
  localStorage.removeItem('anyskill.profile')
  localStorage.removeItem(GRAPH_KEY)
  localStorage.removeItem(NODE_KEY)
  localStorage.removeItem(PROGRESS_KEY)
  if (includeHabits) localStorage.removeItem('anyskill.habits.v1')
}
