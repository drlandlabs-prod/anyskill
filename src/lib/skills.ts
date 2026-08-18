// Skill graph model + mock decomposition engine for the prototype.

export type NodeKind = 'concept' | 'procedure' | 'fact'
export type NodeState = 'locked' | 'available' | 'active' | 'mastered' | 'known'

export interface SkillNode {
  id: string
  label: string
  kind: NodeKind
  tier: number            // layout row
  hours: number           // estimated hours to acquire
  prereqs: string[]       // ids
  state: NodeState
  mastery: number         // 0..1
  transfer: boolean       // transferable anchor node
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

const NEGOTIATION: SkillNode[] = [
  // tier 0 — foundations
  { id: 'batna',     label: 'BATNA & walk-away power',  kind: 'concept',   tier: 0, hours: 1.5, prereqs: [],                 state: 'available', mastery: 0.1, transfer: true },
  { id: 'zopa',      label: 'ZOPA — the bargaining zone', kind: 'concept', tier: 0, hours: 1.0, prereqs: [],                 state: 'available', mastery: 0.2, transfer: true },
  { id: 'anchoring', label: 'Anchoring & first offers', kind: 'procedure', tier: 0, hours: 2.0, prereqs: [],                 state: 'available', mastery: 0.0, transfer: true },
  // tier 1
  { id: 'interests', label: 'Interests vs positions',   kind: 'concept',   tier: 1, hours: 1.5, prereqs: ['batna'],          state: 'locked', mastery: 0, transfer: true },
  { id: 'value',     label: 'Creating vs claiming value', kind: 'concept', tier: 1, hours: 2.0, prereqs: ['zopa'],           state: 'locked', mastery: 0, transfer: false },
  { id: 'framing',   label: 'Framing & loss aversion',  kind: 'concept',   tier: 1, hours: 1.5, prereqs: ['anchoring'],      state: 'locked', mastery: 0, transfer: true },
  // tier 2
  { id: 'questions', label: 'Calibrated questions',     kind: 'procedure', tier: 2, hours: 2.0, prereqs: ['interests'],      state: 'locked', mastery: 0, transfer: true },
  { id: 'silence',   label: 'Tactical silence & pauses', kind: 'procedure', tier: 2, hours: 1.0, prereqs: ['framing'],       state: 'locked', mastery: 0, transfer: false },
  { id: 'packages',  label: 'Multi-issue packaging',    kind: 'procedure', tier: 2, hours: 2.5, prereqs: ['value'],          state: 'locked', mastery: 0, transfer: false },
  // tier 3
  { id: 'emotions',  label: 'Reading emotions & labeling', kind: 'procedure', tier: 3, hours: 2.0, prereqs: ['questions', 'silence'], state: 'locked', mastery: 0, transfer: true },
  { id: 'pressure',  label: 'Handling pressure tactics', kind: 'procedure', tier: 3, hours: 1.5, prereqs: ['packages'],      state: 'locked', mastery: 0, transfer: false },
  // tier 4 — capstone
  { id: 'capstone',  label: 'CAPSTONE · live salary negotiation', kind: 'procedure', tier: 4, hours: 2.0, prereqs: ['emotions', 'pressure'], state: 'locked', mastery: 0, transfer: false },
]

// Generic fallback decomposition for any typed skill.
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
  const isNegotiation = /negoti/i.test(skill)
  const nodes = (isNegotiation ? NEGOTIATION : genericGraph(skill)).map((n) => ({ ...n }))

  // diagnosis simulation: prior knowledge marks some foundations as known
  if (priorLevel !== 'none') {
    const unlockCount = priorLevel === 'working' ? 4 : 2
    nodes.forEach((n) => {
      if (n.tier === 0 || (priorLevel === 'working' && n.tier === 1 && nodes.filter(x => x.state === 'known').length < unlockCount)) {
        n.state = 'known'
        n.mastery = 0.85
      }
    })
    // unlock next frontier
    nodes.forEach((n) => {
      if (n.state === 'locked' && n.prereqs.every((p) => nodes.find((x) => x.id === p)?.state === 'known')) {
        n.state = 'available'
      }
    })
  }

  const total = nodes.reduce((a, n) => a + n.hours, 0)
  const saved = nodes.filter((n) => n.state === 'known').reduce((a, n) => a + n.hours, 0)
  return { skill: skill.trim() || 'Negotiation', totalHours: Math.round((total - saved) * 10) / 10, savedHours: saved, nodes }
}

