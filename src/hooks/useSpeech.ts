import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal typings for the Web Speech API (not in TS dom lib).
interface SpeechRecognitionResultItem { transcript: string }
interface SpeechRecognitionResult { 0: SpeechRecognitionResultItem; isFinal: boolean }
interface SpeechRecognitionEvent { resultIndex: number; results: SpeechRecognitionResult[] & { length: number } }
interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type RecognitionCtor = new () => SpeechRecognitionInstance

function getCtor(): RecognitionCtor | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as RecognitionCtor | null
}

/** Speech-to-text dictation for the chat input. */
export function useDictation(onFinal: (text: string) => void, onInterim: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const supported = typeof window !== 'undefined' && getCtor() !== null
  const recRef = useRef<SpeechRecognitionInstance | null>(null)
  const finalRef = useRef(onFinal)
  const interimRef = useRef(onInterim)
  finalRef.current = onFinal
  interimRef.current = onInterim

  const stop = useCallback(() => {
    recRef.current?.stop()
    recRef.current = null
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor || recRef.current) return
    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      let final = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      if (final) finalRef.current(final)
      if (interim) interimRef.current(interim)
    }
    rec.onend = () => { recRef.current = null; setListening(false) }
    rec.onerror = () => { recRef.current = null; setListening(false) }
    recRef.current = rec
    rec.start()
    setListening(true)
  }, [])

  const toggle = useCallback(() => {
    if (recRef.current) stop()
    else start()
  }, [start, stop])

  useEffect(() => () => { recRef.current?.abort() }, [])

  return { supported, listening, toggle, stop }
}

/** Text-to-speech for AI messages. */
export function useSpeechSynth() {
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback((text: string) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.05
    u.pitch = 0.9
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find((v) => /en[-_]US/i.test(v.lang) && /google|samantha|natural/i.test(v.name))
    if (preferred) u.voice = preferred
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(u)
  }, [supported])

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel() }, [supported])

  return { supported, speaking, speak, cancel }
}
