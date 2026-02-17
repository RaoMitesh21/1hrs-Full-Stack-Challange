import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

export default function Header(){
  const nav = useNavigate()
  const { loggedIn, logout } = useAuth()

  function handleLogout(){
    logout()
    nav('/')
  }

  return (
    <header className="header">
      <Link to="/" style={{textDecoration:'none'}}>
        <div className="logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
              <line x1="12" y1="2" x2="12" y2="22"/>
              <line x1="2" y1="8.5" x2="22" y2="8.5"/>
              <line x1="2" y1="15.5" x2="22" y2="15.5"/>
            </svg>
          </div>
          <span className="logo-text">InterviewIQ</span>
        </div>
      </Link>
      <nav className="nav-links">
        {loggedIn && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
        {loggedIn && <Link to="/analytics" className="nav-link">Analytics</Link>}
        {loggedIn
          ? <button className="btn-sm" onClick={handleLogout}>Sign out</button>
          : <Link to="/auth"><button className="btn-sm">Sign in</button></Link>
        }
      </nav>
    </header>
  )
}
