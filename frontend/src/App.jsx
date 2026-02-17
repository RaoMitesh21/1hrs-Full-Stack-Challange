import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import Results from './pages/Results'
import Analytics from './pages/Analytics'
import Header from './components/Header'
import Footer from './components/Footer'

function App(){
  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/auth" element={<Auth/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/interview/:qId" element={<Interview/>} />
          <Route path="/results/:id" element={<Results/>} />
          <Route path="/analytics" element={<Analytics/>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
