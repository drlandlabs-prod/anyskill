// Habit Engine — James Clear's Atomic Habits mapped onto the RETAIN layer.

const KEY = 'anyskill.habits.v1'

export interface HabitState {
  reps: string[]            // ISO dates (yyyy-mm-dd) with at least one completed rep
  identity: string          // "I am becoming a negotiator"
  cueTime: string           // implementation intention time, e.g. "07:30"
  cueAnchor: string         // habit stack anchor, e.g. "morning coffee"
}

export const DEFAULT_HABIT: HabitState = {
  reps: [],
  identity: 'a person who negotiates calmly',
  cueTime: '07:30',
  cueAnchor: 'morning coffee',
}

export function loadHabit(): HabitState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_HABIT, ...(JSON.parse(raw) as HabitState) }
  } catch { /* ignore */ }
  // seed a believable history on first run so the heatmap reads
  const seeded: HabitState = { ...DEFAULT_HABIT, reps: seedHistory() }
  localStorage.setItem(KEY, JSON.stringify(seeded))
  return seeded
}

export function saveHabit(h: HabitState) {
  localStorage.setItem(KEY, JSON.stringify(h))
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

function seedHistory(): string[] {
  const out: string[] = []
  const now = new Date()
  // ~5.5 weeks of spotty history, denser recently, yesterday missed (never-miss-twice demo)
  for (let i = 39; i >= 1; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    if (i === 1) continue // missed yesterday
    const p = i < 14 ? 0.85 : i < 28 ? 0.6 : 0.4
    if (Math.random() < p) out.push(iso(d))
  }
  return out
}

export function completeRep(h: HabitState): HabitState {
  const today = iso(new Date())
  if (h.reps.includes(today)) return h
  const next = { ...h, reps: [...h.reps, today] }
  saveHabit(next)
  return next
}

export function streak(h: HabitState): number {
  const set = new Set(h.reps)
  let n = 0
  const d = new Date()
  // allow streak to count from today or, if today not done yet, from yesterday
  if (!set.has(iso(d))) d.setDate(d.getDate() - 1)
  while (set.has(iso(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export function missedYesterday(h: HabitState): boolean {
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return !h.reps.includes(iso(y))
}

/** Last N days for the heatmap, oldest first. */
export function heatmapDays(h: HabitState, days = 40): { date: string; done: boolean; isToday: boolean }[] {
  const set = new Set(h.reps)
  const out = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const date = iso(d)
    out.push({ date, done: set.has(date), isToday: i === 0 })
  }
  return out
}

// --- the Four Laws, wired to product behavior ---
export interface Law {
  n: number
  name: string
  principle: string
  productBehavior: string
  status: 'active' | 'configurable'
}

export const FOUR_LAWS: Law[] = [
  {
    n: 1,
    name: 'MAKE IT OBVIOUS',
    principle: 'Implementation intention + habit stacking: "After [anchor] at [time], I will do one rep."',
    productBehavior: 'Fixed cue slot below; the skill map glows at cue time; sprint resumes into the exact right node.',
    status: 'configurable',
  },
  {
    n: 2,
    name: 'MAKE IT ATTRACTIVE',
    principle: 'Temptation bundling + visible progress create craving.',
    productBehavior: 'Mastery meter, streak flame, and the glowing frontier node are the anticipation engine.',
    status: 'active',
  },
  {
    n: 3,
    name: 'MAKE IT EASY',
    principle: '2-Minute Rule: scale the day\'s rep down until starting is frictionless.',
    productBehavior: 'Every drill has a 2-minute minimum viable rep — the daily default. Sessions expand once started.',
    status: 'active',
  },
  {
    n: 4,
    name: 'MAKE IT SATISFYING',
    principle: 'Instant reward + tracking. Never miss twice — a miss is an event, not an identity.',
    productBehavior: 'Rep completes → instant mastery bump + heatmap cell. Missed yesterday? Today is a recovery rep.',
    status: 'active',
  },
]

export const TWO_MIN_REP = {
  title: 'One re-anchor, out loud',
  instruction:
    'Say one specific counter-offer to an imaginary low anchor — number, one value justification, then silence. That\'s it. 2 minutes.',
  reward: '+mastery on ANCHORING · streak extended',
}
