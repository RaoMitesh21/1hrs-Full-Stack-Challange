import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

const FEATURES = [
  {icon:'⏱', color:'purple', title:'Timed Rounds', desc:'Real interview pressure. Countdown timer with pulse alerts under 10 seconds.'},
  {icon:'🧠', color:'pink', title:'AI Scoring', desc:'Keyword matching, structure analysis, vocabulary richness — scored on four dimensions.'},
  {icon:'📊', color:'blue', title:'Progress Tracking', desc:'Score timeseries, role comparisons, strength/weakness frequency maps.'},
  {icon:'🎯', color:'green', title:'Targeted Feedback', desc:'Actionable tips per question. Know exactly what to improve and how.'},
  {icon:'🔬', color:'amber', title:'Multi-Role Bank', desc:'Frontend, Backend, ML, DevOps, System Design — 35+ curated questions.'},
  {icon:'🛡️', color:'red', title:'Difficulty Levels', desc:'Easy, Medium, Hard — difficulty-weighted scoring rewards deeper answers.'},
]

/* ─── Helper: hex → rgba ─── */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/* ─── Floating 3D Nodes constellation ─── */
const NODES = [
  { x: 220, y: 80,  r: 28, label: 'AI',     color: '#6366f1', delay: 0   },
  { x: 380, y: 160, r: 22, label: 'ML',      color: '#8b5cf6', delay: 0.8 },
  { x: 140, y: 240, r: 18, label: 'JS',      color: '#ec4899', delay: 1.6 },
  { x: 340, y: 310, r: 24, label: 'React',   color: '#6366f1', delay: 0.4 },
  { x: 100, y: 120, r: 14, label: 'API',     color: '#a78bfa', delay: 1.2 },
  { x: 420, y: 60,  r: 12, label: 'SQL',     color: '#818cf8', delay: 2.0 },
  { x: 460, y: 270, r: 16, label: 'DSA',     color: '#c084fc', delay: 0.6 },
  { x: 60,  y: 340, r: 11, label: 'CI',      color: '#a78bfa', delay: 1.8 },
  { x: 280, y: 400, r: 20, label: 'Node',    color: '#8b5cf6', delay: 1.0 },
  { x: 500, y: 380, r: 13, label: 'K8s',     color: '#6366f1', delay: 1.4 },
  { x: 180, y: 420, r: 10, label: 'Git',     color: '#ec4899', delay: 2.2 },
  { x: 430, y: 440, r: 15, label: 'AWS',     color: '#818cf8', delay: 0.2 },
]

const CONNECTIONS = [
  [0,1],[0,2],[0,4],[1,3],[1,6],[2,4],[2,7],[3,6],[3,8],[4,7],
  [5,1],[5,6],[6,9],[7,10],[8,10],[8,11],[9,11],[0,3],[2,8],[5,0],
]

const CANVAS_W = 560
const CANVAS_H = 500
const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 2

