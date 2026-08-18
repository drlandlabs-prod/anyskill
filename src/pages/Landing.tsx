import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { MatrixRain } from '@/components/MatrixRain'
import { Button } from '@/components/ui/button'
import { saveProfile } from '@/lib/session'
import { useDictation, useSpeechSynth } from '@/hooks/useSpeech'
import { AISettings } from '@/components/AISettings'
import { loadAIConfig, decomposeSkillAI } from '@/lib/ai'
import { storeGraph, graphFromAI } from '@/lib/skills'
import type { LearnerProfile } from '@/lib/skills'

type Phase = 'hero' | 'chat' | 'decompose'

interface Msg { from: 'ai' | 'user'; text: string }

const SUGGESTIONS = ['Negotiation', 'Public speaking', 'SQL for analysis', 'Figma', 'Financial modeling']
const HOURS = [5, 10, 20]
const LEVELS: { id: LearnerProfile['priorLevel']; label: string }[] = [
  { id: 'none', label: 'Total beginner' },
  { id: 'some', label: 'Know the basics' },
  { id: 'working', label: 'Working knowledge' },
]

const DECOMPOSE_LOG = [
  '> parsing goal semantics …',
  '> retrieving transferable-skill ontology …',
  '> decomposing into sub-skills … 12 nodes, 14 prerequisite edges',
  '> running adaptive diagnosis …',
  '> prior knowledge detected: marking foundations KNOWN',
  '> sequencing sprints via next-best-node policy …',
  '> calibrating hour budget …',
  '> SKILL GRAPH COMPILED ✓',
]

