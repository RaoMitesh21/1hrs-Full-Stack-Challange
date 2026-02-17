import React, {useEffect, useState} from 'react'
import API, {setAuth} from '../utils/api'
import { useNavigate } from 'react-router-dom'

const ROLE_ICONS = {frontend:'🖥️',backend:'⚙️',fullstack:'🔗',ml:'🧠',devops:'🚀','system-design':'🏗️'}

export default function Dashboard(){
  const nav = useNavigate()
  const [roles,setRoles] = useState([])
  const [stats,setStats] = useState({})
  const [role,setRole] = useState('')
  const [difficulty,setDifficulty] = useState('easy')
  const [questions,setQuestions] = useState([])
  const [history,setHistory] = useState([])
  const [analytics,setAnalytics] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('ai_token')
    if(!token){ nav('/auth'); return }
    setAuth(token)

    // load roles, history, analytics in parallel
    Promise.all([
      API.get('/roles'),
      API.get('/history?limit=5'),
      API.get('/analytics'),
    ]).then(([rr, hr, ar])=>{
      setRoles(rr.data.roles || [])
      setStats(rr.data.stats || {})
      if(rr.data.roles?.length) setRole(rr.data.roles[0])
      setHistory(hr.data.interviews || [])
      setAnalytics(ar.data)
    }).catch(()=>{})
  },[])

  // load questions when role or difficulty changes
  useEffect(()=>{
    if(!role) return
    API.get('/questions', {params:{role,difficulty}}).then(r=>{
      setQuestions(r.data.questions || [])
    }).catch(()=>{})
  },[role,difficulty])

  const diffClass = d => d==='easy'?'diff-easy':d==='hard'?'diff-hard':'diff-medium'

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:24}}>
      {/* LEFT column */}
      <div>
        {/* Role selector */}
        <div className="panel reveal">
          <div className="panel-header">
            <span className="panel-title">SELECT ROLE</span>
            <span style={{color:'var(--muted)',fontSize:12}}>{stats.total || 0} total questions</span>
          </div>
          <div className="role-grid">
            {roles.map(r=>(
              <div key={r} className={`role-card ${r===role?'active':''}`} onClick={()=>setRole(r)}>
                <div style={{fontSize:24,marginBottom:6}}>{ROLE_ICONS[r]||'📋'}</div>
                <h4>{r}</h4>
                <div className="count">{stats.by_role?.[r]||0} Qs</div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="panel reveal delay-1" style={{marginTop:16}}>
          <div className="panel-header">
            <span className="panel-title">DIFFICULTY</span>
          </div>
          <div style={{display:'flex',gap:10}}>
            {['easy','medium','hard'].map(d=>(
              <button key={d}
                className={difficulty===d ? 'button' : 'button-outline'}
                onClick={()=>setDifficulty(d)}
                style={{textTransform:'uppercase',fontSize:12,letterSpacing:1}}
              >{d}</button>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="reveal delay-2" style={{marginTop:20}}>
          <div className="panel-title" style={{marginBottom:8}}>AVAILABLE QUESTIONS</div>
          {questions.length === 0 && <div style={{color:'var(--muted)',fontSize:13}}>No questions found for this selection.</div>}
          {questions.map((q,i)=>(
            <div key={q.id} className="q-item slide-in" style={{animationDelay:`${0.05*i}s`}}>
              <div>
                <div className="q-text">{q.text}</div>
                <div className="q-meta">
                  <span>{q.category||q.role}</span>
                  <span className={`diff-badge ${diffClass(q.difficulty)}`}>{q.difficulty}</span>
                  <span>{q.time_limit ? `${Math.floor(q.time_limit/60)}:${String(q.time_limit%60).padStart(2,'0')}` : '3:00'}</span>
                </div>
              </div>
              <button className="button" onClick={()=>nav(`/interview/${q.id}`)}>Start →</button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT column */}
      <aside>
        {/* Performance summary */}
        <div className="panel reveal">
          <div className="panel-title" style={{marginBottom:12}}>PERFORMANCE</div>
          {analytics && analytics.total_interviews > 0 ? (
            <>
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                <div className="score-ring" style={{'--pct': analytics.avg_score}}>
                  <span className="value">{analytics.avg_score}</span>
                </div>
                <div>
                  <div style={{fontSize:13,color:'var(--muted)'}}>Avg score</div>
                  <div style={{fontSize:13,color:'var(--muted)',marginTop:4}}>{analytics.total_interviews} interviews</div>
                  {analytics.recent_trend && analytics.recent_trend !== 'not enough data' && (
                    <div className={`trend-badge trend-${analytics.recent_trend}`} style={{marginTop:6}}>{analytics.recent_trend}</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{color:'var(--muted)',fontSize:13}}>Complete interviews to see progress</div>
          )}
        </div>

        {/* Recent history */}
        <div className="panel reveal delay-1" style={{marginTop:16}}>
          <div className="panel-header">
            <span className="panel-title">RECENT HISTORY</span>
            {history.length > 0 && <button className="button-outline" style={{fontSize:11}} onClick={()=>nav('/analytics')}>View all</button>}
          </div>
          {history.length === 0
            ? <div style={{color:'var(--muted)',fontSize:13}}>No interviews yet</div>
            : history.map(h=>(
              <div key={h.id} className="history-item">
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{(h.question_text||'').substring(0,60)}…</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{h.role} · {h.difficulty} · {new Date(h.date).toLocaleDateString()}</div>
                </div>
                <div className="history-score">{h.score}</div>
              </div>
            ))
          }
        </div>
      </aside>
    </div>
  )
}