// --- mock drill content for the practice session (negotiation / anchoring) ---
export interface Drill {
  prompt: string
  hint: string
  goodSignals: string[]
  feedbackGood: string
  feedbackWeak: string
}

export const ANCHORING_DRILL: Drill = {
  prompt:
    'SCENARIO — You are offered a contract role. The client says: "We usually pay around $85/hr for this." You believe your market rate is $120/hr. Make your first counter-offer out loud — write exactly what you would say.',
  hint: 'Strong answers re-anchor with a specific number above target, justify it with value, and stay warm.',
  goodSignals: ['1', '$', 'value', 'scope', 'based on', 'rate'],
  feedbackGood:
    'Strong re-anchor. You moved the reference point, tied it to value, and kept rapport. In BKT terms: slip probability low, mastery +0.18 on "Anchoring".',
  feedbackWeak:
    'You responded, but you accepted their anchor as the frame. Try stating a specific number first (e.g. $125), justify with scope/value, then stop talking. Mastery +0.05.',
}

export const SPRINTS = [
  { n: 1, focus: 'BATNA + ZOPA', duration: '60 min', status: 'done' as const },
  { n: 2, focus: 'Anchoring drills', duration: '75 min', status: 'active' as const },
  { n: 3, focus: 'Interests vs positions', duration: '75 min', status: 'next' as const },
  { n: 4, focus: 'Creating vs claiming value', duration: '90 min', status: 'locked' as const },
  { n: 5, focus: 'Calibrated questions + silence', duration: '90 min', status: 'locked' as const },
  { n: 6, focus: 'Packaging + pressure tactics', duration: '90 min', status: 'locked' as const },
  { n: 7, focus: 'Capstone: live negotiation', duration: '90 min', status: 'locked' as const },
]

// ---------------------------------------------------------------------------
// Dynamic content engine — sprints and drills derived from the CURRENT skill,
// not hardcoded. Negotiation keeps its hand-authored content as the showcase.

export interface Sprint {
  n: number
  focus: string
  duration: string
  status: 'done' | 'active' | 'next' | 'locked'
}

/** Build the sprint plan from a skill graph: known nodes collapse into the
 *  diagnosis, remaining nodes become sprints in tier order. */
export function buildSprints(graph: SkillGraph): Sprint[] {
  const known = graph.nodes.filter((n) => n.state === 'known')
  const todo = graph.nodes
    .filter((n) => n.state !== 'known')
    .sort((a, b) => a.tier - b.tier)

  const sprints: Sprint[] = []
  if (known.length > 0) {
    sprints.push({
      n: 0,
      focus: `Diagnosis: ${known.length} foundations already known`,
      duration: '—',
      status: 'done',
    })
  }
  todo.forEach((node, i) => {
    const mins = Math.round(Math.min(90, Math.max(45, node.hours * 45)))
    sprints.push({
      n: sprints.length,
      focus: node.label,
      duration: `${mins} min`,
      status: node.state === 'available' ? (i === 0 || todo.slice(0, i).every((t) => t.state !== 'available') ? 'active' : 'next') : 'locked',
    })
  })
  // ensure exactly one active sprint
  if (!sprints.some((s) => s.status === 'active')) {
    const first = sprints.find((s) => s.status === 'next' || s.status === 'locked')
    if (first) first.status = 'active'
  }
  return sprints
}

/** The node a sprint should train right now (stored when user clicks a node). */
const NODE_KEY = 'anyskill.activeNode'

export function saveActiveNode(id: string) { localStorage.setItem(NODE_KEY, id) }

export function loadActiveNode(graph: SkillGraph): SkillNode {
  const stored = localStorage.getItem(NODE_KEY)
  const byId = stored ? graph.nodes.find((n) => n.id === stored) : undefined
  if (byId && byId.state !== 'locked') return byId
  return (
    graph.nodes.find((n) => n.state === 'available') ??
    graph.nodes.find((n) => n.state !== 'known') ??
    graph.nodes[0]
  )
}

/** Generate drill content for any node of any skill. */
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
    feedbackGood: `Strong application — you reasoned from the principle, not from a script. In BKT terms: slip probability low, mastery +0.18 on "${label}".`,
    feedbackWeak: `You stayed on the surface. Anchor each step to the principle behind "${label}" and state why it works — then the skill transfers to new situations. Mastery +0.05.`,
  }
}

/** Full reset between learning tasks — clears the profile and active node. */
export function resetProgress(includeHabits = false) {
  localStorage.removeItem('anyskill.profile')
  localStorage.removeItem(NODE_KEY)
  if (includeHabits) localStorage.removeItem('anyskill.habits.v1')
}
