import { useMemo } from 'react'
import type { SkillNode, NodeState } from '@/lib/skills'

const W = 960
const TIER_H = 120
const PAD_Y = 60

const STATE_STYLE: Record<NodeState, { fill: string; stroke: string; text: string; dash?: boolean }> = {
  known:     { fill: 'hsl(147 100% 13%)', stroke: 'hsl(136 100% 50% / 0.5)', text: '#9dffc4' },
  mastered:  { fill: 'hsl(147 100% 13%)', stroke: '#00ff41', text: '#baffd0' },
  available: { fill: 'hsl(150 30% 5%)',   stroke: '#00ff41', text: '#00ff41' },
  active:    { fill: 'hsl(150 35% 7%)',   stroke: '#ff6b1a', text: '#ffb07a' },
  locked:    { fill: 'hsl(150 20% 4%)',   stroke: 'hsl(140 20% 22%)', text: 'hsl(140 12% 42%)', dash: true },
}

export function SkillGraph({
  nodes,
  onSelect,
  selectedId,
}: {
  nodes: SkillNode[]
  onSelect?: (n: SkillNode) => void
  selectedId?: string | null
}) {
  const { positioned, edges, height } = useMemo(() => {
    const tiers = new Map<number, SkillNode[]>()
    nodes.forEach((n) => {
      const arr = tiers.get(n.tier) ?? []
      arr.push(n)
      tiers.set(n.tier, arr)
    })
    const positioned = new Map<string, { x: number; y: number; node: SkillNode }>()
    tiers.forEach((arr, tier) => {
      arr.forEach((n, i) => {
        const x = (W / (arr.length + 1)) * (i + 1)
        const y = PAD_Y + tier * TIER_H
        positioned.set(n.id, { x, y, node: n })
      })
    })
    const edges: { x1: number; y1: number; x2: number; y2: number; live: boolean }[] = []
    nodes.forEach((n) =>
      n.prereqs.forEach((p) => {
        const a = positioned.get(p)
        const b = positioned.get(n.id)
        if (a && b) {
          edges.push({
            x1: a.x, y1: a.y, x2: b.x, y2: b.y,
            live: a.node.state === 'known' || a.node.state === 'mastered',
          })
        }
      }),
    )
    const maxTier = Math.max(...nodes.map((n) => n.tier))
    return { positioned, edges, height: PAD_Y * 2 + maxTier * TIER_H }
  }, [nodes])

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto select-none">
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1} y1={e.y1 + 22} x2={e.x2} y2={e.y2 - 22}
          stroke={e.live ? 'hsl(136 100% 50% / 0.55)' : 'hsl(140 20% 20%)'}
          strokeWidth={e.live ? 1.6 : 1}
          className={e.live ? 'edge-flow' : undefined}
          strokeDasharray={e.live ? undefined : '3 5'}
        />
      ))}

      {[...positioned.values()].map(({ x, y, node }) => {
        const st = STATE_STYLE[node.state]
        const isSel = selectedId === node.id
        const clickable = node.state !== 'locked'
        return (
          <g
            key={node.id}
            transform={`translate(${x}, ${y})`}
            onClick={() => clickable && onSelect?.(node)}
            className={clickable ? 'cursor-pointer' : 'cursor-not-allowed'}
          >
            {(node.state === 'available' || node.state === 'active') && (
              <circle r={30} fill="none"
                stroke={node.state === 'active' ? 'hsl(24 100% 55% / 0.35)' : 'hsl(136 100% 50% / 0.25)'}
                className="node-pulse" />
            )}
            <rect
              x={-86} y={-22} width={172} height={44} rx={6}
              fill={st.fill}
              stroke={isSel ? '#ff6b1a' : st.stroke}
              strokeWidth={isSel ? 2.2 : 1.2}
              strokeDasharray={st.dash ? '4 4' : undefined}
            />
            <text
              textAnchor="middle" dominantBaseline="middle"
              fill={st.text} fontSize={10.5} fontFamily="'JetBrains Mono', monospace"
            >
              {wrap(node.label, 24).map((line, i, arr) => (
                <tspan key={i} x={0} dy={i === 0 ? -(arr.length - 1) * 6 : 12}>
                  {line}
                </tspan>
              ))}
            </text>
            {/* mastery pip */}
            {node.mastery > 0 && (
              <rect x={-86} y={26} width={172 * node.mastery} height={3} rx={1.5} fill="#00ff41" opacity={0.85} />
            )}
            {node.transfer && (
              <text x={92} y={-14} fontSize={9} fill="#ff6b1a" fontFamily="'JetBrains Mono', monospace">⇄</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function wrap(label: string, max: number): string[] {
  if (label.length <= max) return [label]
  const words = label.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 2)
}
