import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import API, {setAuth} from '../utils/api'
import { Line, Bar } from 'react-chartjs-2'
import { Chart, LinearScale, CategoryScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js'

Chart.register(LinearScale, CategoryScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#ffffff', titleColor: '#0f172a', bodyColor: '#334155', borderColor: 'rgba(99,102,241,0.15)', borderWidth: 1, cornerRadius: 10, titleFont: { family: 'Clash Display' }, padding: 12 },
  },
  scales: {
    x: { grid: { color: 'rgba(100,116,139,0.06)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(100,116,139,0.06)' }, ticks: { color: '#64748b', font: { size: 11 } }, min: 0, max: 100 },
  },
}

export default function Analytics(){
  const nav = useNavigate()
  const [data,setData] = useState(null)
  const [err,setErr] = useState(false)

  useEffect(()=>{
    const token = localStorage.getItem('ai_token')
    if(!token){ nav('/auth'); return }
    setAuth(token)
    API.get('/analytics').then(r=> setData(r.data)).catch(()=> setErr(true))
  },[])

  if(err) return <div className="panel" style={{maxWidth:500,margin:'80px auto',textAlign:'center'}}>Failed to load analytics.</div>
  if(!data) return (
    <div className="panel" style={{maxWidth:500,margin:'80px auto',textAlign:'center'}}>
      <div className="analyzing-spinner" style={{margin:'0 auto 16px'}}></div>
      <div style={{color:'var(--muted)'}}>Loading analytics…</div>
    </div>
  )

  if(data.total_interviews === 0) return (
    <div className="panel" style={{maxWidth:500,margin:'80px auto',textAlign:'center'}}>
      <div style={{fontSize:18,fontWeight:700,marginBottom:12}}>No data yet</div>
      <div style={{color:'var(--muted)',marginBottom:20}}>Complete some interviews to unlock analytics.</div>
      <button className="button" onClick={()=>nav('/dashboard')}>Go to Dashboard</button>
    </div>
  )

  const times = data.timeseries || []
  const lineData = {
    labels: times.map(t=> new Date(t.date).toLocaleDateString()),
    datasets: [{
      label: 'Score',
      data: times.map(t=> t.score),
      borderColor: 'rgba(99,102,241,0.85)',
      backgroundColor: 'rgba(99,102,241,0.06)',
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointBackgroundColor: '#6366f1',
    }],
  }

  const roles = Object.keys(data.role_average || {})
  const barData = {
    labels: roles.map(r=> r.toUpperCase()),
    datasets: [{
      label: 'Avg score',
      data: roles.map(r=> data.role_average[r]),
      backgroundColor: roles.map((_,i)=> i%2===0 ? 'rgba(99,102,241,0.7)' : 'rgba(236,72,153,0.6)'),
      borderRadius: 6,
      barThickness: 36,
    }],
  }

  // difficulty bar
  const diffs = Object.keys(data.difficulty_average || {})
  const diffBarData = {
    labels: diffs.map(d=> d.toUpperCase()),
    datasets: [{
      label: 'Avg score',
      data: diffs.map(d=> data.difficulty_average[d]),
      backgroundColor: ['rgba(52,211,153,0.7)','rgba(251,191,36,0.7)','rgba(255,107,107,0.7)'],
      borderRadius: 6,
      barThickness: 36,
    }],
  }

  const strengths = Object.entries(data.strength_frequency || {})
  const weaknesses = Object.entries(data.weakness_frequency || {})

  const trendClass = data.recent_trend === 'improving' ? 'trend-improving' : data.recent_trend === 'declining' ? 'trend-declining' : 'trend-stable'

  return (
    <div>
      {/* Stat cards */}
      <div className="stat-grid reveal">
        <div className="stat-card">
          <div className="stat-value">{data.total_interviews}</div>
          <div className="stat-label">Interviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.avg_score}</div>
          <div className="stat-label">Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{roles.length}</div>
          <div className="stat-label">Roles Covered</div>
        </div>
        <div className="stat-card">
          <div className={`trend-badge ${trendClass}`} style={{fontSize:14,marginTop:4}}>{data.recent_trend}</div>
          <div className="stat-label" style={{marginTop:8}}>Trend</div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}} className="reveal delay-1">
        <div className="panel">
          <div className="panel-title" style={{marginBottom:12}}>SCORE PROGRESSION</div>
          <div className="graph"><Line data={lineData} options={chartOpts} /></div>
        </div>
        <div className="panel">
          <div className="panel-title" style={{marginBottom:12}}>ROLE COMPARISON</div>
          <div className="graph"><Bar data={barData} options={chartOpts} /></div>
        </div>
      </div>

      {/* Difficulty + Strengths/Weaknesses */}
      <div style={{display:'grid',gridTemplateColumns:'340px 1fr 1fr',gap:20,marginTop:20}} className="reveal delay-2">
        <div className="panel">
          <div className="panel-title" style={{marginBottom:12}}>BY DIFFICULTY</div>
          <div className="graph"><Bar data={diffBarData} options={chartOpts} /></div>
        </div>

        <div className="panel">
          <div className="panel-title" style={{marginBottom:12,color:'var(--success)'}}>TOP STRENGTHS</div>
          {strengths.length === 0
            ? <div style={{color:'var(--muted)',fontSize:13}}>Not enough data</div>
            : strengths.map(([s,c])=>(
              <div key={s} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(100,116,139,0.06)',fontSize:13}}>
                <span>{s}</span>
                <span style={{color:'var(--success)',fontWeight:700}}>{c}×</span>
              </div>
            ))
          }
        </div>

        <div className="panel">
          <div className="panel-title" style={{marginBottom:12,color:'var(--accent-2)'}}>TOP WEAKNESSES</div>
          {weaknesses.length === 0
            ? <div style={{color:'var(--muted)',fontSize:13}}>Not enough data</div>
            : weaknesses.map(([w,c])=>(
              <div key={w} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(100,116,139,0.06)',fontSize:13}}>
                <span>{w}</span>
                <span style={{color:'var(--accent-2)',fontWeight:700}}>{c}×</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Improvement suggestions */}
      {data.improvement_suggestions && data.improvement_suggestions.length > 0 && (
        <div className="panel reveal delay-3" style={{marginTop:20}}>
          <div className="panel-title" style={{marginBottom:12}}>IMPROVEMENT SUGGESTIONS</div>
          {data.improvement_suggestions.map((s,i)=>(
            <div key={i} className="tip-card">{s}</div>
          ))}
        </div>
      )}
    </div>
  )
}
