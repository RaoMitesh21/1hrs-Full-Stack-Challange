import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Results(){
  const loc = useLocation()
  const nav = useNavigate()
  const record = loc.state?.record

  if(!record) return (
    <div className="panel" style={{maxWidth:500,margin:'80px auto',textAlign:'center'}}>
      <div style={{fontSize:18,fontWeight:700,marginBottom:12}}>No results available</div>
      <button className="button" onClick={()=>nav('/dashboard')}>Go to Dashboard</button>
    </div>
  )

  return (
    <div style={{maxWidth:900,margin:'0 auto'}}>
      {/* Score header */}
      <div className="panel reveal" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:24}}>
          <div className="score-ring scale-in" style={{'--pct': record.score}}>
            <span className="value">{record.score}</span>
          </div>
          <div>
            <div style={{fontFamily:'Clash Display',fontSize:24,fontWeight:800}}>Interview Complete</div>
            <div style={{color:'var(--muted)',fontSize:13,marginTop:4}}>
              {record.role} · {record.difficulty} · {new Date(record.date).toLocaleString()}
            </div>
          </div>
        </div>
        <button className="button-outline" onClick={()=>nav('/dashboard')}>← Dashboard</button>
      </div>

      {/* Question */}
      <div className="panel reveal delay-1" style={{marginTop:16}}>
        <div className="panel-title" style={{marginBottom:8}}>QUESTION</div>
        <div className="question-large" style={{fontSize:17}}>{record.question_text}</div>
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16}}>
        <div className="panel reveal delay-2">
          <div className="panel-title" style={{marginBottom:10,color:'var(--success)'}}>✓ STRENGTHS</div>
          {(record.strengths||[]).length === 0
            ? <div style={{color:'var(--muted)',fontSize:13}}>None detected</div>
            : (record.strengths||[]).map((s,i)=> <div key={i} className="tag tag-green">{s}</div>)
          }
        </div>
        <div className="panel reveal delay-2">
          <div className="panel-title" style={{marginBottom:10,color:'var(--accent-2)'}}>✗ WEAKNESSES</div>
          {(record.weaknesses||[]).length === 0
            ? <div style={{color:'var(--muted)',fontSize:13}}>None detected</div>
            : (record.weaknesses||[]).map((w,i)=> <div key={i} className="tag tag-red">{w}</div>)
          }
        </div>
      </div>

      {/* Detailed feedback */}
      <div className="panel reveal delay-3" style={{marginTop:16}}>
        <div className="panel-title" style={{marginBottom:10}}>DETAILED FEEDBACK</div>
        <pre style={{whiteSpace:'pre-wrap',color:'var(--muted)',fontSize:13,lineHeight:1.7,fontFamily:'inherit'}}>{record.feedback}</pre>
      </div>

      {/* Tips */}
      {record.tips && record.tips.length > 0 && (
        <div className="panel reveal delay-4" style={{marginTop:16}}>
          <div className="panel-title" style={{marginBottom:10}}>IMPROVEMENT TIPS</div>
          {record.tips.map((t,i)=>(
            <div key={i} className="tip-card">{t}</div>
          ))}
        </div>
      )}

      <div style={{marginTop:24,textAlign:'center'}}>
        <button className="cta" onClick={()=>nav('/dashboard')}>Practice another question →</button>
      </div>
    </div>
  )
}
