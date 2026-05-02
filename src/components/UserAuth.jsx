import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function UserAuth({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuthSuccess(data.user)
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              role: 'user'
            }
          }
        })
        if (error) throw error
        if (data.user) {
          // Supabase might require email confirmation, but we'll try to log them in or show a message
          if (data.session) {
            onAuthSuccess(data.user)
          } else {
            setError("Check your email for a confirmation link!")
          }
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="auth-header">
          <div className="brand-icon" style={{ margin: '0 auto 16px', background: 'var(--cornflower)', border: 'none' }}>G</div>
          <h2 className="auth-title">
            {isLogin ? 'Welcome ' : 'Join '} 
            <em>Gauri</em>
          </h2>
          <p className="auth-sub">
            {isLogin ? 'Log in to sync your health data across devices.' : 'Create an account to securely save your health journal.'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setIsLogin(true)}>Log In</span></p>
          )}
        </div>
      </div>
    </div>
  )
}