function FloatingNodes() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Set high-DPI canvas
    canvas.width = CANVAS_W * DPR
    canvas.height = CANVAS_H * DPR
    canvas.style.width = CANVAS_W + 'px'
    canvas.style.height = CANVAS_H + 'px'
    ctx.scale(DPR, DPR)

    let frame = 0
    let animId
    let running = true

    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      const t = frame * 0.008

      // Compute animated positions
      const pos = NODES.map((n, i) => ({
        x: n.x + Math.sin(t + n.delay * 2) * 12 + Math.cos(t * 0.7 + i) * 6,
        y: n.y + Math.cos(t + n.delay * 2) * 10 + Math.sin(t * 0.5 + i) * 5,
        r: n.r,
        label: n.label,
        color: n.color,
        pulse: (Math.sin(t * 2 + n.delay * 3) + 1) / 2,
      }))

      // Draw connections
      CONNECTIONS.forEach(([a, b]) => {
        const pa = pos[a], pb = pos[b]
        const dx = pb.x - pa.x, dy = pb.y - pa.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const alpha = Math.max(0.03, 0.08 + 0.14 * (1 - dist / 400))

        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
        const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y)
        grad.addColorStop(0, hexToRgba(pa.color, alpha))
        grad.addColorStop(1, hexToRgba(pb.color, alpha))
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.4
        ctx.stroke()

        // Traveling particle along connection
        const particleT = ((t * 0.4 + a * 0.3) % 1)
        const px = pa.x + dx * particleT
        const py = pa.y + dy * particleT
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fillStyle = hexToRgba(pa.color, 0.35)
        ctx.fill()
      })

      // Draw nodes
      pos.forEach((n) => {
        // Outer glow
        const glowR = n.r + 10 + n.pulse * 8
        const glow = ctx.createRadialGradient(n.x, n.y, n.r * 0.3, n.x, n.y, glowR)
        glow.addColorStop(0, hexToRgba(n.color, 0.18))
        glow.addColorStop(1, hexToRgba(n.color, 0))
        ctx.beginPath()
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Glass circle fill
        const bg = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, 0, n.x, n.y, n.r)
        bg.addColorStop(0, 'rgba(255,255,255,0.95)')
        bg.addColorStop(0.6, 'rgba(248,250,252,0.9)')
        bg.addColorStop(1, hexToRgba(n.color, 0.12))
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = bg
        ctx.fill()

        // Border ring
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.strokeStyle = hexToRgba(n.color, 0.4)
        ctx.lineWidth = 2
        ctx.stroke()

        // Subtle inner ring
        if (n.r > 12) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r - 4, 0, Math.PI * 2)
          ctx.strokeStyle = hexToRgba(n.color, 0.08)
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Label text
        if (n.r >= 14) {
          const fontSize = Math.max(9, Math.round(n.r * 0.55))
          ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = n.color
          ctx.fillText(n.label, n.x, n.y + 1)
        }
      })

      // Floating ambient micro-particles
      for (let i = 0; i < 20; i++) {
        const px = (Math.sin(t * 0.3 + i * 1.7) * 0.5 + 0.5) * CANVAS_W
        const py = (Math.cos(t * 0.25 + i * 2.1) * 0.5 + 0.5) * CANVAS_H
        const a = 0.12 + Math.sin(t + i) * 0.06
        ctx.beginPath()
        ctx.arc(px, py, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${a})`
        ctx.fill()
      }

      frame++
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => { running = false; cancelAnimationFrame(animId) }
  }, [])

  return (
    <div className="hero-nodes-wrap">
      <div className="hero-nodes-glow" />
      <canvas ref={canvasRef} className="hero-nodes-canvas" />
      <div className="hero-nodes-badge hero-nodes-badge-1">
        <span className="hero-nodes-badge-dot" style={{background:'#6366f1'}} />
        <span>AI Scoring</span>
      </div>
      <div className="hero-nodes-badge hero-nodes-badge-2">
        <span className="hero-nodes-badge-dot" style={{background:'#ec4899'}} />
        <span>35+ Questions</span>
      </div>
      <div className="hero-nodes-badge hero-nodes-badge-3">
        <span className="hero-nodes-badge-dot" style={{background:'#8b5cf6'}} />
        <span>Real-time Analytics</span>
      </div>
    </div>
  )
}

export default function Landing(){
  const nav = useNavigate()
  const { loggedIn } = useAuth()
  return (
    <>
      <section className="hero">
        <div className="copy reveal">
          <div className="h-title">Ace your next<br/><span className="gradient">tech interview.</span></div>
          <p className="h-sub">AI-powered interview simulations with timed questions, multi-dimensional scoring, and real-time analytics. Practice smarter, not harder.</p>
          <button className="cta reveal delay-1" onClick={()=>nav(loggedIn ? '/dashboard' : '/auth')}>
            {loggedIn ? 'Go to Dashboard →' : 'Start Practicing →'}
          </button>
        </div>
        <FloatingNodes />
      </section>

      <section className="features-grid reveal delay-3">
        {FEATURES.map((f,i) => (
          <div key={i} className="feature-card">
            <div className={`feature-icon feature-icon-${f.color}`}>{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </>
  )
}
