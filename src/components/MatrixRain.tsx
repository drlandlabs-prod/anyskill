import { useEffect, useRef } from 'react'

/** Subtle matrix-rain canvas backdrop. */
export function MatrixRain({ opacity = 0.16 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const cols = Math.floor(w / 18)
    const drops = Array.from({ length: cols }, () => Math.random() * -60)
    const glyphs = 'アカサタナハマヤラワ0123456789ΔΣλπ$#%&*+=<>'

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    let last = 0
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (t - last < 66) return // ~15fps, cheap and moody
      last = t
      ctx.fillStyle = 'rgba(4, 8, 6, 0.22)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = '14px "JetBrains Mono", monospace'
      for (let i = 0; i < cols; i++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)]
        const x = i * 18
        const y = drops[i] * 18
        ctx.fillStyle = Math.random() > 0.975 ? '#baffd0' : '#00ff41'
        ctx.fillText(ch, x, y)
        if (y > h && Math.random() > 0.985) drops[i] = 0
        drops[i] += 1
      }
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity }}
    />
  )
}
