import React, {useState} from 'react'
import API from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

export default function Auth(){
  const [mode,setMode] = useState('login')
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const nav = useNavigate()
  const { login } = useAuth()

  async function submit(e){
    e.preventDefault()
    try{
      const path = mode==='login' ? '/login' : '/register'
      const r = await API.post(path, {username, password})
      login(r.data.token)
      nav('/dashboard')
    }catch(err){
      alert(err?.response?.data?.error || 'Error')
    }
  }

  return (
    <div className="auth-card panel reveal">
      <h2 style={{marginTop:0}}>{mode==='login' ? 'Sign in' : 'Create account'}</h2>
      <form onSubmit={submit}>
        <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" />
        <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
        <div style={{marginTop:14,display:'flex',gap:12}}>
          <button className="button" type="submit">{mode==='login' ? 'Sign in' : 'Register'}</button>
          <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')} style={{background:'transparent',color:'var(--muted)',border:'none',cursor:'pointer'}}>Switch to {mode==='login'?'Register':'Sign in'}</button>
        </div>
      </form>
    </div>
  )
}
