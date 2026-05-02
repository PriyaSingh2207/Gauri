import React from 'react'
import { supabase } from '../lib/supabase'

export default function Sidebar({ activeTab, setActiveTab, user, isAnonymous, onLoginClick }) {
  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-icon">G</div>
        <div className="brand-name">Gauri</div>
        <div className="brand-sub">Health Companion</div>
      </div>
      <nav className="nav">
        <div className={`nav-item ${activeTab === 'cycle' ? 'active' : ''}`} onClick={() => setActiveTab('cycle')}>
          <span className="nav-icon">🩸</span> Cycle Tracker
        </div>
        <div className={`nav-item ${activeTab === 'symptoms' ? 'active' : ''}`} onClick={() => setActiveTab('symptoms')}>
          <span className="nav-icon">💊</span> Symptoms
        </div>
        <div className={`nav-item ${activeTab === 'pcos' ? 'active' : ''}`} onClick={() => setActiveTab('pcos')}>
          <span className="nav-icon">🧬</span> PCOS Risk
        </div>
        <div className={`nav-item ${activeTab === 'breast' ? 'active' : ''}`} onClick={() => setActiveTab('breast')}>
          <span className="nav-icon">🎗️</span> Breast Health
        </div>
        <div className={`nav-item ${activeTab === 'meds' ? 'active' : ''}`} onClick={() => setActiveTab('meds')}>
          <span className="nav-icon">💉</span> Medications
        </div>
        <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <span className="nav-icon">📋</span> Health Log
        </div>
        <div className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          <span className="nav-icon">🤖</span> Gauri
        </div>
      </nav>
      <div className="sidebar-footer">
        {isAnonymous ? (
          <div className="auth-section">
            <div className="privacy-badge">🔒 Anonymous Mode</div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }} onClick={onLoginClick}>
              Login / Sign Up
            </button>
          </div>
        ) : (
          <div className="auth-section">
            <div className="user-info" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', marginBottom: '8px', lineHeight: '1.4' }}>
              Logged in as: <br/>
              <strong style={{ fontSize: '10px', wordBreak: 'break-all', opacity: 0.8 }}>{user?.email}</strong>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }} onClick={() => supabase.auth.signOut()}>
              Logout
            </button>
          </div>
        )}
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <a href="/specialist-login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textDecoration: 'none' }}>Specialist Login</a>
        </div>
      </div>
    </div>
  )
}
