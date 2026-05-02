import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SpecialistDashboard from './SpecialistDashboard/SpecialistDashboard'

export default function SpecialistLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      setSession(data.session)
    }
    setLoading(false)
  }

  if (session) {
    return <SpecialistDashboard session={session} onLogout={() => supabase.auth.signOut().then(() => setSession(null))} />
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '28px', marginBottom: '8px', color: 'var(--text)' }}>Specialist <em>Portal</em></h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '24px' }}>Log in to connect with users securely.</p>
        
        {error && <div style={{ padding: '12px', background: 'rgba(184, 92, 92, 0.1)', color: '#8B2020', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}
