import { useState } from 'react'
import { useNavigate } from 'react-router'
import { MatrixRain } from '@/components/MatrixRain'
import { FINANCE_MODULES, FIN_TOTAL_LESSONS, FIN_TOTAL_HOURS } from '@/lib/financeCurriculum'
import { saveProfile } from '@/lib/session'

export function Finances() {
  const navigate = useNavigate()
  const [open, setOpen] = useState<string | null>('money-theory')

  const startSprint = () => {
    saveProfile({
      skill: 'Financial Literacy',
      goal: 'Money theory through financial statements',
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
          CURRICULUM · FINANCIAL LITERACY TRACK
        </div>
        <button onClick={() => navigate('/map')} className="text-[11px] text-matrix/70 hover:text-matrix tracking-widest">
          SKILL MAP ▸
        </button>
      </header>

      {/* hero strip */}
      <section className="px-6 lg:px-10 py-8 border-b border-matrix/20 grid-bg">
        <div className="font-mono text-[11px] tracking-[0.35em] text-signal mb-3">
          // FINANCES — FROM FIRST PRINCIPLES TO FINANCIAL STATEMENTS
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-offwhite max-w-3xl leading-tight">
          Money is a skill. <span className="text-matrix glow-matrix">Learn it like one.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
          Eight modules: what money is, how to run your own finances, how credit works, how a business
          works, and how to read the three financial statements — following Bill Ackman's lemonade-stand
          walkthrough in <span className="text-offwhite">"Everything You Need to Know About Finance and
          Investing in Under an Hour"</span> (Big Think).
        </p>
        <div className="mt-6 flex flex-wrap gap-6 font-mono text-sm">
          <span className="text-matrix glow-soft">{FINANCE_MODULES.length} MODULES</span>
          <span className="text-offwhite">{FIN_TOTAL_LESSONS} LESSONS</span>
          <span className="text-signal">≈{FIN_TOTAL_HOURS}H SPRINT</span>
          <button onClick={startSprint} className="text-matrix underline underline-offset-4 hover:glow-soft">
            ▶ LOAD AS SKILL GRAPH
          </button>
        </div>
      </section>

      {/* learning path */}
      <main className="flex-1 overflow-auto p-6 lg:p-10 max-w-5xl w-full mx-auto space-y-4">
        {FINANCE_MODULES.map((mod, mi) => {
          const isOpen = open === mod.id
          return (
            <section
              key={mod.id}
              className={`border rounded transition-colors ${
                isOpen ? 'border-matrix/50 bg-card box-glow' : 'border-matrix/20 bg-black/30 hover:border-matrix/40'
              }`}
            >
              <button onClick={() => setOpen(isOpen ? null : mod.id)} className="w-full flex items-center gap-4 px-5 py-4 text-left">
                <span className={`font-mono text-xs w-8 ${isOpen ? 'text-signal' : 'text-muted-foreground'}`}>
                  {String(mi + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h2 className={`font-mono text-base tracking-wide ${isOpen ? 'text-matrix glow-soft' : 'text-offwhite'}`}>
                    {mod.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.tagline}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                  {mod.lessons.length} LESSONS · {mod.hours}h
                </span>
                <span className={`font-mono text-matrix transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-3 fade-up">
                  {mod.lessons.map((l) => (
                    <article key={l.id} className="border border-border bg-black/40 rounded p-4 hover:border-matrix/40 transition-colors">
                      <h3 className="font-mono text-sm text-offwhite">{l.name}</h3>
                      <p className="mt-2 text-sm text-offwhite/90 leading-relaxed">{l.idea}</p>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{l.detail}</p>
                      <div className="mt-3 border-l-2 border-signal/40 pl-3 font-mono text-xs leading-relaxed">
                        <div className="text-[10px] tracking-widest text-signal/80 mb-1">TRAINING DRILL</div>
                        <p className="text-muted-foreground">{l.drill}</p>
                      </div>
                      {l.ackman && (
                        <div className="mt-3 border-l-2 border-matrix/50 pl-3 font-mono text-xs leading-relaxed">
                          <div className="text-[10px] tracking-widest text-matrix/70 mb-1">▸ IN ACKMAN'S TALK</div>
                          <p className="text-matrix/80">{l.ackman}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {/* ackman reference card */}
        <section className="border border-matrix/30 rounded p-5 bg-brg/20">
          <div className="font-mono text-[10px] tracking-widest text-matrix/70 mb-2">PRIMARY REFERENCE</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-offwhite">Bill Ackman — "Everything You Need to Know About Finance and
            Investing in Under an Hour"</span> (Big Think). The business arc of this track follows it directly:
            the lemonade stand's cap table (equity vs. debt), its balance sheet, its income statement, why
            leverage is dangerous, and the closing rules — kill high-interest debt first, build a cash cushion,
            favor low-fee index funds, start early, and never invest in what you don't understand. Watch it
            alongside modules 4–8, then do the drills: the talk gives you the worked example, the drills make
            it yours.
          </p>
        </section>
      </main>
    </div>
  )
}
