import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { MatrixRain } from '@/components/MatrixRain'
import { Button } from '@/components/ui/button'
import { ANCHORING_DRILL } from '@/lib/skills'
import { loadProfile } from '@/lib/session'

type Phase = 'prime' | 'model' | 'drill' | 'reflect' | 'done'

const PHASES: { id: Phase; label: string; dur: string }[] = [
  { id: 'prime', label: 'PRIME', dur: '2 min' },
  { id: 'model', label: 'MODEL', dur: '5 min' },
  { id: 'drill', label: 'DRILL', dur: '25 min' },
  { id: 'reflect', label: 'REFLECT', dur: '3 min' },
]

export function Session() {
  const navigate = useNavigate()
  const profile = loadProfile()
  const [phase, setPhase] = useState<Phase>('prime')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [good, setGood] = useState(false)
  const [mastery, setMastery] = useState(12)
  const [seconds, setSeconds] = useState(0)
  const [reflectText, setReflectText] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const submitAnswer = () => {
    if (!answer.trim()) return
    const hits = ANCHORING_DRILL.goodSignals.filter((s) => answer.toLowerCase().includes(s.toLowerCase()))
    const isGood = hits.length >= 3
    setGood(isGood)
    setFeedback(isGood ? ANCHORING_DRILL.feedbackGood : ANCHORING_DRILL.feedbackWeak)
    setMastery((m) => Math.min(100, m + (isGood ? 18 : 5)))
  }

  const phaseIdx = PHASES.findIndex((p) => p.id === phase)
  const next = () => {
    const order: Phase[] = ['prime', 'model', 'drill', 'reflect', 'done']
    setPhase(order[Math.min(order.indexOf(phase) + 1, order.length - 1)])
  }

  return (
    <div className="scanlines min-h-screen flex flex-col">
      <MatrixRain opacity={0.05} />

      <header className="flex items-center justify-between px-6 py-4 border-b border-matrix/20 font-mono">
        <button onClick={() => navigate('/map')} className="text-sm tracking-widest">
          <span className="text-matrix glow-soft">ANY</span>
          <span className="text-offwhite">SKILL</span>
          <span className="text-signal">_</span>
        </button>
        <div className="text-[11px] text-muted-foreground uppercase">
          SPRINT 2 · {profile?.skill ?? 'Negotiation'} · NODE: ANCHORING
        </div>
        <div className="text-matrix text-sm glow-soft tabular-nums">{mm}:{ss}</div>
      </header>

      {/* phase stepper */}
      <div className="flex border-b border-matrix/20 font-mono text-[11px]">
        {PHASES.map((p, i) => (
          <div
            key={p.id}
            className={`flex-1 px-4 py-2.5 text-center tracking-widest border-r border-matrix/10 last:border-r-0 ${
              i < phaseIdx
                ? 'bg-brg/40 text-matrix'
                : i === phaseIdx
                  ? 'bg-signal/10 text-signal box-glow-orange'
                  : 'text-muted-foreground'
            }`}
          >
            {i < phaseIdx ? '✓ ' : ''}{p.label} <span className="opacity-50">· {p.dur}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* main pane */}
        <div className="flex-1 p-6 lg:p-10 overflow-auto">
          {phase === 'prime' && (
            <div className="max-w-2xl fade-up space-y-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-signal">// PRIME — WHY THIS MATTERS</div>
              <h2 className="text-3xl font-bold text-offwhite">Anchoring: whoever names a number first bends reality.</h2>
              <p className="text-muted-foreground leading-relaxed">
                The first number in a negotiation pulls the entire outcome toward it — even for experts.
                Today's drill: you will practice <span className="text-matrix">re-anchoring</span> when the
                other side opens low. By the end of this sprint you should be able to counter-anchor
                <span className="text-offwhite"> calmly, specifically, and without apologizing</span>.
              </p>
              <div className="border border-matrix/30 rounded p-4 bg-card font-mono text-xs text-matrix/80 box-glow">
                SUCCESS CRITERIA — state a specific counter-number · justify with value/scope · then hold silence
              </div>
              <Button onClick={next} className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90">
                CONTINUE ▸
              </Button>
            </div>
          )}

          {phase === 'model' && (
            <div className="max-w-2xl fade-up space-y-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-signal">// MODEL — WORKED EXAMPLE</div>
              <h2 className="text-3xl font-bold text-offwhite">Watch an expert re-anchor.</h2>
              <div className="space-y-3 font-mono text-sm">
                <div className="border border-border rounded p-4 bg-black/50">
                  <span className="text-muted-foreground text-xs">CLIENT</span>
                  <p className="text-offwhite mt-1">"We usually pay around $85/hr for this."</p>
                </div>
                <div className="border border-matrix/40 rounded p-4 bg-brg/30 box-glow">
                  <span className="text-matrix text-xs">EXPERT — note the 3 moves</span>
                  <p className="text-offwhite mt-1">
                    "For the scope you described — <span className="text-matrix">①</span> my rate is
                    <span className="text-signal"> $125/hr</span>. <span className="text-matrix">②</span> That's based
                    on the last three launches I shipped on this exact stack. <span className="text-matrix">③</span> …"
                    <span className="text-muted-foreground">(silence)</span>
                  </p>
                </div>
              </div>
              <ol className="font-mono text-xs text-muted-foreground space-y-1.5">
                <li><span className="text-matrix">①</span> Specific number, above target — delivered flatly</li>
                <li><span className="text-matrix">②</span> Justified with value, not apology</li>
                <li><span className="text-matrix">③</span> Silence — let the anchor do the work</li>
              </ol>
              <Button onClick={next} className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90">
                ENTER DRILL ▸
              </Button>
            </div>
          )}

          {phase === 'drill' && (
            <div className="max-w-2xl fade-up space-y-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-signal">// DRILL — DELIBERATE PRACTICE · ATTEMPT 1/3</div>
              <div className="border border-matrix/30 rounded p-5 bg-card box-glow">
                <p className="font-mono text-sm text-offwhite leading-relaxed whitespace-pre-line">{ANCHORING_DRILL.prompt}</p>
              </div>
              <p className="font-mono text-xs text-muted-foreground">HINT · {ANCHORING_DRILL.hint}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder='Type exactly what you would say out loud…'
                className="w-full bg-black/50 border border-matrix/30 rounded px-4 py-3 font-mono text-sm text-offwhite placeholder:text-muted-foreground focus:outline-none focus:border-matrix focus:box-glow"
              />
              {!feedback ? (
                <Button onClick={submitAnswer} className="bg-accent text-accent-foreground font-mono tracking-widest hover:bg-accent/90 box-glow-orange">
                  SUBMIT FOR FEEDBACK ▸
                </Button>
              ) : (
                <div className={`fade-up border rounded p-5 font-mono text-sm leading-relaxed ${
                  good ? 'border-matrix/50 bg-brg/30 text-matrix box-glow' : 'border-signal/50 bg-signal/5 text-signal box-glow-orange'
                }`}>
                  <div className="text-[10px] tracking-widest mb-2 opacity-70">COACH FEEDBACK · BKT UPDATE</div>
                  {feedback}
                  <div className="mt-4 flex gap-3">
                    <Button onClick={next} className="bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90">
                      CONTINUE TO REFLECT ▸
                    </Button>
                    <Button variant="outline" onClick={() => { setFeedback(null); setAnswer('') }}
                      className="font-mono text-xs border-matrix/40 text-matrix hover:bg-matrix/10">
                      ↻ RETRY DRILL
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === 'reflect' && (
            <div className="max-w-2xl fade-up space-y-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-signal">// REFLECT — FEYNMAN CHECK</div>
              <h2 className="text-3xl font-bold text-offwhite">Explain anchoring back, in your own words.</h2>
              <p className="text-muted-foreground">Teach it to a smart 12-year-old. Gaps in your explanation get routed back into tomorrow's plan automatically.</p>
              <textarea
                value={reflectText}
                onChange={(e) => setReflectText(e.target.value)}
                rows={4}
                placeholder="Anchoring is…"
                className="w-full bg-black/50 border border-matrix/30 rounded px-4 py-3 font-mono text-sm text-offwhite placeholder:text-muted-foreground focus:outline-none focus:border-matrix focus:box-glow"
              />
              <Button
                onClick={() => { setMastery((m) => Math.min(100, m + 10)); next() }}
                disabled={reflectText.trim().length < 20}
                className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90 disabled:opacity-40"
              >
                COMPLETE SPRINT ▸
              </Button>
            </div>
          )}

          {phase === 'done' && (
            <div className="max-w-2xl fade-up space-y-6 text-center mx-auto pt-8">
              <div className="font-mono text-6xl text-matrix glow-matrix">✓</div>
              <h2 className="text-3xl font-bold text-offwhite">Sprint 2 complete.</h2>
              <p className="font-mono text-sm text-muted-foreground">
                NODE: ANCHORING → mastery <span className="text-matrix">{mastery}%</span> ·
                spaced-repetition reviews scheduled at <span className="text-signal">+1d, +3d, +7d</span>
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/map')} className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90 box-glow">
                  RETURN TO SKILL MAP ▸
                </Button>
                <Button onClick={() => navigate('/habits')} variant="outline"
                  className="border-signal/50 text-signal font-mono tracking-widest hover:bg-signal/10">
                  RETAIN: HABIT ENGINE ▸
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* telemetry sidebar */}
        <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-matrix/20 p-5 space-y-5 font-mono">
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground mb-1.5">NODE MASTERY (BKT)</div>
            <div className="h-2 rounded bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-700" style={{ width: `${mastery}%` }} />
            </div>
            <div className="text-matrix text-xs mt-1 glow-soft">{mastery}% · guess 0.08 · slip 0.11</div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground mb-1.5">HOUR BUDGET</div>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div className="flex justify-between"><span>consumed</span><span className="text-offwhite">3.2h</span></div>
              <div className="flex justify-between"><span>remaining</span><span className="text-matrix">12.8h</span></div>
              <div className="flex justify-between"><span>pace</span><span className="text-signal">on track</span></div>
            </div>
          </div>
          <div className="border border-matrix/20 rounded p-3 bg-black/40">
            <div className="text-[10px] tracking-widest text-muted-foreground mb-2">TUTOR CONSTRAINTS</div>
            <ul className="text-[11px] space-y-1 text-matrix/70">
              <li>▸ socratic mode: ON</li>
              <li>▸ hints before answers</li>
              <li>▸ edge-of-ability targeting</li>
              <li>▸ retrieval &gt; re-reading</li>
            </ul>
          </div>
          <div className="border border-dashed border-matrix/25 rounded p-3 text-[11px] text-muted-foreground leading-relaxed">
            Every attempt updates the Bayesian knowledge-tracing model. The sequencer re-plans your next sprint tonight.
          </div>
        </aside>
      </main>
    </div>
  )
}
