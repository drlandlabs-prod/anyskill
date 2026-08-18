import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { MatrixRain } from '@/components/MatrixRain'
import { Button } from '@/components/ui/button'
import {
  loadHabit, saveHabit, completeRep, streak, missedYesterday, heatmapDays,
  FOUR_LAWS, TWO_MIN_REP, type HabitState,
} from '@/lib/habits'
import { decomposeSkill, loadActiveNode } from '@/lib/skills'
import { loadProfile } from '@/lib/session'

export function Habits() {
  const navigate = useNavigate()
  const profile = loadProfile()
  const [habit, setHabit] = useState<HabitState>(() => loadHabit())
  const [repState, setRepState] = useState<'idle' | 'running' | 'done'>('idle')
  const [secs, setSecs] = useState(120)

  // the daily rep trains whatever node is active on the current skill graph
  const rep = useMemo(() => {
    if (!profile) return TWO_MIN_REP
    const graph = decomposeSkill(profile.skill, profile.priorLevel)
    const node = loadActiveNode(graph)
    const label = node.label.replace(/^CAPSTONE · /, '')
    return {
      title: `One rep of "${label}"`,
      instruction: `Do a single 2-minute rep of ${label} for ${profile.skill}: one concrete application, out loud or on paper. That's it.`,
      reward: `+mastery on ${label.toUpperCase()} · streak extended`,
    }
  }, [profile?.skill, profile?.priorLevel])

  const s = streak(habit)
  const missed = missedYesterday(habit)
  const cells = useMemo(() => heatmapDays(habit, 40), [habit])
  const todayDone = cells[cells.length - 1]?.done ?? false

  const startRep = () => {
    setRepState('running')
    setSecs(120)
    const iv = setInterval(() => {
      setSecs((v) => {
        if (v <= 1) {
          clearInterval(iv)
          finishRep()
          return 0
        }
        return v - 1
      })
    }, 1000)
  }

  const finishRep = () => {
    setHabit((h) => completeRep(h))
    setRepState('done')
  }

  const update = (patch: Partial<HabitState>) => {
    setHabit((h) => {
      const next = { ...h, ...patch }
      saveHabit(next)
      return next
    })
  }

  const mm = String(Math.floor(secs / 60)).padStart(1, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <div className="scanlines min-h-screen flex flex-col">
      <MatrixRain opacity={0.05} />

      <header className="flex items-center justify-between px-6 py-4 border-b border-matrix/20 font-mono">
        <button onClick={() => navigate('/')} className="text-sm tracking-widest">
          <span className="text-matrix glow-soft">ANY</span>
          <span className="text-offwhite">SKILL</span>
          <span className="text-signal">_</span>
        </button>
        <div className="text-[11px] text-muted-foreground uppercase tracking-widest hidden md:block">
          HABIT ENGINE · RETAIN LAYER · ATOMIC HABITS
        </div>
        <button onClick={() => navigate('/map')} className="text-[11px] text-matrix/70 hover:text-matrix tracking-widest">
          SKILL MAP ▸
        </button>
      </header>

      {/* stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-matrix/20 divide-x divide-matrix/10 font-mono">
        {[
          { k: 'CURRENT STREAK', v: `${s}d`, c: 'text-matrix' },
          { k: 'TOTAL REPS', v: `${habit.reps.length}`, c: 'text-offwhite' },
          { k: 'IDENTITY', v: habit.identity, c: 'text-offwhite', small: true },
          { k: 'NEVER MISS TWICE', v: missed ? 'AT RISK ⚠' : 'HELD ✓', c: missed ? 'text-signal' : 'text-matrix' },
        ].map((st) => (
          <div key={st.k} className="px-5 py-4">
            <div className="text-[10px] tracking-widest text-muted-foreground">{st.k}</div>
            <div className={`${st.small ? 'text-sm' : 'text-2xl'} font-bold ${st.c} glow-soft truncate`}>{st.v}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <main className="flex-1 overflow-auto p-6 lg:p-10 space-y-6">

          {/* recovery banner — never miss twice */}
          {missed && !todayDone && (
            <div className="fade-up border border-signal/60 bg-signal/5 rounded p-4 font-mono text-sm text-signal box-glow-orange">
              ⚠ You missed yesterday. Clear's rule: <span className="text-offwhite">never miss twice.</span>{' '}
              Today is a recovery rep — 2 minutes, no judgement, streak preserved by acting now.
            </div>
          )}

          {/* today's 2-minute rep */}
          <section className="border border-matrix/40 rounded p-6 bg-card box-glow">
            <div className="font-mono text-[11px] tracking-[0.3em] text-signal mb-2">// TODAY'S 2-MINUTE REP</div>
            <h2 className="text-2xl font-bold text-offwhite">{rep.title}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed max-w-xl">{rep.instruction}</p>

            {repState === 'idle' && !todayDone && (
              <Button onClick={startRep} className="mt-5 bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90">
                ▶ START 2:00 TIMER
              </Button>
            )}
            {repState === 'running' && (
              <div className="mt-5 flex items-center gap-4 font-mono">
                <span className="text-4xl text-matrix glow-matrix tabular-nums">{mm}:{ss}</span>
                <span className="text-xs text-muted-foreground">do the rep now — out loud</span>
                <Button variant="outline" onClick={finishRep}
                  className="ml-auto border-matrix/40 text-matrix font-mono text-xs hover:bg-matrix/10">
                  FINISH EARLY ✓
                </Button>
              </div>
            )}
            {(repState === 'done' || todayDone) && (
              <div className="mt-5 fade-up font-mono text-sm text-matrix glow-soft">
                ✓ REP LOGGED — {rep.reward}
              </div>
            )}
          </section>

          {/* heatmap */}
          <section className="border border-matrix/20 rounded p-6 bg-black/30">
            <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-4">// REP TRACKER — LAST 40 DAYS</div>
            <div className="grid grid-cols-10 gap-1.5 max-w-md">
              {cells.map((c) => (
                <div
                  key={c.date}
                  title={c.date}
                  className={`aspect-square rounded-sm border ${
                    c.isToday
                      ? 'border-signal box-glow-orange ' + (c.done ? 'bg-primary' : 'bg-signal/10 animate-pulse')
                      : c.done
                        ? 'bg-matrix/80 border-matrix/40'
                        : 'bg-muted/60 border-border'
                  }`}
                />
              ))}
            </div>
            <div className="mt-3 font-mono text-[10px] text-muted-foreground flex gap-4">
              <span><i className="inline-block w-2 h-2 bg-matrix/80 rounded-sm mr-1.5" />rep done</span>
              <span><i className="inline-block w-2 h-2 bg-muted rounded-sm mr-1.5" />missed</span>
              <span><i className="inline-block w-2 h-2 border border-signal rounded-sm mr-1.5" />today</span>
            </div>
          </section>

          {/* four laws */}
          <section>
            <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-3">// THE FOUR LAWS, WIRED IN</div>
            <div className="grid md:grid-cols-2 gap-3">
              {FOUR_LAWS.map((law) => (
                <div key={law.n} className="border border-matrix/20 rounded p-4 bg-black/40 hover:border-matrix/40 transition-colors">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-sm text-matrix">LAW {law.n} · {law.name}</span>
                    <span className={`text-[9px] tracking-widest ${law.status === 'active' ? 'text-matrix' : 'text-signal'}`}>
                      {law.status === 'active' ? '● ACTIVE' : '◌ CONFIG BELOW'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-offwhite/80 leading-relaxed">{law.principle}</p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground leading-relaxed border-l-2 border-matrix/30 pl-2">
                    {law.productBehavior}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* config sidebar — implementation intention + identity */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-matrix/20 p-5 font-mono space-y-5">
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground mb-2">IMPLEMENTATION INTENTION</div>
            <div className="border border-matrix/30 rounded p-4 bg-card space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">"After</p>
              <input
                value={habit.cueAnchor}
                onChange={(e) => update({ cueAnchor: e.target.value })}
                className="w-full bg-black/50 border border-matrix/30 rounded px-3 py-2 text-offwhite focus:outline-none focus:border-matrix"
                placeholder="morning coffee"
              />
              <p className="text-muted-foreground">at</p>
              <input
                type="time"
                value={habit.cueTime}
                onChange={(e) => update({ cueTime: e.target.value })}
                className="w-full bg-black/50 border border-matrix/30 rounded px-3 py-2 text-offwhite focus:outline-none focus:border-matrix"
              />
              <p className="text-muted-foreground leading-relaxed">
                I will do one 2-minute rep of <span className="text-matrix">{profile?.skill ?? 'my skill'}</span>."
              </p>
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground mb-2">IDENTITY-BASED HABIT</div>
            <div className="border border-matrix/30 rounded p-4 bg-brg/20 space-y-2 text-xs">
              <p className="text-muted-foreground">"Every rep is a vote for the person I am becoming:</p>
              <input
                value={habit.identity}
                onChange={(e) => update({ identity: e.target.value })}
                className="w-full bg-black/50 border border-matrix/30 rounded px-3 py-2 text-matrix focus:outline-none focus:border-matrix glow-soft"
              />
              <p className="text-muted-foreground">"</p>
              <p className="text-[11px] text-matrix/70">votes cast: {habit.reps.length}</p>
            </div>
          </div>

          <div className="border border-dashed border-matrix/25 rounded p-3 text-[11px] text-muted-foreground leading-relaxed">
            The FSRS review queue feeds this tracker — spaced repetition <span className="text-offwhite">is</span> the
            habit; the streak is what makes you show up for it.
          </div>

          <Button onClick={() => navigate('/session')} variant="outline"
            className="w-full border-matrix/40 text-matrix font-mono text-xs hover:bg-matrix/10">
            FULL SPRINT INSTEAD ▸
          </Button>
        </aside>
      </div>
    </div>
  )
}
