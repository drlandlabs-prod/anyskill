import { useState } from 'react'
import { AI_PRESETS, loadAIConfig, saveAIConfig, pingAI, type AIConfig } from '@/lib/ai'

/** Small gear panel: paste an OpenAI-compatible API key to switch the app
 *  from mock content to live AI decomposition, drills, and feedback. */
export function AISettings() {
  const [open, setOpen] = useState(false)
  const [cfg, setCfg] = useState<AIConfig>(() => loadAIConfig() ?? { apiKey: '', baseUrl: AI_PRESETS[0].baseUrl, model: AI_PRESETS[0].model })
  const [status, setStatus] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const connected = !!loadAIConfig()

  const applyPreset = (name: string) => {
    const p = AI_PRESETS.find((x) => x.name === name)
    if (p) setCfg((c) => ({ ...c, baseUrl: p.baseUrl, model: p.model }))
  }

  const save = () => {
    saveAIConfig(cfg.apiKey ? cfg : null)
    setStatus(cfg.apiKey ? 'saved — live AI enabled' : 'key cleared — mock mode')
  }

  const test = async () => {
    setTesting(true)
    setStatus(null)
    try {
      const r = await pingAI(cfg)
      setStatus(`✓ ${r}`)
    } catch (e) {
      setStatus(`✗ ${e instanceof Error ? e.message : 'connection failed'}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`font-mono text-[11px] tracking-widest transition-colors ${
          connected ? 'text-matrix glow-soft' : 'text-muted-foreground hover:text-matrix'
        }`}
        title="AI engine settings"
      >
        {connected ? '◉ AI LIVE' : '○ AI KEY'}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-80 border border-matrix/40 bg-black/95 rounded p-4 font-mono text-xs space-y-3 box-glow fade-up">
          <div className="text-[10px] tracking-widest text-muted-foreground">
            AI ENGINE — key stays in your browser (localStorage)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AI_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p.name)}
                className={`px-2 py-1 border rounded text-[10px] transition-colors ${
                  cfg.baseUrl === p.baseUrl ? 'border-matrix text-matrix' : 'border-border text-muted-foreground hover:border-matrix/50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <input
            value={cfg.baseUrl}
            onChange={(e) => setCfg((c) => ({ ...c, baseUrl: e.target.value }))}
            placeholder="base URL"
            className="w-full bg-black/50 border border-matrix/30 rounded px-3 py-2 text-offwhite focus:outline-none focus:border-matrix"
          />
          <input
            value={cfg.model}
            onChange={(e) => setCfg((c) => ({ ...c, model: e.target.value }))}
            placeholder="model"
            className="w-full bg-black/50 border border-matrix/30 rounded px-3 py-2 text-offwhite focus:outline-none focus:border-matrix"
          />
          <input
            type="password"
            value={cfg.apiKey}
            onChange={(e) => setCfg((c) => ({ ...c, apiKey: e.target.value }))}
            placeholder="API key (sk-…)"
            className="w-full bg-black/50 border border-matrix/30 rounded px-3 py-2 text-offwhite focus:outline-none focus:border-matrix"
          />
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 bg-primary text-primary-foreground rounded py-2 hover:bg-primary/90">
              SAVE
            </button>
            <button onClick={test} disabled={testing || !cfg.apiKey}
              className="flex-1 border border-matrix/40 text-matrix rounded py-2 hover:bg-matrix/10 disabled:opacity-40">
              {testing ? '…' : 'TEST'}
            </button>
          </div>
          {status && <div className={`text-[11px] ${status.startsWith('✓') || status.includes('enabled') ? 'text-matrix' : status.startsWith('✗') ? 'text-signal' : 'text-muted-foreground'}`}>{status}</div>}
        </div>
      )}
    </div>
  )
}
