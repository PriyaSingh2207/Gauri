import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SymptomsJournal({ user, isAnonymous, data, saveData, showToast }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState(new Set())
  const [selectedMood, setSelectedMood] = useState('')
  const [pain, setPain] = useState(3)
  const [notes, setNotes] = useState('')

  const symptoms = data.symptoms || []

  const toggleSym = (name) => {
    const newSet = new Set(selectedSymptoms)
    if (newSet.has(name)) newSet.delete(name)
    else newSet.add(name)
    setSelectedSymptoms(newSet)
  }

  const logSymptoms = async () => {
    if (!selectedSymptoms.size && !selectedMood) {
      showToast('Select at least one symptom or mood')
      return
    }
    if (!user) {
      showToast('Waiting for authentication...')
      return
    }

    if (isAnonymous) {
      // Don't save to Supabase for anonymous users
      const mockInserted = {
        id: 'temp-' + Date.now(),
        symptoms: Array.from(selectedSymptoms),
        mood: selectedMood,
        pain: parseInt(pain),
        notes,
        created_at: new Date().toISOString()
      }
      
      const formatted = {
        id: mockInserted.id,
        symptoms: mockInserted.symptoms,
        mood: mockInserted.mood,
        pain: mockInserted.pain,
        notes: mockInserted.notes,
        date: mockInserted.created_at
      }

      saveData({ ...data, symptoms: [...symptoms, formatted] })
      showToast('Symptoms saved locally (Session only)')
    } else {
      const entry = {
        user_id: user.id,
        symptoms: Array.from(selectedSymptoms),
        mood: selectedMood,
        pain: parseInt(pain),
        notes
      }

      const { data: inserted, error } = await supabase.from('symptoms').insert([entry]).select()

      if (error) {
        showToast('Error saving: ' + error.message)
        return
      }

      const formatted = {
        id: inserted[0].id,
        symptoms: inserted[0].symptoms,
        mood: inserted[0].mood,
        pain: inserted[0].pain,
        notes: inserted[0].notes,
        date: inserted[0].created_at
      }

      saveData({ ...data, symptoms: [...symptoms, formatted] })
      showToast('Symptoms saved!')
    }
    clearSymptoms()
  }

  const clearSymptoms = () => {
    setSelectedSymptoms(new Set())
    setSelectedMood('')
    setPain(3)
    setNotes('')
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div id="tab-symptoms" className="tab-content">
      <div className="page-header">
        <div>
          <div className="page-title">Symptom <em>Journal</em></div>
          <div className="page-sub">Track how you feel — physically and emotionally</div>
        </div>
      </div>
      <div className="page-content">
        <div className="card" style={{marginBottom: 16}}>
          <div className="card-title"><span>🌡️</span> Physical Symptoms</div>
          <div className="symptom-grid">
            {[
              { id: 'cramps', icon: '😣', label: 'Cramps' },
              { id: 'bloating', icon: '🫧', label: 'Bloating' },
              { id: 'headache', icon: '🤕', label: 'Headache' },
              { id: 'fatigue', icon: '😴', label: 'Fatigue' },
              { id: 'backpain', icon: '🦴', label: 'Back Pain' },
              { id: 'nausea', icon: '🤢', label: 'Nausea' },
              { id: 'breast', icon: '⚡', label: 'Breast Pain' },
              { id: 'acne', icon: '🔴', label: 'Acne' }
            ].map(sym => (
              <div 
                key={sym.id}
                className={`symptom-chip ${selectedSymptoms.has(sym.id) ? 'selected' : ''}`}
                onClick={() => toggleSym(sym.id)}
              >
                <span className="s-icon">{sym.icon}</span>{sym.label}
              </div>
            ))}
          </div>
          <div className="intensity-row">
            <span className="intensity-label">Pain intensity</span>
            <input type="range" min="1" max="10" value={pain} onChange={e => setPain(e.target.value)} />
            <span className="intensity-val">{pain}</span>
            <span style={{fontSize: 11, color: 'var(--text3)'}}>/10</span>
          </div>
        </div>
        
        <div className="section-row">
          <div className="card">
            <div className="card-title"><span>🧠</span> Mood Today</div>
            <div className="mood-grid">
              {[
                { id: 'Happy', icon: '😊' },
                { id: 'Calm', icon: '😌' },
                { id: 'Anxious', icon: '😰' },
                { id: 'Sad', icon: '😢' },
                { id: 'Irritable', icon: '😤' }
              ].map(mood => (
                <div 
                  key={mood.id}
                  className={`mood-btn ${selectedMood === mood.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <span className="m-icon">{mood.icon}</span>{mood.id}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title"><span>✍️</span> Notes</div>
            <textarea 
              placeholder="Describe how you're feeling... anything unusual?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            ></textarea>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={logSymptoms}>Save Entry</button>
              <button className="btn btn-secondary" onClick={clearSymptoms}>Clear</button>
              {isAnonymous && <span style={{ fontSize: '10px', color: 'var(--text3)', alignSelf: 'center', marginLeft: 'auto' }}>⚠ Session only</span>}
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title"><span>📋</span> Recent Symptom Log</div>
          <div className="history-list">
            {symptoms.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💊</div>
                No symptoms logged yet.
              </div>
            ) : (
              [...symptoms].reverse().map((s, i) => (
                <div key={i} className="history-entry sym">
                  <div className="h-date">{formatDate(s.date)}</div>
                  <div className="h-text">
                    {s.symptoms.length ? s.symptoms.join(', ') : ''}
                    {s.mood ? (s.symptoms.length ? ` · Mood: ${s.mood}` : `Mood: ${s.mood}`) : ''} 
                    {' '}· Pain: {s.pain}/10
                    {s.notes ? ` · ${s.notes}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