export function Landing() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('hero')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(0) // 0 ask skill, 1 ask hours, 2 ask level, 3 confirm
  const [skill, setSkill] = useState('')
  const [hours, setHours] = useState(10)
  const [logLines, setLogLines] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // voice: dictation into the chat box + read-aloud for AI messages
  const [interim, setInterim] = useState('')
  const dictation = useDictation(
    (final) => { setInput((v) => (v ? v.trimEnd() + ' ' : '') + final.trim()); setInterim('') },
    (live) => setInterim(live),
  )
  const synth = useSpeechSynth()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, logLines])

  const startChat = (preset?: string) => {
    setPhase('chat')
    const first: Msg[] = [{ from: 'ai', text: 'What skill do you want to acquire? Name anything — I\'ll build you a 10–20 hour sprint.' }]
    setMsgs(preset ? [...first, { from: 'user', text: preset }] : first)
    if (preset) {
      setSkill(preset)
      setTimeout(() => setMsgs((m) => [...m, { from: 'ai', text: `"${preset}" — good choice. How many hours per week can you train?` }]), 500)
      setStep(1)
    }
  }

  const submit = (value?: string) => {
    const v = (value ?? (input + (interim ? ' ' + interim : ''))).trim()
    if (!v) return
    dictation.stop()
    setInterim('')
    setInput('')
    setMsgs((m) => [...m, { from: 'user', text: v }])
    if (step === 0) {
      setSkill(v)
      setStep(1)
      setTimeout(() => setMsgs((m) => [...m, { from: 'ai', text: `"${v}" — good choice. How many hours per week can you train?` }]), 500)
    }
  }

  const pickHours = (h: number) => {
    setHours(h)
    setMsgs((m) => [...m, { from: 'user', text: `${h} hrs / week` }])
    setStep(2)
    setTimeout(() => setMsgs((m) => [...m, { from: 'ai', text: 'Last thing — how much do you already know about it?' }]), 500)
  }

  const pickLevel = (l: LearnerProfile['priorLevel'], label: string) => {
    setMsgs((m) => [...m, { from: 'user', text: label }])
    setStep(3)
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'ai', text: 'Perfect. Decompiling the skill now — stand by.' }])
      runDecompose(skill, l)
    }, 600)
  }

  const runDecompose = (sk: string, lv: LearnerProfile['priorLevel']) => {
    setPhase('decompose')
    const ai = loadAIConfig()
    const lines = ai
      ? [...DECOMPOSE_LOG.slice(0, 2), `> querying ${ai.model} for live decomposition …`, ...DECOMPOSE_LOG.slice(2)]
      : DECOMPOSE_LOG
    lines.forEach((line, i) => {
      setTimeout(() => setLogLines((l) => [...l, line]), 350 * (i + 1))
    })

    saveProfile({ skill: sk, goal: '', hoursPerWeek: hours, deadline: '', priorLevel: lv })

    const finish = () => navigate('/map')
    if (ai) {
      decomposeSkillAI(ai, sk, lv)
        .then((g) => {
          storeGraph(graphFromAI(g, lv))
          setLogLines((l) => [...l, `> AI graph received: ${g.nodes.length} nodes ✓`])
          setTimeout(finish, 900)
        })
        .catch((e) => {
          setLogLines((l) => [...l, `> AI failed (${e instanceof Error ? e.message.slice(0, 60) : 'error'}) → local fallback`])
          setTimeout(finish, 1200)
        })
    } else {
      setTimeout(finish, 350 * (lines.length + 1) + 600)
    }
  }

  return (
    <div className="scanlines min-h-screen grid-bg flex flex-col">
      <MatrixRain opacity={phase === 'hero' ? 0.18 : 0.08} />

      {/* top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-matrix/20">
        <div className="font-mono text-sm tracking-widest">
          <span className="text-matrix glow-soft">ANY</span>
          <span className="text-offwhite">SKILL</span>
          <span className="text-signal">_</span>
        </div>
        <div className="flex items-center gap-5">
          <AISettings />
          <button
            onClick={() => navigate('/finances')}
            className="font-mono text-[11px] tracking-widest text-signal hover:text-accent transition-colors"
          >
            FINANCES ▸
          </button>
          <button
            onClick={() => navigate('/models')}
            className="font-mono text-[11px] tracking-widest text-signal hover:text-accent transition-colors"
          >
            MUNGER MODELS ▸
          </button>
          <button
            onClick={() => navigate('/habits')}
            className="font-mono text-[11px] tracking-widest text-signal hover:text-accent transition-colors"
          >
            HABITS ▸
          </button>
          <div className="font-mono text-[11px] text-muted-foreground hidden md:block">
            TRANSFERABLE SKILL ACQUISITION · v0.1 PROTOTYPE
          </div>
        </div>
      </header>

      {phase === 'hero' && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center fade-up">
          <div className="font-mono text-[11px] tracking-[0.35em] text-signal mb-6">
            // COMPETENCE IN 10–20 HOURS. PROVEN, NOT CERTIFIED.
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-offwhite leading-tight">
            Learn <span className="text-matrix glow-matrix font-mono">any skill</span>
            <br />by asking for it.
          </h1>
          <p className="mt-6 max-w-xl text-muted-foreground text-lg">
            The engine decomposes any transferable skill into a skill graph, diagnoses what you
            already know, and sprints you through the delta — deliberate practice, instant feedback,
            capstone proof.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground font-mono tracking-widest hover:bg-primary/90 box-glow px-10"
              onClick={() => startChat()}
            >
              ▶ INITIATE INTAKE
            </Button>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSkill(s); startChat(s) }}
                  className="font-mono text-xs px-3 py-1.5 border border-matrix/30 text-matrix/80 hover:border-matrix hover:text-matrix hover:bg-matrix/5 transition-colors rounded"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-16 w-full overflow-hidden opacity-60">
            <div className="ticker whitespace-nowrap font-mono text-xs text-matrix/60">
              {Array(2).fill(
                ' DECOMPOSE → DIAGNOSE → PLAN → SPRINT → PROVE → RETAIN ◆ BLOOM 2σ ◆ DELIBERATE PRACTICE ◆ RETRIEVAL ◆ SPACED REPETITION ◆ WORKED EXAMPLES ◆ TRANSFER-FIRST ◆',
              ).join('')}
            </div>
          </div>
        </main>
      )}

      {(phase === 'chat' || phase === 'decompose') && (
        <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-6 py-8 fade-up">
          <div className="flex-1 space-y-4 overflow-y-auto pb-6">
            {msgs.map((m, i) => (
              <div key={i} className={`fade-up flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded font-mono text-sm leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-brg text-offwhite border border-matrix/30'
                      : 'bg-card border border-matrix/20 text-matrix box-glow'
                  }`}
                >
                  {m.from === 'ai' && <span className="text-signal mr-2">▸</span>}
                  {m.text}
                  {m.from === 'ai' && synth.supported && (
                    <button
                      onClick={() => (synth.speaking ? synth.cancel() : synth.speak(m.text))}
                      className="ml-3 align-middle text-matrix/50 hover:text-matrix transition-colors"
                      title={synth.speaking ? 'Stop' : 'Read aloud'}
                    >
                      {synth.speaking ? '◼' : '♪'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {phase === 'chat' && step === 1 && (
              <div className="flex gap-2 fade-up">
                {HOURS.map((h) => (
                  <button key={h} onClick={() => pickHours(h)}
                    className="font-mono text-xs px-4 py-2 border border-signal/50 text-signal hover:bg-signal/10 rounded transition-colors">
                    {h} hrs/wk
                  </button>
                ))}
              </div>
            )}
            {phase === 'chat' && step === 2 && (
              <div className="flex flex-wrap gap-2 fade-up">
                {LEVELS.map((l) => (
                  <button key={l.id} onClick={() => pickLevel(l.id, l.label)}
                    className="font-mono text-xs px-4 py-2 border border-signal/50 text-signal hover:bg-signal/10 rounded transition-colors">
                    {l.label}
                  </button>
                ))}
              </div>
            )}

            {phase === 'decompose' && (
              <div className="mt-6 p-4 border border-matrix/30 bg-black/60 rounded font-mono text-xs space-y-1.5 box-glow">
                {logLines.map((l, i) => (
                  <div key={i} className="fade-up text-matrix/90">{l}</div>
                ))}
                {logLines.length < DECOMPOSE_LOG.length && <div className="caret text-matrix/60" />}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {phase === 'chat' && step === 0 && (
            <form
              className="flex flex-col gap-2 border-t border-matrix/20 pt-4"
              onSubmit={(e) => { e.preventDefault(); submit() }}
            >
              {dictation.listening && (
                <div className="fade-up font-mono text-[11px] text-signal tracking-widest">
                  ◉ LISTENING — speak, then hit SEND or tap the mic to stop
                  {interim && <span className="block mt-1 text-matrix/70 normal-case tracking-normal">"{interim}"</span>}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={dictation.listening && interim ? input + (input ? ' ' : '') + interim : input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. negotiation, touch typing, statistics…"
                  className="flex-1 bg-black/50 border border-matrix/30 rounded px-4 py-3 font-mono text-sm text-offwhite placeholder:text-muted-foreground focus:outline-none focus:border-matrix focus:box-glow"
                />
                {dictation.supported && (
                  <Button
                    type="button"
                    onClick={dictation.toggle}
                    title={dictation.listening ? 'Stop dictation' : 'Dictate by voice'}
                    className={`font-mono px-4 ${
                      dictation.listening
                        ? 'bg-accent text-accent-foreground box-glow-orange animate-pulse hover:bg-accent/90'
                        : 'bg-transparent border border-matrix/40 text-matrix hover:bg-matrix/10'
                    }`}
                  >
                    {dictation.listening ? '◼' : '🎙'}
                  </Button>
                )}
                <Button type="submit" className="bg-primary text-primary-foreground font-mono hover:bg-primary/90">
                  SEND ▸
                </Button>
              </div>
            </form>
          )}
        </main>
      )}
    </div>
  )
}
