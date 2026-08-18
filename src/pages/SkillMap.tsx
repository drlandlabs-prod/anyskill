import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { MatrixRain } from '@/components/MatrixRain'
import { SkillGraph } from '@/components/SkillGraph'
import { Button } from '@/components/ui/button'
import { decomposeSkill, buildSprints, saveActiveNode, resetProgress, type SkillNode } from '@/lib/skills'
import { loadProfile } from '@/lib/session'

const KIND_COLOR: Record<SkillNode['kind'], string> = {
  concept: 'text-matrix',
  procedure: 'text-signal',
  fact: 'text-offwhite',
}

export function SkillMap() {
  const navigate = useNavigate()
  const profile = loadProfile()
  const graph = useMemo(
    () => decomposeSkill(profile?.skill ?? 'Negotiation', profile?.priorLevel ?? 'none'),
    [profile?.skill, profile?.priorLevel],
  )
  const sprints = useMemo(() => buildSprints(graph), [graph])
  const activeSprint = sprints.find((s) => s.status === 'active')
  const [selected, setSelected] = useState<SkillNode | null>(null)

  const known = graph.nodes.filter((n) => n.state === 'known').length
  const frontier = graph.nodes.filter((n) => n.state === 'available' || n.state === 'active')

  const train = (node?: SkillNode) => {
    if (node) saveActiveNode(node.id)
    navigate('/session')
  }

  const reset = () => {
    resetProgress()
    navigate('/')
  }

  return (
    <div className="scanlines min-h-screen flex flex-col">
      <MatrixRain opacity={0.06} />

      <header className="flex items-center justify-between px-6 py-4 border-b border-matrix/20">
        <button onClick={() => navigate('/')} className="font-mono text-sm tracking-widest">
          <span className="text-matrix glow-soft">ANY</span>
          <span className="text-offwhite">SKILL</span>
          <span className="text-signal">_</span>
        </button>
        <div className="font-mono text-[11px] text-muted-foreground uppercase hidden md:block">
          SKILL GRAPH · {graph.skill}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/habits')} className="font-mono text-[11px] text-signal hover:text-accent tracking-widest transition-colors">
            HABITS ▸
          </button>
          <button
            onClick={reset}
            title="Clear saved profile + active node, start a fresh skill"
            className="font-mono text-[11px] text-muted-foreground hover:text-signal tracking-widest transition-colors"
          >
            ↺ NEW SKILL
          </button>
          <Button
            className="bg-accent text-accent-foreground font-mono text-xs tracking-widest hover:bg-accent/90 box-glow-orange"
            onClick={() => train()}
          >
            ▶ {activeSprint ? `START SPRINT ${activeSprint.n}` : 'START SPRINT'}
          </Button>
        </div>
      </header>

      {/* stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-matrix/20 divide-x divide-matrix/10 font-mono">
        {[
          { k: 'HOURS TO COMPETENCE', v: `${graph.totalHours}h`, c: 'text-matrix' },
          { k: 'SAVED BY DIAGNOSIS', v: `−${graph.savedHours}h`, c: 'text-signal' },
          { k: 'NODES KNOWN', v: `${known}/${graph.nodes.length}`, c: 'text-offwhite' },
          { k: 'WEEKLY BUDGET', v: `${profile?.hoursPerWeek ?? 10}h/wk`, c: 'text-offwhite' },
        ].map((s) => (
          <div key={s.k} className="px-5 py-4">
            <div className="text-[10px] tracking-widest text-muted-foreground">{s.k}</div>
            <div className={`text-2xl font-bold ${s.c} glow-soft`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* graph */}
        <div className="flex-1 overflow-auto p-6 grid-bg">
          <SkillGraph nodes={graph.nodes} onSelect={setSelected} selectedId={selected?.id} />
          <div className="flex gap-5 justify-center mt-4 font-mono text-[10px] text-muted-foreground">
            <span><i className="inline-block w-2 h-2 rounded-full bg-matrix mr-1.5" />AVAILABLE</span>
            <span><i className="inline-block w-2 h-2 rounded-full bg-brg border border-matrix/50 mr-1.5" />KNOWN</span>
            <span><i className="inline-block w-2 h-2 rounded-full border border-dashed border-muted-foreground mr-1.5" />LOCKED</span>
            <span><span className="text-signal mr-1">⇄</span>TRANSFERS TO OTHER SKILLS</span>
          </div>
        </div>

        {/* side panel */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-matrix/20 p-5 space-y-5 overflow-auto">
          {selected ? (
            <div className="fade-up border border-matrix/30 rounded p-4 bg-card box-glow">
              <div className={`font-mono text-[10px] tracking-widest uppercase ${KIND_COLOR[selected.kind]}`}>
                {selected.kind} · tier {selected.tier}
              </div>
              <h3 className="font-mono text-sm text-offwhite mt-2 leading-relaxed">{selected.label}</h3>
              <div className="mt-3 space-y-1.5 font-mono text-xs text-muted-foreground">
                <div>est. <span className="text-matrix">{selected.hours}h</span> to acquire</div>
                <div>mastery <span className="text-matrix">{Math.round(selected.mastery * 100)}%</span></div>
                <div>state <span className="text-signal uppercase">{selected.state}</span></div>
                {selected.transfer && <div className="text-signal">⇄ transferable anchor — speeds up future skills</div>}
              </div>
              {(selected.state === 'available' || selected.state === 'active') && (
                <Button
                  className="w-full mt-4 bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90"
                  onClick={() => train(selected)}
                >
                  TRAIN THIS NODE ▸
                </Button>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-matrix/25 rounded p-4 font-mono text-xs text-muted-foreground">
              ▸ select a node to inspect it. Frontier nodes glow green — the sequencer recommends training{' '}
              <span className="text-matrix">{frontier[0]?.label ?? '—'}</span> next.
            </div>
          )}

          {/* sprint plan */}
          <div>
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-2">SPRINT PLAN</div>
            <div className="space-y-1.5">
              {sprints.map((s) => (
                <div
                  key={s.n}
                  className={`flex items-center gap-3 px-3 py-2 rounded border font-mono text-xs ${
                    s.status === 'active'
                      ? 'border-signal/60 bg-signal/5 text-signal box-glow-orange'
                      : s.status === 'done'
                        ? 'border-matrix/30 bg-brg/40 text-matrix'
                        : s.status === 'next'
                          ? 'border-matrix/30 text-offwhite'
                          : 'border-border text-muted-foreground'
                  }`}
                >
                  <span className="w-6 opacity-70">{String(s.n).padStart(2, '0')}</span>
                  <span className="flex-1">{s.focus}</span>
                  <span className="opacity-60">{s.duration}</span>
                  <span>
                    {s.status === 'done' ? '✓' : s.status === 'active' ? '◉' : s.status === 'next' ? '→' : '·'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
