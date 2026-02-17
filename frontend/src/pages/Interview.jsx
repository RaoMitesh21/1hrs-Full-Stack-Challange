import React, {useEffect, useState, useRef, useCallback} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API, {setAuth} from '../utils/api'

function Timer({seconds, onExpire}){
  const [s,setS] = useState(seconds)
  const ref = useRef()
  useEffect(()=>{
    ref.current = setInterval(()=>{
      setS(prev=>{
        if(prev<=1){ clearInterval(ref.current); onExpire?.(); return 0 }
        return prev-1
      })
    },1000)
    return ()=>clearInterval(ref.current)
  },[])
  const m = Math.floor(s/60)
  const sc = s%60
  const danger = s <= 10
  const warn = s <= 30 && s > 10
  return (
    <div className={`timer ${danger?'pulse':''}`} style={warn?{color:'var(--warn)'}:{}}>
      <span style={{fontSize:12,opacity:0.6,marginRight:4}}>⏱</span>
      {m}:{String(sc).padStart(2,'0')}
    </div>
  )
}

export default function Interview(){
  const {qId} = useParams()
  const nav = useNavigate()
  const [question,setQuestion] = useState(null)
  const [answer,setAnswer] = useState('')
  const [analyzing,setAnalyzing] = useState(false)
  const [wordCount,setWordCount] = useState(0)
  const submitted = useRef(false)

  useEffect(()=>{
    const token = localStorage.getItem('ai_token')
    if(!token){ nav('/auth'); return }
    setAuth(token)
    API.get('/questions').then(r=>{
      const q = (r.data.questions || []).find(x=>x.id===qId)
      setQuestion(q)
    })
  },[qId])

  const handleChange = useCallback(e=>{
    const v = e.target.value
    setAnswer(v)
    setWordCount(v.trim() ? v.trim().split(/\s+/).length : 0)
  },[])

  async function submit(){
    if(!question || submitted.current) return
    submitted.current = true
    setAnalyzing(true)
    try{
      const r = await API.post('/submit', {
        role: question.role,
        difficulty: question.difficulty,
        question_id: question.id,
        answer,
      })
      nav(`/results/${r.data.record.id}`, {state:{record: r.data.record}})
    }catch{
      alert('Submission failed — check your connection.')
      submitted.current = false
    }finally{ setAnalyzing(false) }
  }

  if(!question) return (
    <div className="panel" style={{maxWidth:500,margin:'80px auto',textAlign:'center'}}>
      <div className="analyzing-spinner" style={{margin:'0 auto 16px'}}></div>
      <div style={{color:'var(--muted)'}}>Loading question…</div>
    </div>
  )

  if(analyzing) return (
    <div className="analyzing-overlay scale-in">
      <div className="analyzing-spinner"></div>
      <div style={{fontFamily:'Clash Display',fontSize:20,fontWeight:700}}>Analyzing your response…</div>
      <div style={{color:'var(--muted)',marginTop:8,fontSize:13}}>AI is evaluating keyword coverage, structure, depth & vocabulary.</div>
    </div>
  )

  const timeLimit = question.time_limit || 180

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24}}>
      {/* Main question area */}
      <div className="panel reveal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
              <span className={`diff-badge diff-${question.difficulty}`}>{question.difficulty}</span>
              <span style={{color:'var(--muted)',fontSize:12}}>{question.role}</span>
              {question.category && <span style={{color:'var(--muted)',fontSize:12}}>· {question.category}</span>}
            </div>
            <div className="question-large">{question.text}</div>
          </div>
          <Timer seconds={timeLimit} onExpire={submit} />
        </div>

        <textarea
          className="textarea"
          value={answer}
          onChange={handleChange}
          placeholder="Structure your answer clearly: start with a summary, then explain key points with examples…"
          autoFocus
        />

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:14}}>
          <div style={{color:'var(--muted)',fontSize:12}}>
            {wordCount} words
          </div>
          <button className="button" onClick={submit} disabled={!answer.trim()}>
            Submit answer →
          </button>
        </div>
      </div>

      {/* Sidebar hints */}
      <aside>
        <div className="panel reveal delay-1">
          <div className="panel-title" style={{marginBottom:10}}>TIPS</div>
          <div className="tip-card" style={{marginTop:0}}>Start with a one-line TL;DR that directly answers the question.</div>
          <div className="tip-card">Mention 2–3 key concepts or terms relevant to the topic.</div>
          <div className="tip-card">Include a real-world example or step-by-step walkthrough.</div>
          <div className="tip-card">End with a brief conclusion or trade-off discussion.</div>
        </div>

        <div className="panel reveal delay-2" style={{marginTop:14}}>
          <div className="panel-title" style={{marginBottom:10}}>SCORING</div>
          <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.7}}>
            <div>▸ Keyword coverage — 45%</div>
            <div>▸ Answer depth — 25%</div>
            <div>▸ Sentence structure — 15%</div>
            <div>▸ Vocabulary richness — 15%</div>
          </div>
        </div>
      </aside>
    </div>
  )
}
