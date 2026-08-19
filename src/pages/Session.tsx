import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { MatrixRain } from '@/components/MatrixRain'
import { Button } from '@/components/ui/button'
import { currentGraph, loadActiveNode, buildDrill, recordLearningEvidence, completeNode } from '@/lib/skills'
import { loadAIConfig, generateDrillAI, evaluateAnswerAI, evaluateReflectionAI, type AIDrill } from '@/lib/ai'
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
  const skill = profile?.skill ?? 'Negotiation'
  const initialGraph = useMemo(
    () => currentGraph(skill, profile?.priorLevel ?? 'none'),
    [skill, profile?.priorLevel],
  )
  const node = useMemo(() => loadActiveNode(initialGraph), [initialGraph])
  const localDrill = useMemo(() => buildDrill(node, skill), [node, skill])
  const nodeLabel = node.label.replace(/^CAPSTONE · /, '')
  const isAnchoring = node.id === 'anchoring'
  const ai = useMemo(() => loadAIConfig(), [])

  const [aiDrill, setAiDrill] = useState<AIDrill | null>(null)
  const [drillLoading, setDrillLoading] = useState(false)
  useEffect(() => {
    if (!ai || isAnchoring) return
    setDrillLoading(true)
    generateDrillAI(ai, nodeLabel, node.kind, skill)
      .then(setAiDrill)
      .catch(() => setAiDrill(null))
      .finally(() => setDrillLoading(false))
  }, [ai, isAnchoring, nodeLabel, node.kind, skill])

  const drill = aiDrill ?? localDrill
  const [phase, setPhase] = useState<Phase>('prime')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [good, setGood] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [mastery, setMastery] = useState(() => Math.round(node.mastery * 100))
  const [seconds, setSeconds] = useState(0)
  const [reflectText, setReflectText] = useState('')
  const [reflectFeedback, setReflectFeedback] = useState<string | null>(null)
  const [reflectEvaluating, setReflectEvaluating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const persistAttempt = (nextMastery: number, passed: boolean, score: number, masteryDelta: number, attemptFeedback: string) => {
    recordLearningEvidence(
      currentGraph(skill, profile?.priorLevel ?? 'none'),
      node.id,
      nextMastery / 100,
      {
        type: /^CAPSTONE/.test(node.label) ? 'capstone' : 'drill',
        score,
        masteryDelta,
        passed,
        feedback: attemptFeedback,
      },
    )
  }

  const submitAnswer = async () => {
    if (!answer.trim() || evaluating) return
    if (ai) {
      setEvaluating(true)
      try {
        const ev = await evaluateAnswerAI(ai, nodeLabel, drill.prompt, answer)
        const deltaPoints = Math.round(ev.masteryDelta * 100)
        const nextMastery = Math.min(100, mastery + deltaPoints)
        setGood(ev.good)
        setFeedback(ev.feedback)
        setMastery(nextMastery)
        persistAttempt(nextMastery, ev.good, ev.score ?? (ev.good ? 0.75 : 0.35), ev.masteryDelta, ev.feedback)
        return
      } catch {
        // fall through to deterministic local scoring
      } finally {
        setEvaluating(false)
      }
    }

    const hits = drill.goodSignals.filter((s) => answer.toLowerCase().includes(s.toLowerCase()))
    const isGood = hits.length >= 3
    const deltaPoints = isGood ? 18 : 5
    const nextMastery = Math.min(100, mastery + deltaPoints)
    const localFeedback = isGood ? localDrill.feedbackGood : localDrill.feedbackWeak
    setGood(isGood)
    setFeedback(localFeedback)
    setMastery(nextMastery)
    persistAttempt(nextMastery, isGood, Math.min(1, hits.length / Math.max(1, drill.goodSignals.length)), deltaPoints / 100, localFeedback)
  }

  const completeReflection = async () => {
    const text = reflectText.trim()
    if (text.length < 20 || reflectEvaluating) return
    setReflectEvaluating(true)
    try {
      let passed = false
      let score = 0
      let delta = 0
      let reflectionFeedback = ''

      if (ai) {
        try {
          const ev = await evaluateReflectionAI(ai, nodeLabel, text)
          passed = ev.good
          score = ev.score ?? (ev.good ? 0.75 : 0.25)
          delta = ev.masteryDelta
          reflectionFeedback = ev.feedback
        } catch {
          // deterministic fallback below
        }
      }

      if (!reflectionFeedback) {
        const words = text.toLowerCase().split(/\s+/).filter(Boolean)
        const hasCausalLanguage = ['because', 'therefore', 'so that', 'which means', 'causes'].some((token) => text.toLowerCase().includes(token))
        const mentionsConcept = nodeLabel.toLowerCase().split(/\W+/).filter((x) => x.length > 4).some((token) => text.toLowerCase().includes(token))
        passed = words.length >= 35 && hasCausalLanguage && mentionsConcept
        score = passed ? 0.7 : Math.min(0.55, words.length / 70)
        delta = passed ? 0.07 : 0
        reflectionFeedback = passed
          ? 'Your explanation is specific enough to show causal understanding. The reflection counts as supporting evidence, not automatic mastery.'
          : 'This explanation is not strong enough to increase mastery yet. Explain what causes what, why the principle works, and include one concrete example.'
      }

      const nextMastery = Math.min(100, mastery + Math.round(delta * 100))
      setMastery(nextMastery)
      setReflectFeedback(reflectionFeedback)

      completeNode(
        currentGraph(skill, profile?.priorLevel ?? 'none'),
        node.id,
        nextMastery / 100,
        {
          type: 'reflection',
          score,
          masteryDelta: delta,
          passed,
          feedback: reflectionFeedback,
        },
      )
      setPhase('done')
    } finally {
      setReflectEvaluating(false)
    }
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
          <span className="text-matrix glow-soft">ANY</span><span className="text-offwhite">SKILL</span><span className="text-signal">_</span>
        </button>
        <div className="text-[11px] text-muted-foreground uppercase">SPRINT · {skill} · NODE: {nodeLabel.toUpperCase()}</div>
        <div className="text-matrix text-sm glow-soft tabular-nums">{mm}:{ss}</div>
      </header>

      <div className="flex border-b border-matrix/20 font-mono text-[11px]">
        {PHASES.map((p, i) => (
          <div key={p.id} className={`flex-1 px-4 py-2.5 text-center tracking-widest border-r border-matrix/10 last:border-r-0 ${
            i < phaseIdx ? 'bg-brg/40 text-matrix' : i === phaseIdx ? 'bg-signal/10 text-signal box-glow-orange' : 'text-muted-foreground'
          }`}>
            {i < phaseIdx ? '✓ ' : ''}{p.label} <span className="opacity-50">· {p.dur}</span>
          </div>
        ))}
      </div>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-6 lg:p-10 overflow-auto">
          {phase === 'prime' && (
            <div className="max-w-2xl fade-up space-y-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-signal">// PRIME — WHY THIS MATTERS</div>
              {isAnchoring ? (
                <>
                  <h2 className="text-3xl font-bold text-offwhite">Anchoring: whoever names a number first bends reality.</h2>
                  <p className="text-muted-foreground leading-relaxed">The first number in a negotiation pulls the outcome toward it. Today's drill practices re-anchoring calmly, specifically, and without apologizing.</p>
                  <div className="border border-matrix/30 rounded p-4 bg-card font-mono text-xs text-matrix/80 box-glow">SUCCESS CRITERIA — state a specific counter-number · justify with value/scope · then hold silence</div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-offwhite">{nodeLabel}: the next node on your {skill} graph.</h2>
                  <p className="text-muted-foreground leading-relaxed">This sprint trains <span className="text-matrix">{nodeLabel}</span>, a <span className="text-offwhite">{node.kind}</span> node estimated at <span className="text-matrix">{node.hours}h</span> to acquire. You'll see one model, then practice at the edge of your ability with feedback.</p>
                  <div className="border border-matrix/30 rounded p-4 bg-card font-mono text-xs text-matrix/80 box-glow">SUCCESS CRITERIA — apply {nodeLabel} to a concrete case · name the principle · state what a beginner would miss</div>
                </>
              )}
              <Button onClick={next} className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90">CONTINUE ▸</Button>
            </div>
          )}

          {phase === 'model' && (
            <div className="max-w-2xl fade-up space-y-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-signal">// MODEL — WORKED EXAMPLE</div>
              {isAnchoring ? (
                <>
                  <h2 className="text-3xl font-bold text-offwhite">Watch an expert re-anchor.</h2>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="border border-border rounded p-4 bg-black/50"><span className="text-muted-foreground text-xs">CLIENT</span><p className="text-offwhite mt-1">"We usually pay around $85/hr for this."</p></div>
                    <div className="border border-matrix/40 rounded p-4 bg-brg/30 box-glow"><span className="text-matrix text-xs">EXPERT — note the 3 moves</span><p className="text-offwhite mt-1">"For the scope you described, my rate is <span className="text-signal">$125/hr</span>. That's based on the last three launches I shipped on this exact stack." <span className="text-muted-foreground">(silence)</span></p></div>
                  </div>
                  <ol className="font-mono text-xs text-muted-foreground space-y-1.5"><li>① Specific number, above target</li><li>② Justified with value, not apology</li><li>③ Silence — let the anchor work</li></ol>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-offwhite">Watch an expert apply {nodeLabel}.</h2>
                  <div className="border border-matrix/40 rounded p-4 bg-brg/30 box-glow font-mono text-sm text-offwhite">① Name the principle. ② Apply it step by step and explain why. ③ Compare the result with the naive approach.</div>
                  <ol className="font-mono text-xs text-muted-foreground space-y-1.5"><li>① Principle first</li><li>② Reasoned steps — every move has a because</li><li>③ Self-check against the beginner approach</li></ol>
                </>
              )}
              <Button onClick={next} className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90">ENTER DRILL ▸</Button>
            </div>
          )}

          {phase === 'drill' && (
            <div className="max-w-2xl fade-up space-y-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-signal">// DRILL — DELIBERATE PRACTICE</div>
              <div className="border border-matrix/30 rounded p-5 bg-card box-glow"><p className="font-mono text-sm text-offwhite leading-relaxed whitespace-pre-line">{drill.prompt}</p></div>
              <p className="font-mono text-xs text-muted-foreground">HINT · {drill.hint}</p>
              {drillLoading && <p className="font-mono text-xs text-signal animate-pulse">◌ generating a live drill for this node…</p>}
              {ai && !drillLoading && aiDrill && <p className="font-mono text-[10px] text-matrix/60">◉ LIVE AI DRILL · {ai.model}</p>}
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} placeholder="Type exactly what you would do or say…" className="w-full bg-black/50 border border-matrix/30 rounded px-4 py-3 font-mono text-sm text-offwhite placeholder:text-muted-foreground focus:outline-none focus:border-matrix focus:box-glow" />
              {!feedback ? (
                <Button onClick={submitAnswer} disabled={evaluating} className="bg-accent text-accent-foreground font-mono tracking-widest hover:bg-accent/90 box-glow-orange disabled:opacity-50">{evaluating ? '◌ EVALUATING…' : 'SUBMIT FOR FEEDBACK ▸'}</Button>
              ) : (
                <div className={`fade-up border rounded p-5 font-mono text-sm leading-relaxed ${good ? 'border-matrix/50 bg-brg/30 text-matrix box-glow' : 'border-signal/50 bg-signal/5 text-signal box-glow-orange'}`}>
                  <div className="text-[10px] tracking-widest mb-2 opacity-70">COACH FEEDBACK · MASTERY ESTIMATE UPDATED</div>
                  {feedback}
                  <div className="mt-4 flex gap-3">
                    <Button onClick={next} className="bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90">CONTINUE TO REFLECT ▸</Button>
                    <Button variant="outline" onClick={() => { setFeedback(null); setAnswer(''); setGood(false) }} className="font-mono text-xs border-matrix/40 text-matrix hover:bg-matrix/10">↻ RETRY DRILL</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === 'reflect' && (
            <div className="max-w-2xl fade-up space-y-6">
              <div className="font-mono text-[11px] tracking-[0.3em] text-signal">// REFLECT — FEYNMAN CHECK</div>
              <h2 className="text-3xl font-bold text-offwhite">Explain {nodeLabel.toLowerCase()} back, in your own words.</h2>
              <p className="text-muted-foreground">Teach it to a smart 12-year-old. This explanation is evaluated for correctness and causal understanding before it can affect mastery.</p>
              <textarea value={reflectText} onChange={(e) => setReflectText(e.target.value)} rows={5} placeholder={`${nodeLabel} is…`} className="w-full bg-black/50 border border-matrix/30 rounded px-4 py-3 font-mono text-sm text-offwhite placeholder:text-muted-foreground focus:outline-none focus:border-matrix focus:box-glow" />
              {reflectFeedback && <div className="border border-matrix/30 bg-brg/20 rounded p-4 font-mono text-xs text-matrix">{reflectFeedback}</div>}
              <Button onClick={completeReflection} disabled={reflectText.trim().length < 20 || reflectEvaluating} className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90 disabled:opacity-40">{reflectEvaluating ? '◌ EVALUATING REFLECTION…' : 'COMPLETE SPRINT ▸'}</Button>
            </div>
          )}

          {phase === 'done' && (
            <div className="max-w-2xl fade-up space-y-6 text-center mx-auto pt-8">
              <div className="font-mono text-6xl text-matrix glow-matrix">✓</div>
              <h2 className="text-3xl font-bold text-offwhite">Sprint complete.</h2>
              <p className="font-mono text-sm text-muted-foreground">NODE: {nodeLabel.toUpperCase()} → mastery estimate <span className="text-matrix">{mastery}%</span></p>
              {reflectFeedback && <p className="font-mono text-xs text-muted-foreground">{reflectFeedback}</p>}
              <p className="font-mono text-xs text-signal">Recommended retention checks: +1d, +3d, +7d</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/map')} className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90 box-glow">RETURN TO SKILL MAP ▸</Button>
                <Button onClick={() => navigate('/habits')} variant="outline" className="border-signal/50 text-signal font-mono tracking-widest hover:bg-signal/10">RETAIN: HABIT ENGINE ▸</Button>
              </div>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-matrix/20 p-5 space-y-5 font-mono">
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground mb-1.5">NODE MASTERY ESTIMATE</div>
            <div className="h-2 rounded bg-muted overflow-hidden"><div className="h-full bg-primary transition-all duration-700" style={{ width: `${mastery}%` }} /></div>
            <div className="text-matrix text-xs mt-1 glow-soft">{mastery}% · evidence-based prototype score</div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground mb-1.5">SESSION</div>
            <div className="text-xs space-y-1 text-muted-foreground"><div className="flex justify-between"><span>elapsed</span><span className="text-offwhite">{mm}:{ss}</span></div><div className="flex justify-between"><span>graph remaining</span><span className="text-matrix">{currentGraph(skill, profile?.priorLevel ?? 'none').totalHours}h</span></div></div>
          </div>
          <div className="border border-matrix/20 rounded p-3 bg-black/40">
            <div className="text-[10px] tracking-widest text-muted-foreground mb-2">TUTOR CONSTRAINTS</div>
            <ul className="text-[11px] space-y-1 text-matrix/70"><li>▸ socratic mode: ON</li><li>▸ hints before answers</li><li>▸ edge-of-ability targeting</li><li>▸ retrieval &gt; re-reading</li></ul>
          </div>
          <div className="border border-dashed border-matrix/25 rounded p-3 text-[11px] text-muted-foreground leading-relaxed">Every drill and reflection stores evidence. Crossing the mastery threshold marks the node mastered and unlocks dependent nodes.</div>
        </aside>
      </main>
    </div>
  )
}
