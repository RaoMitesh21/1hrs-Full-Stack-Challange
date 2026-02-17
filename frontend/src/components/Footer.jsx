import React from 'react'

export default function Footer(){
  return (
    <footer className="footer">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>© {new Date().getFullYear()} InterviewIQ — Practice smarter, not harder</div>
        <div style={{color:'var(--muted)'}}>Built with precision • AI-powered feedback</div>
      </div>
    </footer>
  )
}
