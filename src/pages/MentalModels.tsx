import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { MatrixRain } from '@/components/MatrixRain'
import { DISCIPLINES, TENDENCY_INDEX, TOTAL_MODELS, TOTAL_HOURS, type MentalModel } from '@/lib/mentalModels'
import { saveProfile } from '@/lib/session'

export function MentalModels() {
  const navigate = useNavigate()
  const [open, setOpen] = useState<string | null>('math')
  const [stack, setStack] = useState<MentalModel[]>([])

  const toggleStack = (m: MentalModel) =>
    setStack((s) => (s.find((x) => x.id === m.id) ? s.filter((x) => x.id !== m.id) : [...s, m]))

  const stacked = useMemo(() => new Set(stack.map((m) => m.id)), [stack])

  const startSprint = () => {
    saveProfile({
      skill: 'Munger Mental Models',
      goal: 'Build the latticework',
      hoursPerWeek: 5,
      deadline: '',
      priorLevel: 'none',
    })
    navigate('/map')
  }

  return (
    <div className="scanlines min-h-screen flex flex-col">
      <MatrixRain opacity={0.06} />

      <header className="flex items-center justify-between px-6 py-4 border-b border-matrix/20 font-mono">
        <button onClick={() => navigate('/')} className="text-sm tracking-widest">
          <span className="text-matrix glow-soft">ANY</span>
          <span className="text-offwhite">SKILL</span>
          <span className="text-signal">_</span>
        </button>
        <div className="text-[11px] text-muted-foreground uppercase tracking-widest hidden md:block">
          CURRICULUM MODULE · POOR CHARLIE'S ALMANACK
        </div>
        <button onClick={() => navigate('/map')} className="text-[11px] text-matrix/70 hover:text-matrix tracking-widest">
          SKILL MAP ▸
        </button>
      </header>

      {/* hero strip */}
      <section className="px-6 lg:px-10 py-8 border-b border-matrix/20 grid-bg">
        <div className="font-mono text-[11px] tracking-[0.35em] text-signal mb-3">
          // THE LATTICEWORK OF MENTAL MODELS
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-offwhite max-w-3xl leading-tight">
          ~100 big ideas carry <span className="text-matrix glow-matrix">90% of the freight</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
          Munger's rule from the Almanack: learn the big ideas from the big disciplines — deeply enough to use them
          daily — and hang them on one latticework. Below: the models he actually names, broken into trainable modules.
        </p>
        <div className="mt-6 flex flex-wrap gap-6 font-mono text-sm">
          <span className="text-matrix glow-soft">{DISCIPLINES.length} DISCIPLINES</span>
          <span className="text-offwhite">{TOTAL_MODELS} CORE MODELS</span>
          <span className="text-signal">≈{TOTAL_HOURS}H SPRINT</span>
          <button onClick={startSprint} className="text-matrix underline underline-offset-4 hover:glow-soft">
            ▶ LOAD AS SKILL GRAPH
          </button>
        </div>
      </section>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* modules */}
        <main className="flex-1 overflow-auto p-6 lg:p-10 space-y-4">
          {DISCIPLINES.map((d, di) => {
            const isOpen = open === d.id
            return (
              <section
                key={d.id}
                className={`border rounded transition-colors ${
                  isOpen ? 'border-matrix/50 bg-card box-glow' : 'border-matrix/20 bg-black/30 hover:border-matrix/40'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : d.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  <span className={`font-mono text-xs w-8 ${isOpen ? 'text-signal' : 'text-muted-foreground'}`}>
                    {String(di + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h2 className={`font-mono text-base tracking-wide ${isOpen ? 'text-matrix glow-soft' : 'text-offwhite'}`}>
                      {d.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.tagline}</p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                    {d.models.length} MODELS · {d.hours}h
                  </span>
                  <span className={`font-mono text-matrix transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 space-y-3 fade-up">
                    {d.models.map((m) => {
                      const active = stacked.has(m.id)
                      return (
                        <article
                          key={m.id}
                          className={`border rounded p-4 cursor-pointer transition-colors ${
                            active
                              ? 'border-signal/70 bg-signal/5 box-glow-orange'
                              : 'border-border bg-black/40 hover:border-matrix/40'
                          }`}
                          onClick={() => toggleStack(m)}
                          title="Click to add to your Lollapalooza stack"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className={`font-mono text-sm ${active ? 'text-signal' : 'text-offwhite'}`}>{m.name}</h3>
                            <span className={`font-mono text-[10px] ${active ? 'text-signal' : 'text-muted-foreground'}`}>
                              {active ? '◉ STACKED' : '○ STACK'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-offwhite/90 leading-relaxed">{m.idea}</p>
                          <div className="mt-3 grid md:grid-cols-2 gap-3 font-mono text-xs leading-relaxed">
                            <div className="border-l-2 border-matrix/40 pl-3">
                              <div className="text-[10px] tracking-widest text-matrix/70 mb-1">WHY IT CARRIES FREIGHT</div>
                              <p className="text-muted-foreground">{m.freight}</p>
                            </div>
                            <div className="border-l-2 border-signal/40 pl-3">
                              <div className="text-[10px] tracking-widest text-signal/80 mb-1">TRAINING DRILL</div>
                              <p className="text-muted-foreground">{m.application}</p>
                            </div>
                          </div>
                          {m.quote && (
                            <blockquote className="mt-3 font-mono text-xs text-matrix/80 italic border-t border-matrix/15 pt-2">
                              "{m.quote}" — C.M.
                            </blockquote>
                          )}
                        </article>
                      )
                    })}

                    {d.id === 'psychology' && (
                      <div className="border border-dashed border-matrix/25 rounded p-4">
                        <div className="font-mono text-[10px] tracking-widest text-muted-foreground mb-2">
                          FULL INDEX — MUNGER'S 25 STANDARD CAUSES OF HUMAN MISJUDGMENT
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] text-muted-foreground">
                          {TENDENCY_INDEX.map((t) => (
                            <div key={t.n}>
                              <span className="text-matrix/50 w-6 inline-block">{String(t.n).padStart(2, '0')}</span>
                              {t.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )
          })}
        </main>

        {/* lollapalooza stack sidebar */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-matrix/20 p-5 font-mono space-y-4 lg:sticky lg:top-0 self-start">
          <div className="text-[10px] tracking-widest text-muted-foreground">LOLLAPALOOZA BUILDER</div>
          {stack.length === 0 ? (
            <p className="text-xs text-muted-foreground leading-relaxed border border-dashed border-matrix/25 rounded p-3">
              Munger's capstone idea: single models are tools — <span className="text-matrix">combinations are weapons</span>.
              Click models on the left to stack them and see them compound.
            </p>
          ) : (
            <div className="space-y-2 fade-up">
              {stack.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2 border border-signal/40 bg-signal/5 rounded px-3 py-2 text-xs">
                  <span className="text-signal">×{i + 1}</span>
                  <span className="flex-1 text-offwhite">{m.name}</span>
                  <button onClick={() => toggleStack(m)} className="text-muted-foreground hover:text-signal">✕</button>
                </div>
              ))}
              <div className={`border rounded p-3 text-xs leading-relaxed ${
                stack.length >= 2 ? 'border-matrix/50 bg-brg/30 text-matrix box-glow' : 'border-border text-muted-foreground'
              }`}>
                {stack.length < 2 ? (
                  <>Stack ≥2 models. When multiple forces point one way, outcomes go nonlinear — that's the Lollapalooza effect.</>
                ) : (
                  <>
                    ▸ {stack.length} tendencies/models now compound. Munger: when several act in concert you don't get
                    addition — you get <span className="text-signal">nuclear physics</span>. Analyze any real decision by
                    listing which of your stack is operating on it simultaneously.
                  </>
                )}
              </div>
            </div>
          )}

          <div className="border border-matrix/20 rounded p-3 bg-black/40 text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-matrix/70">MAN-WITH-A-HAMMER WARNING —</span> to the person with only a hammer, every
            problem looks like a nail. The latticework exists to prevent exactly that.
          </div>
        </aside>
      </div>
    </div>
  )
}
